var CityImprovement = artifacts.require("./city/CityImprovement.sol");
var Proof = artifacts.require("./utils/Proof.sol");

module.exports = function(deployer) {
  deployer.deploy(Proof);
  deployer.link(Proof, CityImprovement);
  deployer.deploy(CityImprovement)
}
