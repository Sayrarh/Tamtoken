import { ethers } from "hardhat";

async function main() {
  
  const Tamtoken = await ethers.getContractFactory("Tamtoken");
  const tam = await Tamtoken.deploy();

  await tam.deployed();

  console.log(
    `Tam Token Contract is deployed to ${tam.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
