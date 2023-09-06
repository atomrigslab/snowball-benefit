// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SnowballGamma is ERC721 {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIdCounter;
    
    string private _BASE_URI = "";

    constructor() ERC721("SnowballGamma", "SBG") {
        setBaseURI("ipfs://bafybeiaoiplgpgp47yjberimrlfwzeeay3rcput2ddgt6ebttfn4q4ojfa");
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

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, "/", tokenId.toString(), ".json")) : "";
    }

    function safeMint(address to) public  {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function getGammaVersion() public view returns(uint256) {
        return 1; 
    }
}