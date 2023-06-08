const fs = require("fs");
const { ethers, network } = require("hardhat");
const pathToAddress = "../frontend/src/constants/networkMapping.json";
const pathToAbi = "../frontend/src/constants/";
module.exports = async () => {
  console.log("Updating frontend...");
  updateAddress();
  updateABI();
};

const updateAddress = async () => {
  const contract = await ethers.getContract("TrustMart");
  const chainId = network.config.chainId.toString();
  const contractAddress = contract.address;
  const JSON_FILE = JSON.parse(fs.readFileSync(pathToAddress, "utf8"));
  if (chainId in JSON_FILE) {
    if (!JSON_FILE[chainId]["TrustMart"].includes(contractAddress)) {
      JSON_FILE[chainId]["TrustMart"].push(contractAddress);
    }
  } else {
    JSON_FILE[chainId] = { TrustMart: [contractAddress] };
  }
  fs.writeFileSync(pathToAddress, JSON.stringify(JSON_FILE));
};

const updateABI = async () => {
  const contract = await ethers.getContract("TrustMart");
  fs.writeFileSync(
    `${pathToAbi}TrustMart.json`,
    contract.interface.format(ethers.utils.FormatTypes.json)
  );
};
