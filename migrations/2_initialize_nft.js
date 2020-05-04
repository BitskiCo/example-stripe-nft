var LimitedMintableNonFungibleToken = artifacts.require("LimitedMintableNonFungibleToken");
var ExampleApp = artifacts.require("ExampleApp");

module.exports = function(deployer, network, accounts) {
  const perWalletTokenLimit = process.env['TOKEN_LIMIT'] || '5';
  const tokenTypes = process.env['TOKEN_TYPES'] || '5';
  const tokenName = process.env['TOKEN_NAME'] || "Bitski Example Dude";
  const tokenSymbol = process.env['TOKEN_SYMBOL'] || "BED";
  console.log('Calling LimitedMintableNonFungibleToken', perWalletTokenLimit, tokenTypes, tokenName, tokenSymbol);
  return deployer.deploy(LimitedMintableNonFungibleToken, perWalletTokenLimit, tokenTypes, tokenName, tokenSymbol).then(() => {
    return deployer.deploy(ExampleApp, LimitedMintableNonFungibleToken.address, accounts[0]);
  });
};
