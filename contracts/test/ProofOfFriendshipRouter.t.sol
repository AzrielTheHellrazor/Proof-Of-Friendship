// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {ProofOfFriendshipRouter} from "../src/ProofOfFriendshipRouter.sol";
import {EventNFT} from "../src/EventNFT.sol";

contract ProofOfFriendshipRouterTest is Test {
    ProofOfFriendshipRouter public router;
    address public creator;
    address public user1;
    address public user2;
    address public user3;
    address public eventNFT;

    function setUp() public {
        creator = address(1);
        user1 = address(2);
        user2 = address(3);
        user3 = address(4);
        
        router = new ProofOfFriendshipRouter();
    }

    function testCreateEvent() public {
        vm.startPrank(creator);
        
        vm.expectEmit(true, true, false, true);
        emit ProofOfFriendshipRouter.EventNFTCreated(
            address(0), // We don't know the exact address yet
            creator,
            "Summer Party",
            "A fun summer party with friends",
            "https://example.com/summer.jpg"
        );
        
        address newEventNFT = router.createEvent(
            "Summer Party",
            "A fun summer party with friends",
            "https://example.com/summer.jpg"
        );
        
        assertTrue(router.isEventNFT(newEventNFT));
        
        ProofOfFriendshipRouter.EventMetadata memory metadata = router.getEventMetadata(newEventNFT);
        assertEq(metadata.name, "Summer Party");
        assertEq(metadata.description, "A fun summer party with friends");
        assertEq(metadata.imageURI, "https://example.com/summer.jpg");
        assertEq(metadata.creator, creator);
        assertTrue(metadata.exists);
        
        vm.stopPrank();
    }

    function testCreateEventWithEmptyFields() public {
        vm.startPrank(creator);
        
        vm.expectRevert("Event name cannot be empty");
        router.createEvent("", "Description", "https://example.com/image.jpg");
        
        vm.expectRevert("Event description cannot be empty");
        router.createEvent("Name", "", "https://example.com/image.jpg");
        
        vm.expectRevert("Event image URI cannot be empty");
        router.createEvent("Name", "Description", "");
        
        vm.stopPrank();
    }

    function testMintNFT() public {
        // Create event first
        vm.startPrank(creator);
        address newEventNFT = router.createEvent(
            "Summer Party",
            "A fun summer party with friends",
            "https://example.com/summer.jpg"
        );
        
        // Create event token
        EventNFT(newEventNFT).createEventToken(100, "https://token1.com", "Group photo", false);
        vm.stopPrank();
        
        // Mint NFT
        vm.startPrank(user1);
        router.mint(newEventNFT);
        
        assertEq(EventNFT(newEventNFT).balanceOf(user1, 1), 1);
        assertTrue(EventNFT(newEventNFT).hasUserMintedEvent(user1));
        
        vm.stopPrank();
    }

    function testFriendshipPoints() public {
        // Create event
        vm.startPrank(creator);
        address newEventNFT = router.createEvent(
            "Summer Party",
            "A fun summer party with friends",
            "https://example.com/summer.jpg"
        );
        
        EventNFT(newEventNFT).createEventToken(100, "https://token1.com", "Group photo", false);
        vm.stopPrank();
        
        // First user mints
        vm.startPrank(user1);
        router.mint(newEventNFT);
        vm.stopPrank();
        
        // Second user mints - should earn friendship points with user1
        vm.startPrank(user2);
        router.mint(newEventNFT);
        vm.stopPrank();
        
        // Check friendship points
        uint256 points = router.getFriendshipPoints(user1, user2);
        assertEq(points, 5); // POINTS_PER_INTERACTION = 5
        
        // Third user mints - should earn friendship points with both user1 and user2
        vm.startPrank(user3);
        router.mint(newEventNFT);
        vm.stopPrank();
        
        // Check friendship points
        uint256 points1_2 = router.getFriendshipPoints(user1, user2);
        uint256 points1_3 = router.getFriendshipPoints(user1, user3);
        uint256 points2_3 = router.getFriendshipPoints(user2, user3);
        
        assertEq(points1_2, 5); // Still 5 (no additional interaction)
        assertEq(points1_3, 5); // New friendship
        assertEq(points2_3, 5); // New friendship
    }

    function testGetNFTHolders() public {
        // Create event
        vm.startPrank(creator);
        address newEventNFT = router.createEvent(
            "Summer Party",
            "A fun summer party with friends",
            "https://example.com/summer.jpg"
        );
        
        EventNFT(newEventNFT).createEventToken(100, "https://token1.com", "Group photo", false);
        vm.stopPrank();
        
        // Multiple users mint
        vm.startPrank(user1);
        router.mint(newEventNFT);
        vm.stopPrank();
        
        vm.startPrank(user2);
        router.mint(newEventNFT);
        vm.stopPrank();
        
        vm.startPrank(user3);
        router.mint(newEventNFT);
        vm.stopPrank();
        
        // Check holders
        address[] memory holders = router.getNFTHolders(newEventNFT, 1);
        assertEq(holders.length, 3);
        assertEq(holders[0], user1);
        assertEq(holders[1], user2);
        assertEq(holders[2], user3);
    }

    function testHasUserMintedNFT() public {
        // Create event
        vm.startPrank(creator);
        address newEventNFT = router.createEvent(
            "Summer Party",
            "A fun summer party with friends",
            "https://example.com/summer.jpg"
        );
        
        EventNFT(newEventNFT).createEventToken(100, "https://token1.com", "Group photo", false);
        vm.stopPrank();
        
        // User1 mints
        vm.startPrank(user1);
        router.mint(newEventNFT);
        vm.stopPrank();
        
        // Check mint status
        assertTrue(router.hasUserMintedNFT(newEventNFT, 1, user1));
        assertFalse(router.hasUserMintedNFT(newEventNFT, 1, user2));
    }

    function testGetAllEventNFTs() public {
        // Create multiple events
        vm.startPrank(creator);
        
        address event1 = router.createEvent(
            "Event 1",
            "First event",
            "https://example.com/event1.jpg"
        );
        
        address event2 = router.createEvent(
            "Event 2",
            "Second event",
            "https://example.com/event2.jpg"
        );
        
        vm.stopPrank();
        
        // Check all events
        address[] memory allEvents = router.getAllEventNFTs();
        assertEq(allEvents.length, 2);
        assertEq(allEvents[0], event1);
        assertEq(allEvents[1], event2);
    }

    function testGetFriendshipPointsBatch() public {
        // Create event
        vm.startPrank(creator);
        address newEventNFT = router.createEvent(
            "Summer Party",
            "A fun summer party with friends",
            "https://example.com/summer.jpg"
        );
        
        EventNFT(newEventNFT).createEventToken(100, "https://token1.com", "Group photo", false);
        vm.stopPrank();
        
        // Multiple users mint to create friendships
        vm.startPrank(user1);
        router.mint(newEventNFT);
        vm.stopPrank();
        
        vm.startPrank(user2);
        router.mint(newEventNFT);
        vm.stopPrank();
        
        vm.startPrank(user3);
        router.mint(newEventNFT);
        vm.stopPrank();
        
        // Test batch friendship points
        address[] memory friends = new address[](2);
        friends[0] = user2;
        friends[1] = user3;
        
        uint256[] memory points = router.getFriendshipPointsBatch(user1, friends);
        assertEq(points.length, 2);
        assertEq(points[0], 5); // user1 <-> user2
        assertEq(points[1], 5); // user1 <-> user3
    }

    function testWhitelistFunctionality() public {
        // Create event
        vm.startPrank(creator);
        address newEventNFT = router.createEvent(
            "Summer Party",
            "A fun summer party with friends",
            "https://example.com/summer.jpg"
        );
        
        EventNFT(newEventNFT).createEventToken(100, "https://token1.com", "Group photo", true);
        vm.stopPrank();
        
        // Add users to whitelist
        address[] memory addresses = new address[](2);
        addresses[0] = user1;
        addresses[1] = user2;
        
        vm.startPrank(creator);
        router.addToWhitelist(newEventNFT, addresses);
        vm.stopPrank();
        
        // Check whitelist status
        assertTrue(router.isUserWhitelisted(newEventNFT, user1));
        assertTrue(router.isUserWhitelisted(newEventNFT, user2));
        assertFalse(router.isUserWhitelisted(newEventNFT, user3));
        
        // Check mint eligibility
        (bool canMint1, ) = router.canUserMintEvent(newEventNFT, user1);
        (bool canMint2, ) = router.canUserMintEvent(newEventNFT, user2);
        (bool canMint3, ) = router.canUserMintEvent(newEventNFT, user3);
        
        assertTrue(canMint1);
        assertTrue(canMint2);
        assertFalse(canMint3);
    }

    function testWhitelistMinting() public {
        // Create event with whitelist enabled
        vm.startPrank(creator);
        address newEventNFT = router.createEvent(
            "Summer Party",
            "A fun summer party with friends",
            "https://example.com/summer.jpg"
        );
        
        EventNFT(newEventNFT).createEventToken(100, "https://token1.com", "Group photo", true);
        
        // Add user1 to whitelist
        address[] memory addresses = new address[](1);
        addresses[0] = user1;
        router.addToWhitelist(newEventNFT, addresses);
        vm.stopPrank();
        
        // user1 can mint (whitelisted)
        vm.startPrank(user1);
        router.mint(newEventNFT);
        vm.stopPrank();
        
        // user2 cannot mint (not whitelisted)
        vm.startPrank(user2);
        vm.expectRevert("Address not whitelisted for this event");
        router.mint(newEventNFT);
        vm.stopPrank();
    }

    function testRemoveFromWhitelist() public {
        // Create event
        vm.startPrank(creator);
        address newEventNFT = router.createEvent(
            "Summer Party",
            "A fun summer party with friends",
            "https://example.com/summer.jpg"
        );
        
        EventNFT(newEventNFT).createEventToken(100, "https://token1.com", "Group photo", true);
        
        // Add users to whitelist
        address[] memory addresses = new address[](2);
        addresses[0] = user1;
        addresses[1] = user2;
        router.addToWhitelist(newEventNFT, addresses);
        
        // Remove user1 from whitelist
        address[] memory removeAddresses = new address[](1);
        removeAddresses[0] = user1;
        router.removeFromWhitelist(newEventNFT, removeAddresses);
        vm.stopPrank();
        
        // Check whitelist status
        assertFalse(router.isUserWhitelisted(newEventNFT, user1));
        assertTrue(router.isUserWhitelisted(newEventNFT, user2));
    }

    function testSetWhitelistEnabled() public {
        // Create event
        vm.startPrank(creator);
        address newEventNFT = router.createEvent(
            "Summer Party",
            "A fun summer party with friends",
            "https://example.com/summer.jpg"
        );
        
        EventNFT(newEventNFT).createEventToken(100, "https://token1.com", "Group photo", false);
        
        // Enable whitelist
        router.setWhitelistEnabled(newEventNFT, true);
        
        // Disable whitelist
        router.setWhitelistEnabled(newEventNFT, false);
        vm.stopPrank();
    }

    function testPauseUnpauseEventNFT() public {
        // Create event
        vm.startPrank(creator);
        address newEventNFT = router.createEvent(
            "Summer Party",
            "A fun summer party with friends",
            "https://example.com/summer.jpg"
        );
        
        EventNFT(newEventNFT).createEventToken(100, "https://token1.com", "Group photo", false);
        vm.stopPrank();
        
        // Pause event NFT
        vm.startPrank(address(router.owner()));
        router.pauseEventNFT(newEventNFT);
        assertTrue(EventNFT(newEventNFT).paused());
        
        // Unpause event NFT
        router.unpauseEventNFT(newEventNFT);
        assertFalse(EventNFT(newEventNFT).paused());
        vm.stopPrank();
    }

    function testInvalidEventNFT() public {
        address invalidEvent = address(999);
        
        vm.expectRevert("Invalid event NFT contract");
        router.mint(invalidEvent);
        
        vm.expectRevert("Invalid event NFT contract");
        router.getEventMetadata(invalidEvent);
        
        vm.expectRevert("Invalid event NFT contract");
        router.getNFTHolders(invalidEvent, 1);
        
        vm.expectRevert("Invalid event NFT contract");
        router.hasUserMintedNFT(invalidEvent, 1, user1);
    }
}