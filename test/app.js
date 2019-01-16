var ExampleApp = artifacts.require("ExampleApp");
var Token = artifacts.require("LimitedMintableNonFungibleToken");

contract('ExampleApp', (accounts) => {

  it('should not be able to mint if not from app wallet', () => {
    const tokenId = web3.utils.randomHex(32);
    const tokenIdString = web3.utils.hexToNumberString(tokenId);
    const tokenURI = `https://foo.bar/tokens/${tokenIdString}`;

    return ExampleApp.deployed().then(instance => {
      return instance.mint(accounts[0], tokenId, tokenURI, { from: accounts[1] }).catch(error => {
        assert.ok(error);
      });
    });
  });


  it('should be able to mint a token', () => {
    const tokenId = web3.utils.randomHex(32);
    const tokenIdString = web3.utils.hexToNumberString(tokenId);
    const tokenURI = `https://foo.bar/tokens/${tokenIdString}`;

    return ExampleApp.deployed().then(instance => {
      return instance.mint(accounts[0], tokenId, tokenURI);
    }).then(result => {
      return Token.deployed().then(tokenInstance => {
        return tokenInstance.ownerOf(tokenId);
      }).then(result => {
        assert.equal(result.valueOf(), accounts[0]);
      });
    });
  });

  it('should not be able to update the address if not the app wallet', () => {
    return ExampleApp.deployed().then(instance => {
      return instance.setAppWalletAddress(accounts[1], { from: accounts[1] }).catch(error => {
        assert.ok(error);
      });
    });
  });

  it('should be able to update the app wallet address', () => {
    const tokenId = web3.utils.randomHex(32);
    const tokenIdString = web3.utils.hexToNumberString(tokenId);
    const tokenURI = `https://foo.bar/tokens/${tokenIdString}`;

    return ExampleApp.deployed().then(instance => {
      return instance.setAppWalletAddress(accounts[1], { from: accounts[0] }).then(() => {
        return instance.mint(accounts[0], tokenId, tokenURI, { from: accounts[1] });
      }).then(result => {
        assert.ok(result);
      });
    });
  });

});
