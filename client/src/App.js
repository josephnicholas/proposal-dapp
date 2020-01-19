import React, { Component } from "react";
import CityImprovementContract from "./contracts/CityImprovement.json";
import getWeb3 from "./getWeb3";
import { BaseStyles, Flex, Box, Form, Input, Field, Button, Heading, Textarea, Text, Description, Card, arr } from 'rimble-ui';

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
    solutions: []};

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
    const { contract } = this.state;

    const response = await contract.methods.getNumberOfProposals().call();

    for (let i = 0; i < response; i++) { 
      const proposalResponse = await contract.methods.readProposal(i).call()
      console.log(proposalResponse["title"]);
      this.state.titles.push(proposalResponse["title"]);
      this.state.descriptions.push(proposalResponse["description"]);
      this.state.problems.push(proposalResponse["problem"]);
      this.state.solutions.push(proposalResponse["solution"]);
    }

   this.setState({ proposalCount: response });
  };

  applyForApprover = async () => {
    const { accounts, contract } = this.state;
    await contract.methods.applyForApprover().send({ from: accounts[0] });
    console.log("Added approver " + accounts[0]);
  };

  approve = async (id) => {
    const { accounts, contract } = this.state;

    await contract.methods.approve(id).send({ from: accounts[0], value: 200 });
    const proposalResponse = await contract.methods.readProposal(id).call();
    
    console.log("Approved " +proposalResponse["title"]);
    console.log("Status " +proposalResponse["status"]);
  };

  applyForVoter = async () => {
    const { accounts, contract } = this.state;
    await contract.methods.applyForVoter().send({ from: accounts[0] });
    console.log("Added voter " + accounts[0]);
  };

  vote = async (id) => {
    const { accounts, contract } = this.state;
    await contract.methods.vote(id).send({ from: accounts[0] });

    console.log("Voted " + id);

    const proposalResponse = await contract.methods.readProposal(id).call();

    console.log("Voted " + proposalResponse["title"]);
  };

  close = async (id) => {
    const { accounts, contract } = this.state;
    await contract.methods.close(id).send({ from: accounts[0] });

    const proposalResponse = await contract.methods.readProposal(id).call();

    console.log("Closed " + proposalResponse["title"]);
    console.log("Status " +proposalResponse["status"]);
  };

  submit = async () => {
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

  handleData = async (id) => {
    const { contract } = this.state;
    return await contract.methods.readProposal(id).call();
  }

  handleCardRender = (count) => {
    const array = [];

    for (let i = 0; i < count; i++) {
        array.push
        (<Card width={"auto"} maxWidth={"240px"} mx={"auto"} px={[3, 3, 4]}>
        <Heading>{this.state.titles[i]}</Heading>
          <Box>
            <Text mb={4}>
            {this.state.descriptions[i]}
            </Text>
          </Box>
    
          <Box>
            <Text mb={4}>
            {this.state.problems[i]}
            </Text>
          </Box>
    
          <Box>
            <Text mb={4}>
            {this.state.solutions[i]}
            </Text>
          </Box>
    
          <Button className="vote" onClick={() => this.vote(i)} width={[1, "auto", 1]} mb={1}>
            Vote
          </Button>
        
          <Button className="approve" onClick={() => this.approve(i)} width={[1, "auto", 1]} mb={1}>
            Approve
          </Button>
    
          <Button.Outline className="close" onClick={() => this.close(i)} width={[1, "auto", 1]} mt={[2, 0, 0]}>
            Close
          </Button.Outline>
        </Card>);
    }
    
    return array;
  }

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
                <Box width={[1, 1, 1/2]} px={3}>
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
                <Box width={[1, 1, 1/2]} px={3}>
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
              <Box width={[1, 1, 1/2]} px={3}>
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
              <Box width={[1, 1, 1/2]} px={3}>
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
                <Button className="clearFields" size={'medium'} mr={1}>Clear</Button>
                <Button className="submitApplication" type='submit' size={'medium'} color={'green'} ml={1}>Submit</Button>
              </Box>
            </Form>
            <Flex>
              <Box>
                {this.handleCardRender(this.state.proposalCount)}
              </Box>
            </Flex>
            <Box>
              <Button className="applyApprover" onClick={() => this.applyForApprover()} width={[1, "auto", "auto"] }mt={2} mr={2}>
                Apply as Approver
              </Button>
              <Button className="applyVoter" onClick={() => this.applyForVoter()} width={[1, "auto", "auto"]} mt={2} mr={2}>
                Apply as Voter
              </Button>`
            </Box>
            <div>The stored value is: {this.state.proposalCount}</div>
          </Box>
        </Box>
      </BaseStyles>
    );
  }
}

export default App;
