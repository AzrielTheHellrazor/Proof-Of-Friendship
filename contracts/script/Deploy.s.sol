// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {ProofOfFriendship} from "../src/ProofOfFriendship.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        ProofOfFriendship proofOfFriendship = new ProofOfFriendship();

        // Create some sample events for testing
        proofOfFriendship.createEvent(
            "Summer BBQ Party",
            "A fun summer barbecue with friends and family. We grilled burgers, played games, and enjoyed the beautiful weather together.",
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop"
        );

        proofOfFriendship.createEvent(
            "Game Night",
            "Board games and pizza night with the crew. We played everything from classic Monopoly to modern strategy games.",
            "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop"
        );

        proofOfFriendship.createEvent(
            "Beach Day",
            "Sun, sand, and waves with close friends. We spent the day building sandcastles, playing beach volleyball, and enjoying the ocean breeze.",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop"
        );

        vm.stopBroadcast();

        console.log("ProofOfFriendship deployed at:", address(proofOfFriendship));
        console.log("Created 3 sample events");
    }
} 