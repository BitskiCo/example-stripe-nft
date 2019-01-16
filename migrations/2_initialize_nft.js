var LimitedMintableNonFungibleToken = artifacts.require("LimitedMintableNonFungibleToken");
var ExampleApp = artifacts.require("ExampleApp");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(LimitedMintableNonFungibleToken, 5, 5).then(() => {
    return deployer.deploy(ExampleApp, LimitedMintableNonFungibleToken.address, accounts[0]);
  });
};
