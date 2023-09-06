// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SnowballBeta is ERC721 {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIdCounter;
    
    string private _BASE_URI = "";

    constructor() ERC721("SnowballBeta", "SBB") {
        setBaseURI("ipfs://bafybeiceg6vp5onjvaktapui4gznfsqm67r6fosqh56zc3bzbjztrqkrm4");
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

    function getBetaVersion() public view returns(uint256) {
        return 1; 
    }
}