const GAS_URLS = Object.freeze({
  polygon: "https://gasstation.polygon.technology/v2", // Polygon Pos Mainet
  mumbai: "https://gasstation-testnet.polygon.technology/v2", // Polygon Mumbai
});

const TRANSACTION_CONFIG = Object.freeze({
  account: {
    length: 42,
    prefix: "0x",
  },
  block: {
    confirmation: 6, // recommended over 5 for contract verification
  },
  gas: {
    matic: "https://gasstation.polygon.technology/v2", // Polygon Pos Mainet
    mumbai: "https://gasstation-testnet.polygon.technology/v2", // Polygon Mumbai
  },
});

const METADATA_URLS = Object.freeze({
  erc721: {
    gateway: {
      image:
        "https://nftstorage.link/ipfs/bafybeiekqquf63jiah4vnoni4tnboqn4s6srbnuo7taj2ambdtbj2b4efe",
      json: "https://nftstorage.link/ipfs/bafybeihxd5qpifeu65jerjqlix52ca5tqqdwdtwduq3vub66azw2czdaba",
    },
  },
});

const CONTRACT_ADDRESS = Object.freeze({
  testNft: {
    goerli: "0x70007e08a396B88cB5Abaac612fcB99D2eE3822D",
    mumbai: {
      benefit: {
        proxy: "0x55605f0a6bC988f4407182c57a51aD2d4b913c85",
        impl: "0xD856a511fCA2C50c5218043c38ab319543518b5b",
      },
      multiMint: "0xE0484D22b66651FcAc0665bA5410f8118b8f24e7",
      forDev: "0x89DdF63b152048109C88F0E89722F0729a9D87C8",
      alpha: "0x33BcF67a9bd45C392cf9D0a1184856Cb8A946aC9",
      beta: "",
      gamma: "",
    },
  },
});

const WALLET_ADDRESS = Object.freeze({
  wallet: {
    metamask: {
      jake: "0xb3a0Cc498E0120aC6CA9919FD699f3a4b52730a1",
    },
    dekey: {
      jimmy: "0xD62201F549Aa135C2Db7cBCF6850B818c72730f5",
      saul: "0x8341F92326eBEc9646AA19CbfdF89FEb9e5eE658",
      lucy: "0x33fC81FA29CEfA58Edc55a3B4622FbCE576d426E",
      seby: "0xc775674dB00456e2971995A0dda48e0622fE4Bef",
    },
  },
});

const SERVER_URL = Object.freeze({
  relayer:
    "https://z4h3ubiei2uonyxvcgxiyt3rkq0omtvn.lambda-url.ap-northeast-2.on.aws",
});

module.exports = {
  GAS_URLS,
  METADATA_URLS,
  CONTRACT_ADDRESS,
  TRANSACTION_CONFIG,
};
