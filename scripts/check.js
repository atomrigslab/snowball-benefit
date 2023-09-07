//@dev node scripts for minor checks

require("dotenv").config({ path: "../.env" });

const { ethers } = require("hardhat");
const ALPHA_ABI = require("./asset/abi/snowball-alpha.json");
const { useMetadataFetch } = require("./hook");

const { ALCHEMY_MUMBAI_KEY, DEV_PK } = process.env;

function getRandomInt() {
  const max = 9;
  return Math.floor(Math.random() * max);
}

// base uri change test
const provider = new ethers.AlchemyProvider("matic-mumbai", ALCHEMY_MUMBAI_KEY);
const signer = new ethers.Wallet(DEV_PK, provider);

console.log(provider._network.name);
console.log(signer.address);

// test circling token URI with alchemy api
const tokenIds = {
  zero: 0, // 0
  first: 1, // 1
  second: 2, // 2
  eleven: 11, // 2
  fifteen: 15, // 6 => ok
  fifty: 50, // 5 => ok
};

const targetContract = "0x33BcF67a9bd45C392cf9D0a1184856Cb8A946aC9";
const targetTokenId = 11;

useMetadataFetch(targetContract, targetTokenId).then((res) => {
  console.log(res.media);
});
