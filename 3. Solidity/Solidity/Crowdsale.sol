pragma solidity 0.8.10;

import "./ERC20Token.sol";

contract Crowdsale {
    uint256 public rate = 200; // le taux à utiliser
    ERC20Token public token;

    constructor(uint256 initialSupply) {
        token = new ERC20Token(initialSupply);
    }

    receive() external payable {
        require(msg.value >= 0.1 ether, "You can't send less than 0.1 ether");
        distribute(msg.value);
    }

    function distribute(uint256 amount) internal {
        uint256 tokenToSent = amount * rate;
        token.transfer(msg.sender, tokenToSent);
    }
}
