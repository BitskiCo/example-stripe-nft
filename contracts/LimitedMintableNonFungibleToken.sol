pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Burnable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title LimitedMintableNonFungibleToken
 *
 * Superset of the ERC721 standard that allows for the minting
 * of non-fungible tokens, but limited to n tokens.
 */
contract LimitedMintableNonFungibleToken is ERC721Full, ERC721Burnable {

    using SafeMath for uint256;

    // The maximum amount of tokens that can be owned by an address
    uint public mintLimit;

    // The number of character designs
    uint public characterCount;

    // Emitted when a new token is minted
    event Mint(address indexed _to, uint256 indexed _tokenId);

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
     * @dev Mints a new token with the given id to the sender's address
     * @param _tokenId the id of the token to mint
     */
    function mint(uint256 _tokenId) public {
        mintTo(msg.sender, _tokenId);
    }

    /**
     * @dev Mints a new token with the given id to the given address
     * @param _to the owner of the token
     * @param _tokenId the id of the token to mint
     */
    function mintTo(address _to, uint256 _tokenId) public {
        // Enforce the mint limit
        require(balanceOf(_to) < mintLimit, "You have reached the token limit");
        _mint(_to, _tokenId);
        emit Mint(_to, _tokenId);
    }

    /**
     * @dev Mints a new token with the given id to the given address, and associates a token uri with it
     * @param _to the owner of the token
     * @param _tokenId the id of the token to mint
     * @param _tokenURI the URI containing the metadata about this token
     */
    function mintWithTokenURI(address _to, uint256 _tokenId, string memory _tokenURI) public {
        mintTo(_to, _tokenId);
        _setTokenURI(_tokenId, _tokenURI);
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
