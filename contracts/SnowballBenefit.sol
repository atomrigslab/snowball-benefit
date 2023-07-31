// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

/**
 * @title Snowball Benefit Contract
 * @author Atomrigs Lab
 *
 **/

import "hardhat/console.sol";

contract SnowballBenefit {

    uint32 private _benefitId;
    uint64 private _usageId;
    address private _owner;
    address private _admin;
    bytes32 public DOMAIN_SEPARATOR;    

    struct Benefit {
        uint32 chainId;
        address nftContract;
        uint32 expiration;
        uint8 maxUsage;
        address operator;
        string content;       
    }    

    struct Usage {
        uint32 benefitId;
        uint32 nftId;
        address user;
    }

    mapping(uint32 => Benefit) public benefits; //benefitId => Benefit
    mapping(address => uint32[]) public benefitIdsByNft; //nft address => [benefitId]
    mapping(uint64 => Usage) public usages; //usageId => Usage
    mapping(uint32 => uint64[]) public usageIdsByBenefit; //benefitId => [UsageId]
    mapping(address => uint64[]) public usageIdsByUser; //userAddress => [UsageId]
    mapping(uint32 => mapping(uint32 => uint8)) public usageCount; //benefitId => nftId => usageCount
    mapping(address => uint32) private _nonces; //user address => nonce

    event BenefitRegistered(uint32 benefitId);
    event BenefitUsed(uint32 benefitId, uint64 usageId, address user);
    event OwnershipTransfered(address newOwner);
    event SetAdmin(address newAdmin);

    modifier onlyOwner() {
        require(_owner == msg.sender, "Benefit: caller is not the owner address!");
        _;
    }

    modifier onlyAdmin() {
        require(_admin == msg.sender || _owner == msg.sender, "Benefit: caller is not the admin address!");
        _;
    }             

    function initialize() public {
        require(_owner == address(0), "Benefit: already initialized"); 
        _owner = msg.sender;            
        _setDomainSeparator();
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        _owner = _newOwner;
        emit OwnershipTransfered(_newOwner);
    }

    function setAdmin(address _newAdmin) external onlyOwner {
        _admin = _newAdmin;
        emit SetAdmin(_newAdmin);
    }

    function getOwner() public view returns (address) {
        return _owner;
    }    

    function getAdmin() public view returns (address) {
        return _admin;
    }    

    function getVersion() public pure returns (string memory) {
        return "1";
    }

    function nonces(address user) public view returns (uint256) {
        return _nonces[user];
    }

    function splitSig(bytes memory sig) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
        //return (r, s, v);
    }          

    function getDomainInfo() public view returns (string memory, string memory, uint, address) {
        string memory name = "Snowball-Benefit";
        string memory version = getVersion();
        uint chainId = block.chainid;
        address verifyingContract = address(this);
        return (name, version, chainId, verifyingContract);
    }

    function getBenefitTypes() public pure returns (string memory) {
      string memory dataTypes = "Benefit(uint32 chainId,address nftContract,uint32 expiration,uint8 maxUsage,string content,address operator,uint256 deadline,uint256 nonce)";
      return dataTypes;      
    }

    function getUsageTypes() public pure returns (string memory) {
        string memory dataTypes = "Usage(address user,uint32 benefitId,uint32 nftId,uint256 deadline,uint256 nonce)";
        return dataTypes;      
    }    

    function getRecordTypes() public pure returns (string memory) {
        string memory dataTypes = "Record(uint32 benefitId,address operator,uint256 deadline,uint256 nonce)";
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

    function getBenefitHash(
        uint32 chainId, 
        address nftContract,
        uint32 expiration,
        uint8 maxUsage,
        string memory content,
        address operator,
        uint256 deadline, 
        uint256 nonce  
        ) public view returns (bytes32) {

        string memory MESSAGE_TYPE = getBenefitTypes();
        bytes32 hash = keccak256(
            abi.encodePacked(
                "\x19\x01", // backslash is needed to escape the character
                DOMAIN_SEPARATOR,
                keccak256(
                    abi.encode(
                        keccak256(abi.encodePacked(MESSAGE_TYPE)),
                        chainId,
                        nftContract,
                        expiration,
                        maxUsage,
                        keccak256(bytes(content)),
                        operator,
                        deadline,
                        nonce
                    )
                )
            )
        );
        return hash;
    }

    function getUsageHash(
        address user, 
        uint32 benefitId,
        uint32 nftId,
        uint256 deadline, 
        uint256 nonce
        ) public view returns (bytes32) {

        string memory MESSAGE_TYPE = getUsageTypes();
        bytes32 hash = keccak256(
            abi.encodePacked(
                "\x19\x01", 
                DOMAIN_SEPARATOR,
                keccak256(
                    abi.encode(
                        keccak256(abi.encodePacked(MESSAGE_TYPE)),
                        user,
                        benefitId,
                        nftId,
                        deadline,
                        nonce
                    )
                )
            )
        );
        return hash;
    }

    function getRecordHash(
        uint32 benefitId,
        address operator,
        uint256 deadline, 
        uint256 nonce
        ) public view returns (bytes32) {

        string memory MESSAGE_TYPE = getRecordTypes();
        bytes32 hash = keccak256(
            abi.encodePacked(
                "\x19\x01", 
                DOMAIN_SEPARATOR,
                keccak256(
                    abi.encode(
                        keccak256(abi.encodePacked(MESSAGE_TYPE)),
                        benefitId,
                        operator,
                        deadline,
                        nonce
                    )
                )
            )
        );
        return hash;
    }       

    function verifyBenefitSig(
        uint32 chainId, 
        address nftContract,
        uint32 expiration,
        uint8 maxUsage,
        string memory content,
        address operator,
        uint256 deadline, 
        uint256 nonce,
        bytes memory sig  
        )
        public view returns (bool) {

        (bytes32 r, bytes32 s, uint8 v) = splitSig(sig);

        bytes32 hash = getBenefitHash(chainId, nftContract, expiration, maxUsage, content, operator, deadline, nonce);
        if (v < 27) {
          v += 27;
        }
        return operator == ecrecover(hash, v, r, s);
    }    

    function verifyUsageSig(
        address user, 
        uint32 benefitId,
        uint32 nftId,
        uint256 deadline, 
        uint256 nonce,
        bytes memory sig
        )
        public view returns (bool) {

        (bytes32 r, bytes32 s, uint8 v) = splitSig(sig);
        bytes32 hash = getUsageHash(user, benefitId, nftId, deadline, nonce);
        if (v < 27) {
          v += 27;
        }
        return user == ecrecover(hash, v, r, s);
    }

    function verifyRecordSig(
        uint32 benefitId,
        address operator,
        uint256 deadline, 
        uint256 nonce,
        bytes memory sig
        )
        public view returns (bool) {

        (bytes32 r, bytes32 s, uint8 v) = splitSig(sig);
        bytes32 hash = getRecordHash(benefitId, operator, deadline, nonce);
        if (v < 27) {
          v += 27;
        }
        return operator == ecrecover(hash, v, r, s);
    }
    // 

    function _registerBenefit(
        uint32 chainId, 
        address nftContract,
        uint32 expiration,
        uint8 maxUsage,
        string calldata content,
        address operator
        ) private {

        _benefitId++;
        benefits[_benefitId] = 
            Benefit(
                chainId,
                nftContract,
                expiration,
                maxUsage,
                operator,
                content
            );
        benefitIdsByNft[nftContract].push(_benefitId);
        emit BenefitRegistered(_benefitId);
    }


    function registerBenefit(
        uint32 chainId, 
        address nftContract,
        uint32 expiration,
        uint8 maxUsage,
        string calldata content
        ) external {

        address operator = msg.sender;
        _registerBenefit(chainId, nftContract, expiration, maxUsage, content, operator);
    }

    function relayRegisterBenefit(
        uint32 chainId, 
        address nftContract,
        uint32 expiration,
        uint8 maxUsage,
        string calldata content,
        address operator,
        uint256 deadline, 
        uint256 nonce,  
        bytes memory sig
        ) 
        external {

        require(deadline >= block.timestamp, "Benefit: expired deadline");
        require(verifyBenefitSig(chainId, nftContract, expiration, maxUsage, content, operator, deadline, nonce, sig), "Benefit: sig does not match");

        _registerBenefit(chainId, nftContract, expiration, maxUsage, content, operator);
        _nonces[operator]++;            
    }

    function _recordUsage(
        address user, 
        uint32 benefitId,
        uint32 nftId,
        uint256 deadline, 
        uint256 nonce,
        bytes memory sig
        ) 
        private {

        require(deadline >= block.timestamp, "Benefit: expired deadline");
        require(verifyUsageSig(user, benefitId, nftId, deadline, nonce, sig), "Benefit: user sig does not match");

        Benefit memory benefit = benefits[benefitId];
        require(usageCount[benefitId][nftId] < benefit.maxUsage, "Benefit: already used max usage count");        

        _usageId++;
        usages[_usageId] = 
            Usage(
                benefitId,
                nftId,
                user
            );
        usageIdsByUser[user].push(_usageId);
        usageCount[benefitId][nftId]++;
        emit BenefitUsed(benefitId, _usageId, user);
    }    

    function recordUsage(
        address user, 
        uint32 benefitId,
        uint32 nftId,
        uint256 deadline, 
        uint256 nonce,
        bytes memory sig
        ) 
        external {

        Benefit memory benefit = benefits[benefitId];
        require(msg.sender == benefit.operator, "Benefit: sender is not the benefit operator");        
        _recordUsage(user, benefitId, nftId, deadline, nonce, sig);
    }

    function relayRecordUsage(
        address user, 
        uint32 benefitId,
        uint32 nftId,
        uint256 deadline, 
        uint256 nonce,
        bytes memory sig,
        address operator,
        uint256 opDeadline, 
        uint256 opNonce,
        bytes memory opSig
        ) 
        external {

        Benefit memory benefit = benefits[benefitId];
        require(verifyRecordSig(benefitId, operator, opDeadline, opNonce, opSig), "Benefit: operator sig does not match");        
        require(operator == benefit.operator, "Benefit: sender is not the benefit operator");        
        _recordUsage(user, benefitId, nftId, deadline, nonce, sig);
    }
}