// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface ISnowBallMint {
    function mint(address to) external returns (uint256);
    function safeMint(address to) external;
}

/// @dev call mint for 3 different nft contracts. used for easier wagmi ui integration
contract SnowBallMultiMint {
    address public _SNOWBALL_ALPHA = 0x9F6acc9878b931Bf882720AeAed9e47E81350B6a;
    address public _SNOWBALL_BETA = 0x529D30F5d2C9F4E76Fc4d28B9495179B50b9c221;
    address public _SNOWBALL_GAMMA = 0x5b8A0e300F88723639FF5949e509F0cDB74010CC;

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

    function multiSafeMint(address recipient) public {
        address[3] memory nftLists = [_SNOWBALL_ALPHA, _SNOWBALL_BETA, _SNOWBALL_GAMMA];

        for (uint256 index = 0; index < nftLists.length; index++) {
            ISnowBallMint targetNft = ISnowBallMint(nftLists[index]);
            targetNft.safeMint(recipient);
        }
    }

    function getCurrentNfts() public view returns(address, address, address) {
        return (_SNOWBALL_ALPHA, _SNOWBALL_BETA, _SNOWBALL_GAMMA);
    }

    function getMultiMintVersion() public view returns(uint256) {
        return 2;
    }
}