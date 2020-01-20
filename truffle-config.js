const path = require("path");

const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraKey = '0f4d7a2c72e142059cbf95d74a41f94f';
const infuraURL = 'https://rinkeby.infura.io/v3/0f4d7a2c72e142059cbf95d74a41f94f'

const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {

  plugins: ["truffle-security"],

  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, infuraURL),
      network_id: 4,          // Rinkeby's network id
      gas: 5500000,        
    },
  },
  compilers: {
    solc: {
      version: "^0.5.0",
      parser: "solcjs",
      settings: {
        optimizer: {
          enabled: true,
          runs: 300
        }
      }
    }
  }
};
