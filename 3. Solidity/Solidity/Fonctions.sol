pragma solidity 0.8.10;

contract functionTest {
    string myString = "Hello World";

    function hello() public view returns (string memory) {
        return myString;
    }
}
