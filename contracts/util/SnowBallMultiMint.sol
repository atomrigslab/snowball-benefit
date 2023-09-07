// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface ISnowBallMint {
    function mint(address recipient, uint256 tokenId) external;
    function safeMint(address to) external;
}

/// @dev call mint for 3 different nft contracts. used for easier wagmi ui integration
contract SnowBallMultiMint {
    address public _SNOWBALL_ALPHA = 0x33BcF67a9bd45C392cf9D0a1184856Cb8A946aC9;
    address public _SNOWBALL_BETA = 0xF197658408a7CAb109E791004499519FB6d0082b;
    address public _SNOWBALL_GAMMA = 0x4cC58D6E19525036D44a60Db9442D969BD3d22e9;

    enum NftIndex {
        ALPHA, // starts with 0
        BETA,
        GAMMA
    }

    function update(NftIndex _index, address newNftAddress) public {
        require(uint256(_index) < 3, "Invalid NFT indexing");

        if (uint256(_index) == 0) {
            _SNOWBALL_ALPHA = newNftAddress;
        }
        if (uint256(_index) == 1) {
            _SNOWBALL_BETA = newNftAddress;
        }
        if (uint256(_index) == 2) {
            _SNOWBALL_GAMMA = newNftAddress;
        }
    }

    function singleMint(address nft, address recipient, uint256 tokenId) public {
        ISnowBallMint targetNft = ISnowBallMint(nft);
        targetNft.mint(recipient, tokenId);
    }

    function multiMint(address recipient, uint256 tokenId) public {
        address[3] memory nftLists = [_SNOWBALL_ALPHA, _SNOWBALL_BETA, _SNOWBALL_GAMMA];

        for (uint256 index = 0; index < nftLists.length; index++) {
            ISnowBallMint targetNft = ISnowBallMint(nftLists[index]);
            targetNft.mint(recipient, tokenId);
        }
    }

    function getCurrentNfts() public view returns(address, address, address) {
        return (_SNOWBALL_ALPHA, _SNOWBALL_BETA, _SNOWBALL_GAMMA);
    }

    function getMultiMintVersion() public pure returns(uint256) {
        return 3;
    }
}