const GAS_URLS = Object.freeze({
  polygon: "https://gasstation.polygon.technology/v2", // Polygon Pos Mainet
  mumbai: "https://gasstation-testnet.polygon.technology/v2", // Polygon Mumbai
});

const TRANSACTION_CONFIG = Object.freeze({
  block: {
    confirmation: 6, // recommended over 5 for contract verification
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
      multiMint: "0x17Fef6d026C92A01baF624B991ac2Ea45D5b64D8",
      forDev: "0x3108E52EFF7d18DA5A54C62c0c3163835309BEEA",
      alpha: "0x9F6acc9878b931Bf882720AeAed9e47E81350B6a",
      beta: "0x529D30F5d2C9F4E76Fc4d28B9495179B50b9c221",
      gamma: "0x5b8A0e300F88723639FF5949e509F0cDB74010CC",
    },
  },
});

module.exports = {
  GAS_URLS,
  METADATA_URLS,
  CONTRACT_ADDRESS,
  TRANSACTION_CONFIG,
};
