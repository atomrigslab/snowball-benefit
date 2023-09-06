require("dotenv").config({ path: "./.env" });
require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");

const { DEV_PK, MNEMONIC } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    // sepolia: {
    //   url:
    //     "https://eth-sepolia.g.alchemy.com/v2/" + process.env.ALCHEMY_API_KEY,
    //   accounts: {
    //     accounts: DEV_PK !== undefined ? [DEV_PK] : [],
    //   },
    // },
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/" + process.env.ALCHEMY_API_KEY,
      accounts: DEV_PK !== undefined ? [DEV_PK] : [],
    },
    polygonMumbai: {
      url:
        "https://polygon-mumbai.g.alchemy.com/v2/" +
        process.env.ALCHEMY_API_KEY,
      accounts: DEV_PK !== undefined ? [DEV_PK] : [],
    },
    polygon: {
      url: "https://polygon.g.alchemy.com/v2/" + process.env.ALCHEMY_API_KEY,
      accounts: DEV_PK !== undefined ? [DEV_PK] : [],
    },
  },
  etherscan: {
    apiKey: {
      //polygon
      polygon: process.env.POLYGONSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,

      //ethereum
      mainnet: process.env.ETHERSCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
    },
  },
};
