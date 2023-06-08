const { ethers } = require("hardhat");
const { items } = require("./items.json");
const token = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};
const main = async () => {
  const [deployer] = await ethers.getSigners();
  const contract = await ethers.getContract("TrustMart");
  console.log(`Deployed TrustMart contract at:${contract.address}\n`);
  for (let item of items) {
    const transaction = await contract
      .connect(deployer)
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
};
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
