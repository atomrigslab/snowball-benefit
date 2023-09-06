// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SnowBall is ERC721 {

    uint256 _tokenId;
    constructor() ERC721("SnowBall NFT", "SBNFT") {}

    function _baseURI() internal pure override returns (string memory) {
        return "SnowBall NFT";
    }

    function mint(address to) public returns (uint256) {
        _safeMint(to, ++_tokenId);
        return _tokenId;
    }
}