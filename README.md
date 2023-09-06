# snowball-benefit

Snowball-benefit contract

## Metadata integrate on-chain URI with IPFS

Check standard here: [opensea metadata stardard](https://docs.opensea.io/docs/metadata-standards)

- check image format: 350\*350, .png
- check if images are hosted
- check baseURI in the format of: `ipfs://cid`
- check if cid points to token metadata: `gateway/cid/{id}.json`
- check alchemy NFT-API using `useMetadataFetch`
