// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SnowballBeta is ERC721 {
    using Strings for uint256;

    string private _BASE_URI = "";

    constructor() ERC721("SnowballBeta", "SBB") {
        setBaseURI("ipfs://bafybeihxd5qpifeu65jerjqlix52ca5tqqdwdtwduq3vub66azw2czdaba");
    }

    function setBaseURI(string memory _newURI) public {
        _BASE_URI = _newURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _BASE_URI;
    }

    function baseURI() public view returns(string memory) {
        return _baseURI();
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireMinted(tokenId);

        // return circling tokenURI
        string memory baseURI = _baseURI();
        uint256 targetId = _getRemainders(tokenId);

        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, "/", targetId.toString(), ".json")) : "";
    }

    function mint(address recipient, uint256 tokenId) public {
        _safeMint(recipient, tokenId);
    }

    function _getRemainders(uint256 _tokenId) internal pure returns(uint256) {
        return _tokenId % 9;
    }

    function getBetaVersion() public pure returns(uint256) {
        return 3; 
    }
}

