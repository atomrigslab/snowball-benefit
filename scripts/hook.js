require("dotenv").config({ path: "../.env" });

const hre = require("hardhat");
const axios = require("axios");
const { ethers } = require("hardhat");

const { ALCHEMY_API_KEY } = process.env;
const { Network, Alchemy } = require("alchemy-sdk");
const { TRANSACTION_CONFIG } = require("./constants");

const settings = {
  apiKey: ALCHEMY_API_KEY, // Replace with your Alchemy API Key.
  network: Network.MATIC_MUMBAI, // Replace with your network.
};

/**
 *
 * @param {string} contractName
 */
async function useDeployer(contractName) {
  const contract = await ethers.deployContract(contractName);
  await contract.waitForDeployment();
  console.log("deployed to; ", contract.target);

  await useWaitBlocks(TRANSACTION_CONFIG.block.confirmation);

  await hre.run("verify:verify", { address: contract.target });
  console.log("verified done");
}

/**
 *
 * @param {number} n
 */
async function useWaitBlocks(n) {
  const currentBlock = await ethers.provider.getBlockNumber();
  const targetBlock = currentBlock + n;

  return new Promise((resolve, reject) => {
    ethers.provider.on("block", (blockNumber) => {
      console.log("blockNumber: ", blockNumber);
      if (blockNumber == targetBlock) {
        ethers.provider.removeAllListeners("block");
        console.log(`Waited ${n} blocks, terminating hook`);
        resolve();
      }
    });
  });
}

async function useGasFeeOption() {
  const data = (await axios(GAS_URLS[hre.network.name])).data;

  return {
    maxFeePerGas: ethers.parseUnits(
      Math.ceil(data.fast.maxFee).toString(),
      "gwei"
    ),
    maxPriorityFeePerGas: ethers.parseUnits(
      Math.ceil(data.standard.maxPriorityFee).toString(),
      "gwei"
    ),
  };
}

/**
 *
 * @param {string} targetContract
 * @param {number} tokenId
 */
async function useMetadataFetch(targetContract, tokenId) {
  const alchemy = new Alchemy(settings);
  const response = await alchemy.nft.getNftMetadata(targetContract, tokenId, {
    refreshCache: true,
  });

  console.log("... fetching NFT metadata by contract and token id");
  console.log({ response });
}

async function useGetNftByWallet(wallet) {
  if (wallet.length !== 42) {
    throw new Error("Invalid wallet address");
  }
  const alchemy = new Alchemy(settings);
  const response = await alchemy.nft.getNftsForOwner();

  console.log("... fetching nfts by wallet");
  console.log({ response });
}

module.exports = {
  useDeployer,
  useWaitBlocks,
  useMetadataFetch,
  useGetNftByWallet,
  useGasFeeOption,
};
