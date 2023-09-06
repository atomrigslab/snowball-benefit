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
    alpha: {
      image:
        "https://nftstorage.link/ipfs/bafybeigrfgup4dtxekqzxavz377ufetk4ebjmgdhd7ep2eckjb5ryhgzlq",
      json: {
        ipfsHash:
          "ipfs://bafybeih6wduczxy75akqcgudpeuaclfulg3yq5trfwgoqbaw4oq74mac7e",
        gateway:
          "https://nftstorage.link/ipfs/bafybeih6wduczxy75akqcgudpeuaclfulg3yq5trfwgoqbaw4oq74mac7e",
      },
    },
    beta: {
      image:
        "https://nftstorage.link/ipfs/bafybeidwhcjctg2vrmh2st64hfl2qltxmoxspqi4inj6myfohevzc3nysy",
      json: {
        ipfsHash:
          "ipfs://bafybeiceg6vp5onjvaktapui4gznfsqm67r6fosqh56zc3bzbjztrqkrm4",
        gateway:
          "https://nftstorage.link/ipfs/bafybeiceg6vp5onjvaktapui4gznfsqm67r6fosqh56zc3bzbjztrqkrm4",
      },
    },
    gamma: {
      image:
        "https://nftstorage.link/ipfs/bafybeibrc4byd76pexpi4gugqzfeoisojkpegxoo5r6bcb7mheyfum54s4",
      json: {
        ipfsHash:
          "ipfs://bafybeiaoiplgpgp47yjberimrlfwzeeay3rcput2ddgt6ebttfn4q4ojfa",
        gateway:
          "https://nftstorage.link/ipfs/bafybeiaoiplgpgp47yjberimrlfwzeeay3rcput2ddgt6ebttfn4q4ojfa",
      },
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
      multiMint: "0x17Fef6d026C92A01baF624B991ac2Ea45D5b64D8",
      forDev: "0x3108E52EFF7d18DA5A54C62c0c3163835309BEEA",
      alpha: "0x9F6acc9878b931Bf882720AeAed9e47E81350B6a",
      beta: "0x529D30F5d2C9F4E76Fc4d28B9495179B50b9c221",
      gamma: "0x5b8A0e300F88723639FF5949e509F0cDB74010CC",
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
