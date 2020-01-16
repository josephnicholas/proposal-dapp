const CityImprovement = artifacts.require("./CityImprovement.sol");
let catchRevert = require("./exceptionsHelpers.js").catchRevert
const BN = web3.utils.BN

contract("CityImprovement", accounts => {
  const owner = accounts[0];
  const applicant = accounts[1];
  const approver = accounts[2];
  const voter = accounts[3];

  const citizenApplicant = accounts[4];
  const presidentApprover = accounts[5];
  const congressmanApprover = accounts[6];

  const citizenVoter = accounts[7];

  const REWARD_AMOUNT = 200;

  let improvement
  let cip

  beforeEach(async () => {
    improvement = await CityImprovement.deployed();
    cip = await CityImprovement.new();
  })

  describe("Proposal application", async() => {
    it("appliant should be able to submit proposal", async () => {
      await improvement.submit("New MTR Proposal", "New Route to Manial to Cebu", "Traffice Jam", "More Transportation", {from: applicant});
      var result = await improvement.readProposal(0); // 1 proposal still in the list
      
      assert.equal(result["applicant"], applicant, "Proposal applicant has the same address");
      assert.equal(result["title"], "New MTR Proposal", "Title same as proposed");
      assert.equal(result["approver"], 0, "No approver yet");
      assert.equal(result["votes"], 0, "No votes yet");
      assert.equal(result["proof"], 0, "No proof yet");
      assert.equal(result["status"], 0, "Status should be Submitted");
    });

    it("applicant can only submit one proposal", async () => {
      await catchRevert(improvement.submit("New MTR Proposal", "New Route to Manial to Cebu", "Traffice Jam", "More Transportation", {from: applicant}));
    });

    it("owner can't do non-admin task", async () => {
      await catchRevert(improvement.submit("New MTR Proposal", "New Route to Manial to Cebu", "Traffice Jam", "More Transportation", {from: owner}));
    });
  })

  describe("Voting proposal", async() => {
    it("owner cannot apply as voter", async () => {
      await catchRevert(improvement.applyForVoter({from: owner}));
    });
  })

  describe("Approving and rejecting proposal", async() => {
    it("owner cannot apply as approver", async () => {
      await catchRevert(improvement.applyForApprover({from: owner}));
    });

    it("applicant receives rewards when proposal is approved", async () => {
      // vote then approve
      await improvement.applyForVoter({from: voter});
      await improvement.vote(0, {from: voter});

      var prevBalance = await web3.eth.getBalance(applicant);
      await improvement.applyForApprover({from:approver});
      await improvement.approve(0, {from: approver, value: REWARD_AMOUNT});

      var result = await improvement.readProposal(0);
      
      var balance = await web3.eth.getBalance(applicant);
      assert.equal(result["approver"][0], approver, "Approver assgined.");
      assert.equal(result["status"], 0, "Not yet approved needs 2 approvers.");
      assert.equal(result["votes"], 1, "There should be 1 vote.");
      assert.equal(result["proof"], 0x0, "No proof of approval yet.");
      assert.equal(balance, new BN(prevBalance).toString(), "Applicant balance should not change.");
    });
  })

  describe("Full proposal flow", async() => {
    it("proposal application, approval, and closure", async () => {
      // This will be the 2nd proposal in the improvement list.
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
      await cip.approve(0, {from: congressmanApprover, value: REWARD_AMOUNT});

      await cip.applyForApprover({from: presidentApprover});
      await cip.approve(0, {from: presidentApprover, value: REWARD_AMOUNT});

      var result = await cip.readProposal(0);
      
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
  })
});
