// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProofOfFriendship
 * @dev A contract for minting NFTs as proof of attending social events
 * @author Your Name
 */
contract ProofOfFriendship is ERC721, ERC721Enumerable, Ownable {
    // Event structure
    struct Event {
        string name;
        string description;
        string imageURI;
        bool exists;
        uint256 totalMinted;
    }

    // State variables
    uint256 private _tokenIdCounter;
    mapping(uint256 => Event) public events;
    mapping(address => mapping(uint256 => bool)) public hasMintedForEvent;
    mapping(address => uint256) public userEventCount;
    uint256 public totalEvents;

    // Events
    event EventCreated(uint256 indexed eventId, string name, string description, string imageURI);
    event NFTMinted(address indexed to, uint256 indexed tokenId, uint256 indexed eventId);

    /**
     * @dev Constructor sets the token name and symbol
     */
    constructor() ERC721("Proof of Friendship", "POF") Ownable(msg.sender) {}

    /**
     * @dev Creates a new event (only owner)
     * @param name Event name
     * @param description Event description
     * @param imageURI URI for the event image
     * @return eventId The ID of the created event
     */
    function createEvent(
        string memory name,
        string memory description,
        string memory imageURI
    ) public onlyOwner returns (uint256 eventId) {
        require(bytes(name).length > 0, "Event name cannot be empty");
        require(bytes(description).length > 0, "Event description cannot be empty");
        require(bytes(imageURI).length > 0, "Event image URI cannot be empty");

        eventId = totalEvents;
        events[eventId] = Event({
            name: name,
            description: description,
            imageURI: imageURI,
            exists: true,
            totalMinted: 0
        });

        totalEvents++;
        emit EventCreated(eventId, name, description, imageURI);
    }

    /**
     * @dev Mints an NFT for a specific event
     * @param eventId The ID of the event to mint for
     */
    function mintForEvent(uint256 eventId) public {
        require(events[eventId].exists, "Event does not exist");
        require(!hasMintedForEvent[msg.sender][eventId], "Already minted for this event");

        // Mark user as having minted for this event
        hasMintedForEvent[msg.sender][eventId] = true;
        
        // Increment user's event count if this is their first time
        if (userEventCount[msg.sender] == 0) {
            userEventCount[msg.sender] = 1;
        } else {
            userEventCount[msg.sender]++;
        }

        // Increment event's total minted count
        events[eventId].totalMinted++;

        // Mint the NFT
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        _safeMint(msg.sender, newTokenId);

        emit NFTMinted(msg.sender, newTokenId, eventId);
    }

    /**
     * @dev Returns the number of unique events a user has attended
     * @param user Address of the user
     * @return count Number of events attended
     */
    function countEventsAttended(address user) public view returns (uint256 count) {
        return userEventCount[user];
    }

    /**
     * @dev Checks if a user has minted for a specific event
     * @param user Address of the user
     * @param eventId ID of the event
     * @return True if user has minted for this event
     */
    function hasUserMintedForEvent(address user, uint256 eventId) public view returns (bool) {
        return hasMintedForEvent[user][eventId];
    }

    /**
     * @dev Returns event details
     * @param eventId ID of the event
     * @return name Event name
     * @return description Event description
     * @return imageURI Event image URI
     * @return totalMinted Total NFTs minted for this event
     * @return exists Whether the event exists
     */
    function getEvent(uint256 eventId) public view returns (
        string memory name,
        string memory description,
        string memory imageURI,
        uint256 totalMinted,
        bool exists
    ) {
        Event memory eventData = events[eventId];
        return (
            eventData.name,
            eventData.description,
            eventData.imageURI,
            eventData.totalMinted,
            eventData.exists
        );
    }

    /**
     * @dev Returns all events (for frontend use)
     * @return eventIds Array of event IDs
     * @return eventNames Array of event names
     * @return eventDescriptions Array of event descriptions
     * @return eventImageURIs Array of event image URIs
     * @return eventTotalMinted Array of total minted counts
     */
    function getAllEvents() public view returns (
        uint256[] memory eventIds,
        string[] memory eventNames,
        string[] memory eventDescriptions,
        string[] memory eventImageURIs,
        uint256[] memory eventTotalMinted
    ) {
        eventIds = new uint256[](totalEvents);
        eventNames = new string[](totalEvents);
        eventDescriptions = new string[](totalEvents);
        eventImageURIs = new string[](totalEvents);
        eventTotalMinted = new uint256[](totalEvents);

        for (uint256 i = 0; i < totalEvents; i++) {
            Event memory eventData = events[i];
            eventIds[i] = i;
            eventNames[i] = eventData.name;
            eventDescriptions[i] = eventData.description;
            eventImageURIs[i] = eventData.imageURI;
            eventTotalMinted[i] = eventData.totalMinted;
        }
    }

    /**
     * @dev Override required by Solidity
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Override required by Solidity
     */
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    /**
     * @dev Override required by Solidity
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
} 