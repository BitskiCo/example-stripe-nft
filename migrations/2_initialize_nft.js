var LimitedMintableNonFungibleToken = artifacts.require("LimitedMintableNonFungibleToken");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(LimitedMintableNonFungibleToken, 5, 5);
};
