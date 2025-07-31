// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {EventNFT} from "../src/EventNFT.sol";

contract EventNFTTest is Test {
    EventNFT public eventNFT;
    
    address public router = address(1);
    address public creator = address(2);
    address public user1 = address(3);
    address public user2 = address(4);
    
    function setUp() public {
        vm.startPrank(router);
        eventNFT = new EventNFT(
            "Summer Party",
            "https://example.com/summer",
            router
        );
        vm.stopPrank();
    }

    function testInitialState() public {
        assertEq(eventNFT.name(), "Summer Party");
        assertEq(eventNFT.router(), router);
        assertEq(eventNFT.owner(), router);
    }

    function testCreateToken() public {
        vm.startPrank(creator);
        
        vm.expectEmit(true, true, false, true);
        emit EventNFT.TokenCreated(1, creator, 100, "https://token1.com", "Group photo from party");
        
        eventNFT.createToken(1, 100, "https://token1.com", "Group photo from party");
        
        assertTrue(eventNFT.tokenExists(1));
        assertEq(eventNFT.maxSupply(1), 100);
        assertEq(eventNFT.tokenCreator(1), creator);
        assertEq(eventNFT.uri(1), "https://token1.com");
        assertEq(eventNFT.tokenDescription(1), "Group photo from party");
        
        vm.stopPrank();
    }

    function testCannotCreateTokenTwice() public {
        vm.startPrank(creator);
        eventNFT.createToken(1, 100, "https://token1.com", "Group photo");
        
        vm.expectRevert("Token already exists");
        eventNFT.createToken(1, 50, "https://token1-duplicate.com", "Duplicate");
        
        vm.stopPrank();
    }

    function testCannotCreateTokenWithEmptyFields() public {
        vm.startPrank(creator);
        
        vm.expectRevert("URI cannot be empty");
        eventNFT.createToken(1, 100, "", "Description");
        
        vm.expectRevert("Description cannot be empty");
        eventNFT.createToken(1, 100, "https://token1.com", "");
        
        vm.stopPrank();
    }

    function testMintOnlyByRouter() public {
        // Create token first
        vm.startPrank(creator);
        eventNFT.createToken(1, 100, "https://token1.com", "Group photo");
        vm.stopPrank();
        
        // Only router can mint
        vm.startPrank(router);
        eventNFT.mint(user1, 1);
        assertEq(eventNFT.balanceOf(user1, 1), 1);
        assertEq(eventNFT.tokenSupply(1), 1);
        assertTrue(eventNFT.hasUserMinted(user1, 1));
        vm.stopPrank();
        
        // Non-router cannot mint
        vm.startPrank(user1);
        vm.expectRevert("Only router can call this function");
        eventNFT.mint(user1, 1);
        vm.stopPrank();
    }

    function testMaxSupplyEnforcement() public {
        // Create token with max supply of 2
        vm.startPrank(creator);
        eventNFT.createToken(1, 2, "https://token1.com", "Limited edition");
        vm.stopPrank();
        
        vm.startPrank(router);
        // Mint first token
        eventNFT.mint(user1, 1);
        assertEq(eventNFT.tokenSupply(1), 1);
        
        // Mint second token (should reach max)
        eventNFT.mint(user2, 1);
        assertEq(eventNFT.tokenSupply(1), 2);
        
        vm.stopPrank();
        
        // Try to mint to a third user (should fail - max supply reached)
        address user3 = address(5);
        vm.startPrank(router);
        vm.expectRevert("Would exceed max supply");
        eventNFT.mint(user3, 1);
        
        vm.stopPrank();
    }

    function testUnlimitedSupply() public {
        // Create token with unlimited supply (maxSupply = 0)
        vm.startPrank(creator);
        eventNFT.createToken(1, 0, "https://token1.com", "Unlimited edition");
        vm.stopPrank();
        
        vm.startPrank(router);
        // Should be able to mint to many users (unlimited supply)
        eventNFT.mint(user1, 1);
        eventNFT.mint(user2, 1);
        
        // Create many more users to test unlimited supply
        for (uint256 i = 10; i < 20; i++) {
            eventNFT.mint(address(uint160(i)), 1);
        }
        
        assertEq(eventNFT.tokenSupply(1), 12); // 2 + 10 users
        vm.stopPrank();
    }

    function testCannotMintTwice() public {
        // Create token
        vm.startPrank(creator);
        eventNFT.createToken(1, 100, "https://token1.com", "Group photo");
        vm.stopPrank();
        
        vm.startPrank(router);
        // First mint succeeds
        eventNFT.mint(user1, 1);
        assertEq(eventNFT.balanceOf(user1, 1), 1);
        assertTrue(eventNFT.hasUserMinted(user1, 1));
        
        // Second mint fails
        vm.expectRevert("User already minted this token");
        eventNFT.mint(user1, 1);
        
        vm.stopPrank();
    }

    function testSetTokenURI() public {
        // Create token
        vm.startPrank(creator);
        eventNFT.createToken(1, 100, "https://token1.com", "Group photo");
        vm.stopPrank();
        
        // Creator can update URI
        vm.startPrank(creator);
        eventNFT.setTokenURI(1, "https://updated-token1.com");
        assertEq(eventNFT.uri(1), "https://updated-token1.com");
        vm.stopPrank();
        
        // Non-creator cannot update URI
        vm.startPrank(user1);
        vm.expectRevert("Not authorized to set URI");
        eventNFT.setTokenURI(1, "https://malicious.com");
        vm.stopPrank();
        
        // Owner (router) can update URI
        vm.startPrank(router);
        eventNFT.setTokenURI(1, "https://router-updated.com");
        assertEq(eventNFT.uri(1), "https://router-updated.com");
        vm.stopPrank();
    }

    function testPauseUnpause() public {
        // Create token
        vm.startPrank(creator);
        eventNFT.createToken(1, 100, "https://token1.com", "Group photo");
        vm.stopPrank();
        
        // Normal operation works
        vm.startPrank(router);
        eventNFT.mint(user1, 1);
        vm.stopPrank();
        
        // Owner pauses contract
        vm.startPrank(router);
        eventNFT.pause();
        vm.stopPrank();
        
        // Minting should fail when paused
        vm.startPrank(router);
        vm.expectRevert();
        eventNFT.mint(user2, 1);
        vm.stopPrank();
        
        // Token creation should also fail when paused
        vm.startPrank(creator);
        vm.expectRevert();
        eventNFT.createToken(2, 50, "https://token2.com", "Another photo");
        vm.stopPrank();
        
        // Owner unpauses
        vm.startPrank(router);
        eventNFT.unpause();
        vm.stopPrank();
        
        // Should work again
        vm.startPrank(router);
        eventNFT.mint(user2, 1);
        assertEq(eventNFT.balanceOf(user2, 1), 1);
        vm.stopPrank();
    }

    function testGetTokenInfo() public {
        vm.startPrank(creator);
        eventNFT.createToken(1, 100, "https://token1.com", "Epic group photo");
        vm.stopPrank();
        
        vm.startPrank(router);
        eventNFT.mint(user1, 1);
        vm.stopPrank();
        
        (address tokenCreator, uint256 currentSupply, uint256 maximumSupply, string memory description, string memory tokenURI, bool exists) = 
            eventNFT.getTokenInfo(1);
            
        assertEq(tokenCreator, creator);
        assertEq(currentSupply, 1);
        assertEq(maximumSupply, 100);
        assertEq(description, "Epic group photo");
        assertEq(tokenURI, "https://token1.com");
        assertTrue(exists);
    }

    function testHoldsToken() public {
        vm.startPrank(creator);
        eventNFT.createToken(1, 100, "https://token1.com", "Group photo");
        vm.stopPrank();
        
        // User doesn't hold token initially
        assertFalse(eventNFT.holdsToken(user1, 1));
        
        vm.startPrank(router);
        eventNFT.mint(user1, 1);
        vm.stopPrank();
        
        // User holds token after minting
        assertTrue(eventNFT.holdsToken(user1, 1));
        assertTrue(eventNFT.hasUserMinted(user1, 1));
        assertFalse(eventNFT.holdsToken(user2, 1)); // user2 doesn't hold it
        assertFalse(eventNFT.hasUserMinted(user2, 1)); // user2 hasn't minted it
    }

    function testURIForNonExistentToken() public {
        vm.expectRevert("Token does not exist");
        eventNFT.uri(999);
    }

    function testMintNonExistentToken() public {
        vm.startPrank(router);
        vm.expectRevert("Token does not exist");
        eventNFT.mint(user1, 999);
        vm.stopPrank();
    }

    function testMintZeroAmount() public {
        vm.startPrank(creator);
        eventNFT.createToken(1, 100, "https://token1.com", "Group photo");
        vm.stopPrank();
        
        vm.startPrank(router);
        // Since we always mint 1, there's no zero amount test
        // Instead test that user can't mint twice
        eventNFT.mint(user1, 1);
        vm.expectRevert("User already minted this token");
        eventNFT.mint(user1, 1);
        vm.stopPrank();
    }

    function testGetCreatedTokens() public {
        vm.startPrank(creator);
        eventNFT.createToken(1, 100, "https://token1.com", "First photo");
        eventNFT.createToken(5, 50, "https://token5.com", "Fifth photo");
        eventNFT.createToken(10, 25, "https://token10.com", "Tenth photo");
        vm.stopPrank();
        
        uint256[] memory createdTokens = eventNFT.getCreatedTokens();
        assertEq(createdTokens.length, 3);
        assertEq(createdTokens[0], 1);
        assertEq(createdTokens[1], 5);
        assertEq(createdTokens[2], 10);
    }
}