pragma solidity ^0.5.0;

import "./Proposal.sol";
import "./Proof.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

contract CityImprovement is Proposal, Ownable {
    
    // FYI How to retrieve the idea and for showing to UI.
    // FYI modifier to restrict certain functions from approvers/editors.
    // FYI modifier to only allow applicants for applying innovation ideas
    // FYI should have a read proposal
    // TODO should have applyForApprover(cannot propose and cannot vote) and applyAsVoter(cannot vote own proposal)
    // TODO can only apply once(application must be approved first before application)
    // TODO can only approve once(cannot approved alredy approved proposal)
    // TODO can only vote once.
    // TODO have a poll
    // TODO add function voteForIdea
    // TODO highest vote count should have highest priority
    // FYI can't vote when already approved or when status is in progress.
    // FYI approver role & voter role.
    // FYI one vote payable and once approved the applicant/approver can withdraw the amount
    // FYI try to create another proposer type(travel budget proposal), add destination.
    // Propsal can have image(destination/blueprint) time stamped
    // make the proof of existence as library
    
    // address of patent applicants.
    // address should automatically marked as applicants if they submit a proposal.
    mapping (address => bool) public applicants;
    
    // address of patent approvers.
    mapping (address => bool) private approvers; // Mayor and Governor

    // address of improvement voters
    mapping (address => bool) private voters;
    
    // id of patent application
    mapping (uint => ProposalDetails) public improvements;
    
    // patent counts
    uint public improvementCounts;

    // reward amount
    uint private REWARD_AMOUNT = 200 wei;
    
    // Modifiers
    modifier isApprover(address _address) {
        require(approvers[_address] == true, "Only approver is allowed");
        _;
    }

    modifier isVoter(address _address) {
        require(voters[_address] == true, "Only voter is allowed");
        _;
    }

    modifier isApplicant(address _address) {
        require(applicants[_address] == true, "Only applicant is allowed");
        _;
    }

    modifier notClosed(uint id) {
        require(improvements[id].status != Proposal.State.Closed, "Only open proposals are allowed");
        _;
    }
    
    constructor() public {
        improvementCounts = 0;
    }

    function readProposal(uint id) 
        public 
        view 
        returns(string memory title, 
            string memory description, 
            address applicant, 
            address payable[] memory approver,
            uint votes,
            bytes32 proof,
            Proposal.State status) {
        return (improvements[id].title, 
            improvements[id].description, 
            improvements[id].applicant, 
            improvements[id].approver,
            improvements[id].votes,
            improvements[id].proof,
            improvements[id].status);
    }
    
    /** 
     * @dev This function creates a new idea to apply for innovation approval.
     **/
    function submit(string memory title, string memory description, string memory problem, string memory solution) public returns(bool) {
        require(applicants[msg.sender] == false);
        require(voters[msg.sender] == false);
        require(approvers[msg.sender] == false);
        require(msg.sender != owner());
        
        emit LogNewIdea(improvementCounts);
        improvements[improvementCounts] = Proposal.ProposalDetails({
            title: title,
            description: description,
            problem: problem,
            solution: solution,
            applicant: msg.sender,
            approver: new address payable[](0),
            votes: 0,
            approvals: 0,
            proof: 0x0,
            status: Proposal.State.Submitted
        });
        
        // Add `msg.sender` to the applicant list.
        applicants[msg.sender] = true;
        improvementCounts = improvementCounts + 1;
        return true;
    }

    /**
     * @dev This function approves the idea by the randomly selected approver.
     **/
     function approve(uint id) public payable isApprover(msg.sender) notClosed(id){
         require(improvements[id].votes > 0, "Proposal votes should be present for approval");
         require(improvements[id].approvals <= 2, "Proposal approvals not exceed 2");
         require(improvements[id].status != Proposal.State.Rejected, "Cannot approve if already rejected");

         improvements[id].approvals++;
         improvements[id].approver.push(msg.sender);
         if (improvements[id].approvals == 2) {
             improvements[id].status = Proposal.State.Approved;

            //After approval notarize proposal.
            improvements[id].proof = Proof.notarize(abi.encode(improvements[id].title, 
                                    improvements[id].description, 
                                    improvements[id].problem, 
                                    improvements[id].solution, 
                                    improvements[id].applicant, 
                                    improvements[id].approver, 
                                    improvements[id].votes, 
                                    improvements[id].approvals,
                                    improvements[id].status));

                                            // reward some tokens to applicant.
            improvements[id].applicant.transfer(REWARD_AMOUNT * improvements[id].votes);
            emit LogApproveIdea(id);
         }
     }
     
     /**
      * @dev This function rejects the idea by the approver.
      * @param id Proposal id.
      **/
      function reject(uint id) public isApprover(msg.sender) notClosed(id) {
          // the one that approved cannot reject.
          // no rewards shall be given to the applicant
          improvements[id].approver.push(msg.sender);
          improvements[id].status = Proposal.State.Rejected;
          emit LogRejectIdea(id);
      }

       function vote(uint id) public isVoter(msg.sender) notClosed(id) {
           require(improvements[id].voted[msg.sender] == false, "Voter can only vote once.");
           require(improvements[id].status != Proposal.State.Rejected, "Cannot vote if already rejected");

           improvements[id].votes++;
           improvements[id].voted[msg.sender] = true;
       }

       function close(uint id) public onlyOwner notClosed(id) {
           require(improvements[id].status == Proposal.State.Approved || improvements[id].status == Proposal.State.Rejected, "Proposal state should be approved or rejected.");
           improvements[id].status = Proposal.State.Closed;
       }

           
      /**
       * @dev This function marks the @msg.sender to be an approver and added to the list of approvers.
       * Note: Approvers can't can't be voters and can't be applicants.
       **/
       function applyForApprover() public {
           require(applicants[msg.sender] == false);
           require(voters[msg.sender] == false);
           require(approvers[msg.sender] == false);
           require(msg.sender != owner());

           approvers[msg.sender] = true;
       }

      /**
       * @dev This function marks the @msg.sender to be an voter and added to the list of voters.
       * Note: Voters can't can't be approvers but can be applicants.
       **/
       function applyForVoter() public {
           require(applicants[msg.sender] == false);
           require(voters[msg.sender] == false);
           require(approvers[msg.sender] == false);
           require(msg.sender != owner());

           voters[msg.sender] = true;
       }
}