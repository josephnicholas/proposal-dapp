# City Improvement (a proposal system)

Author: Joseph Nicholas R. Alcantara

## Table of Contents
- [Introduction](#introduction)
- [About this project](#about-this-project)
- [Development resources](#development-resources)
- [Research](#research)
- [Further improvements](#further-improvements)
- [Known issues](#known-issues)

## Introduction

## About this project

## Development resources

- Mail: [josephnicholasalcantara@gmail.com](mailto:josephnicholasalcantara@gmail.com)
- Github: [https://github.com/josephnicholas/proposal-dapp](https://github.com/josephnicholas/proposal-dapp)

### Dependencies

| Deps          | Version| Linux Ubuntu    | macOS Catalina     |
| ------------  | -------| --------------  | ------------------ |
| solidity      | 0.5.0  | `solc`                        | `solidity`|
| Truffle suite | any    | `npm install -g truffle`      | `npm install -g truffle`  |
| Mythx         | any    | `npm install truffle-security`| `npm install truffle-security`  |
| NodeJS        | any    | [Install guide](https://nodejs.org/en/download/package-manager/) | [Install guide](https://nodejs.org/en/download/package-manager/)  |
| Ganache       | any    | `npm install -g ganache-cli`  | `npm install -g ganache-cli`  |
| Metamask      | any    | [Install guide](https://metamask.io/)  | [Install guide](https://metamask.io/)  |

### Setup and run locally

- Install solidity compiler
    ```bash
    $ sudo add-apt-repository ppa:ethereum/ethereum
    $ sudo apt-get update
    $ sudo apt-get install solc
    ```
- Install [Metamask](https://metamask.io/)
- Install Truffle and Ganache CLI
    ```bash
    $ npm install -g truffle
    $ npm install -g ganache-cli
    ```
- Clone repository
    ```bash
    $ git clone https://github.com/josephnicholas/proposal-dapp.git
    $ cd proposal-dapp
    ```

- (Optional) Install MythX
    ```bash
    $ npm install truffle-security
    ```

- Install Openzeppelin smart contracts
    ```bash
    $ npm install @openzeppelin/contracts
    ```

- Compile contracts
    ```bash
    $ truffle compile --all
    ```

- Run Ganache CLI and run the contract test
    ```bash
    $ ganache-cli
    $ truffle test --network develop
    # develop 8545 CLI
    # development 7545 UI
    ```

- Migrate contract in Ganache CLI
    ```bash
    $ truffle migrate --network develop
    ```

- Connect Metamask to Ganache CLI - [Guide](https://www.trufflesuite.com/tutorials/pet-shop#interacting-with-the-dapp-in-a-browser)

- After deployment run the React client
    ```bash
    $ cd client
    $ npm install
    $ npm run start
    # page will open at localhost:3000
    ```

### Design pattern decisions

### Avoiding common attack

## Research

## Further improvements

## Known issues

