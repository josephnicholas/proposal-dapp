pragma solidity ^0.8.0;

import "../proposal/Proposal.sol";
library Proof {
  
  /// @dev Hashes the Proposal and add it as a Proof of approval.
  /// @param document Proposal details. 
  /// @return hash of the Proposal.
  function notarize(bytes calldata document) external pure returns (bytes32){
    return keccak256(document);
  }
}
