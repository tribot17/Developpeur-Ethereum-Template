pragma solidity 0.8.10;

contract Bank {
    mapping(address => uint256) private _balances;

    receive() external payable {
        deposit(msg.value);
    }

    function deposit(uint256 _amount) public {
        require(
            msg.sender != address(0),
            "You can't deposite for the address zero"
        );
        _balances[msg.sender] += _amount;
    }

    function transfer(address _recipent, uint256 _amount) public {
        require(
            _recipent != address(0),
            "You can't transfer to the address zero"
        );
        require(
            _balances[msg.sender] >= _amount,
            "You have not enought balance"
        );
        _balances[msg.sender] -= _amount;
        _balances[_recipent] += _amount;
    }

    function balanceOf(address _adress) public view returns (uint256) {
        return _balances[_adress];
    }
}
