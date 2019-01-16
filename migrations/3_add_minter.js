var LimitedMintableNonFungibleToken = artifacts.require("LimitedMintableNonFungibleToken");
var ExampleApp = artifacts.require("ExampleApp");

module.exports = function(deployer, network, accounts) {
  return LimitedMintableNonFungibleToken.deployed().then(instance => {
    return instance.isMinter(ExampleApp.address).then(result => {
      if (result.valueOf() === false) {
        return instance.addMinter(ExampleApp.address, { from: accounts[0] });
      }
    });
  });
};
