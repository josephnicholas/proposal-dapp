import React, { Component } from "react";
import CityImprovementContract from "./contracts/CityImprovement.json";
import getWeb3 from "./getWeb3";
import { BaseStyles, Flex, Box, Form, Input, Field, Button, Heading, Textarea, Text, Card } from 'rimble-ui';

import "./App.css";

class App extends Component {
  state = { 
    proposalCount: 0, 
    title: null, 
    web3: null, 
    accounts: null, 
    contract: null,
    proposalTitle: "", 
    proposalDescription: "", 
    proposalProb: "", 
    proposalSol: "",
    titles: [],
    descriptions: [],
    problems: [],
    solutions: [],
    applyVoterBtn: false,
    applyApproverBtn: false,
    applicantState: false,
    ownerState: false,
    approverDone: false,
    pendingPayments: 0,
    cardProposals: null
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = CityImprovementContract.networks[networkId];
      const instance = new web3.eth.Contract(
        CityImprovementContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.load);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  load = async () => {
    const { contract, accounts } = this.state;

    const response = await contract.methods.getNumberOfProposals().call();
    const aVoterState = await contract.methods.voters(accounts[0]).call();
    const aApproverState = await contract.methods.approvers(accounts[0]).call();
    const applicantState = await contract.methods.applicants(accounts[0]).call();
    const ownerState = await contract.methods.owner().call() == accounts[0];
    const pending = await contract.methods.payments(accounts[0]).call({ from: accounts[0] });

    for (let i = 0; i < response; i++) { 
      const proposalResponse = await contract.methods.readProposal(i).call()
      this.state.titles.push(proposalResponse["title"]);
      this.state.descriptions.push(proposalResponse["description"]);
    }

   this.setState({ proposalCount: response });
   this.setState({ applyVoterBtn: aVoterState });
   this.setState({ applyApproverBtn: aApproverState });
   this.setState({ applicantState: applicantState });
   this.setState({ pendingPayments: pending });
   this.setState({ ownerState: ownerState });

   await this.handleCardRender(this.state.proposalCount);
  };

  getProposalStats = async (id) => {
    const { contract } = this.state;
    const proposal = await contract.methods.improvements(id).call();
    
    const votes = proposal["votes"];
    const approvals = proposal["approvals"];
    let stat = ""
    switch(proposal["status"]) {
      case "2":
        stat = "Rejected";
        break;
      case "4":
        stat = "Closed";
        break;
      default:
        stat = "In Progress";
        break;
    }
    return [votes, approvals, stat];
  }

  applyForApprover = async () => {
    const { accounts, contract } = this.state;
    await contract.methods.applyForApprover().send({ from: accounts[0] });
    console.log("Added approver " + accounts[0]);
  };

  approve = async (id) => {
    const { accounts, contract, web3 } = this.state;

    const REWARD_AMOUNT = web3.utils.toWei('1', 'ether');
    const responseApprovals = await contract.methods.improvements(id).call();
    const votes = responseApprovals["votes"];

    try {
      if (responseApprovals["approvals"] > 0) {
        await contract.methods.approve(id).send({ from: accounts[0], value: new web3.utils.BN(REWARD_AMOUNT).mul(new web3.utils.BN(votes)) });
      } else {
        await contract.methods.approve(id).send({ from: accounts[0] });
      }
    } catch(error) {
      alert(
        "Proposal should be voted first"
      );
      console.error(error.message());
    }
  };
  
  reject = async (id) => {
    const { accounts, contract } = this.state;
    try {
      await contract.methods.reject(id).send({ from: accounts[0] });
    } catch (error) {
      alert(
        "Proposal should be voted first"
      );
      console.error(error.message);
    }
  };

  applyForVoter = async () => {
    const { accounts, contract } = this.state;
    await contract.methods.applyForVoter().send({ from: accounts[0] });
    console.log("Added voter " + accounts[0]);
  };

  vote = async (id) => {
    const { accounts, contract } = this.state;
    await contract.methods.vote(id).send({ from: accounts[0] });
    await this.handleVoteButton(id);
  };

  close = async (id) => {
    const { accounts, contract } = this.state;
    await contract.methods.close(id).send({ from: accounts[0] });
  };

  submit = async (event) => {
    event.preventDefault();
    const { accounts, contract, proposalTitle, proposalDescription, proposalProb, proposalSol } = this.state;
    await contract.methods.submit(proposalTitle, proposalDescription, proposalProb, proposalSol).send({from: accounts[0]});

    console.log("Successfully Submitted by " + accounts[0]);
  };

  handleInputTitle = async (event) => {
    this.setState({proposalTitle: event.target.value});
  };

  handleInputDesc = async (event) => {
    this.setState({proposalDescription: event.target.value});
  };

  handleInputProb = async (event) => {
    this.setState({proposalProb: event.target.value});
  };

  handleInputSol = async (event) => {
    this.setState({proposalSol: event.target.value});
  };

  handleClear = async (event) => {
    this.setState({proposalTitle: ""});
    this.setState({proposalDescription: ""});
    this.setState({proposalProb: ""});
    this.setState({proposalSol: ""});
  };

  handleVoteButton = async(id) => {
    const { accounts, contract } = this.state;
    const response = await contract.methods.doneVoting(id, accounts[0]).call();
    return response;
  }

  handleApproveButton = async(id) => {
    const { accounts, contract } = this.state;
    const response = await contract.methods.doneApproving(id, accounts[0]).call();
    return response;
  }

  handleClosed = async(id) => {
    const { contract } = this.state;
    const response = await contract.methods.improvements(id).call();
    const closed = (response["status"] == 4)

    return closed;
  }

  handleCardRender = async (count) => {
    const array = [];
    
    for (let i = 0; i < count; i++) {
      const [ votes, approvals, stat ] = await this.getProposalStats(i);
        array.push(<Card width={"auto"} maxWidth={"540px"} px={[3, 3, 4]}>
        <Heading>{this.state.titles[i]}</Heading>
          <Box>
            <Text mb={4}>
            {this.state.descriptions[i]}
            </Text>
          </Box>

          <Box>
            <Text mb={1}>
              <strong>Votes:</strong> { votes }
            </Text>
          </Box>

          <Box>
            <Text mb={1}>
              <strong>Approvals:</strong> { approvals }
            </Text>
          </Box>

          <Box>
            <Text mb={1}>
              <strong>Status:</strong> { stat }
            </Text>
          </Box>
    
          <Button disabled={ await this.handleNoRoleAddress() || this.state.applicantState || this.state.ownerState  || this.state.applyApproverBtn || await this.handleVoteButton(i) || await this.handleClosed(i) } onClick={() => this.vote(i)} width={[1, "auto", 1]} mb={1}>
            Vote
          </Button>
        
          <Button disabled={ await this.handleNoRoleAddress() || this.state.applicantState || this.state.ownerState || this.state.applyVoterBtn || await this.handleApproveButton(i) || await this.handleClosed(i) } className="approve" onClick={() => this.approve(i)} width={[1, "auto", 1]} mb={1}>
            Approve
          </Button>

          <Button disabled={ await this.handleNoRoleAddress() || this.state.applicantState || this.state.ownerState || this.state.applyVoterBtn || await this.handleApproveButton(i) || await this.handleClosed(i) } onClick={() => this.reject(i)} width={[1, "auto", 1]} mb={1}>
            Reject
          </Button>
    
          <Button.Outline  disabled={ !this.state.ownerState  || await this.handleClosed(i) } className="close" onClick={() => this.close(i)} width={[1, "auto", 1]} mt={[2, 0, 0]}>
            Close
          </Button.Outline>
        </Card>);
    }
    this.setState({cardProposals: array});
  };

  handleWithdraw = async() => {
    const { accounts, contract } = this.state;
    if (this.state.pendingPayments > 0) {
      await contract.methods.withdrawPayments(accounts[0]).send({from: accounts[0]});
    }
  };

  handleNoRoleAddress = async() => {
    const { accounts, contract } = this.state;
    const isApplicant = await contract.methods.applicants(accounts[0]).call();
    const isApprover = await contract.methods.approvers(accounts[0]).call();
    const isVoter = await contract.methods.voters(accounts[0]).call();
    return (!isApplicant && !isApprover && !isVoter);
  };

   render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <BaseStyles>
        <Box p={4} className="App">
          <Box>
            <Form onSubmit={this.submit} border={1} borderColor={"grey"} borderRadius={1} p={3}>
              <Flex mx={-3} flexWrap={"wrap"}>
                <Box width={[1, 1, 1]} px={3}>
                  <Field label="Title" width={1}>
                    <Input
                    type="text"
                    required
                    width={1}
                    value={this.state.proposalTitle}
                    onChange={this.handleInputTitle}/>                  
                   </Field>
                </Box>
              </Flex>
              <Flex mx={-3} flexWrap={"wrap"}>
                <Box width={[1, 1, 1]} px={3}>
                    <Field label="Description" width={1}>
                      <Textarea
                      type="text"
                      required
                      width={1}
                      height={5}
                      value={this.state.proposalDescription}     
                      onChange={this.handleInputDesc}/>              
                    </Field>
                  </Box>
              </Flex>
              <Flex mx={-3} flexWrap={"wrap"}>
              <Box width={[1, 1, 1]} px={3}>
                    <Field label="Problem" width={1}>
                      <Textarea
                      type="text"
                      required
                      width={1}
                      height={3}
                      value={this.state.proposalProb}
                      onChange={this.handleInputProb}/>                  
                    </Field>
                  </Box>
              </Flex>
              <Flex mx={-3} flexWrap={"wrap"}>
              <Box width={[1, 1, 1]} px={3}>
                    <Field label="Solution" width={1}>
                      <Textarea
                      type="text"
                      required
                      width={1}
                      height={3}
                      value={this.state.proposalSol}
                      onChange={this.handleInputSol}/>                  
                    </Field>
                  </Box>
              </Flex>
              <Box>
                <Button disabled={ this.state.ownerState || this.state.applyApproverBtn || this.state.applyVoterBtn } type='reset' size={'medium'} onClick={() => this.handleClear()} mr={1}>Clear</Button>
                <Button disabled={ this.state.ownerState || this.state.applyApproverBtn || this.state.applyVoterBtn } type='submit' size={'medium'} color={'green'} ml={1}>Submit</Button>
              </Box>
            </Form>
            <Flex>
              <Box width={[1, 1, 1]} px={3}>
                <Button disabled={this.state.pendingPayments == 0} size={'large'} onClick={ () => this.handleWithdraw() } mb={2} mt={2}>Withdraw</Button>
              </Box>
            </Flex>
            <Flex>
                {this.state.cardProposals}
            </Flex>
            <Box>
              <Button disabled={ this.state.ownerState || this.state.applyApproverBtn || this.state.applyVoterBtn || this.state.applicantState} className="applyApprover" onClick={() => this.applyForApprover()} width={[1, "auto", "auto"] }mt={2} mr={2}>
                Apply as Approver
              </Button>
              <Button disabled={ this.state.ownerState || this.state.applyVoterBtn || this.state.applyApproverBtn || this.state.applicantState} className="applyVoter" onClick={() => this.applyForVoter()} width={[1, "auto", "auto"]} mt={2} mr={2}>
                Apply as Voter
              </Button>
            </Box>
            <Text>Proposal count: {this.state.proposalCount}</Text>
          </Box>
        </Box>
      </BaseStyles>
    );
  }
}

export default App;
