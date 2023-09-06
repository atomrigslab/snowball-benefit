// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title Snowball Benefit Contract
 * @author Atomrigs Lab
 *
 **/

import "hardhat/console.sol";
import { Relayable } from "./Relayable.sol";

contract SnowballBenefitV2 is Relayable {

    error DelegateTimeLockNotPassed(uint256 timeLeft);
    error NotOwnerError();
    error NotAdminError();
    error AlreadyInitiazlizedError();
    error NotOperatorError();
    error ExceedMaxUsageError();
    error SignerMatchError(address signer);

    uint32 private _benefitId;
    uint64 private _usageId;
    uint256 public DELEGATE_TIME_LOCK; 

    struct Benefit {
        uint32 benefitId;
        uint32 chainId;
        address nftContract;
        uint32 expiration;
        uint8 maxUsage;
        address operator;
        string content;       
    }    

    struct Usage {
        uint64 usageId;
        uint32 benefitId;
        uint32 nftId;
        address user;
    }

    struct Delegate {
        address targetAddr;
        uint32 timestamp;
    }

    mapping(uint32 => Benefit) public benefits; //benefitId => Benefit
    mapping(address => uint32[]) public benefitIdsByNft; //nft address => [benefitId]
    mapping(uint64 => Usage) public usages; //usageId => Usage
    mapping(uint32 => uint64[]) public usageIdsByBenefit; //benefitId => [UsageId]
    mapping(address => uint64[]) public usageIdsByUser; //userAddress => [UsageId]
    mapping(uint32 => mapping(uint32 => uint8)) public usageCount; //benefitId => nftId => usageCount
    mapping(address => Delegate) public delegates; //nft holder address => Delegate (targetAddr, timestamp)
    mapping(address => mapping(address => bool)) public staffs; //operator addr => (staff addr => bool)

    event BenefitRegistered(address nftContract, uint32 benefitId);
    event BenefitUsed(uint32 benefitId, uint64 usageId, address user);
    event Delegated(address indexed sourceAddr, address targetAddr);
    event StaffChanged(address indexed operator, address staff, bool isActive);

    function initialize() public initializer() {
        if (owner() != address(0)) {
            revert AlreadyInitiazlizedError();
        }
        __Relayable_init();
        DELEGATE_TIME_LOCK = 3 days;
    }

    function getVersion() override public pure returns (string memory) {
        return "1";
    }

    function getDomainInfo() override public view returns (string memory, string memory, uint, address) {
        string memory name = "Snowball-Benefit";
        string memory version = getVersion();
        uint chainId = block.chainid;
        address verifyingContract = address(this);
        return (name, version, chainId, verifyingContract);
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
                _benefitId,
                chainId,
                nftContract,
                expiration,
                maxUsage,
                operator,
                content
            );
        benefitIdsByNft[nftContract].push(_benefitId);
        emit BenefitRegistered(nftContract, _benefitId);
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

    function getBenefitParamHash(
        uint32 chainId, 
        address nftContract,
        uint32 expiration,
        uint8 maxUsage,
        string calldata content,
        address operator
        ) public pure returns (bytes32) {

        bytes32 paramHash = keccak256(
            abi.encodePacked(
                chainId, 
                nftContract,
                expiration,
                maxUsage,
                abi.encodePacked(content),
                operator
            )
        ); 
        return paramHash;

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
        ) external {
        bytes32 paramHash = getBenefitParamHash(
            chainId, 
            nftContract,
            expiration,
            maxUsage,
            content,
            operator
        );
        /*
        uint256 paramHash = keccak256(
            abi.encodePacked(
                chainId, 
                nftContract,
                expiration,
                maxUsage,
                abi.encodePacked(content),
                operator
            )
        );
        */

        
        address signer = getSigner('relayRegisterBenefit', paramHash, deadline, nonce, sig);
        if (operator != signer) {
            revert SignerMatchError(signer);
        }
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
        ) private {
            
        Benefit memory benefit = benefits[benefitId];
        if (usageCount[benefitId][nftId] == benefit.maxUsage) {
            revert ExceedMaxUsageError();
        }

        bytes32 paramHash = keccak256(
            abi.encodePacked(
                user, 
                benefitId,
                nftId
            )
        );
        address signer = getSigner('recordUsage', paramHash, deadline, nonce, sig);     
        if (user != signer) {
            if(delegates[user].targetAddr != signer) {
                revert SignerMatchError(signer);
            }
        }
        _usageId++;
        usages[_usageId] = 
            Usage(
                _usageId,
                benefitId,
                nftId,
                user
            );
        usageIdsByUser[user].push(_usageId);
        usageCount[benefitId][nftId]++;
        _nonces[user]++;
        emit BenefitUsed(benefitId, _usageId, user);
    }    

    function recordUsage(
        address user, 
        uint32 benefitId,
        uint32 nftId,
        uint256 deadline, 
        uint256 nonce,
        bytes memory sig
        ) external {

        Benefit memory benefit = benefits[benefitId];
        if(msg.sender != benefit.operator) {
            if(staffs[benefit.operator][msg.sender] != true) {
                revert NotOperatorError();
            }
        }
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
        ) external {

        Benefit memory benefit = benefits[benefitId];
        bytes32 paramHash = keccak256(
            abi.encodePacked(
                benefitId, 
                operator
            )
        );
        address signer = getSigner('relayRecordUsage', paramHash, opDeadline, opNonce, opSig);
        if(signer != benefit.operator) {
            if(staffs[benefit.operator][signer] != true) {
                revert NotOperatorError();
            }
        }               

        _recordUsage(user, benefitId, nftId, deadline, nonce, sig);
        _nonces[operator]++;
    }

    function _delegate(
        address sourceAddr, 
        address targetAddr
        ) private {

        Delegate memory existing = delegates[sourceAddr];
        if (existing.targetAddr != address(0)) {
            if(uint256(existing.timestamp) + DELEGATE_TIME_LOCK > block.timestamp) {
                revert DelegateTimeLockNotPassed(uint256(existing.timestamp) + DELEGATE_TIME_LOCK - block.timestamp);
            }
        }

        delegates[sourceAddr] = Delegate(targetAddr, uint32(block.timestamp));
        emit Delegated(sourceAddr, targetAddr);
    }

    function delegate(address targetAddr) public {
        _delegate(msg.sender, targetAddr);
    }

    function relayDelegate(
        address sourceAddr, 
        address targetAddr,
        uint256 deadline, 
        uint256 nonce,
        bytes memory sig
    ) external {

        bytes32 paramHash = keccak256(
            abi.encodePacked(
                sourceAddr, 
                targetAddr
            )
        );
        address signer = getSigner('relayDelegate', paramHash, deadline, nonce, sig);        
        if(sourceAddr != signer) {
            revert SignerMatchError(signer);
        }
        _delegate(sourceAddr, targetAddr);
        _nonces[sourceAddr]++;       
    }

    function _changeStaff(address operator, address staff, bool isActive) private {
        staffs[operator][staff] = isActive;
        emit StaffChanged(operator, staff, isActive);
    }

    function changeStaff(address staff, bool isActive) external {
        _changeStaff(msg.sender, staff, isActive);
    }

    function relayChangeStaff(
        address operator,
        address staff,
        bool isActive,
        uint256 deadline,
        uint256 nonce,
        bytes memory sig
    ) external {

        bytes32 paramHash = keccak256(
            abi.encodePacked(
                operator, 
                staff,
                isActive
            )
        );
        address signer = getSigner('relayChangeStaff', paramHash, deadline, nonce, sig);
        if (operator != signer) {
            revert SignerMatchError(signer);
        }
        _changeStaff(operator, staff, isActive);

    }

    function getAllBenefits(address nftAddr) public view returns (Benefit[] memory) {
        uint32[] memory benefitIds = benefitIdsByNft[nftAddr];
        uint256 length = benefitIds.length;
        Benefit[] memory allBenefits = new Benefit[](length);
        for (uint256 i = 0; i < length; i++ ) {
            Benefit memory benefit = benefits[benefitIds[i]];
            allBenefits[i] = benefit;
        }
        return allBenefits;
    }

    function getActiveBenefits(address nftAddr) public view returns (Benefit[] memory) {
        Benefit[] memory allBenefits = getAllBenefits(nftAddr);
        uint256 length = allBenefits.length;
        uint256 activeCount;
        for (uint256 i = 0; i < length; i++ ) {
            Benefit memory benefit = allBenefits[i];
            if (benefit.expiration > block.timestamp) {
                activeCount += 1;
            }
        }
        Benefit[] memory activeBenefits = new Benefit[](activeCount);        

        uint256 j;
        for (uint256 i = 0; i < length; i++ ) {
            Benefit memory benefit = allBenefits[i];
            if (benefit.expiration > block.timestamp) {
                activeBenefits[j++] = benefit;
            }
        }        
        return activeBenefits;
    }
}