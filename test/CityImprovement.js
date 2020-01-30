const CityImprovement = artifacts.require("./city/CityImprovement.sol");
let catchRevert = require("./exceptionsHelpers.js").catchRevert
const BN = web3.utils.BN
const toWei = web3.utils.toWei;

contract("CityImprovement", accounts => {
  const owner = accounts[0];
  const applicant = accounts[1];
  const approver = accounts[2];
  const voter = accounts[3];

  const citizenApplicant = accounts[4];
  const presidentApprover = accounts[5];
  const congressmanApprover = accounts[6];

  const citizenVoter = accounts[7];

  const REWARD_AMOUNT = toWei('1', 'ether');

  let cip

  beforeEach(async () => {
    cip = await CityImprovement.new();
  })

  contract("Proposal application", async() => {
    it("applicant should be able to submit proposal", async () => {
      const tx = await cip.submit("New MTR Proposal", "New Route to Manial to Cebu", "Traffice Jam", "More Transportation", {from: applicant});
      
      let eventEmitted = false;
      if (tx.logs[0].event == "LogSubmit") {
        eventEmitted = true;
      }

      const result = await cip.readProposal(0);
      const proposal = await cip.improvements(0);

      assert.equal(eventEmitted, true, "Submit log")
      assert.equal(proposal["title"], "New MTR Proposal", "Title same as proposed");      
      assert.equal(result["applicant"], applicant, "Proposal applicant has the same address");
      assert.equal(result["title"], "New MTR Proposal", "Title same as proposed");
      assert.equal(result["approver"], 0, "No approver yet");
      assert.equal(result["votes"], 0, "No votes yet");
      assert.equal(result["proof"], 0, "No proof yet");
      assert.equal(result["status"], 0, "Status should be Submitted");
    });

    it("applicant can only submit one proposal", async () => {
      await cip.submit("New MTR Proposal", "New Route to Manial to Cebu", "Traffice Jam", "More Transportation", {from: applicant});
      await catchRevert(cip.submit("New MTR Proposal", "New Route to Manial to Cebu", "Traffice Jam", "More Transportation", {from: applicant}));
    });

    it("owner can't do non-admin task", async () => {
      await catchRevert(cip.submit("New MTR Proposal", "New Route to Manial to Cebu", "Traffice Jam", "More Transportation", {from: owner}));
    });

    it("applicant can submit again after proposal is closed", async () => {
      let tx = await cip.submit("Blockchain voting system", 
        "Ethereum powered blockchain system for private and secured election", 
        "Broken election rules and easy to manipulate", 
        "Fair election", 
        {from: citizenApplicant});

      let eventEmitted = false;
      if (tx.logs[0].event == "LogSubmit") {
        eventEmitted = true;
      }

      assert.equal(eventEmitted, true, 'applicant submit proposal log')

      tx = await cip.applyForVoter({from: citizenVoter});
      eventEmitted = false;
      if (tx.logs[0].event == "LogVoterApply") {
        eventEmitted = true;
      }

      assert.equal(eventEmitted, true, 'applying for approver should emit a approver apply event')

      tx = await cip.applyForVoter({from: voter});
      eventEmitted = false;
      if (tx.logs[0].event == "LogVoterApply") {
        eventEmitted = true;
      }
      assert.equal(eventEmitted, true, 'applying for approver should emit a approver apply event')

      tx = await cip.vote(0, {from: citizenVoter});
      eventEmitted = false;
      if (tx.logs[0].event == "LogVote") {
        eventEmitted = true;
      }
      assert.equal(eventEmitted, true, 'voter vote to proposal')

      tx = await cip.vote(0, {from: voter});
      eventEmitted = false;
      if (tx.logs[0].event == "LogVote") {
        eventEmitted = true;
      }
      assert.equal(eventEmitted, true, 'voter vote to proposal')

      var isVoter = await cip.voters(voter)
      assert.equal(true, isVoter, "address is a voter");

      var prevBalance = await web3.eth.getBalance(citizenApplicant);
      tx = await cip.applyForApprover({from: congressmanApprover});
      eventEmitted = false;
      if (tx.logs[0].event == "LogApproverApply") {
        eventEmitted = true;
      }
      assert.equal(eventEmitted, true, 'log apply for 1st approver')

      tx = await cip.applyForApprover({from: presidentApprover});
      eventEmitted = false;
      if (tx.logs[0].event == "LogApproverApply") {
        eventEmitted = true;
      }
      assert.equal(eventEmitted, true, 'log apply for 2nd approver')

      tx = await cip.approve(0, {from: congressmanApprover, value: REWARD_AMOUNT});
      eventEmitted = false;
      if (tx.logs[0] == null) {
        eventEmitted = true;
      }
      assert.equal(eventEmitted, true, 'should be true since proposal not yet fully approved')

      tx = await cip.approve(0, {from: presidentApprover, value: REWARD_AMOUNT});
      eventEmitted = false;
      if (tx.logs[0].event == "LogApprove") {
        eventEmitted = true;
      }
      assert.equal(eventEmitted, true, 'should be true since proposal is fully approved')

      var result = await cip.readProposal(0);
      await cip.withdrawPayments(citizenApplicant);

      var balance = await web3.eth.getBalance(citizenApplicant);
      assert.equal(result["approver"][1], presidentApprover, "Approver assgined.");
      assert.equal(result["status"], 3, "Status should be approved.");
      assert.equal(result["votes"], 2, "There should be 2 vote.");
      assert.notEqual(result["proof"], 0x0, "Proposal has now proof of approval.");
      assert.equal(balance, new BN(prevBalance).add(new BN(REWARD_AMOUNT).mul(new BN(result["votes"]))).toString(), "Applicant balance greater than the previous.");

      tx = await cip.close(0, {from: owner});
      eventEmitted = false;
      if (tx.logs[0].event == "LogClose") {
        eventEmitted = true;
      }
      assert.equal(eventEmitted, true, 'log close for proposal from owner')

      result = await cip.readProposal(0);
      assert.equal(result["status"], 4, "Owner already closed");

      tx = await cip.submit("Blockchain voting system", 
        "Ethereum powered blockchain system for private and secured election", 
        "Broken election rules and easy to manipulate", 
        "Fair election", 
        {from: citizenApplicant});

      result = await cip.readProposal(1);
      const count = await cip.getNumberOfProposals({from: owner});

      assert.equal(result["status"], 0, "Status should be Submitted");
      assert.equal(count, 2, "2 proposals should already be in the container");
    });
  })

  contract("Voting proposal", async() => {
    it("owner cannot apply as voter", async () => {
      await catchRevert(cip.applyForVoter({from: owner}));
    });

    it("same voter cannot apply twice", async () => {
      cip.applyForVoter({from: voter})
      await catchRevert(cip.applyForVoter({from: voter}));
    });

    it("approver cannot apply as voter", async () => {
      cip.applyForApprover({from: approver})
      await catchRevert(cip.applyForVoter({from: approver}));
    });

    it("applicant cannot apply as voter", async () => {
      await cip.submit("New MTR Proposal", "New Route to Manial to Cebu", "Traffice Jam", "More Transportation", {from: applicant});
      await catchRevert(cip.applyForVoter({from: applicant}));
    });

    it("voter already voted", async () => {
      await cip.submit("New MTR Proposal", "New Route to Manial to Cebu", "Traffice Jam", "More Transportation", {from: applicant});
      cip.applyForVoter({from: voter})
      cip.vote(0, {from: voter})
      let done = await cip.doneVoting(0, voter);
      assert.equal(done, true, "Address of voter already voted");
    });
  })

  contract("Approving and rejecting proposal", async() => {
    it("owner cannot apply as approver", async () => {
      await catchRevert(cip.applyForApprover({from: owner}));
    });

    it("same approver cannot apply twice", async () => {
      cip.applyForApprover({from: approver})
      await catchRevert(cip.applyForApprover({from: approver}));
    });

    it("applicant receives rewards when proposal is approved", async () => {
      await cip.submit("New MTR Proposal", "New Route to Manial to Cebu", "Traffice Jam", "More Transportation", {from: applicant});

      await cip.applyForVoter({from: voter});
      await cip.vote(0, {from: voter});

      var prevBalance = await web3.eth.getBalance(applicant);
      await cip.applyForApprover({from:approver});
      await cip.approve(0, {from: approver, value: REWARD_AMOUNT});

      var result = await cip.readProposal(0);
      
      var balance = await web3.eth.getBalance(applicant);
      assert.equal(result["approver"][0], approver, "Approver assgined.");
      assert.equal(result["status"], 0, "Not yet approved needs 2 approvers.");
      assert.equal(result["votes"], 1, "There should be 1 vote.");
      assert.equal(result["proof"], 0x0, "No proof of approval yet.");
      assert.equal(balance, new BN(prevBalance).toString(), "Applicant balance should not change.");
    });

    it("approver already approved", async () => {
      await cip.submit("New MTR Proposal", "New Route to Manial to Cebu", "Traffice Jam", "More Transportation", {from: applicant});
      await cip.applyForVoter({from: voter})
      await cip.vote(0, {from: voter})
      await cip.applyForApprover({from: approver})
      await cip.approve(0, {from: approver, value: REWARD_AMOUNT});

      let done = await cip.doneApproving(0, approver);
      assert.equal(done, true, "Address of approver already approved");
    });
  })

  contract("Full proposal flow", async() => {
    it("proposal application, approval, and closure", async () => {
      // This will be the 2nd proposal in the cip list.
      cip.submit("Blockchain voting system", 
        "Ethereum powered blockchain system for private and secured election", 
        "Broken election rules and easy to manipulate", 
        "Fair election", 
        {from: citizenApplicant});

      const tx = await cip.applyForVoter({from: citizenVoter});
      let eventEmitted = false;
      if (tx.logs[0].event == "LogVoterApply") {
        eventEmitted = true;
      }

      assert.equal(eventEmitted, true, 'applying for approver should emit a approver apply event')

      await cip.applyForVoter({from: voter});

      await cip.vote(0, {from: citizenVoter});
      await cip.vote(0, {from: voter});

      var isVoter = await cip.voters(voter)
      assert.equal(true, isVoter, "This is a voter");

      var prevBalance = await web3.eth.getBalance(citizenApplicant);
      await cip.applyForApprover({from: congressmanApprover});
      await cip.applyForApprover({from: presidentApprover});

      await cip.approve(0, {from: congressmanApprover, value: REWARD_AMOUNT});
      await cip.approve(0, {from: presidentApprover, value: REWARD_AMOUNT});

      var result = await cip.readProposal(0);
      await cip.withdrawPayments(citizenApplicant);

      var balance = await web3.eth.getBalance(citizenApplicant);
      assert.equal(result["approver"][1], presidentApprover, "Approver assgined.");
      assert.equal(result["status"], 3, "Status should be approved.");
      assert.equal(result["votes"], 2, "There should be 2 vote.");
      assert.notEqual(result["proof"], 0x0, "Proposal has now proof of approval.");
      assert.equal(balance, new BN(prevBalance).add(new BN(REWARD_AMOUNT).mul(new BN(result["votes"]))).toString(), "Applicant balance greater than the previous.");

      await cip.close(0, {from: owner});

      result = await cip.readProposal(0);
      assert.equal(result["status"], 4, "Owner already closed");
    });

    it("proposal application, reject, and closure", async () => {
      // This will be the 2nd proposal in the cip list.
      cip.submit("Blockchain voting system", 
        "Ethereum powered blockchain system for private and secured election", 
        "Broken election rules and easy to manipulate", 
        "Fair election", 
        {from: citizenApplicant});

      await cip.applyForVoter({from: citizenVoter});
      await cip.applyForVoter({from: voter});

      await cip.vote(0, {from: citizenVoter});
      await cip.vote(0, {from: voter});

      var prevBalance = await web3.eth.getBalance(citizenApplicant);
      await cip.applyForApprover({from: congressmanApprover});
      await cip.reject(0, {from: congressmanApprover});

      var result = await cip.readProposal(0);
      
      var balance = await web3.eth.getBalance(citizenApplicant);
      assert.equal(result["approver"][0], congressmanApprover, "Approver rejected.");
      assert.equal(result["status"], 2, "Status should be rejected.");
      assert.equal(result["votes"], 2, "There should be 2 vote.");
      assert.equal(result["proof"], 0x0, "Proposal should have no proof of approval.");
      assert.equal(balance, new BN(prevBalance), "Applicant balance greater than the previous.");

      await cip.close(0, {from: owner});

      result = await cip.readProposal(0);
      assert.equal(result["status"], 4, "Owner already closed");
    });

    it("2 proposal application, 1 reject, 1 approve and 2 closure", async () => {
      cip.submit("Blockchain voting system", 
        "Ethereum powered blockchain system for private and secured election", 
        "Broken election rules and easy to manipulate", 
        "Fair election", 
        {from: citizenApplicant});

      cip.submit("P2P voting system", 
        "Corda powered blockchain system for private and secured election", 
        "Broken election rules and easy to manipulate", 
        "Fair election", 
        {from: applicant});

      await cip.applyForVoter({from: citizenVoter});
      await cip.applyForVoter({from: voter});

      await cip.vote(0, {from: citizenVoter});
      await cip.vote(0, {from: voter});

      var prevBalance = await web3.eth.getBalance(citizenApplicant);
      await cip.applyForApprover({from: congressmanApprover});
      await cip.reject(0, {from: congressmanApprover});

      var result = await cip.readProposal(0);
      var count = await cip.getNumberOfProposals({from: owner});
      
      var balance = await web3.eth.getBalance(citizenApplicant);
      assert.equal(count, 2, "2 Proposals are applied.");
      assert.equal(result["approver"][0], congressmanApprover, "Approver rejected.");
      assert.equal(result["status"], 2, "Status should be rejected.");
      assert.equal(result["votes"], 2, "There should be 2 vote.");
      assert.equal(result["proof"], 0x0, "Proposal should have no proof of approval.");
      assert.equal(balance, new BN(prevBalance), "No reward given to applicant.");

      await cip.close(0, {from: owner});

      result = await cip.readProposal(0);
      assert.equal(result["status"], 4, "Owner already closed");

      await cip.vote(1, {from: citizenVoter});
      await cip.vote(1, {from: voter});

      prevBalance = await web3.eth.getBalance(applicant);
      await cip.applyForApprover({from: presidentApprover});
      await cip.approve(1, {from: congressmanApprover, value: REWARD_AMOUNT});
      await cip.approve(1, {from: presidentApprover, value: REWARD_AMOUNT});

      result = await cip.readProposal(1);
      await cip.withdrawPayments(applicant);
      balance = await web3.eth.getBalance(applicant);

      assert.equal(result["approver"][0], congressmanApprover, "First approver");
      assert.equal(result["status"], 3, "Status should be approved.");
      assert.equal(result["votes"], 2, "There should be 2 vote.");
      assert.notEqual(result["proof"], 0x0, "Proposal should have no proof of approval.");
      assert.equal(balance, new BN(prevBalance).add(new BN(REWARD_AMOUNT).mul(new BN(result["votes"]))).toString(), "Applicant balance greater than the previous.");
    });
  })
  contract("owner pausing contract", async() => {
    it("Owner can pause contract", async () => {
      let tx = await cip.pause({from: owner});
      let eventEmitted = false;
      if (tx.logs[0].event == "Paused") {
        eventEmitted = true;
      }

      assert.equal(eventEmitted, true, 'owner contract paused')

      await catchRevert(cip.submit("New MTR Proposal", 
        "New Route to Manial to Cebu", 
        "Traffice Jam", 
        "More Transportation", 
        { from: applicant }));
    })

    it("Owner paused and unpaused then applicant can apply", async () => {
      let tx = await cip.pause({from: owner});
      let eventEmitted = false;
      if (tx.logs[0].event == "Paused") {
        eventEmitted = true;
      }
  
      assert.equal(eventEmitted, true, 'owner contract paused')
  
      await catchRevert(cip.submit("New MTR Proposal", 
        "New Route to Manial to Cebu", 
        "Traffice Jam", 
        "More Transportation", 
        { from: applicant }));
    })
  })
});
