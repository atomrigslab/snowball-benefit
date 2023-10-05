// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title Relayable Contract
 * @author Atomrigs Lab
 * @dev Contract module which provides a basic relaying transasaction mechanism with ownable 
 * and nitialiazable funtionality.
 */

//import "hardhat/console.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol"; 

abstract contract Relayable is Initializable {

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);
    error DeadlineExpiredError();
    error SigMismatchError();
    error InvalidSigLengthError();

    function __Relayable_init() internal initializer {
        _owner = msg.sender;            
        _setDomainSeparator();
    }

    address private _owner;
    bytes32 public DOMAIN_SEPARATOR;

    mapping(address => uint32) internal _nonces; //user address => nonce

    event OwnershipTransfered(address newOwner);

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }    

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }    

    function transferOwnership(address _newOwner) public onlyOwner {
        _owner = _newOwner;
        emit OwnershipTransfered(_newOwner);
    }

    function getVersion() public virtual pure returns (string memory) {
        return "1";
    }

    function nonces(address user) public virtual view returns (uint256) {
        return _nonces[user];
    }

    function splitSig(bytes memory sig) public virtual pure returns (bytes32 r, bytes32 s, uint8 v) {
        if(sig.length != 65) {
            revert InvalidSigLengthError();
        }
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
        //return (r, s, v);
    }          

    function getDomainInfo() public virtual view returns (string memory, string memory, uint, address) {
        string memory name = "Relayable Contract";
        string memory version = getVersion();
        uint chainId = block.chainid;
        address verifyingContract = address(this);
        return (name, version, chainId, verifyingContract);
    }

    function getDataTypes() public virtual pure returns (string memory) {
        string memory dataTypes = "relayData(string funcName,bytes32 paramHash,uint256 deadline,uint256 nonce)";
        return dataTypes;
    }

    function _setDomainSeparator() internal {
        string memory EIP712_DOMAIN_TYPE = "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)";
        ( string memory name, string memory version, uint chainId, address verifyingContract ) = getDomainInfo();
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(abi.encodePacked(EIP712_DOMAIN_TYPE)),
                keccak256(abi.encodePacked(name)),
                keccak256(abi.encodePacked(version)),
                chainId,
                verifyingContract
            )
        );
    }

    function getRelayHash(
        string memory funcName,
        bytes32 paramHash,
        uint256 deadline,
        uint256 nonce
    ) public view returns (bytes32) {

        //string memory paramHash2 = string(abi.encodePacked(paramHash));
        string memory MESSAGE_TYPE = getDataTypes();
        bytes32 hash = keccak256(
            abi.encodePacked(
                "\x19\x01", // backslash is needed to escape the character
                DOMAIN_SEPARATOR,
                keccak256(
                    abi.encode(
                        keccak256(abi.encodePacked(MESSAGE_TYPE)),
                        keccak256(abi.encodePacked(funcName)),
                        paramHash,
                        deadline,
                        nonce
                    )
                )
            )
        );
        return hash;
    }

    function getSigner(
        string memory funcName,
        bytes32 paramHash,
        uint256 deadline,
        uint256 nonce,
        bytes memory sig  
        ) public virtual view returns (address) {

        if (deadline < block.timestamp) {
            revert DeadlineExpiredError();
        }        
        (bytes32 r, bytes32 s, uint8 v) = splitSig(sig);
        bytes32 hash = getRelayHash(funcName, paramHash, deadline, nonce);
        if (v < 27) {
          v += 27;
        }
        address signer = ecrecover(hash, v, r, s);
        //for delegated signer, use sourceAddr's nonce
        //if (nonce != _nonces[signer]) {
        //    revert UserNonceError(nonce, _nonces[signer]);
        //}      
        return signer;
    }
}