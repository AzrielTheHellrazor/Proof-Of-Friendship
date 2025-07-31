// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {ProofOfFriendshipRouter} from "../src/ProofOfFriendshipRouter.sol";

contract DeployScript is Script {
    function run() external {
        // Get private key from .env file (handles both with and without 0x prefix)
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey;
        
        // Add 0x prefix if not present
        if (bytes(privateKeyStr).length == 64) {
            // No 0x prefix, add it
            deployerPrivateKey = vm.parseUint(string(abi.encodePacked("0x", privateKeyStr)));
        } else {
            // Has 0x prefix already
            deployerPrivateKey = vm.parseUint(privateKeyStr);
        }
        
        vm.startBroadcast(deployerPrivateKey);
        // Deploy the main ProofOfFriendshipRouter contract
        ProofOfFriendshipRouter router = new ProofOfFriendshipRouter();

        vm.stopBroadcast();
    }
} 