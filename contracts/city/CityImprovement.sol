pragma solidity ^0.5.0;

import "../proposal/Proposal.sol";
import "../utils/Proof.sol";
import "@openzeppelin/contracts/payment/PullPayment.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/lifecycle/Pausable.sol";

/// @title Simulation for City improvment proposal system.
/// @author Joseph Nicholas R. Alcantara
/// @notice This contract for educational purposes only, 
///         this will simulate a City improvement which 
///         is a type of legal proposal.
/// @dev All of the functionalities are experimental but are already unit tested.
contract CityImprovement is Proposal, PullPayment, Ownable, Pausable {
        
    using SafeMath for uint;

    // address of patent applicants.
    mapping (address => bool) public applicants;
    
    // address of patent approvers.
    mapping (address => bool) public approvers;

    // address of improvement voters
    mapping (address => bool) public voters;
    
    // reward amount
    uint constant private REWARD_AMOUNT = 1 ether;

    // list of proposals
    Proposal.ProposalDetails[] public improvements;
    
    // Modifiers
    modifier isApprover(address _address) {
        require(approvers[_address] == true, "Only approver is allowed");
        _;
    }

    modifier isVoter(address _address) {
        require(voters[_address] == true, "Only voter is allowed");
        _;
    }

    modifier notClosed(uint id) {
        require(improvements[id].status != Proposal.State.Closed, "Only open proposals are allowed");
        _;
    }

    /// @dev Reads and returns the proposal by Id.
    /// @param id Proposal id.
    /// @return Proposal details public details.
    function readProposal(uint id) 
        public 
        view 
        whenNotPaused
        returns(string memory title, 
            string memory description, 
            address applicant, 
            address payable[] memory approver,
            uint votes,
            bytes32 proof,
            Proposal.State status) {
        require(improvements.length > 0, "There should be a proposal to read on");
        return (improvements[id].title, 
            improvements[id].description, 
            improvements[id].applicant, 
            improvements[id].approver,
            improvements[id].votes,
            improvements[id].proof,
            improvements[id].status);
    }
    
    /// @dev Start of city improvement application.
    /// @param title City improvement title.
    /// @param description City improvement description.
    /// @param problem City improvement problem it wishes to tackle.
    /// @param solution Problem's solution.
    /// @return Application result
    function submit(string memory title, string memory description, string memory problem, string memory solution) public whenNotPaused {
        require(applicants[msg.sender] == false);
        require(voters[msg.sender] == false);
        require(approvers[msg.sender] == false);
        require(msg.sender != owner());
        
        improvements.push(Proposal.ProposalDetails({
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
        }));

        applicants[msg.sender] = true;
        emit LogSubmit(improvements.length, msg.sender);
    }

     /// @dev Approves the City improvement proposal. Application approval sents some reward amount to
     ///      the applicant which will also vary depending on the number of votes.
     /// @param id City improvement ID.
     function approve(uint id) public payable isApprover(msg.sender) notClosed(id) whenNotPaused {
         require(improvements[id].votes > 0, "Proposal votes should be present for approval");
         require(improvements[id].approvals <= 2, "Proposal approvals not exceed 2");
         require(improvements[id].status == Proposal.State.Submitted, "Proposal status should still be submitted");
         if(improvements[id].approver.length > 0) {
            require(msg.sender != improvements[id].approver[0], "Approver can only approve once");
         }

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
            _asyncTransfer(improvements[id].applicant, REWARD_AMOUNT.mul(improvements[id].votes));

            // once approved applicant can submit, be a voter, or approver.
            applicants[improvements[id].applicant] = false;

            emit LogApprove(id);
         }
     }
     
      /// @dev This function rejects the idea by the approver.
      /// @param id Proposal id.
      function reject(uint id) public isApprover(msg.sender) notClosed(id) whenNotPaused {
          // Checks if an approver already approved the proposal.
          if(improvements[id].approver.length > 0) {
            require(msg.sender != improvements[id].approver[0], "First approver cannot reject the application");
          }
          require(improvements[id].status == Proposal.State.Submitted, "Proposal status should still be submitted");
          improvements[id].approver.push(msg.sender);
          improvements[id].status = Proposal.State.Rejected;
          emit LogReject(id);
      }
        
       /// @dev This function rejects the idea by the approver.
       /// @param id Proposal id.
       function vote(uint id) public isVoter(msg.sender) notClosed(id) whenNotPaused {
           require(improvements[id].status == Proposal.State.Submitted, "Proposal status should still be submitted");
           require(improvements[id].voted[msg.sender] == false, "Voter can only vote once.");
           require(improvements[id].status != Proposal.State.Rejected, "Cannot vote if already rejected");

           improvements[id].votes++;
           improvements[id].voted[msg.sender] = true;
           emit LogVote(id);
       }

       /// @dev Owner only function to close a proposal when it is approved or rejected.
       /// @param id Proposal id.
       function close(uint id) public onlyOwner notClosed(id) whenNotPaused {
           require(improvements[id].status == Proposal.State.Approved || improvements[id].status == Proposal.State.Rejected, "Proposal state should be approved or rejected.");
           improvements[id].status = Proposal.State.Closed;
           emit LogClose(id);
       }

       /// @dev Marks the caller as the an approver, which will be assigned as among the 2 to approve proposals.
       function applyForApprover() public whenNotPaused {
           require(applicants[msg.sender] == false);
           require(voters[msg.sender] == false);
           require(approvers[msg.sender] == false);
           require(msg.sender != owner());

           approvers[msg.sender] = true;
           emit LogApproverApply(msg.sender);
       }

       /// @dev Marks the caller as a voter, which can then be vote for proposals.
       function applyForVoter() public whenNotPaused {
           require(applicants[msg.sender] == false);
           require(voters[msg.sender] == false);
           require(approvers[msg.sender] == false);
           require(msg.sender != owner());

           voters[msg.sender] = true;
           emit LogVoterApply(msg.sender);
       }

       /// @dev Gets the number of proposals.
       /// @return number of proposals
       function getNumberOfProposals() public view whenNotPaused returns(uint)  {
           return improvements.length;
       }

       /// @dev Helper function to know if approver already is done.
       /// @return true/false if approver is found in proposal
       function doneApproving(uint id, address approver) public view returns(bool) {
           for (uint8 idx = 0; idx < improvements[id].approver.length; idx++) {
               if (improvements[id].approver[idx] == approver ) {
                 return true;  
               } 
           }
           return false;
       }

       /// @dev Helper function to know if voter already is done.
       /// @return true/false if voter is found in proposal
       function doneVoting(uint id, address voter) public view returns(bool) {
           return improvements[id].voted[voter];
       }
}