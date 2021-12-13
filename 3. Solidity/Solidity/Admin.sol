pragma solidity 0.8.10;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

contract Admin is Ownable {
    mapping(address => bool) private WhiteList;
    mapping(address => bool) private BlackList;

    event Whitelisted(address _address);
    event Blacklisted(address _address);

    function whitelist(address _address) public onlyOwner {
        require(!WhiteList[_address], "This address is already whiteListed");
        require(!BlackList[_address], "This address is already blacklisted");
        WhiteList[_address] = true;
        emit Whitelisted(_address);
    }

    function blacklist(address _address) public onlyOwner {
        require(!WhiteList[_address], "This address is already whiteListed");
        require(!BlackList[_address], "This address is already blacklisted");
        BlackList[_address] = true;
    }

    function isBlacklisted(address _address)
        public
        view
        onlyOwner
        returns (bool)
    {
        return BlackList[_address];
    }

    function isWhitelisted(address _address)
        public
        view
        onlyOwner
        returns (bool)
    {
        return WhiteList[_address];
    }
}
