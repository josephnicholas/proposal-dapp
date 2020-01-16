pragma solidity ^0.5.0;

/// @title An interface for different kinds of proposals.
/// @author Joseph Nicholas R. Alcantara.
/// @notice This contract is for educational purposes only fot the Consensys 2019-2020 bootcamp.
/// @dev All function calls are currently implemented without side effects.
interface Proposal {

    /// @dev State of the proposal.
    enum State {
        Submitted,
        Review,
        Rejected,
        Approved,
        Closed
    }

    /// @dev Data structure for Proposal details.
    struct ProposalDetails {
        string title;
        string description;
        string problem;
        string solution;
        address payable applicant;
        address payable[] approver;
        mapping(address => bool) voted;
        uint votes;
        uint approvals;
        bytes32 proof;
        State status;
    }

    event LogSubmit(uint id, address addr);
    event LogApprove(uint id);
    event LogReject(uint id);
    event LogClose(uint id);
    event LogVote(uint id);
    event LogVoterApply(address addr);
    event LogApproverApply(address addr);
 
    /// @dev This function creates a new proposal.
    /// @param title Title of proposal.
    /// @param description Description or overview of the proposal.
    /// @param problem Problem it seeks to address.
    /// @param solution Proposed solution.
    /// @return Application result.
    function submit(string calldata title, string calldata description, string calldata problem, string calldata solution) external returns(bool);

    /// @dev This function approves the idea by the randomly selected approver.
    /// @param id Id of the proposal to approve.
    function approve(uint id) external payable;

    /// @dev This function rejects the idea by the approver.
    /// @param id Id of the proposal to reject.
    function reject(uint id) external;
 
    /// @dev This function adds 1 vote to the proposal.
    /// @param id Id of the proposal to vote. 
    function vote(uint id) external;

    /// @dev This function lets the owner close the proposal after it's marked as Approved
    /// @param id Id of the proposal to close.
    function close(uint id) external;

    /// @dev This function marks the @msg.sender to be an approver and added to the list of approvers.
    /// @notice Approvers can't can't be voters and can't be applicants.
    function applyForApprover() external;

    
    /// @dev This function marks the @msg.sender to be an voter and added to the list of voters.
    /// @notice Voters can't can't be approvers but can be applicants.
    function applyForVoter() external;
}