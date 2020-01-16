pragma solidity ^0.5.0;

import "./Proposal.sol";
library Proof {
  // store a proof of existence in the contract state
  // function storeProof(bytes32 proof) internal {
  //   proofs[proof] = true;
  // }
  // store proof in IPFS
  // calculate and store proof or a document
  function notarize(bytes calldata document) external returns (bytes32){
    bytes32 proof = proofFor(document);
    return proof;
    //storeProof(proof);
  }

  // helper function to store document's sha256
  function proofFor(bytes memory document) public pure returns (bytes32) {
    return keccak256(document);
  }

  // check if the document has been notarized
  // function checkDocument(string memory document) public view returns (bool) {
  //   bytes32 proof = proofFor(document);
  //   return hasProof(proof);
  // }
  // check document in IPFS

  // returns true if proof is already stored
  // function hasProof(bytes32 proof) public view returns (bool) {
  //   return proofs[proof];
  // }
  // store in IPFS
}
