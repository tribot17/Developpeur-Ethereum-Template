pragma solidity 0.8.10;

contract Time {
    function getTime() public view returns (uint256) {
        return block.timestamp;
    }
}
