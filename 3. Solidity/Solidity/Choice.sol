pragma solidity 0.8.10;

contract Choice {
    mapping(address => uint256) choices;

    function add(uint256 _myuint) public {
        choices[msg.sender] = _myuint;
    }
}
