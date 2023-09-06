//@dev node scripts for minor checks

const { CONTRACT_ADDRESS } = require("./constants");
const { useMetadataFetch } = require("./hook");

const tokenId = 0; // @dev minted by tokenid 1

// alchemy NFT api response check

// useMetadataFetch(CONTRACT_ADDRESS.testNft.mumbai.alpha, tokenId).then(
//   console.log
// );

// useMetadataFetch(CONTRACT_ADDRESS.testNft.mumbai.beta, tokenId).then(
//   console.log
// );

useMetadataFetch(CONTRACT_ADDRESS.testNft.mumbai.gamma, tokenId).then(
  console.log
);
