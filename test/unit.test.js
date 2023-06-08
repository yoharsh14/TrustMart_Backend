const { expect } = require("chai");
const { ethers } = require("hardhat");
const token = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};
const developmentChains = ["localhost", "hardhat"];
!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Trust Mart Testing", async () => {
      let contract, deployer, buyer, seller;
      beforeEach(async () => {
        [deployer, buyer, seller] = await ethers.getSigners();
        contract = await ethers.getContractFactory("TrustMart");
        contract = await contract.deploy();
      });
      describe("Deployment", () => {
        it("has correct owner", async () => {
          const owner = await contract.getOwner();
          expect(owner).to.equal(deployer.address);
        });
      });
      describe("Listing Items", () => {
        let transaction;
        const ID = 1;
        const name = "One Plus 3T";
        const category = "mobile";
        const image = "img";
        const cost = token(20);
        const rating = 5;
        const stock = 100;
        beforeEach(async () => {
          transaction = await contract
            .connect(deployer)
            .list(ID, name, category, image, cost, rating, stock);
          await transaction.wait();
        });
        it("Number of Items Increased", async () => {
          const numItems = await contract.numberOfItems();
          expect(1).to.equal(numItems);
        });
        it("Item is stored or not", async () => {
          const Item = await contract.getItem(ID);
          expect(Item.id).to.equal(ID);
          expect(Item.name).to.equal(name);
          expect(Item.category).to.equal(category);
          expect(Item.image).to.equal(image);
          expect(Item.rating).to.equal(rating);
          expect(Item.stock).to.equal(stock);
          expect(Item.vendor).to.equal(deployer.address);
        });
        it("Check the event Occured or not", async () => {
          expect(transaction).to.emit(contract, "List");
        });
      });
      describe("Adding new Seller", async () => {
        let transaction;
        const ID = 2012;
        const name = "Kunal";
        beforeEach(async () => {
          transaction = await contract.connect(seller).becomeSeller(ID, name);
          await transaction.wait();
        });
        it("Seller Added in mappings", async () => {
          const sellerDetails = await contract.getSellerInfo(seller.address);
          expect(sellerDetails.id).to.equal(ID);
          expect(sellerDetails.name).to.equal(name);
        });
        it("Seller adding event is emitted", async () => [
          expect(transaction).to.emit(contract, "SellerAdded"),
        ]);
      });
      describe("Seller Listing Item", async () => {
        let transaction;
        const ID = 1;
        const name = "One Plus 3T";
        const category = "mobile";
        const image = "img";
        const cost = token(20);
        const rating = 5;
        const stock = 100;
        beforeEach(async () => {
          transaction = await contract
            .connect(seller)
            .becomeSeller(2012, "kunal");
          await transaction.wait(1);
          transaction = await contract
            .connect(seller)
            .list(ID, name, category, image, cost, rating, stock);
          await transaction.wait(1);
        });
        it("Item listed buy seller", async () => {
          const listing = await contract.connect(seller).getItem(ID);
          expect(listing.id).to.equal(ID);
          expect(listing.category).to.equal(category);
          expect(listing.vendor).to.equal(seller.address);
        });
        it("Item Listed buy seller event Emitted", async () => {
          expect(transaction).to.emit(contract, "List");
        });
      });
      describe("Buying", async () => {
        let transaction;
        const ID = 1;
        const name = "One Plus 3T";
        const category = "mobile";
        const image = "img";
        const cost = token(20);
        const rating = 5;
        const stock = 100;
        let currentBalance = 0;
        let sellerBalance = 0;
        beforeEach(async () => {
          sellerBalance = await contract.addressToAmount(deployer.address);
          currentBalance = await ethers.provider.getBalance(contract.address);
          transaction = await contract.list(
            ID,
            name,
            category,
            image,
            cost,
            rating,
            stock
          );
          await transaction.wait(1);
          currentStock = (await contract.getItem(ID)).stock;
          transaction = await contract.connect(buyer).buy(ID, { value: cost });
          await transaction.wait(1);
        });
        it("stock is reduced", async () => {
          let newStock = (await contract.getItem(ID)).stock;
          expect(parseInt(currentStock)).to.be.greaterThan(parseInt(newStock));
        });
        it("Update buyer's coutn", async () => {
          const info = await contract.orderCount(buyer.address);
          expect(info).to.equal(1);
        });
        it("Adds the order", async () => {
          const order = await contract.orders(buyer.address, 1);
          expect(parseInt(order.time)).to.to.greaterThan(0);
          expect(order.item.category).to.equal(category);
        });
        it("Contract Balance updated", async () => {
          let newBlance = await ethers.provider.getBalance(contract.address);
          expect(parseInt(currentBalance)).to.be.lessThan(parseInt(newBlance));
        });
        it("Buy event emitted", async () => {
          expect(transaction).to.emit(contract, "Buy");
        });
        it("Balance of the seller is increased", async () => {
          const latestBalance = await contract.addressToAmount(
            deployer.address
          );
          expect(parseInt(sellerBalance)).to.be.lessThan(
            parseInt(latestBalance)
          );
        });
      });
      describe("Withdraw", async () => {
        let transaction;
        const ID = 1;
        const name = "One Plus 3T";
        const category = "mobile";
        const image = "img";
        const cost = token(20);
        const rating = 5;
        const stock = 100;
        beforeEach(async () => {
          transaction = await contract
            .connect(seller)
            .becomeSeller(2012, "kunal");
          await transaction.wait(1);
          transaction = await contract
            .connect(seller)
            .list(ID, name, category, image, cost, rating, stock);
          await transaction.wait(1);
          transaction = await contract.connect(buyer).buy(ID, { value: cost });
          await transaction.wait(1);
        });
        it("withdraw all the amount success fully", async () => {
          const balance = await contract.addressToAmount(seller.address);
          const currentBalanceOfSeller = await ethers.provider.getBalance(
            seller.address
          );
          transaction = await contract.connect(seller).withdraw();
          await transaction.wait();
          const latestBalanceOfSeller = await ethers.provider.getBalance(
            seller.address
          );
          expect(
            parseInt(currentBalanceOfSeller + balance)
          ).to.be.greaterThanOrEqual(parseInt(latestBalanceOfSeller));
        });
      });
    });
