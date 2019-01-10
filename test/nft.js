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

    it("should mint a coin for account 0", function() {
        return LimitedMintableNonFungibleToken.deployed().then(function(instance) {
            return instance.mint(1, {from: accounts[0]}).then(function(result) {
                return instance.balanceOf(accounts[0]);
            }).then(function(balance) {
                assert.equal(balance.valueOf(), 1, "First account should have 1 token");
            });
        });
    });

    it("should not mint coin 1 for account 1", function() {
        return LimitedMintableNonFungibleToken.deployed().then(function(instance) {
            return instance.mint(1, {from: accounts[1]}).catch(function(error){
                return instance.balanceOf(accounts[1]);
            }).then(function(balance) {
            assert.equal(balance.valueOf(), 0, "Second account should not have any tokens");
            });
        });
    });

    it("should mint coins 2 and 3 for account 1", function() {
        return LimitedMintableNonFungibleToken.deployed().then(function(instance) {
            return instance.mint(2, {from: accounts[1]}).then(function(result) {
                return instance.mint(3, {from: accounts[1]});
            }).then(function(result) {
                return instance.balanceOf(accounts[1]);
            }).then(function(balance) {
                assert.equal(balance.valueOf(), 2, "Second account should have 2 tokens");
            });
        });
    });

    it("should properly return image id", function() {
        return LimitedMintableNonFungibleToken.deployed().then(function(instance) {
            return instance.mint(9, {from: accounts[0]}).then(result => {
                return instance.imageId(9);
            }).then(imageId => {
                assert.equal(imageId.valueOf(), 5, "imageId should return proper value");
            });
        });
    });
});
