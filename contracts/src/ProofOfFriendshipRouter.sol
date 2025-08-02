// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {EventNFT} from "./EventNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProofOfFriendshipRouter
 * @dev Main router contract that manages friendship points and controls NFT minting
 * @author Proof of Friendship Team
 */
contract ProofOfFriendshipRouter is Ownable, ReentrancyGuard {
    // Friendship points mapping - normalized to avoid double counting
    mapping(address => mapping(address => uint256)) public friendshipPoints;
    
    // Event NFT tracking
    address[] public eventNFTs;
    mapping(address => bool) public isEventNFT;
    mapping(address => EventMetadata) public eventMetadata;
    
    // NFT holders tracking for friendship points
    mapping(address => mapping(uint256 => address[])) public nftHolders; // eventNFT => tokenId => holders
    mapping(address => mapping(uint256 => mapping(address => bool))) public isNFTHolder;
    
    struct EventMetadata {
        string name;
        string description;
        string imageURI;
        address creator;
        uint256 createdAt;
        bool exists;
    }
    
    uint256 public constant POINTS_PER_INTERACTION = 5;
    
    // Events
    event EventNFTCreated(
        address indexed eventNFT,
        address indexed creator,
        string name,
        string description,
        string imageURI
    );
    
    event NFTMinted(
        address indexed user,
        address indexed eventNFT,
        uint256 indexed tokenId,
        uint256 friendshipPointsEarned
    );
    
    event FriendshipPointsUpdated(
        address indexed userA,
        address indexed userB,
        uint256 totalPoints,
        address indexed eventNFT,
        uint256 tokenId
    );
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Creates a new Event NFT collection
     * @param name Name of the event
     * @param description Description of the event  
     * @param imageURI Image URI for the event
     * @return eventNFT Address of the created EventNFT contract
     */
    function createEvent(
        string memory name,
        string memory description,
        string memory imageURI
    ) external returns (address eventNFT) {
        require(bytes(name).length > 0, "Event name cannot be empty");
        require(bytes(description).length > 0, "Event description cannot be empty");
        require(bytes(imageURI).length > 0, "Event image URI cannot be empty");
        
        // Deploy new EventNFT contract
        EventNFT newEventNFT = new EventNFT(name, imageURI, address(this));
        eventNFT = address(newEventNFT);
        
        // Store metadata
        eventNFTs.push(eventNFT);
        isEventNFT[eventNFT] = true;
        eventMetadata[eventNFT] = EventMetadata({
            name: name,
            description: description,
            imageURI: imageURI,
            creator: msg.sender,
            createdAt: block.timestamp,
            exists: true
        });
        
        emit EventNFTCreated(eventNFT, msg.sender, name, description, imageURI);
    }
    
    /**
     * @dev Mints exactly 1 event NFT and updates friendship points - ONLY way to mint NFTs
     * @param eventNFT Address of the EventNFT contract
     */
    function mint(
        address eventNFT
    ) external nonReentrant {
        require(isEventNFT[eventNFT], "Invalid event NFT contract");
        
        uint256 tokenId = 1; // Always use token ID 1 for the main event token
        
        // Get current holders of this specific NFT before minting
        address[] memory currentHolders = nftHolders[eventNFT][tokenId];
        
        // Mint exactly 1 NFT through the EventNFT contract
        EventNFT(eventNFT).mint(msg.sender);
        
        // Add to holders tracking (user now holds this token)
        nftHolders[eventNFT][tokenId].push(msg.sender);
        isNFTHolder[eventNFT][tokenId][msg.sender] = true;
        
        // Update friendship points with all current holders
        uint256 pointsEarned = _updateFriendshipPoints(msg.sender, currentHolders, eventNFT, tokenId);
        
        emit NFTMinted(msg.sender, eventNFT, tokenId, pointsEarned);
    }
    
    /**
     * @dev Internal function to update friendship points
     * @param newMinter Address of the new minter
     * @param existingHolders Array of existing token holders
     * @param eventNFT Address of the event NFT contract
     * @param tokenId Token ID that was minted
     */
    function _updateFriendshipPoints(
        address newMinter,
        address[] memory existingHolders,
        address eventNFT,
        uint256 tokenId
    ) internal returns (uint256 totalPointsEarned) {
        
        for (uint256 i = 0; i < existingHolders.length; i++) {
            address existingHolder = existingHolders[i];
            
            // Skip if it's the same address
            if (existingHolder == newMinter) {
                continue;
            }
            
            // Normalize addresses to ensure symmetry
            (address minAddr, address maxAddr) = _normalizeAddresses(newMinter, existingHolder);
            
            // Add friendship points
            friendshipPoints[minAddr][maxAddr] += POINTS_PER_INTERACTION;
            totalPointsEarned += POINTS_PER_INTERACTION;
            
            emit FriendshipPointsUpdated(
                newMinter,
                existingHolder,
                friendshipPoints[minAddr][maxAddr],
                eventNFT,
                tokenId
            );
        }
    }
    
    /**
     * @dev Normalizes two addresses to ensure consistent mapping
     */
    function _normalizeAddresses(address addr1, address addr2) 
        internal 
        pure 
        returns (address minAddr, address maxAddr) 
    {
        return addr1 < addr2 ? (addr1, addr2) : (addr2, addr1);
    }
    
    /**
     * @dev Gets friendship points between two users
     */
    function getFriendshipPoints(address userA, address userB) 
        external 
        view 
        returns (uint256) 
    {
        (address minAddr, address maxAddr) = _normalizeAddresses(userA, userB);
        return friendshipPoints[minAddr][maxAddr];
    }
    
    /**
     * @dev Gets all holders of a specific NFT
     */
    function getNFTHolders(address eventNFT, uint256 tokenId) 
        external 
        view 
        returns (address[] memory) 
    {
        return nftHolders[eventNFT][tokenId];
    }
    
    /**
     * @dev Gets all created event NFTs
     */
    function getAllEventNFTs() external view returns (address[] memory) {
        return eventNFTs;
    }
    
    /**
     * @dev Gets event metadata
     */
    function getEventMetadata(address eventNFT) 
        external 
        view 
        returns (EventMetadata memory) 
    {
        require(eventMetadata[eventNFT].exists, "Event does not exist");
        return eventMetadata[eventNFT];
    }
    
    /**
     * @dev Gets friendship points for a user with multiple other users
     */
    function getFriendshipPointsBatch(address user, address[] calldata friends)
        external
        view
        returns (uint256[] memory points)
    {
        points = new uint256[](friends.length);
        
        for (uint256 i = 0; i < friends.length; i++) {
            (address minAddr, address maxAddr) = _normalizeAddresses(user, friends[i]);
            points[i] = friendshipPoints[minAddr][maxAddr];
        }
    }
    
    /**
     * @dev Checks if user holds a specific NFT
     */
    function hasUserMintedNFT(address eventNFT, uint256 tokenId, address user) 
        external 
        view 
        returns (bool) 
    {
        return isNFTHolder[eventNFT][tokenId][user];
    }
    
    /**
     * @dev Emergency function to pause a specific event NFT contract (only owner)
     */
    function pauseEventNFT(address eventNFT) external onlyOwner {
        require(isEventNFT[eventNFT], "Invalid event NFT contract");
        EventNFT(eventNFT).pause();
    }
    
    /**
     * @dev Emergency function to unpause a specific event NFT contract (only owner)
     */
    function unpauseEventNFT(address eventNFT) external onlyOwner {
        require(isEventNFT[eventNFT], "Invalid event NFT contract");
        EventNFT(eventNFT).unpause();
    }
    
    /**
     * @dev Adds addresses to whitelist for an event NFT (convenience function)
     * @param eventNFT Address of the EventNFT contract
     * @param addresses Array of addresses to add to whitelist
     */
    function addToWhitelist(
        address eventNFT,
        address[] calldata addresses
    ) external {
        require(isEventNFT[eventNFT], "Invalid event NFT contract");
        EventNFT(eventNFT).addToWhitelist(addresses);
    }
    
    /**
     * @dev Removes addresses from whitelist for an event NFT (convenience function)
     * @param eventNFT Address of the EventNFT contract
     * @param addresses Array of addresses to remove from whitelist
     */
    function removeFromWhitelist(
        address eventNFT,
        address[] calldata addresses
    ) external {
        require(isEventNFT[eventNFT], "Invalid event NFT contract");
        EventNFT(eventNFT).removeFromWhitelist(addresses);
    }
    
    /**
     * @dev Sets whitelist status for an event NFT (convenience function)
     * @param eventNFT Address of the EventNFT contract
     * @param enabled Whether whitelist should be enabled
     */
    function setWhitelistEnabled(
        address eventNFT,
        bool enabled
    ) external {
        require(isEventNFT[eventNFT], "Invalid event NFT contract");
        EventNFT(eventNFT).setWhitelistEnabled(enabled);
    }
    
    /**
     * @dev Checks if user is whitelisted for an event (convenience function)
     * @param eventNFT Address of the EventNFT contract
     * @param user Address to check
     */
    function isUserWhitelisted(
        address eventNFT,
        address user
    ) external view returns (bool) {
        require(isEventNFT[eventNFT], "Invalid event NFT contract");
        return EventNFT(eventNFT).isUserWhitelisted(user);
    }
    
    /**
     * @dev Checks if user can mint an event token (convenience function)
     * @param eventNFT Address of the EventNFT contract
     * @param user Address to check
     */
    function canUserMintEvent(
        address eventNFT,
        address user
    ) external view returns (bool canMint, string memory reason) {
        require(isEventNFT[eventNFT], "Invalid event NFT contract");
        return EventNFT(eventNFT).canUserMintEvent(user);
    }
}