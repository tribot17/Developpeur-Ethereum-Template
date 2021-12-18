// import "../contracts/SimpleStorage.sol";

const SimpleStorage = artifacts.require("SimpleStorage");
const Voting = artifacts.require("Voting");
module.exports = (deployer) => {
  // Deployer le smart contract!
  deployer.deploy(SimpleStorage);
  deployer.deploy(Voting);
};
