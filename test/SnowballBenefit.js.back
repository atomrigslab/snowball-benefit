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

describe("Snowball-benefit tests", function () {

  //let signingKey = new ethers.utils.SigningKey("0x63eeb773af53b643eb56f5742e3f6bcafed1fa5538af07e02ccbd95726a4e554");
  //let signingKeyAddr = ethers.utils.computeAddress(signingKey.publicKey);
  //let signer = {address: signingKeyAddr, key: signingKey};

  //let hash =  ethers.utils.solidityKeccak256(["address", "address", "address"],[extAcct.address, shares3.party1, shares3.party2]);
  //let sig = extAcct.key.signDigest(hash);

  let Contract;
  let contract;
  let owner;
  let relayer;
  let operator1;
  let user1;
  let beacon;
 
  beforeEach(async function () {
    Contract = await ethers.getContractFactory("SnowballBenefitV1");
    [owner, relayer, operator1, user1, user1new] = await ethers.getSigners();

     //beacon proxy
    beacon = await upgrades.deployBeacon(Contract);
    await beacon.waitForDeployment();
    contract = await upgrades.deployBeaconProxy(beacon, Contract);
    await contract.waitForDeployment();
    return { contract, beacon };
  });

  async function benefitSigFixture() {
    let [ name, version, chainId, verifyingContract ] = await contract.getDomainInfo();
    chainId = parseInt(chainId);

    let operator = operator1.address;
    let nftChainId = 1;
    let nftContract = '0x6466514368A0c2E1396BC3164495c6f90cBA92F6';
    let expiration = Math.floor(Date.now() / 1000) + 60*60*24*39 //30day
    let maxUsage = 1;
    let content = 'Sample1 Event Ticket';
    let deadline = Math.floor(Date.now() / 1000) + 60*60*24; //1day    
    let nonce = parseInt(await (contract.nonces(operator)));    
    
    let domain = { name, version, chainId, verifyingContract };
    let types = { Benefit: [{name: 'chainId', type: 'uint32'},
                           {name: 'nftContract', type: 'address'},
                           {name: 'expiration', type: 'uint32'},
                           {name: 'maxUsage', type: 'uint8'},
                           {name: 'content', type: 'string'},                                                                                 
                           {name: 'operator', type: 'address'},                                                                                 
                           {name: 'deadline', type: 'uint256'},
                           {name: 'nonce', type: 'uint256'}]};
    let benefit = { chainId: nftChainId, nftContract, expiration, maxUsage, content, operator, deadline, nonce};
    let sig = await operator1.signTypedData(domain, types, benefit);
    //console.log(domain);
    //console.log(types);
    //console.log(relay);
    //console.log(sig);
    return { benefit, sig, contract };
  }  

  async function usageSigFixture() {
    let [ name, version, chainId, verifyingContract ] = await contract.getDomainInfo();
    chainId = parseInt(chainId);

    let user = user1.address; 
    let benefitId = 1;
    let nftId = 100;
    let deadline = Math.floor(Date.now() / 1000) + 60*60*24; //1day    
    let nonce = parseInt(await (contract.nonces(user)));    
    
    let domain = { name, version, chainId, verifyingContract };
    let types = { Usage: [
                            {name: 'user', type: 'address'},
                            {name: 'benefitId', type: 'uint32'},
                            {name: 'nftId', type: 'uint32'},
                            {name: 'deadline', type: 'uint256'},
                            {name: 'nonce', type: 'uint256'}                                                                                 
                          ]};
    let usage = { user, benefitId, nftId, deadline, nonce };
    let sig = await user1.signTypedData(domain, types, usage);
    //console.log(domain);
    //console.log(types);
    //console.log(usage);
    console.log(sig);
    return { usage, sig, contract };
  } 

  async function recordSigFixture() {
    let [ name, version, chainId, verifyingContract ] = await contract.getDomainInfo();
    chainId = parseInt(chainId);

    let benefitId = 1;
    let operator = operator1.address; 
    let deadline = Math.floor(Date.now() / 1000) + 60*60*24; //1day    
    let nonce = parseInt(await (contract.nonces(operator)));    
    
    let domain = { name, version, chainId, verifyingContract };
    let types = { Record: [
                            {name: 'benefitId', type: 'uint32'},
                            {name: 'operator', type: 'address'},
                            {name: 'deadline', type: 'uint256'},
                            {name: 'nonce', type: 'uint256'}                                                                                 
                          ]};
    let record = { benefitId, operator, deadline, nonce };
    let sig = await operator1.signTypedData(domain, types, record);
    //console.log(domain);
    //console.log(types);
    //console.log(usage);
    console.log(sig);
    return { record, sig, contract };
  } 

  async function delegateSigFixture() {
    let [ name, version, chainId, verifyingContract ] = await contract.getDomainInfo();
    chainId = parseInt(chainId);
    let sourceAddr = user1.address;
    let targetAddr = user1new.address;

    let deadline = Math.floor(Date.now() / 1000) + 60*60*24; //1day    
    let nonce = parseInt(await (contract.nonces(sourceAddr)));    
    
    let domain = { name, version, chainId, verifyingContract };
    let types = { Delegate: [
                            {name: 'sourceAddr', type: 'address'},
                            {name: 'targetAddr', type: 'address'},
                            {name: 'deadline', type: 'uint256'},
                            {name: 'nonce', type: 'uint256'}                                                                                 
                          ]};
    let delegate = { sourceAddr, targetAddr, deadline, nonce };
    let sig = await user1.signTypedData(domain, types, delegate);
    //console.log(domain);
    //console.log(types);
    //console.log(usage);
    console.log(sig);
    return { delegate, sig, contract };
  } 
  
  async function benefitFixture() {
    let chainId = 1;
    let nftContract = '0x6466514368A0c2E1396BC3164495c6f90cBA92F6';
    let expiration = Math.floor(Date.now() / 1000) + 60*60*24*39 //30day
    let maxUsage = 1;
    let content = 'Sample1 Event Ticket';
    await contract.connect(operator1).registerBenefit(chainId, nftContract, expiration, maxUsage, content);

    return { contract };
  }     

  it("verifyBenefitSig should be verified", async function () {

    let { benefit, sig, contract } = await loadFixture(benefitSigFixture);
    let b = benefit;
    //console.log(b);
    //console.log(sig);
    let verificationResult = await contract.verifyBenefitSig(b.chainId, b.nftContract, b.expiration, b.maxUsage, b.content, b.operator, b.deadline, b.nonce, sig);
    expect(verificationResult).to.be.true;
  });    

  it("verifyBenefitSig should not be verified when any element changed", async function () {

    let { benefit, sig, contract } = await loadFixture(benefitSigFixture);
    let b = benefit;
    //console.log(b);
    //console.log(sig);
    let verificationResult = await contract.verifyBenefitSig(2, b.nftContract, b.expiration, b.maxUsage, b.content, b.operator, b.deadline, b.nonce, sig);
    expect(verificationResult).to.be.false;
  });  


  it("verifyUsageSig should be verified", async function () {

    let { usage, sig, contract } = await loadFixture(usageSigFixture);
    let u = usage;
    //console.log(u);
    //console.log(sig);
    let verificationResult = await contract.verifyUsageSig(u.user, u.benefitId, u.nftId, u.deadline, u.nonce, sig);
    expect(verificationResult).to.be.true;
  });  
  
  it("verifyUsageSig should not be verified when any element changed", async function () {

    let { usage, sig, contract } = await loadFixture(usageSigFixture);
    let u = usage;
    //console.log(u);
    //console.log(sig);
    let verificationResult = await contract.verifyUsageSig(u.user, u.benefitId, u.nftId, u.deadline, 4, sig);
    expect(verificationResult).to.be.false;
  });   

  it("verifyRecordSig should be verified", async function () {

    let { record, sig, contract } = await loadFixture(recordSigFixture);
    let u = record;
    //console.log(u);
    //console.log(sig);
    let verificationResult = await contract.verifyRecordSig(u.benefitId, u.operator, u.deadline, u.nonce, sig);
    expect(verificationResult).to.be.true;
  });  

  it("verifyRecordSig should not be verified when any element changed", async function () {

    let { record, sig, contract } = await loadFixture(recordSigFixture);
    let u = record;
    //console.log(u);
    //console.log(sig);
    let verificationResult = await contract.verifyRecordSig(u.benefitId, u.operator, u.deadline, 4, sig);
    expect(verificationResult).to.be.false;
  });  

  it("verifyDelgateSig should be verified", async function () {

    let { delegate, sig, contract } = await loadFixture(delegateSigFixture);
    let u = delegate;
    //console.log(u);
    //console.log(sig);
    let verificationResult = await contract.verifyDelegateSig(u.sourceAddr, u.targetAddr, u.deadline, u.nonce, sig);
    expect(verificationResult).to.be.true;
  });    

  it("verifyDelgateSig should not be verified when any element changed", async function () {

    let { delegate, sig, contract } = await loadFixture(delegateSigFixture);
    let u = delegate;
    //console.log(u);
    //console.log(sig);
    let verificationResult = await contract.verifyDelegateSig(u.sourceAddr, u.targetAddr, u.deadline, 100, sig);
    expect(verificationResult).to.be.false;
  });    

  it("registerBenefit() should work", async function () {
    let chainId = 1;
    let nftContract = '0x6466514368A0c2E1396BC3164495c6f90cBA92F6';
    let expiration = Math.floor(Date.now() / 1000) + 60*60*24*39 //30day
    let maxUsage = 1;
    let content = 'Sample1 Event Ticket';
    await contract.connect(operator1).registerBenefit(chainId, nftContract, expiration, maxUsage, content);
    let benefit = await contract.benefits(1);
    expect(benefit[0]).to.equal(1);
  }); 

  it("realyRegisterBenefit() should work", async function () {
    let { benefit, sig, contract } = await loadFixture(benefitSigFixture);
    let b = benefit;
    //console.log(b);
    //console.log(sig);
    let verificationResult = await contract.verifyBenefitSig(b.chainId, b.nftContract, b.expiration, b.maxUsage, b.content, b.operator, b.deadline, b.nonce, sig);
    await contract.relayRegisterBenefit(b.chainId, b.nftContract, b.expiration, b.maxUsage, b.content, b.operator, b.deadline, b.nonce, sig)
    let benefit1 = await contract.benefits(1);
    expect(benefit1[0]).to.equal(1);
  });   

  it("recordUsage() should work", async function () {
    let { contract } = await loadFixture(benefitFixture);

    let [ name, version, chainId, verifyingContract ] = await contract.getDomainInfo();
    chainId = parseInt(chainId);

    let user = user1.address; 
    let benefitId = 1;
    let nftId = 100;
    let deadline = Math.floor(Date.now() / 1000) + 60*60*24; //1day    
    let nonce = parseInt(await (contract.nonces(user)));    
    
    let domain = { name, version, chainId, verifyingContract };
    let types = { Usage: [
                            {name: 'user', type: 'address'},
                            {name: 'benefitId', type: 'uint32'},
                            {name: 'nftId', type: 'uint32'},
                            {name: 'deadline', type: 'uint256'},
                            {name: 'nonce', type: 'uint256'}                                                                                 
                          ]};
    let usage = { user, benefitId, nftId, deadline, nonce };
    let sig = await user1.signTypedData(domain, types, usage);
    await contract.connect(operator1).recordUsage(user, benefitId, nftId, deadline, nonce, sig);
    let usage1 = await contract.usages(1);
    console.log(usage1);
    expect(usage1[0]).to.equal(1);
  });      

  it("relayRecordUsage() should work", async function () {
    let { contract } = await loadFixture(benefitFixture);

    let [ name, version, chainId, verifyingContract ] = await contract.getDomainInfo();
    chainId = parseInt(chainId);

    let user = user1.address; 
    let benefitId = 1;
    let nftId = 100;
    let deadline = Math.floor(Date.now() / 1000) + 60*60*24; //1day    
    let nonce = parseInt(await (contract.nonces(user)));    
    
    let domain = { name, version, chainId, verifyingContract };
    let types = { Usage: [
                            {name: 'user', type: 'address'},
                            {name: 'benefitId', type: 'uint32'},
                            {name: 'nftId', type: 'uint32'},
                            {name: 'deadline', type: 'uint256'},
                            {name: 'nonce', type: 'uint256'}                                                                                 
                          ]};
    let usage = { user, benefitId, nftId, deadline, nonce };
    let sig = await user1.signTypedData(domain, types, usage);
  
    let operator = operator1.address;
    let opDeadline = Math.floor(Date.now() / 1000) + 60*60*24; //1day    
    let opNonce = parseInt(await (contract.nonces(operator)));    
    
    let opTypes = { Record: [
                            {name: 'benefitId', type: 'uint32'},
                            {name: 'operator', type: 'address'},
                            {name: 'deadline', type: 'uint256'},
                            {name: 'nonce', type: 'uint256'}                                                                                 
                          ]};
    let record = { benefitId, operator, deadline, nonce };
    let opSig = await operator1.signTypedData(domain, opTypes, record);

    await contract.connect(relayer).relayRecordUsage(user, benefitId, nftId, deadline, nonce, sig, operator, opDeadline, opNonce, opSig);
    let usage1 = await contract.usages(1);
    console.log(usage1);
    expect(usage1[0]).to.equal(1);
  });
  
  it("realyDelegate() should work", async function () {
    let { delegate, sig, contract } = await loadFixture(delegateSigFixture);
    let d = delegate;
    //console.log(d);
    await contract.relayDelegate(d.sourceAddr, d.targetAddr, d.deadline, d.nonce, sig)
    let delegate1 = await contract.delegates(d.sourceAddr);
    console.log(delegate1);
    expect(delegate1[0]).to.equal(d.targetAddr);
  }); 
  
  it("realyDelegate() should not work when an element changed", async function () {
    let { delegate, sig, contract } = await loadFixture(delegateSigFixture);
    let d = delegate;
    //console.log(d);
    await expect(contract.relayDelegate(d.sourceAddr, d.targetAddr, d.deadline, 100, sig))
    .to.be.revertedWithCustomError(contract, "UserNonceError");
  });  

  it("realyDelegate() should not work when relacing before DELEGATE_TIME_LOCK", async function () {
    let { delegate, sig, contract } = await loadFixture(delegateSigFixture);
    let d = delegate;
    //console.log(d);
    await contract.relayDelegate(d.sourceAddr, d.targetAddr, d.deadline, d.nonce, sig);

    let [ name, version, chainId, verifyingContract ] = await contract.getDomainInfo();
    chainId = parseInt(chainId);
    let sourceAddr = user1.address;
    let targetAddr = user1new.address;

    let deadline = Math.floor(Date.now() / 1000) + 60*60*24; //1day    
    let nonce = parseInt(await (contract.nonces(sourceAddr)));    
    
    let domain = { name, version, chainId, verifyingContract };
    let types = { Delegate: [
                            {name: 'sourceAddr', type: 'address'},
                            {name: 'targetAddr', type: 'address'},
                            {name: 'deadline', type: 'uint256'},
                            {name: 'nonce', type: 'uint256'}                                                                                 
                          ]};
    let delegate2 = { sourceAddr, targetAddr, deadline, nonce };
    let sig2 = await user1.signTypedData(domain, types, delegate2);
    await expect(contract.relayDelegate(sourceAddr, targetAddr, deadline, nonce, sig2))
    .to.be.revertedWithCustomError(contract, "DelegateTimeLockNotPassed");
  });   

  it("realyDelegate() should work when relacing after DELEGATE_TIME_LOCK", async function () {
    let { delegate, sig, contract } = await loadFixture(delegateSigFixture);
    let d = delegate;
    //console.log(d);
    await contract.relayDelegate(d.sourceAddr, d.targetAddr, d.deadline, d.nonce, sig);

    let [ name, version, chainId, verifyingContract ] = await contract.getDomainInfo();
    chainId = parseInt(chainId);
    let sourceAddr = user1.address;
    let targetAddr = user1new.address;

    let deadline = Math.floor(Date.now() / 1000) + 60*60*24*4; //4day    
    let nonce = parseInt(await (contract.nonces(sourceAddr)));    
    
    let domain = { name, version, chainId, verifyingContract };
    let types = { Delegate: [
                            {name: 'sourceAddr', type: 'address'},
                            {name: 'targetAddr', type: 'address'},
                            {name: 'deadline', type: 'uint256'},
                            {name: 'nonce', type: 'uint256'}                                                                                 
                          ]};
    let delegate2 = { sourceAddr, targetAddr, deadline, nonce };
    let sig2 = await user1.signTypedData(domain, types, delegate2);

    let newTimestamp = Math.floor(Date.now() / 1000) + 60*60*24*3 + 10; //3days
    await time.increaseTo(newTimestamp);

    await expect(contract.relayDelegate(sourceAddr, targetAddr, deadline, nonce, sig2))
    .not.to.be.reverted;
  });  
});


