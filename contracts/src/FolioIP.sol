// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title FolioIP
/// @notice ERC-721 collection that mints intellectual property as unique digital assets on Base.
/// @dev Uniqueness is enforced by certificate content hash so the same IP cannot be minted twice.
contract FolioIP is ERC721, ERC721URIStorage, Ownable {
    /// @dev On-chain record for a minted IP asset.
    struct IPAsset {
        bytes32 contentHash;
        string certificateId;
        address creator;
        uint64 mintedAt;
    }

    /// @notice Incrementing token id counter (starts at 1).
    uint256 public nextTokenId = 1;

    /// @notice tokenId => IP metadata.
    mapping(uint256 tokenId => IPAsset) private _assets;

    /// @notice contentHash => tokenId (0 means unused).
    mapping(bytes32 contentHash => uint256 tokenId) public tokenByContentHash;

    /// @notice Emitted when IP is minted as an NFT.
    event IPMinted(
        uint256 indexed tokenId,
        address indexed to,
        address indexed creator,
        bytes32 contentHash,
        string certificateId,
        string tokenURI
    );

    error ZeroAddress();
    error EmptyContentHash();
    error EmptyCertificateId();
    error EmptyTokenURI();
    error ContentAlreadyMinted(uint256 existingTokenId);
    error TokenDoesNotExist(uint256 tokenId);

    constructor(address initialOwner) ERC721("Folio IP", "FOLIO") Ownable(initialOwner) {}

    /// @notice Mint a unique IP NFT bound to a copyright certificate content hash.
    /// @param to Recipient of the NFT (typically the connected wallet).
    /// @param contentHash Keccak-256 hash of the certificate file bytes.
    /// @param certificateId Off-chain Folio certificate identifier.
    /// @param tokenURI_ Metadata URI for the token (ipfs:// or https://).
    /// @return tokenId Newly minted token id.
    function mintIP(
        address to,
        bytes32 contentHash,
        string calldata certificateId,
        string calldata tokenURI_
    ) external returns (uint256 tokenId) {
        if (to == address(0)) revert ZeroAddress();
        if (contentHash == bytes32(0)) revert EmptyContentHash();
        if (bytes(certificateId).length == 0) revert EmptyCertificateId();
        if (bytes(tokenURI_).length == 0) revert EmptyTokenURI();

        uint256 existing = tokenByContentHash[contentHash];
        if (existing != 0) revert ContentAlreadyMinted(existing);

        tokenId = nextTokenId++;
        tokenByContentHash[contentHash] = tokenId;
        _assets[tokenId] = IPAsset({
            contentHash: contentHash,
            certificateId: certificateId,
            creator: msg.sender,
            mintedAt: uint64(block.timestamp)
        });

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);

        emit IPMinted(tokenId, to, msg.sender, contentHash, certificateId, tokenURI_);
    }

    /// @notice Read on-chain IP metadata for a token.
    function getIPAsset(uint256 tokenId) external view returns (IPAsset memory) {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist(tokenId);
        return _assets[tokenId];
    }

    /// @notice Total number of IP assets minted.
    function totalMinted() external view returns (uint256) {
        return nextTokenId - 1;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
