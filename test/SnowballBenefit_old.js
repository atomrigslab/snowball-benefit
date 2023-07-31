const chai = require("chai");
const { ethers } = require("hardhat");
const chaiAsPromised  = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

function combineSig(v, r, s) {
  return r + s.substr(2) + v.toString(16);
}

function splitSig(sig) {
  if (sig.startsWith("0x")) {
    sig = sig.substring(2);
  }
  return {r: "0x" + sig.slice(0, 64), s: "0x" + sig.slice(64, 128), v: parseInt(sig.slice(128, 130), 16)};
}

describe("LuckyBall core", function () {

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

  async function ballFixture() {
    await contract.connect(owner).setOperator(operator.address);
    await contract.connect(operator).startSeason();
    await contract.connect(operator).issueBalls([user1.address, user2.address],[100,200]);
    return { contract };
  }

  async function usageSigFixture() {
    let [ name, version, chainId, verifyingContract ] = await contract.getDomainInfo();
    chainId = parseInt(chainId);
    let deadline = Math.floor(Date.now() / 1000) + 60*60*24; //1day
    let nonce = parseInt(await (contract.nonces(user.address)));
    let domain = { name, version, chainId, verifyingContract };
    let types = { Usage: [{name: 'user', type: 'address'},
                          {name: 'benefitId', type: 'uint32'},
                          {name: 'nftId', type: 'uint32'},
                          {name: 'deadline', type: 'uint256'},
                          {name: 'nonce', type: 'uint256'} ]};
    let usage = { owner: user1.address, deadline, nonce};
    let sig = await user.signTypedData(domain, types, usage);
    //console.log(domain);
    //console.log(types);
    //console.log(relay);
    //console.log(sig);
    return {deadline, nonce, domain, types, relay, sig, contract};
  }

  async function benefitSigFixture() {
    let [ name, version, chainId, verifyingContract ] = await contract.getDomainInfo();
    chainId = parseInt(chainId);


    let nftChainId = 1;
    let nftContract = '0x6466514368A0c2E1396BC3164495c6f90cBA92F6';
    let expiration = Math.floor(Date.now() / 1000) + 60*60*24*39 //30day
    let maxUsage = 1;
    let content = 'Sample party event1';
    let deadline = Math.floor(Date.now() / 1000) + 60*60*24; //1day    
    let nonce = parseInt(await (contract.nonces(operator.address)));    
    
    let domain = { name, version, chainId, verifyingContract };
    let types = { Benefit: [{name: 'chainId', type: 'uint32'},
                           {name: 'nftContract', type: 'address'},
                           {name: 'expiration', type: 'uint32'},
                           {name: 'maxUsage', type: 'uint8'},
                           {name: 'content', type: 'string'},                                                                                 
                           {name: 'operator', type: 'address'},                                                                                 
                           {name: 'deadline', type: 'uint256'},
                           {name: 'nonce', type: 'uint256'}]};
    let benefit = { chainId: nftChainId, nftContract, expiration, maxUsage, content, operator: operator.address, deadline, nonce};
    let sig = await operator.signTypedData(domain, types, benefit);
    //console.log(domain);
    //console.log(types);
    //console.log(relay);
    //console.log(sig);
    return { benefit, sig, contract };
  }

  async function sampleSigFixture() {
    let [ name, version, chainId, verifyingContract ] = await contract.getDomainInfo();
    chainId = parseInt(chainId);


    let user = user1.address;
   
    let domain = { name, version, chainId, verifyingContract };
    let types = { Benefit: [{name: 'user', type: 'address'}] };
    let sample = { user };
    let sig = await user1.signTypedData(domain, types, sample);
    //console.log(domain);
    //console.log(types);
    //console.log(relay);
    //console.log(sig);
    return { sample, sig, contract };
  }  

  it("verifySampleSig should be verified", async function () {

    let { sample, sig, contract } = await loadFixture(sampleSigFixture);

    let verificationResult = await contract.verifySampleSig(user1.address, sig);
    expect(verificationResult).to.be.true;
  });  


/*
  it("verifyBenefitSig should be verified", async function () {

    let { benefit, sig, contract } = await loadFixture(benefitSigFixture);
    let b = benefit;
    console.log(b);
    console.log(sig);
    let verificationResult = await contract.verifyBenefitSig(b.chainId, b.nftContract, b.expiration, b.maxUsage, b.content, b.operator, b.deadline, b.nonce, sig);
    expect(verificationResult).to.be.true;
  });  
*/
});