pragma solidity >=0.8.0 <0.9.0;

contract SimpleStorage {
    uint256 data;

    function set(uint256 x) public {
        data = x;
    }

    function get() public view returns (uint256) {
        return data;
    }
}
