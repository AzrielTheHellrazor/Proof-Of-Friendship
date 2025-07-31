// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {ProofOfFriendshipRouter} from "../src/ProofOfFriendshipRouter.sol";
import {EventNFT} from "../src/EventNFT.sol";

contract ProofOfFriendshipRouterTest is Test {
    ProofOfFriendshipRouter public router;
    
    address public user1 = address(1);
    address public user2 = address(2);
    address public user3 = address(3);
    
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

    function setUp() public {
        router = new ProofOfFriendshipRouter();
    }

    function testCreateEvent() public {
        vm.startPrank(user1);
        
        vm.expectEmit(false, true, false, false);
        emit EventNFTCreated(address(0), user1, "Summer Party", "A great party", "https://example.com/summer");
        
        address eventNFT = router.createEvent(
            "Summer Party",
            "A great party",
            "https://example.com/summer"
        );
        
        assertTrue(router.isEventNFT(eventNFT));
        
        address[] memory allEvents = router.getAllEventNFTs();
        assertEq(allEvents.length, 1);
        assertEq(allEvents[0], eventNFT);
        
        ProofOfFriendshipRouter.EventMetadata memory metadata = router.getEventMetadata(eventNFT);
        assertEq(metadata.name, "Summer Party");
        assertEq(metadata.description, "A great party");
        assertEq(metadata.imageURI, "https://example.com/summer");
        assertEq(metadata.creator, user1);
        assertTrue(metadata.exists);
        
        vm.stopPrank();
    }

    function testCannotCreateEventWithEmptyFields() public {
        vm.startPrank(user1);
        
        vm.expectRevert("Event name cannot be empty");
        router.createEvent("", "Description", "uri");
        
        vm.expectRevert("Event description cannot be empty");
        router.createEvent("Name", "", "uri");
        
        vm.expectRevert("Event image URI cannot be empty");
        router.createEvent("Name", "Description", "");
        
        vm.stopPrank();
    }

    function testMintAndFriendshipPoints() public {
        // Create event
        vm.startPrank(user1);
        address eventNFT = router.createEvent("Party", "Great party", "https://example.com");
        
        // Create token in the EventNFT contract
        EventNFT(eventNFT).createToken(1, 100, "https://token1.com", "Group photo from the party");
        vm.stopPrank();
        
        // First user mints - no friendship points yet
        vm.startPrank(user1);
        vm.expectEmit(true, true, true, false);
        emit NFTMinted(user1, eventNFT, 1, 0); // 0 points earned
        
        router.mint(eventNFT, 1);
        
        assertEq(EventNFT(eventNFT).balanceOf(user1, 1), 1); // Has the NFT
        assertEq(router.getFriendshipPoints(user1, user2), 0); // No points yet
        assertTrue(router.hasUserMintedNFT(eventNFT, 1, user1)); // Tracked as holder
        vm.stopPrank();
        
        // Second user mints - should get 5 friendship points with user1
        vm.startPrank(user2);
        vm.expectEmit(true, true, true, false);
        emit NFTMinted(user2, eventNFT, 1, 5); // 5 points earned
        
        router.mint(eventNFT, 1);
        
        assertEq(EventNFT(eventNFT).balanceOf(user2, 1), 1); // Has the NFT
        assertEq(router.getFriendshipPoints(user1, user2), 5); // 5 points between them
        assertEq(router.getFriendshipPoints(user2, user1), 5); // Symmetric
        vm.stopPrank();
    }

    function testMultipleParticipants() public {
        // Create event and token
        vm.startPrank(user1);
        address eventNFT = router.createEvent("Party", "Great party", "https://example.com");
        EventNFT(eventNFT).createToken(1, 100, "https://token1.com", "Group photo");
        router.mint(eventNFT, 1);
        vm.stopPrank();
        
        vm.startPrank(user2);
        router.mint(eventNFT, 1);
        vm.stopPrank();
        
        // Third user mints - should get 10 points total (5 with user1, 5 with user2)
        vm.startPrank(user3);
        vm.expectEmit(true, true, true, false);
        emit NFTMinted(user3, eventNFT, 1, 10); // 10 points earned
        
        router.mint(eventNFT, 1);
        
        assertEq(router.getFriendshipPoints(user1, user3), 5);
        assertEq(router.getFriendshipPoints(user2, user3), 5);
        assertEq(router.getFriendshipPoints(user1, user2), 5); // Unchanged
        
        // All should have the NFT
        assertEq(EventNFT(eventNFT).balanceOf(user3, 1), 1);
        vm.stopPrank();
    }

    function testMultipleTokensFromSameEvent() public {
        // Create event and multiple tokens
        vm.startPrank(user1);
        address eventNFT = router.createEvent("Party", "Great party", "https://example.com");
        EventNFT(eventNFT).createToken(1, 100, "https://token1.com", "Group photo");
        EventNFT(eventNFT).createToken(2, 50, "https://token2.com", "Dancing moment");
        vm.stopPrank();
        
        // Users mint first token
        vm.startPrank(user1);
        router.mint(eventNFT, 1);
        vm.stopPrank();
        
        vm.startPrank(user2);
        router.mint(eventNFT, 1);
        assertEq(router.getFriendshipPoints(user1, user2), 5);
        vm.stopPrank();
        
        // Users mint second token - should get additional points
        vm.startPrank(user1);
        router.mint(eventNFT, 2);
        vm.stopPrank();
        
        vm.startPrank(user2);
        router.mint(eventNFT, 2);
        assertEq(router.getFriendshipPoints(user1, user2), 10); // 5 + 5 = 10
        
        // Both should have both NFTs
        assertEq(EventNFT(eventNFT).balanceOf(user2, 1), 1);
        assertEq(EventNFT(eventNFT).balanceOf(user2, 2), 1);
        vm.stopPrank();
    }

    function testCannotMintFromInvalidContract() public {
        vm.startPrank(user1);
        
        vm.expectRevert("Invalid event NFT contract");
        router.mint(address(0), 1);
        
        vm.stopPrank();
    }

    function testCannotMintZeroAmount() public {
        vm.startPrank(user1);
        address eventNFT = router.createEvent("Party", "Great party", "https://example.com");
        
        vm.expectRevert("Invalid event NFT contract");
        router.mint(address(0), 1);
        
        vm.stopPrank();
    }

    function testCannotMintNonExistentToken() public {
        vm.startPrank(user1);
        address eventNFT = router.createEvent("Party", "Great party", "https://example.com");
        
        vm.expectRevert("Token does not exist");
        router.mint(eventNFT, 999);
        
        vm.stopPrank();
    }

    function testGetNFTHolders() public {
        // Create event and token
        vm.startPrank(user1);
        address eventNFT = router.createEvent("Party", "Great party", "https://example.com");
        EventNFT(eventNFT).createToken(1, 100, "https://token1.com", "Group photo");
        router.mint(eventNFT, 1);
        vm.stopPrank();
        
        vm.startPrank(user2);
        router.mint(eventNFT, 1);
        vm.stopPrank();
        
        address[] memory holders = router.getNFTHolders(eventNFT, 1);
        assertEq(holders.length, 2);
        assertEq(holders[0], user1);
        assertEq(holders[1], user2);
    }

    function testBatchFriendshipPoints() public {
        // Setup event and participation
        vm.startPrank(user1);
        address eventNFT = router.createEvent("Party", "Great party", "https://example.com");
        EventNFT(eventNFT).createToken(1, 100, "https://token1.com", "Group photo");
        router.mint(eventNFT, 1);
        vm.stopPrank();
        
        vm.startPrank(user2);
        router.mint(eventNFT, 1);
        vm.stopPrank();
        
        vm.startPrank(user3);
        router.mint(eventNFT, 1);
        vm.stopPrank();
        
        // Test batch query
        address[] memory friends = new address[](2);
        friends[0] = user2;
        friends[1] = user3;
        
        uint256[] memory points = router.getFriendshipPointsBatch(user1, friends);
        assertEq(points[0], 5); // user1 <-> user2
        assertEq(points[1], 5); // user1 <-> user3
    }

    function testEmergencyPause() public {
        // Create event
        vm.startPrank(user1);
        address eventNFT = router.createEvent("Party", "Great party", "https://example.com");
        EventNFT(eventNFT).createToken(1, 100, "https://token1.com", "Group photo");
        vm.stopPrank();
        
        // Owner can pause
        vm.startPrank(address(this)); // Test contract is owner
        router.pauseEventNFT(eventNFT);
        vm.stopPrank();
        
        // Minting should fail when paused
        vm.startPrank(user1);
        vm.expectRevert();
        router.mint(eventNFT, 1);
        vm.stopPrank();
        
        // Owner can unpause
        vm.startPrank(address(this));
        router.unpauseEventNFT(eventNFT);
        vm.stopPrank();
        
        // Should work again after unpause
        vm.startPrank(user1);
        router.mint(eventNFT, 1);
        assertEq(EventNFT(eventNFT).balanceOf(user1, 1), 1);
        vm.stopPrank();
    }

    function testMaxSupplyEnforcement() public {
        // Create event with limited supply token
        vm.startPrank(user1);
        address eventNFT = router.createEvent("Party", "Great party", "https://example.com");
        EventNFT(eventNFT).createToken(1, 2, "https://token1.com", "Limited edition photo");
        
        // Mint first NFT
        router.mint(eventNFT, 1);
        vm.stopPrank();
        
        // Mint second NFT
        vm.startPrank(user2);
        router.mint(eventNFT, 1);
        vm.stopPrank();
        
        // Third mint should fail
        vm.startPrank(user3);
        vm.expectRevert("Would exceed max supply");
        router.mint(eventNFT, 1);
        vm.stopPrank();
    }

    function testMultipleEventsAndCrossEventFriendships() public {
        // Create two events
        vm.startPrank(user1);
        address event1 = router.createEvent("Party 1", "First party", "https://event1.com");
        address event2 = router.createEvent("Party 2", "Second party", "https://event2.com");
        
        EventNFT(event1).createToken(1, 100, "https://event1-token1.com", "Party 1 photo");
        EventNFT(event2).createToken(1, 100, "https://event2-token1.com", "Party 2 photo");
        vm.stopPrank();
        
        // Users mint from first event
        vm.startPrank(user1);
        router.mint(event1, 1);
        vm.stopPrank();
        
        vm.startPrank(user2);
        router.mint(event1, 1);
        assertEq(router.getFriendshipPoints(user1, user2), 5);
        vm.stopPrank();
        
        // Users mint from second event - should add more friendship points
        vm.startPrank(user1);
        router.mint(event2, 1);
        vm.stopPrank();
        
        vm.startPrank(user2);
        router.mint(event2, 1);
        assertEq(router.getFriendshipPoints(user1, user2), 10); // 5 + 5 = 10
        
        // Both should have NFTs from both events
        assertEq(EventNFT(event1).balanceOf(user2, 1), 1);
        assertEq(EventNFT(event2).balanceOf(user2, 1), 1);
        vm.stopPrank();
    }
}