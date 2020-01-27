# City Improvement (a proposal system)

Author: Joseph Nicholas R. Alcantara

## Table of Contents
- [Introduction](#introduction)
- [About this project](#about-this-project)
- [Development resources](#development-resources)
- [Further improvements](#further-improvements)
- [Known issues](#known-issues)

## Introduction

This project is a partial requirement for the Consensys Academy Developer Bootcamp.

The *City Improvement* Dapp is a kind of proposal system for applying, voting, and managing projects proposed by the citizens. The proposal system will not only accept proposals, it will also incentivise the applicant if it is approved. The incentive will be based on the number of votes multiplied by **1 ETH**.

This is a simple implementation that tries to solve the centralized project control of the government without the mass' knowledge.

## About this project

The *City improvement* Dapp is a tool which promotes a decentralized project system which is accessible by both the government and the citizens.

This project is implemented in *solidity* which is one of **Ethereum's** smart contract programming languages. Development of this project is made possible by the following tools:

- [Truffle Suite]()
- [Ganache]()
- [Metamask]()
- [MythX]()
- [ReactJS]()
- [OpenZeppelin library of contracts]()

There is no current plan in deploying the project on the *Ethereum mainnet* but when the project reaches its usage maturity, by then this will be released to the public and proposed to my small local goverment unit in the *Philippines*. Currently this project will be deployed on **Rinkeby testnet** which will also be enough for doing some demos on our local governing body.

Below is a high level explanation of what this decentralized application does and solves.

The *City improvement* Dapp will be composed of the following entities:

- **Owner** - The *owner* is the administrator of the proposal system. The owner's responsibility is to `close` the proposal if it's alread been      voted and approved. It is also the owner's responsiblity to `pause` the Dapp whenver there are unforeseen errors during the Dapp's usage cycle.

- **Applicant** - The *applicant* is the one that `submits` a proposal to the system. The *applicant* can only apply **1** proposal at a time, this is to prevent spamming of applications which will be hard for the system to manage and for the other members to review. The *applicant* can only apply again if his/her proposal is approved/rejected.

    The *applicant* is incentivized when the proposal is `approved`.

- **Approver** - The *approver* is the one that `approves` or `rejects` the *applicants* proposal. The *approver* can only `approve` if propsal has at least **1** *vote*. It is a requirement to have **2** approvals before mark the proposal as approved and incentvize the *applicant*. The `reject` action however just puts the contract to an end. The last *approver* will be the one to deposit the value for the *applicant's* reward.

- **Voter** - The *voter* is the one that `votes` for the proposal. The number of **votes** is multiplied to the reward amount which will be then received by the *applicant*.

- **Proposal** - The *proposal* is the document that details the *applicant's* proposal. When `approved` some of the details are being hashed to serve as a proof that this kind of proposal is already in the system *(This will be used in a later project stage)*.

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
See [Design pattern decisions](design_pattern_decisions.md)

### Avoiding common attack
See [Avoiding Common Attacks](avoiding_common_attacks.md)

## Further improvements

## Known issues

