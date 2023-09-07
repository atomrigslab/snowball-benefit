const chai = require("chai");
const { ethers } = require("hardhat");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { useDeployer } = require("../scripts/hook");

describe("Check token URI", function TestTokenURI() {
  it.only("Should return a circling tokenURI", async function TestModulo() {
    const contract = await ethers.deployContract("SnowballAlpha");
    const tx = await contract.waitForDeployment();

    const [owner] = await ethers.getSigners();

    console.log("...contract deployed");

    const tokenIds = {
      zero: 0, // 0
      first: 1, // 1
      second: 2, // 2
      eleven: 11, // 2
      fifteen: 15, // 6
      fifty: 50, // 5
    };

    // zero
    await contract.mint(owner.address, tokenIds.zero);
    console.log("...contract minted");

    // 50, 15, 0
    const baseURI =
      "ipfs://bafybeihxd5qpifeu65jerjqlix52ca5tqqdwdtwduq3vub66azw2czdaba";

    expect(await contract.tokenURI(tokenIds.zero)).to.equal(
      baseURI.concat(`/${0}.json`)
    );

    console.log(await contract.tokenURI(tokenIds.zero));

    // eleven
    await contract.mint(owner.address, tokenIds.eleven);
    console.log("...contract minted");

    expect(await contract.tokenURI(tokenIds.eleven)).to.equal(
      baseURI.concat(`/${2}.json`)
    );

    console.log(await contract.tokenURI(tokenIds.eleven));

    // fifteen
    await contract.mint(owner.address, tokenIds.fifteen);
    console.log("...contract minted");

    expect(await contract.tokenURI(tokenIds.fifteen)).to.equal(
      baseURI.concat(`/${6}.json`)
    );

    console.log(await contract.tokenURI(tokenIds.fifteen));
  });
});
