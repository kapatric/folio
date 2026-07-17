// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {FolioIP} from "../src/FolioIP.sol";

/// @notice Deploy FolioIP to Base or Base Sepolia.
/// @dev Example:
///   forge script script/DeployFolioIP.s.sol:DeployFolioIP \
///     --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast --verify \
///     --etherscan-api-key $BASESCAN_API_KEY
contract DeployFolioIP is Script {
    function run() external returns (FolioIP folio) {
        address initialOwner = vm.envOr("FOLIO_OWNER", msg.sender);

        vm.startBroadcast();
        folio = new FolioIP(initialOwner);
        vm.stopBroadcast();

        console2.log("FolioIP deployed:", address(folio));
        console2.log("Owner:", folio.owner());
        console2.log("Name:", folio.name());
        console2.log("Symbol:", folio.symbol());
    }
}
