// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const axios = require("axios");
const { ethers, upgrades } = require("hardhat");
const { deploy } = require("@openzeppelin/hardhat-upgrades/dist/utils");

const getFeeOption = async () => {
  const data =  (await axios(gasUrls[hre.network.name])).data
  return {
    maxFeePerGas: ethers.parseUnits(Math.ceil(data.fast.maxFee).toString(), 'gwei'),
    maxPriorityFeePerGas: ethers.parseUnits(Math.ceil(data.standard.maxPriorityFee).toString(), 'gwei')
  }
}

async function main() {

  const Contract = await ethers.getContractFactory("SnowBall");
  const [signer] = await ethers.getSigners();
  signer.provider.getFeeData = async () => { return await getFeeOption() }
  Contract.connect(signer);
  const contract = await Contract.deploy();
  await contract.waitForDeployment();
  console.log("SnowBall deployed to:", contract.target);
  await hre.run("verify:verify", { address: contract.target });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

//npx hh run scripts/deploy.js --network mumbai


