// Specifically request an abstraction for MetaCoin
var LimitedMintableNonFungibleToken = artifacts.require("LimitedMintableNonFungibleToken");

contract('LimitedMintableNonFungibleToken', function(accounts) {
    it("should implement ERC721 interface", function(){
        return LimitedMintableNonFungibleToken.deployed().then(function(instance) {
            return instance.supportsInterface('0x80ac58cd');
        }).then(result => {
            assert.equal(result.valueOf(), true, "Doesn't implement ERC721");
        });
    });

    it("should be able to mint", function() {
        return LimitedMintableNonFungibleToken.deployed().then(function(instance) {
            return instance.isMinter(accounts[0]).then(result => {
                assert.equal(result.valueOf(), true, 'default account should be allowed to mint');
                return instance.mint(accounts[0], 1, { from: accounts[0] });
            }).then(function(result) {
                return instance.balanceOf(accounts[0]);
            }).then(function(balance) {
                assert.equal(balance.valueOf(), 1, "Token should be in the account");
            });
        });
    });

    it("should be able to mint with token uri", function() {
        return LimitedMintableNonFungibleToken.deployed().then(function(instance) {
            return instance.mintWithTokenURI(accounts[0], 2, "https://foo.bar", {from: accounts[0]}).then(function(result) {
                return instance.tokenURI(2);
            }).then(function(tokenURI) {
                assert.equal(tokenURI.valueOf(), "https://foo.bar", "Token should have correct URI");
            });
        });
    });

    it("should not be able to mint if not a minter", function() {
        return LimitedMintableNonFungibleToken.deployed().then(function(instance) {
            return instance.mint(accounts[1], 3, { from: accounts[1] }).catch(function(error){
                assert.ok(error, "Should have returned an error");
                return instance.balanceOf(accounts[1]);
            }).then(function(balance) {
                assert.equal(balance.valueOf(), 0, "Second account should not have any tokens");
            });
        });
    });

    it("should be able to add minter", function() {
        return LimitedMintableNonFungibleToken.deployed().then(instance => {
            return instance.addMinter(accounts[1], { from: accounts[0] }).then(() => {
                return instance.mint(accounts[0], 3, { from: accounts[1] });
            }).then(result => {
                return instance.balanceOf(accounts[0]);
            }).then(result => {
                assert.equal(result.valueOf(), 3, "Should have minted token");
            });
        });
    });

    it("should be able to list tokens", function() {
        return LimitedMintableNonFungibleToken.deployed().then(function(instance) {
            return instance.getOwnerTokens(accounts[0]).then(tokens => {
                assert.ok(tokens.valueOf(), "should have returned a value");
                assert.equal(tokens.valueOf().length, 3, "should have 2 token ids");
            });
        });
    });

    it("should not error when listing tokens for empty balance", function() {
        return LimitedMintableNonFungibleToken.deployed().then(function(instance) {
            return instance.getOwnerTokens(accounts[1]).then(tokens => {
                assert.ok(tokens.valueOf(), "should have returned a value");
                assert.equal(tokens.valueOf().length, 0, "should have 2 token ids");
            });
        });
    });

    it("should properly return image id", function() {
        return LimitedMintableNonFungibleToken.deployed().then(function(instance) {
            return instance.mint(accounts[0], 9, { from: accounts[0] }).then(result => {
                return instance.imageId(9);
            }).then(imageId => {
                assert.equal(imageId.valueOf(), 5, "imageId should return proper value");
            });
        });
    });
});
