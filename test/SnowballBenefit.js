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
    Contract = await ethers.getContractFactory("SnowballBenefit");
    [owner, relayer, operator1, user1] = await ethers.getSigners();

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


  it("verifyBenefitSig should be verified", async function () {

    let { benefit, sig, contract } = await loadFixture(benefitSigFixture);
    let b = benefit;
    //console.log(b);
    //console.log(sig);
    let verificationResult = await contract.verifyBenefitSig(b.chainId, b.nftContract, b.expiration, b.maxUsage, b.content, b.operator, b.deadline, b.nonce, sig);
    expect(verificationResult).to.be.true;
  });    

  it("verifyUsageSig should be verified", async function () {

    let { usage, sig, contract } = await loadFixture(usageSigFixture);
    let u = usage;
    //console.log(u);
    //console.log(sig);
    let verificationResult = await contract.verifyUsageSig(u.user, u.benefitId, u.nftId, u.deadline, u.nonce, sig);
    expect(verificationResult).to.be.true;
  });      

  it("verifyRecordSig should be verified", async function () {

    let { record, sig, contract } = await loadFixture(recordSigFixture);
    let u = record;
    console.log(u);
    console.log(sig);
    let verificationResult = await contract.verifyRecordSig(u.benefitId, u.operator, u.deadline, u.nonce, sig);
    expect(verificationResult).to.be.true;
  });      

});


