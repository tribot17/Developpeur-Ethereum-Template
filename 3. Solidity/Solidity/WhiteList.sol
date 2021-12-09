pragma solidity 0.8.10;

contract WhiteList {
    mapping(address => bool) whitelist;
    event Authorized(address _address);

    function authorize(address _address) public {
        whitelist[_address] = true;
        emit Authorized(_address);
    }
}
