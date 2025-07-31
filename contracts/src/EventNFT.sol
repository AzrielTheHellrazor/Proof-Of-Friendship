// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EventNFT
 * @dev ERC1155 NFT contract for individual events - only mintable through router
 * @author Proof of Friendship Team
 */
contract EventNFT is ERC1155, Ownable, Pausable, ReentrancyGuard {
    // Router contract that deployed this NFT contract
    address public immutable router;
    
    // Event metadata
    string public name;
    
    // Token supply tracking
    mapping(uint256 => uint256) public tokenSupply;
    mapping(uint256 => uint256) public maxSupply;
    
    // Track if user already minted this token (1 NFT per user per token)
    mapping(uint256 => mapping(address => bool)) public hasMinted;
    
    // Token metadata - each tokenId represents different moment/photo from event
    mapping(uint256 => string) public tokenURIs;
    mapping(uint256 => bool) public tokenExists;
    mapping(uint256 => address) public tokenCreator;
    mapping(uint256 => string) public tokenDescription;
    
    // Events
    event TokenCreated(
        uint256 indexed tokenId,
        address indexed creator,
        uint256 maxSupply,
        string uri,
        string description
    );
    
    event TokenMinted(
        address indexed to,
        uint256 indexed tokenId,
        uint256 amount,
        address indexed minter
    );
    
    /**
     * @dev Constructor called by the router when creating new event
     * @param _name Name of the event
     * @param _uri Base URI for metadata
     * @param _router Address of the router contract
     */
    constructor(
        string memory _name,
        string memory _uri,
        address _router
    ) ERC1155(_uri) Ownable(_router) {
        require(_router != address(0), "Router cannot be zero address");
        
        router = _router;
        name = _name;
    }
    
    /**
     * @dev Modifier to ensure only router can call certain functions
     */
    modifier onlyRouter() {
        require(msg.sender == router, "Only router can call this function");
        _;
    }
    
    /**
     * @dev Creates a new token type within this event (anyone can create tokens)
     * @param tokenId Token ID to create
     * @param _maxSupply Maximum supply for this token (0 = unlimited)
     * @param _uri URI for token metadata
     * @param _description Description of this specific moment/photo
     */
    function createToken(
        uint256 tokenId,
        uint256 _maxSupply,
        string memory _uri,
        string memory _description
    ) external whenNotPaused {
        require(!tokenExists[tokenId], "Token already exists");
        require(bytes(_uri).length > 0, "URI cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        
        tokenExists[tokenId] = true;
        maxSupply[tokenId] = _maxSupply;
        tokenURIs[tokenId] = _uri;
        tokenCreator[tokenId] = msg.sender;
        tokenDescription[tokenId] = _description;
        
        emit TokenCreated(tokenId, msg.sender, _maxSupply, _uri, _description);
    }
    
    /**
     * @dev Mints exactly 1 token - ONLY callable by router
     * @param to Address to mint to
     * @param tokenId Token ID to mint
     */
    function mint(
        address to,
        uint256 tokenId
    ) external onlyRouter nonReentrant whenNotPaused {
        require(tokenExists[tokenId], "Token does not exist");
        require(!hasMinted[tokenId][to], "User already minted this token");
        
        // Check max supply (each mint is 1 token)
        if (maxSupply[tokenId] > 0) {
            require(
                tokenSupply[tokenId] + 1 <= maxSupply[tokenId],
                "Would exceed max supply"
            );
        }
        
        // Mark user as having minted this token
        hasMinted[tokenId][to] = true;
        
        // Update supply
        tokenSupply[tokenId] += 1;
        
        // Mint exactly 1 token
        _mint(to, tokenId, 1, "");
        
        emit TokenMinted(to, tokenId, 1, tx.origin);
    }
    

    
    /**
     * @dev Gets the URI for a specific token
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        require(tokenExists[tokenId], "Token does not exist");
        
        // Return specific token URI if set, otherwise return base URI
        if (bytes(tokenURIs[tokenId]).length > 0) {
            return tokenURIs[tokenId];
        }
        
        return super.uri(tokenId);
    }
    
    /**
     * @dev Sets the URI for a specific token (only token creator or owner)
     */
    function setTokenURI(uint256 tokenId, string memory _uri) external {
        require(tokenExists[tokenId], "Token does not exist");
        require(
            msg.sender == tokenCreator[tokenId] || msg.sender == owner(),
            "Not authorized to set URI"
        );
        
        tokenURIs[tokenId] = _uri;
    }
    
    /**
     * @dev Updates the base URI (only owner)
     */
    function setURI(string memory newURI) external onlyOwner {
        _setURI(newURI);
    }
    
    /**
     * @dev Pauses the contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpauses the contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Hook that is called before any token transfer
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override whenNotPaused {
        super._update(from, to, ids, values);
    }
    
    /**
     * @dev Gets basic token information
     */
    function getTokenInfo(uint256 tokenId) 
        external 
        view 
        returns (
            address creator,
            uint256 currentSupply,
            uint256 maximumSupply,
            string memory description,
            string memory tokenURI,
            bool exists
        ) 
    {
        return (
            tokenCreator[tokenId],
            tokenSupply[tokenId],
            maxSupply[tokenId],
            tokenDescription[tokenId],
            tokenURIs[tokenId],
            tokenExists[tokenId]
        );
    }
    
    /**
     * @dev Gets all created tokens for this event
     */
    function getCreatedTokens() external view returns (uint256[] memory) {
        // This is a simplified version - in production you might want to track this more efficiently
        uint256 count = 0;
        uint256 maxTokenId = 1000; // Reasonable limit for gas
        
        // Count existing tokens
        for (uint256 i = 0; i < maxTokenId; i++) {
            if (tokenExists[i]) {
                count++;
            }
        }
        
        // Fill array
        uint256[] memory tokens = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < maxTokenId; i++) {
            if (tokenExists[i]) {
                tokens[index] = i;
                index++;
            }
        }
        
        return tokens;
    }
    
    /**
     * @dev Checks if user holds this token (will always be 1 if they have it)
     */
    function holdsToken(address user, uint256 tokenId) external view returns (bool) {
        return hasMinted[tokenId][user];
    }
    
    /**
     * @dev Checks if user has already minted this specific token
     */
    function hasUserMinted(address user, uint256 tokenId) external view returns (bool) {
        return hasMinted[tokenId][user];
    }
}