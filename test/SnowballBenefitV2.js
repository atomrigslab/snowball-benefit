const chai = require("chai");
const { ethers } = require("hardhat");
const chaiAsPromised  = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
//const crypto = require('crypto');

function combineSig(v, r, s) {
  return r + s.substr(2) + v.toString(16);
}

function splitSig(sig) {
  if (sig.startsWith("0x")) {
    sig = sig.substring(2);
  }
  return {r: "0x" + sig.slice(0, 64), s: "0x" + sig.slice(64, 128), v: parseInt(sig.slice(128, 130), 16)};

}

async function getDelegateSourceList(contract, targetAddr) {
  const filter = contract.filters.Delegated(null, targetAddr)
  const events = await contract.queryFilter(filter)
  const sourceAddrList = []
  for (const event of events) {
    const sourceAddr = event.args.sourceAddr
    const currentTargetAddr = (await contract.delegates(sourceAddr))[0]
    if (currentTargetAddr === targetAddr) {
      sourceAddrList.push(sourceAddr)
    }
  }
  return sourceAddrList;
};

async function getStaffList(contract, operator) {
  const filter = contract.filters.StaffChanged(operator, null);
  const events = await contract.queryFilter(filter);
  const staffList = []
  const staffDict = {}  
  for (const event of events) {
    const staff = event.args.staff
    if (!staffDict[staff]) {
      const staffIsActive = await contract.staffs(operator, staff)
      if (staffIsActive) {
        staffDict[staff] = true
        staffList.push(staff);
      }
    } 
  }
  return staffList;
};

describe("Snowball-benefit tests", function () {

  let Contract;
  let contract;
  let owner;
  let relayer;
  let operator1;
  let user1;
  let beacon;
 
  beforeEach(async function () {
    Contract = await ethers.getContractFactory("SnowballBenefit");
    [owner, relayer, operator1, user1, user1new] = await ethers.getSigners();

     //beacon proxy
    beacon = await upgrades.deployBeacon(Contract);
    await beacon.waitForDeployment();
    contract = await upgrades.deployBeaconProxy(beacon, Contract);
    await contract.waitForDeployment();
    return { contract, beacon };
  });

  async function getTypedData(contract, funcName, paramHash, deadline, nonce) {
    let [ name, version, chainId, verifyingContract ] = await contract.getDomainInfo();
    chainId = parseInt(chainId);    
    let domain = { name, version, chainId, verifyingContract };
    let types = { relayData: [{name: 'funcName', type: 'string'},
                           {name: 'paramHash', type: 'bytes32'},
                           {name: 'deadline', type: 'uint256'},
                           {name: 'nonce', type: 'uint256'}]};
    let  relayData = { funcName, paramHash, deadline, nonce };
    return { domain, types, relayData };
  }

  async function benefitParams() {
    let nftChainId = 1;
    let nftContract = '0x6466514368A0c2E1396BC3164495c6f90cBA92F6';
    let expiration = Math.floor(Date.now() / 1000) + 60*60*24*39 //30day
    let maxUsage = 1;
    let content = JSON.stringify({
      name: "Special Viewing Day Entry",
      where: "Seoul, South Korea",
      when: "2023-12-25T00:00:00Z",
      ticketType: "Event Ticket"
    });
    let params = { nftChainId, nftContract, expiration, maxUsage, content }
    return params;
  }     

  async function benefitSigFixture() {

    let { nftChainId, nftContract, expiration, maxUsage, content } = await benefitParams();
    let operator = operator1.address;
    let deadline = Math.floor(Date.now() / 1000) + 60*60*24; //1day    
    let nonce = parseInt(await (contract.nonces(operator)));    
    let funcName = 'relayRegisterBenefit';
    let paramHash = ethers.solidityPackedKeccak256(
      ["uint32", "address", "uint32", "uint8", "string", "address"],
      [nftChainId, nftContract, expiration, maxUsage, content, operator]
    );
    let { domain, types, relayData } = await getTypedData(contract, funcName, paramHash, deadline, nonce);
    let sig = await operator1.signTypedData(domain, types, relayData);
    let params = { nftChainId, nftContract, expiration, maxUsage, content, operator, deadline, nonce, sig };
    return { params, contract };
  }  

  async function usageSigFixture() {
    let { nftChainId, nftContract, expiration, maxUsage, content } = await benefitParams();
    await contract.connect(operator1).registerBenefit(nftChainId, nftContract, expiration, maxUsage, content);

    let user = user1.address; 
    let benefitId = 1;
    let nftId = 100;
    let deadline = Math.floor(Date.now() / 1000) + 60*60*24; //1day    
    let nonce = parseInt(await (contract.nonces(user)));    
    let funcName = 'recordUsage';
    let paramHash = ethers.solidityPackedKeccak256(
      ["address", "uint32", "uint32"],
      [user, benefitId, nftId]);
    let { domain, types, relayData } = await getTypedData(contract, funcName, paramHash, deadline, nonce);
    let sig = await user1.signTypedData(domain, types, relayData);
    let params = { user, benefitId, nftId, deadline, nonce, sig };
    return { params, contract };
  } 

  async function recordSigFixture() {
    let { params, sig, contract } = await usageSigFixture();
    let p = params;
    let operator = operator1.address; 
    let opDeadline = Math.floor(Date.now() / 1000) + 60*60*24; //1day    
    let opNonce = parseInt(await (contract.nonces(operator)));    
    let funcName = 'relayRecordUsage';
    let paramHash = ethers.solidityPackedKeccak256(
      ["uint32", "address"],
      [p.benefitId, operator]);
      
    let { domain, types, relayData } = await getTypedData(contract, funcName, paramHash, opDeadline, opNonce);    
    let opSig = await operator1.signTypedData(domain, types, relayData);
    params['operator'] = operator;
    params['opDeadline'] = opDeadline;
    params['opNonce'] = opNonce;
    params['opSig'] = opSig;

    //console.log(domain);
    //console.log(types);
    //console.log(usage);
    return { params, contract };
  } 

  async function delegateSigFixture() {

    let sourceAddr = user1.address;
    let targetAddr = user1new.address;
    let deadline = Math.floor(Date.now() / 1000) + 60*60*24; //1day    
    let nonce = parseInt(await (contract.nonces(sourceAddr)));    
    let funcName = 'relayDelegate';
    let paramHash = ethers.solidityPackedKeccak256(
      ["address", "address"],
      [sourceAddr, targetAddr]);
    let { domain, types, relayData } = await getTypedData(contract, funcName, paramHash, deadline, nonce);          
    let sig = await user1.signTypedData(domain, types, relayData);
    let params = { sourceAddr, targetAddr, deadline, nonce, sig, domain, types };
    return { params, contract };
  } 
  
  it("registerBenefit() should work", async function () {
    let { nftChainId, nftContract, expiration, maxUsage, content } = await benefitParams();

    await expect(contract.connect(operator1).registerBenefit(nftChainId, nftContract, expiration, maxUsage, content))
    .to.emit(contract, "BenefitRegistered")
    .withArgs(nftContract, 1);
    let benefit = await contract.benefits(1);
    expect(benefit[0]).to.equal(1);
  }); 

  it("realyRegisterBenefit() should work", async function () {
    let { params, sig, contract } = await benefitSigFixture();
    let p = params;
    //console.log(p);
    await expect (contract.connect(relayer).relayRegisterBenefit(
      p.nftChainId, 
      p.nftContract, 
      p.expiration, 
      p.maxUsage, 
      p.content, 
      p.operator, 
      p.deadline, 
      p.nonce, 
      p.sig))
      .to.emit(contract, "BenefitRegistered")
      .withArgs(p.nftContract, 1);
    let benefit1 = await contract.benefits(1);
    expect(benefit1[0]).to.equal(1);
  });   

  it("recordUsage() should work", async function () {
    let { params, contract } = await loadFixture(usageSigFixture);
    let p = params;

    await expect(contract.connect(operator1).recordUsage(
      p.user, p.benefitId, p.nftId, p.deadline, p.nonce, p.sig))
      .to.emit(contract, "BenefitUsed")
      .withArgs(p.benefitId, 1, p.user, p.user);
    let usage1 = await contract.usages(1);
    console.log(usage1);
    expect(usage1[0]).to.equal(1);
  });      

  it("relayRecordUsage() should work", async function () {
    let { params, contract } = await loadFixture(recordSigFixture);
    let p = params;

    await expect(contract.connect(relayer).relayRecordUsage(
      p.user, p.benefitId, p.nftId, p.deadline, p.nonce, p.sig, p.operator, p.opDeadline, p.opNonce, p.opSig))
      .to.emit(contract, "BenefitUsed")
      .withArgs(p.benefitId, 1, p.user, p.user);

      let usage1 = await contract.usages(1);
    //console.log(usage1);
    expect(usage1[0]).to.equal(1);
  });

  it("delegate() should work", async function () {
    let sourceAddr = user1.address;
    let targetAddr = user1new.address;
    await expect(contract.connect(user1).delegate(targetAddr))
    .to.emit(contract, "Delegated")
    .withArgs(sourceAddr, targetAddr);

    let delegate = await contract.delegates(sourceAddr);
    expect(delegate[0]).to.equal(targetAddr);
    console.log('sourceAddrs', await getDelegateSourceList(contract, targetAddr));
  });

  it("relayDelegate() should work", async function () {
    let { params, contract } = await loadFixture(delegateSigFixture);
    let p = params;
    await expect(contract.connect(relayer).relayDelegate(p.sourceAddr, p.targetAddr, p.deadline, p.nonce, p.sig))
    .to.emit(contract, "Delegated")
    .withArgs(p.sourceAddr,p.targetAddr);

    let delegate1 = await contract.delegates(p.sourceAddr);
    console.log(delegate1);
    expect(delegate1[0]).to.equal(p.targetAddr);
  }); 

  it("relayDelegate() should not work when an element changed", async function () {
    let { params, contract } = await loadFixture(delegateSigFixture);
    let p = params;
    await expect(contract.connect(relayer).relayDelegate(p.sourceAddr, p.targetAddr, p.deadline, 100, p.sig))
    .to.be.revertedWithCustomError(contract, "UserNonceError");
  });  

  it("relayDelegate() should not work when replacing before DELEGATE_TIME_LOCK", async function () {

    let { params, contract } = await loadFixture(delegateSigFixture);
    let p = params;
    await contract.connect(relayer).relayDelegate(p.sourceAddr, p.targetAddr, p.deadline, p.nonce, p.sig);

    let sourceAddr = p.sourceAddr;
    let targetAddr = p.targetAddr;
    let deadline = Math.floor(Date.now() / 1000) + 60*60*24; //1day    
    let nonce = parseInt(await (contract.nonces(sourceAddr)));    
    let funcName = 'relayDelegate';
    let paramHash = ethers.solidityPackedKeccak256(
      ["address", "address"],
      [sourceAddr, targetAddr]);
    let { domain, types, relayData } = await getTypedData(contract, funcName, paramHash, deadline, nonce);         
    let sig = await user1.signTypedData(domain, types, relayData);
    await expect(contract.connect(relayer).relayDelegate(sourceAddr, targetAddr, deadline, nonce, sig))
    .to.be.revertedWithCustomError(contract, "DelegateTimeLockNotPassed");
  });   

  it("relayDelegate() should work when relacing after DELEGATE_TIME_LOCK passed", async function () {

    let { params, contract } = await loadFixture(delegateSigFixture);
    let p = params;
    await contract.connect(relayer).relayDelegate(p.sourceAddr, p.targetAddr, p.deadline, p.nonce, p.sig);

    let newTimestamp = Math.floor(Date.now() / 1000) + 60*60*24*3 + 100; //3days
    await time.increaseTo(newTimestamp);      
    
    let sourceAddr = p.sourceAddr;
    let targetAddr = p.targetAddr;
    let deadline = Math.floor(Date.now() / 1000) + 60*60*24*5; //5day       
    let nonce = parseInt(await (contract.nonces(sourceAddr)));    
    let funcName = 'relayDelegate';
    let paramHash = ethers.solidityPackedKeccak256(
      ["address", "address"],
      [sourceAddr, targetAddr]);
    let { domain, types, relayData } = await getTypedData(contract, funcName, paramHash, deadline, nonce);         
    let sig = await user1.signTypedData(domain, types, relayData);

    await expect(contract.connect(relayer).relayDelegate(sourceAddr, targetAddr, deadline, nonce, sig))
    .to.emit(contract, "Delegated")
    .withArgs(sourceAddr, targetAddr);
        
  });   

  it("delegated user's usage sig should work", async function () {

    let sourceAddr = user1.address;
    let targetAddr = user1new.address;
    await contract.connect(user1).delegate(targetAddr);

    let { nftChainId, nftContract, expiration, maxUsage, content } = await benefitParams();
    await contract.connect(operator1).registerBenefit(nftChainId, nftContract, expiration, maxUsage, content);

    let user = sourceAddr; 
    let benefitId = 1;
    let nftId = 100;
    let deadline = Math.floor(Date.now() / 1000) + 60*60*24*5; //5day    
    let nonce = parseInt(await (contract.nonces(user)));    
    let funcName = 'recordUsage';
    let paramHash = ethers.solidityPackedKeccak256(
      ["address", "uint32", "uint32"],
      [user, benefitId, nftId]);
    let { domain, types, relayData } = await getTypedData(contract, funcName, paramHash, deadline, nonce);
    let sig = await user1new.signTypedData(domain, types, relayData);

    await expect(contract.connect(operator1).recordUsage(
      user, benefitId, nftId, deadline, nonce, sig))
      .to.emit(contract, "BenefitUsed")
      .withArgs(benefitId, 1, user, targetAddr);
    let usage1 = await contract.usages(1);
    console.log(usage1);
    expect(usage1[0]).to.equal(1);    
  });    

  it("chageStaff should work for adding a new staff", async function () {
    await expect(contract.connect(operator1).changeStaff(user1new.address, true))
    .to.emit(contract, "StaffChanged")
    .withArgs(operator1.address, user1new.address, true);

    let staffIsActive = await contract.staffs(operator1.address, user1new.address);
    expect(staffIsActive).to.equal(true);

    console.log(await getStaffList(contract, operator1.address));
  });

  it("chageStaff should work for making a staff inactive", async function () {
    await contract.connect(operator1).changeStaff(user1new.address, true);
    await expect(contract.connect(operator1).changeStaff(user1new.address, false))
    .to.emit(contract, "StaffChanged")
    .withArgs(operator1.address, user1new.address, false);

    let staffIsActive = await contract.staffs(operator1.address, user1new.address);
    expect(staffIsActive).to.equal(false);
  });  

  it("relayChageStaff should work for making a staff active", async function () {

    let operator = operator1.address;
    let staff = user1new.address;

    let deadline = Math.floor(Date.now() / 1000) + 60*60*24*5; //1day    
    let nonce = parseInt(await (contract.nonces(operator)));    
    let funcName = 'relayChangeStaff';
    let paramHash = ethers.solidityPackedKeccak256(
      ["address", "address", "bool"],
      [operator, staff, true]);
    let { domain, types, relayData } = await getTypedData(contract, funcName, paramHash, deadline, nonce);
    let sig = await operator1.signTypedData(domain, types, relayData);
    await expect(contract.connect(relayer).relayChangeStaff(operator, staff, true, deadline, nonce, sig))
    .to.emit(contract, "StaffChanged")
    .withArgs(operator, staff, true);    

  });    

  it("active stuff can record an usage instead of the operator", async function () {
    let { params, contract } = await loadFixture(usageSigFixture);
    let p = params;
    await contract.connect(operator1).changeStaff(user1new.address, true);
    await expect(contract.connect(user1new).recordUsage(
      p.user, p.benefitId, p.nftId, p.deadline, p.nonce, p.sig))
      .to.emit(contract, "BenefitUsed")
      .withArgs(p.benefitId, 1, p.user, p.user);
    let usage1 = await contract.usages(1);
    console.log(usage1);
    expect(usage1[0]).to.equal(1);
  });

  it("Inactive stuff can't record an usage instead of the operator", async function () {
    let { params, contract } = await loadFixture(usageSigFixture);
    let p = params;
    await contract.connect(operator1).changeStaff(user1new.address, false);
    await expect(contract.connect(user1new).recordUsage(
      p.user, p.benefitId, p.nftId, p.deadline, p.nonce, p.sig))
    .to.be.revertedWithCustomError(contract, "NotOperatorError");
  });

});


