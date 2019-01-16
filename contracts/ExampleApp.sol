pragma solidity ^0.5.0;

import "./LimitedMintableNonFungibleToken.sol";

/**
 This contract acts as a gateway between App Wallet and the token contract.
 We register this contract with the token as a minter, and this contract ensures that
 only the App Wallet can mint from here. By separating out the App Wallet interface from the
 basic token interface, we can perform upgrades to application functionality without touching the token.
 */
contract ExampleApp {

    LimitedMintableNonFungibleToken token;
    address appWallet;

    modifier onlyAppWallet() {
        require (msg.sender == appWallet);
        _;
    }

    constructor(address tokenAddress, address appWalletAddress) public {
        appWallet = appWalletAddress;
        token = LimitedMintableNonFungibleToken(tokenAddress);
    }

    function setAppWalletAddress(address _newAddress) public onlyAppWallet {
        appWallet = _newAddress;
    }

    function mint(address _to, uint256 _tokenId, string memory _tokenURI) public onlyAppWallet returns (bool) {
        return token.mintWithTokenURI(_to, _tokenId, _tokenURI);
    }

}
