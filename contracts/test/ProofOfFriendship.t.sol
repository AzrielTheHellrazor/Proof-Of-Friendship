// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {ProofOfFriendship} from "../src/ProofOfFriendship.sol";

contract ProofOfFriendshipTest is Test {
    ProofOfFriendship public proofOfFriendship;
    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);

    function setUp() public {
        vm.startPrank(owner);
        proofOfFriendship = new ProofOfFriendship();
        vm.stopPrank();
    }

    function testCreateEvent() public {
        vm.startPrank(owner);
        
        uint256 eventId = proofOfFriendship.createEvent(
            "Summer BBQ",
            "A fun summer barbecue party",
            "https://example.com/bbq.jpg"
        );
        
        assertEq(eventId, 0);
        assertEq(proofOfFriendship.totalEvents(), 1);
        
        (string memory name, string memory description, string memory imageURI, uint256 totalMinted, bool exists) = proofOfFriendship.getEvent(0);
        assertEq(name, "Summer BBQ");
        assertEq(description, "A fun summer barbecue party");
        assertEq(imageURI, "https://example.com/bbq.jpg");
        assertEq(totalMinted, 0);
        assertTrue(exists);
        
        vm.stopPrank();
    }

    function testMintForEvent() public {
        vm.startPrank(owner);
        uint256 eventId = proofOfFriendship.createEvent(
            "Summer BBQ",
            "A fun summer barbecue party",
            "https://example.com/bbq.jpg"
        );
        vm.stopPrank();

        vm.startPrank(user1);
        proofOfFriendship.mintForEvent(eventId);
        
        assertEq(proofOfFriendship.countEventsAttended(user1), 1);
        assertTrue(proofOfFriendship.hasUserMintedForEvent(user1, eventId));
        
        (,,, uint256 totalMinted,) = proofOfFriendship.getEvent(eventId);
        assertEq(totalMinted, 1);
        
        vm.stopPrank();
    }

    function testCannotMintTwiceForSameEvent() public {
        vm.startPrank(owner);
        uint256 eventId = proofOfFriendship.createEvent(
            "Summer BBQ",
            "A fun summer barbecue party",
            "https://example.com/bbq.jpg"
        );
        vm.stopPrank();

        vm.startPrank(user1);
        proofOfFriendship.mintForEvent(eventId);
        
        vm.expectRevert("Already minted for this event");
        proofOfFriendship.mintForEvent(eventId);
        
        vm.stopPrank();
    }

    function testMultipleEvents() public {
        vm.startPrank(owner);
        uint256 event1 = proofOfFriendship.createEvent("Event 1", "First event", "image1.jpg");
        uint256 event2 = proofOfFriendship.createEvent("Event 2", "Second event", "image2.jpg");
        vm.stopPrank();

        vm.startPrank(user1);
        proofOfFriendship.mintForEvent(event1);
        proofOfFriendship.mintForEvent(event2);
        
        assertEq(proofOfFriendship.countEventsAttended(user1), 2);
        assertTrue(proofOfFriendship.hasUserMintedForEvent(user1, event1));
        assertTrue(proofOfFriendship.hasUserMintedForEvent(user1, event2));
        
        vm.stopPrank();
    }

    function testNonOwnerCannotCreateEvent() public {
        vm.startPrank(user1);
        
        vm.expectRevert();
        proofOfFriendship.createEvent("Event", "Description", "image.jpg");
        
        vm.stopPrank();
    }

    function testMintForNonExistentEvent() public {
        vm.startPrank(user1);
        
        vm.expectRevert("Event does not exist");
        proofOfFriendship.mintForEvent(999);
        
        vm.stopPrank();
    }
} 