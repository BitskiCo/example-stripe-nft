pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "openzeppelin-solidity/contracts/access/roles/MinterRole.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Burnable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title LimitedMintableNonFungibleToken
 *
 * Superset of the ERC721 standard that allows for the minting
 * of non-fungible tokens, but limited to n tokens.
 */
contract LimitedMintableNonFungibleToken is ERC721Full, MinterRole, ERC721Burnable {

    using SafeMath for uint256;

    // The maximum amount of tokens that can be owned by an address
    uint public mintLimit;

    // The number of character designs
    uint public characterCount;

    /**
     * @dev Initializes the contract with a mint limit
     * @param _mintLimit the maximum tokens a given address may own at a given time
     * @param _characterCount the number of unique character designs
     */
    constructor(uint _mintLimit, uint _characterCount) ERC721Full("Bitski Example Dude", "BED") public {
        mintLimit = _mintLimit;
        characterCount = _characterCount;
    }

    /**
     * @dev Mints a new token with the given id to the given address
     * @param _to the owner of the token
     * @param _tokenId the id of the token to mint
     */
    function mint(address _to, uint256 _tokenId) public onlyMinter returns (bool) {
        // Enforce the mint limit
        require(balanceOf(_to) < mintLimit, "You have reached the token limit");
        _mint(_to, _tokenId);
        return true;
    }

    /**
     * @dev Mints a new token with the given id to the given address, and associates a token uri with it
     * @param _to the owner of the token
     * @param _tokenId the id of the token to mint
     * @param _tokenURI the URI containing the metadata about this token
     */
    function mintWithTokenURI(address _to, uint256 _tokenId, string memory _tokenURI) public onlyMinter returns (bool) {
        require(balanceOf(_to) < mintLimit, "You have reached the token limit");
        _mint(_to, _tokenId);
        _setTokenURI(_tokenId, _tokenURI);
        return true;
    }

    /**
     * @dev Returns the token ids owned by the given address
     * @param _owner the owner to query
     */
    function getOwnerTokens(address _owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](balance);
        for (uint i = 0; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

    /**
     * @dev Returns the character image id for a given token
     * @param _tokenId the token id
     */
    function imageId(uint256 _tokenId) external view returns(uint256) {
        require(_exists(_tokenId), "Token ID must be valid");
        uint256 index = _tokenId.mod(characterCount);
        uint256 result = index.add(1);
        return result;
    }
}
