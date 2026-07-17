// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {FolioIP} from "../src/FolioIP.sol";

contract FolioIPTest is Test {
    FolioIP internal folio;
    address internal owner = makeAddr("owner");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    bytes32 internal constant HASH_A = keccak256("certificate-a");
    bytes32 internal constant HASH_B = keccak256("certificate-b");
    string internal constant CERT_A = "folio_abc123";
    string internal constant URI_A = "ipfs://bafyfolioA";

    function setUp() public {
        folio = new FolioIP(owner);
    }

    function test_metadata() public view {
        assertEq(folio.name(), "Folio IP");
        assertEq(folio.symbol(), "FOLIO");
        assertEq(folio.owner(), owner);
        assertEq(folio.totalMinted(), 0);
    }

    function test_mintIP_mintsUniqueAsset() public {
        vm.prank(alice);
        uint256 tokenId = folio.mintIP(alice, HASH_A, CERT_A, URI_A);

        assertEq(tokenId, 1);
        assertEq(folio.ownerOf(1), alice);
        assertEq(folio.tokenURI(1), URI_A);
        assertEq(folio.tokenByContentHash(HASH_A), 1);
        assertEq(folio.totalMinted(), 1);

        FolioIP.IPAsset memory asset = folio.getIPAsset(1);
        assertEq(asset.contentHash, HASH_A);
        assertEq(asset.certificateId, CERT_A);
        assertEq(asset.creator, alice);
        assertEq(asset.mintedAt, uint64(block.timestamp));
    }

    function test_mintIP_revertsOnDuplicateContent() public {
        vm.prank(alice);
        folio.mintIP(alice, HASH_A, CERT_A, URI_A);

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(FolioIP.ContentAlreadyMinted.selector, uint256(1)));
        folio.mintIP(bob, HASH_A, "folio_other", "ipfs://other");
    }

    function test_mintIP_allowsDistinctContent() public {
        vm.prank(alice);
        folio.mintIP(alice, HASH_A, CERT_A, URI_A);

        vm.prank(bob);
        uint256 tokenId = folio.mintIP(bob, HASH_B, "folio_def456", "ipfs://bafyfolioB");
        assertEq(tokenId, 2);
        assertEq(folio.ownerOf(2), bob);
        assertEq(folio.totalMinted(), 2);
    }

    function test_mintIP_revertsOnZeroAddress() public {
        vm.expectRevert(FolioIP.ZeroAddress.selector);
        folio.mintIP(address(0), HASH_A, CERT_A, URI_A);
    }

    function test_mintIP_revertsOnEmptyInputs() public {
        vm.startPrank(alice);

        vm.expectRevert(FolioIP.EmptyContentHash.selector);
        folio.mintIP(alice, bytes32(0), CERT_A, URI_A);

        vm.expectRevert(FolioIP.EmptyCertificateId.selector);
        folio.mintIP(alice, HASH_A, "", URI_A);

        vm.expectRevert(FolioIP.EmptyTokenURI.selector);
        folio.mintIP(alice, HASH_A, CERT_A, "");

        vm.stopPrank();
    }

    function test_getIPAsset_revertsForMissingToken() public {
        vm.expectRevert(abi.encodeWithSelector(FolioIP.TokenDoesNotExist.selector, uint256(99)));
        folio.getIPAsset(99);
    }

    function test_constructor_revertsOnZeroOwner() public {
        vm.expectRevert(abi.encodeWithSignature("OwnableInvalidOwner(address)", address(0)));
        new FolioIP(address(0));
    }
}
