const { network } = require("hardhat");
const developmentChains = ["localhost", "hardhat"];
const verify = require("../utils/verify");
const { items } = require("../scripts/items.json");
const token = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;
  const chainId = network.chainId;
  const trustMart = await deploy("TrustMart", {
    from: deployer,
    log: true,
    args: [],
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  const contract = await ethers.getContract("TrustMart");
  const [signer] = await ethers.getSigners();

  if (!developmentChains.includes(network.name)) {
    log("Verifying...");
    await verify(trustMart.address, []);
    for (let item of items) {
      const transaction = await contract
        .connect(signer)
        .list(
          item.id,
          item.name,
          item.category,
          item.image,
          token(item.price),
          item.rating,
          item.stock
        );
      await transaction.wait();
      console.log(`Listed item ${item.id}: ${item.name}`);
    }
  }
  log();
};
module.exports.tags = [];
