var LimitedMintableNonFungibleToken = artifacts.require("LimitedMintableNonFungibleToken");
var ExampleApp = artifacts.require("ExampleApp");

module.exports = function(deployer, network, accounts) {
  return LimitedMintableNonFungibleToken.deployed().then(instance => {
    return instance.isMinter(ExampleApp.address).then(result => {
      if (result.valueOf() === false) {
        return instance.addMinter(ExampleApp.address, { from: accounts[0] });
      }
    });
  }).then(() => {
    if (process.env["ENTERPRISE_WALLET_ADDRESS"]) {
      console.log('Set minter, now setting app wallet address');
      return ExampleApp.deployed().then(instance => {
        return instance.setAppWalletAddress(process.env["ENTERPRISE_WALLET_ADDRESS"]);
      }).catch((error) => {
        console.error('Could not update enterprise wallet address', error);
        return true;
      });
    } else {
      return true;
    }
  });
};
