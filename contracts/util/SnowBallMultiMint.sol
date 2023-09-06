// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface ISnowBallMint {
    function mint(address to) external returns (uint256);
}

/// @dev call mint for 3 different nft contracts. used for easier wagmi ui integration
contract SnowBallMultiMint {
    address public _SNOWBALL_ALPHA = 0x2C93C564D8a2cC1e5A0F609c1F2f58f1eE9CDc55;
    address public _SNOWBALL_BETA = 0xc8043F9911dEdaa3e611389C6989DFB89cC3b530;
    address public _SNOWBALL_GAMMA = 0x4362572aacdDBcb7E95f98A41CC467F804e0DB1A;

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

    function singleMint(address nft, address recipient) public {
        ISnowBallMint targetNft = ISnowBallMint(nft);
        targetNft.mint(recipient);
    }

    function multiMint(address recipient) public {
        address[3] memory nftLists = [_SNOWBALL_ALPHA, _SNOWBALL_BETA, _SNOWBALL_GAMMA];

        for (uint256 index = 0; index < nftLists.length; index++) {
            ISnowBallMint targetNft = ISnowBallMint(nftLists[index]);
            targetNft.mint(recipient);
        }
    }

    function getCurrentNfts() public view returns(address, address, address) {
        return (_SNOWBALL_ALPHA, _SNOWBALL_BETA, _SNOWBALL_GAMMA);
    }
}