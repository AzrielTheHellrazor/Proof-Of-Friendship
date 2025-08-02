// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {EventNFT} from "../src/EventNFT.sol";

contract EventNFTTest is Test {
    EventNFT public eventNFT;
    address public creator;
    address public router;
    address public user1;
    address public user2;

    function setUp() public {
        creator = address(1);
        router = address(2);
        user1 = address(3);
        user2 = address(4);
        
        vm.startPrank(router);
        eventNFT = new EventNFT("Test Event", "https://test.com", router);
        vm.stopPrank();
    }

    function testCreateEventToken() public {
        vm.startPrank(creator);
        
        vm.expectEmit(true, true, false, true);
        emit EventNFT.TokenCreated(1, creator, 100, "https://token1.com", "Group photo from party");
        
        eventNFT.createEventToken(100, "https://token1.com", "Group photo from party", false);
        
        assertTrue(eventNFT.tokenExists(1));
        assertEq(eventNFT.maxSupply(1), 100);
        assertEq(eventNFT.tokenURIs(1), "https://token1.com");
        assertEq(eventNFT.tokenCreator(1), creator);
        assertEq(eventNFT.tokenDescription(1), "Group photo from party");
        assertFalse(eventNFT.whitelistEnabled(1));
        
        vm.stopPrank();
    }

    function testCannotCreateEventTokenTwice() public {
        vm.startPrank(creator);
        eventNFT.createEventToken(100, "https://token1.com", "Group photo", false);
        
        vm.expectRevert("Event token already exists");
        eventNFT.createEventToken(50, "https://token1-duplicate.com", "Duplicate", false);
        
        vm.stopPrank();
    }

    function testCannotCreateEventTokenWithEmptyFields() public {
        vm.startPrank(creator);
        
        vm.expectRevert("URI cannot be empty");
        eventNFT.createEventToken(100, "", "Description", false);
        
        vm.expectRevert("Description cannot be empty");
        eventNFT.createEventToken(100, "https://token1.com", "", false);
        
        vm.stopPrank();
    }

    function testMintOnlyByRouter() public {
        // Create token first
        vm.startPrank(creator);
        eventNFT.createEventToken(100, "https://token1.com", "Group photo", false);
        vm.stopPrank();
        
        // Only router can mint
        vm.startPrank(router);
        eventNFT.mint(user1);
        assertEq(eventNFT.balanceOf(user1, 1), 1);
        assertEq(eventNFT.tokenSupply(1), 1);
        assertTrue(eventNFT.hasUserMintedEvent(user1));
        vm.stopPrank();
        
        // Non-router cannot mint
        vm.startPrank(user1);
        vm.expectRevert("Only router can call this function");
        eventNFT.mint(user1);
        vm.stopPrank();
    }

    function testMaxSupplyEnforcement() public {
        // Create token with max supply of 2
        vm.startPrank(creator);
        eventNFT.createEventToken(2, "https://token1.com", "Limited edition", false);
        vm.stopPrank();
        
        vm.startPrank(router);
        // Mint first token
        eventNFT.mint(user1);
        assertEq(eventNFT.tokenSupply(1), 1);
        
        // Mint second token (should reach max)
        eventNFT.mint(user2);
        assertEq(eventNFT.tokenSupply(1), 2);
        
        vm.stopPrank();
        
        // Try to mint to a third user (should fail - max supply reached)
        address user3 = address(5);
        vm.startPrank(router);
        vm.expectRevert("Would exceed max supply");
        eventNFT.mint(user3);
        
        vm.stopPrank();
    }

    function testUnlimitedSupply() public {
        // Create token with unlimited supply (maxSupply = 0)
        vm.startPrank(creator);
        eventNFT.createEventToken(0, "https://token1.com", "Unlimited edition", false);
        vm.stopPrank();
        
        vm.startPrank(router);
        // Should be able to mint to many users (unlimited supply)
        eventNFT.mint(user1);
        eventNFT.mint(user2);
        
        // Create many more users to test unlimited supply
        for (uint256 i = 10; i < 20; i++) {
            eventNFT.mint(address(uint160(i)));
        }
        
        assertEq(eventNFT.tokenSupply(1), 12); // 2 + 10 users
        vm.stopPrank();
    }

    function testCannotMintTwice() public {
        // Create token
        vm.startPrank(creator);
        eventNFT.createEventToken(100, "https://token1.com", "Group photo", false);
        vm.stopPrank();
        
        vm.startPrank(router);
        // First mint succeeds
        eventNFT.mint(user1);
        assertEq(eventNFT.balanceOf(user1, 1), 1);
        assertTrue(eventNFT.hasUserMintedEvent(user1));
        
        // Second mint to same user should fail
        vm.expectRevert("User already minted this event token");
        eventNFT.mint(user1);
        
        vm.stopPrank();
    }

    function testTokenURI() public {
        vm.startPrank(creator);
        eventNFT.createEventToken(100, "https://custom-token.com", "Custom token", false);
        vm.stopPrank();
        
        assertEq(eventNFT.uri(1), "https://custom-token.com");
    }

    function testSetTokenURI() public {
        vm.startPrank(creator);
        eventNFT.createEventToken(100, "https://original.com", "Original", false);
        
        // Creator can set URI
        eventNFT.setTokenURI(1, "https://updated.com");
        assertEq(eventNFT.uri(1), "https://updated.com");
        
        vm.stopPrank();
    }

    function testSetTokenURINotAuthorized() public {
        vm.startPrank(creator);
        eventNFT.createEventToken(100, "https://original.com", "Original", false);
        vm.stopPrank();
        
        // Non-creator cannot set URI
        vm.startPrank(user1);
        vm.expectRevert("Not authorized to set URI");
        eventNFT.setTokenURI(1, "https://hacked.com");
        vm.stopPrank();
    }

    function testGetEventTokenInfo() public {
        vm.startPrank(creator);
        eventNFT.createEventToken(100, "https://token1.com", "Test description", true);
        vm.stopPrank();
        
        (
            address tokenCreator,
            uint256 currentSupply,
            uint256 maximumSupply,
            string memory description,
            string memory tokenURI,
            bool exists,
            bool whitelistEnabledForToken
        ) = eventNFT.getEventTokenInfo();
        
        assertEq(tokenCreator, creator);
        assertEq(currentSupply, 0);
        assertEq(maximumSupply, 100);
        assertEq(description, "Test description");
        assertEq(tokenURI, "https://token1.com");
        assertTrue(exists);
        assertTrue(whitelistEnabledForToken);
    }

    function testGetEventTokenId() public {
        vm.startPrank(creator);
        eventNFT.createEventToken(100, "https://token1.com", "Test", false);
        vm.stopPrank();
        
        uint256[] memory tokens = eventNFT.getEventTokenId();
        assertEq(tokens.length, 1);
        assertEq(tokens[0], 1);
    }

    function testGetEventTokenIdEmpty() public {
        uint256[] memory tokens = eventNFT.getEventTokenId();
        assertEq(tokens.length, 0);
    }

    function testHoldsEventToken() public {
        vm.startPrank(creator);
        eventNFT.createEventToken(100, "https://token1.com", "Test", false);
        vm.stopPrank();
        
        vm.startPrank(router);
        eventNFT.mint(user1);
        vm.stopPrank();
        
        assertTrue(eventNFT.holdsEventToken(user1));
        assertFalse(eventNFT.holdsEventToken(user2));
    }

    function testHasUserMintedEvent() public {
        vm.startPrank(creator);
        eventNFT.createEventToken(100, "https://token1.com", "Test", false);
        vm.stopPrank();
        
        vm.startPrank(router);
        eventNFT.mint(user1);
        vm.stopPrank();
        
        assertTrue(eventNFT.hasUserMintedEvent(user1));
        assertFalse(eventNFT.hasUserMintedEvent(user2));
    }

    function testWhitelistFunctionality() public {
        vm.startPrank(creator);
        eventNFT.createEventToken(100, "https://token1.com", "Test", true);
        
        // Add users to whitelist
        address[] memory addresses = new address[](2);
        addresses[0] = user1;
        addresses[1] = user2;
        eventNFT.addToWhitelist(addresses);
        
        assertTrue(eventNFT.isUserWhitelisted(user1));
        assertTrue(eventNFT.isUserWhitelisted(user2));
        assertFalse(eventNFT.isUserWhitelisted(address(999)));
        
        vm.stopPrank();
    }

    function testWhitelistMinting() public {
        vm.startPrank(creator);
        eventNFT.createEventToken(100, "https://token1.com", "Test", true);
        
        // Add user1 to whitelist
        address[] memory addresses = new address[](1);
        addresses[0] = user1;
        eventNFT.addToWhitelist(addresses);
        vm.stopPrank();
        
        vm.startPrank(router);
        // user1 can mint (whitelisted)
        eventNFT.mint(user1);
        
        // user2 cannot mint (not whitelisted)
        vm.expectRevert("Address not whitelisted for this event");
        eventNFT.mint(user2);
        vm.stopPrank();
    }

    function testWhitelistDisabled() public {
        vm.startPrank(creator);
        eventNFT.createEventToken(100, "https://token1.com", "Test", false);
        vm.stopPrank();
        
        vm.startPrank(router);
        // Anyone can mint when whitelist is disabled
        eventNFT.mint(user1);
        eventNFT.mint(user2);
        vm.stopPrank();
    }

    function testRemoveFromWhitelist() public {
        vm.startPrank(creator);
        eventNFT.createEventToken(100, "https://token1.com", "Test", true);
        
        // Add users to whitelist
        address[] memory addresses = new address[](2);
        addresses[0] = user1;
        addresses[1] = user2;
        eventNFT.addToWhitelist(addresses);
        
        // Remove user1 from whitelist
        address[] memory removeAddresses = new address[](1);
        removeAddresses[0] = user1;
        eventNFT.removeFromWhitelist(removeAddresses);
        
        assertFalse(eventNFT.isUserWhitelisted(user1));
        assertTrue(eventNFT.isUserWhitelisted(user2));
        
        vm.stopPrank();
    }

    function testSetWhitelistEnabled() public {
        vm.startPrank(creator);
        eventNFT.createEventToken(100, "https://token1.com", "Test", false);
        
        // Enable whitelist
        eventNFT.setWhitelistEnabled(true);
        assertTrue(eventNFT.whitelistEnabled(1));
        
        // Disable whitelist
        eventNFT.setWhitelistEnabled(false);
        assertFalse(eventNFT.whitelistEnabled(1));
        
        vm.stopPrank();
    }

    function testCanUserMintEvent() public {
        vm.startPrank(creator);
        eventNFT.createEventToken(100, "https://token1.com", "Test", true);
        
        // Add user1 to whitelist
        address[] memory addresses = new address[](1);
        addresses[0] = user1;
        eventNFT.addToWhitelist(addresses);
        vm.stopPrank();
        
        // Check mint eligibility
        (bool canMint1, string memory reason1) = eventNFT.canUserMintEvent(user1);
        assertTrue(canMint1);
        
        (bool canMint2, string memory reason2) = eventNFT.canUserMintEvent(user2);
        assertFalse(canMint2);
        assertEq(reason2, "User not whitelisted for this event");
        
        // Mint to user1
        vm.startPrank(router);
        eventNFT.mint(user1);
        vm.stopPrank();
        
        // Check again - should fail because already minted
        (bool canMint3, string memory reason3) = eventNFT.canUserMintEvent(user1);
        assertFalse(canMint3);
        assertEq(reason3, "User already minted this event token");
    }

    function testPauseUnpause() public {
        vm.startPrank(router);
        eventNFT.pause();
        assertTrue(eventNFT.paused());
        
        eventNFT.unpause();
        assertFalse(eventNFT.paused());
        vm.stopPrank();
    }

    function testCannotMintWhenPaused() public {
        vm.startPrank(creator);
        eventNFT.createEventToken(100, "https://token1.com", "Test", false);
        vm.stopPrank();
        
        vm.startPrank(router);
        eventNFT.pause();
        
        vm.expectRevert("Pausable: paused");
        eventNFT.mint(user1);
        
        eventNFT.unpause();
        eventNFT.mint(user1); // Should work now
        vm.stopPrank();
    }
}