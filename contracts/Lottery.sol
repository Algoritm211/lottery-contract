// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;

contract Lottery {
    address private manager;
    address[] public players;

    constructor() {
        manager = msg.sender;
    }

    modifier managerRequired() {
        require(msg.sender == manager, "Only manager can call this function");
        _;
    }

    function getManager() public view returns (address) {
        return manager;
    }

    function getPlayers() public view returns (address[] memory) {
        return players;
    }

    function enter() public payable {
        // validating function
        require(msg.value >= 0.01 ether, "You sent not enough money to enter the lottery");

        players.push(msg.sender);
    }

    function random() private view returns (uint) {
        return uint(keccak256
            (abi.encodePacked(block.difficulty, block.timestamp, players))
        );
    }

    function pickWinner() public managerRequired {
        uint indexWinner = random() % players.length;
        address payable winner = payable(players[indexWinner]);
        winner.transfer(address(this).balance);
        // Reset players for new lottery game
        players = new address[](0);
    }

}
