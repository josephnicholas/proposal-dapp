var CityImprovement = artifacts.require("./CityImprovement.sol");
var Proof = artifacts.require("./Proof.sol");

module.exports = function(deployer) {
  deployer.deploy(Proof);
  deployer.link(Proof, CityImprovement);
  deployer.deploy(CityImprovement)
}
