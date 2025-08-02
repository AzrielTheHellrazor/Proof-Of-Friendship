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
    
    // Whitelist management - per token whitelist
    mapping(uint256 => mapping(address => bool)) public isWhitelisted;
    mapping(uint256 => bool) public whitelistEnabled;
    
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
    
    event WhitelistStatusChanged(
        uint256 indexed tokenId,
        bool enabled
    );
    
    event UserWhitelisted(
        uint256 indexed tokenId,
        address indexed user,
        address indexed addedBy
    );
    
    event UserRemovedFromWhitelist(
        uint256 indexed tokenId,
        address indexed user,
        address indexed removedBy
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
     * @dev Creates the main event token (only one token per event)
     * @param _maxSupply Maximum supply for this token (0 = unlimited)
     * @param _uri URI for token metadata
     * @param _description Description of this event
     * @param _whitelistEnabled Whether whitelist is enabled for this token
     */
    function createEventToken(
        uint256 _maxSupply,
        string memory _uri,
        string memory _description,
        bool _whitelistEnabled
    ) external whenNotPaused {
        uint256 tokenId = 1; // Always use token ID 1 for the main event token
        require(!tokenExists[tokenId], "Event token already exists");
        require(bytes(_uri).length > 0, "URI cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        
        tokenExists[tokenId] = true;
        maxSupply[tokenId] = _maxSupply;
        tokenURIs[tokenId] = _uri;
        tokenCreator[tokenId] = msg.sender;
        tokenDescription[tokenId] = _description;
        whitelistEnabled[tokenId] = _whitelistEnabled;
        
        emit TokenCreated(tokenId, msg.sender, _maxSupply, _uri, _description);
        
        if (_whitelistEnabled) {
            emit WhitelistStatusChanged(tokenId, true);
        }
    }
    
    /**
     * @dev Mints exactly 1 event token - ONLY callable by router
     * @param to Address to mint to
     */
    function mint(
        address to
    ) external onlyRouter nonReentrant whenNotPaused {
        uint256 tokenId = 1; // Always use token ID 1 for the main event token
        require(tokenExists[tokenId], "Event token does not exist");
        require(!hasMinted[tokenId][to], "User already minted this event token");
        
        // Check whitelist if enabled
        if (whitelistEnabled[tokenId]) {
            require(isWhitelisted[tokenId][to], "Address not whitelisted for this event");
        }
        
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
     * @dev Adds multiple addresses to whitelist for the event (only event creator or owner)
     * @param addresses Array of addresses to add to whitelist
     */
    function addToWhitelist(address[] calldata addresses) external {
        uint256 tokenId = 1; // Always use token ID 1 for the main event token
        require(tokenExists[tokenId], "Event token does not exist");
        require(
            msg.sender == tokenCreator[tokenId] || msg.sender == owner(),
            "Not authorized to manage whitelist"
        );
        
        for (uint256 i = 0; i < addresses.length; i++) {
            if (!isWhitelisted[tokenId][addresses[i]]) {
                isWhitelisted[tokenId][addresses[i]] = true;
                emit UserWhitelisted(tokenId, addresses[i], msg.sender);
            }
        }
    }
    
    /**
     * @dev Removes multiple addresses from whitelist for the event (only event creator or owner)
     * @param addresses Array of addresses to remove from whitelist
     */
    function removeFromWhitelist(address[] calldata addresses) external {
        uint256 tokenId = 1; // Always use token ID 1 for the main event token
        require(tokenExists[tokenId], "Event token does not exist");
        require(
            msg.sender == tokenCreator[tokenId] || msg.sender == owner(),
            "Not authorized to manage whitelist"
        );
        
        for (uint256 i = 0; i < addresses.length; i++) {
            if (isWhitelisted[tokenId][addresses[i]]) {
                isWhitelisted[tokenId][addresses[i]] = false;
                emit UserRemovedFromWhitelist(tokenId, addresses[i], msg.sender);
            }
        }
    }
    
    /**
     * @dev Toggles whitelist status for the event (only event creator or owner)
     * @param enabled Whether whitelist should be enabled
     */
    function setWhitelistEnabled(bool enabled) external {
        uint256 tokenId = 1; // Always use token ID 1 for the main event token
        require(tokenExists[tokenId], "Event token does not exist");
        require(
            msg.sender == tokenCreator[tokenId] || msg.sender == owner(),
            "Not authorized to manage whitelist"
        );
        
        whitelistEnabled[tokenId] = enabled;
        emit WhitelistStatusChanged(tokenId, enabled);
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
     * @dev Gets basic event token information
     */
    function getEventTokenInfo() 
        external 
        view 
        returns (
            address creator,
            uint256 currentSupply,
            uint256 maximumSupply,
            string memory description,
            string memory tokenURI,
            bool exists,
            bool whitelistEnabledForToken
        ) 
    {
        uint256 tokenId = 1; // Always use token ID 1 for the main event token
        return (
            tokenCreator[tokenId],
            tokenSupply[tokenId],
            maxSupply[tokenId],
            tokenDescription[tokenId],
            tokenURIs[tokenId],
            tokenExists[tokenId],
            whitelistEnabled[tokenId]
        );
    }
    
    /**
     * @dev Gets the event token ID (always returns [1] if token exists)
     */
    function getEventTokenId() external view returns (uint256[] memory) {
        if (tokenExists[1]) {
            uint256[] memory tokens = new uint256[](1);
            tokens[0] = 1;
            return tokens;
        } else {
            return new uint256[](0);
        }
    }
    
    /**
     * @dev Checks if user holds the event token
     */
    function holdsEventToken(address user) external view returns (bool) {
        return hasMinted[1][user];
    }
    
    /**
     * @dev Checks if user has already minted the event token
     */
    function hasUserMintedEvent(address user) external view returns (bool) {
        return hasMinted[1][user];
    }
    
    /**
     * @dev Checks if user is whitelisted for the event
     */
    function isUserWhitelisted(address user) external view returns (bool) {
        return isWhitelisted[1][user];
    }
    
    /**
     * @dev Checks if user can mint the event token (considering whitelist)
     */
    function canUserMintEvent(address user) external view returns (bool canMint, string memory reason) {
        if (!tokenExists[1]) {
            return (false, "Event token does not exist");
        }
        
        if (hasMinted[1][user]) {
            return (false, "User already minted this event token");
        }
        
        if (whitelistEnabled[1] && !isWhitelisted[1][user]) {
            return (false, "User not whitelisted for this event");
        }
        
        if (maxSupply[1] > 0 && tokenSupply[1] >= maxSupply[1]) {
            return (false, "Event token supply exhausted");
        }
        
        return (true, "User can mint event token");
    }
}