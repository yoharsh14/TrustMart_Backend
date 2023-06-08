require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
const RPC_URL_GOERLI = process.env.RPC_URL_GOERLI || "key";
const RPC_URL_SEPOLIA = process.env.RPC_URL_SEPOLIA || "key";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "key";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key";
const CMC_API_KEY = process.env.CMC_API_KEY || "key";
module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.17" },
      { version: "0.6.0" },
      { version: "0.6.6" },
      { version: "0.6.121" },
      { version: "0.4.19" },
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      url: RPC_URL_GOERLI,
      accounts: [PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 6,
      timeout: 500000,
    },
    sepolia: {
      url: RPC_URL_SEPOLIA,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6,
      timeout: 500000,
    },
  },
  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: CMC_API_KEY,
    token: "ETH",
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      defalut: 1,
    },
  },
  mocha: {
    timeout: 500000,
  },
};
