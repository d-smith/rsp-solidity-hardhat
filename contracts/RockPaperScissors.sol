//SPDX-License-Identifier: MIT

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.9;

contract RockPaperScissors {

    struct Player {
        address addr;
        bytes32 hashedMove;
        uint revealedMove ;
    }

    uint public constant ROCK = 1;
    uint public constant PAPER = 2;
    uint public constant SCISSORS = 3;
   

    Player[2] private players;


    enum GameState {
        Initializing,
        AwaitingPlayers,
        AwaitingMoves,
        Finishing
    }


    GameState private  gameState;

    address private owner;
    uint256 moveBase;

    event Winner(address player);
    event StaleMate();

    constructor() {
        owner = msg.sender;
        gameState = GameState.Initializing;
        initializeGame();
    }



    modifier validStage(GameState reqState)
    { require(gameState == reqState);
      _;
    }

    function initializeGame() private validStage(GameState.Initializing) {
        gameState = GameState.AwaitingPlayers;
    }

    function registerToPlay() public validStage(GameState.AwaitingPlayers) {
        if(players[0].addr == address(0)) {
            players[0].addr = msg.sender;
            return;
        }
        

        assert(players[1].addr == address(0) && players[0].addr != msg.sender);
        players[1].addr = msg.sender;
        gameState = GameState.AwaitingMoves;
    }

    function throwDown(bytes32 hashedMove) public validStage(GameState.AwaitingMoves) {
        assert(players[0].addr == msg.sender ||
                players[1].addr == msg.sender);
        uint idx = 0;
        if( players[1].addr == msg.sender) {
            idx = 1;
        }

        assert(players[idx].hashedMove == bytes32(0));
        players[idx].hashedMove = hashedMove;

        if(players[0].hashedMove != bytes32(0) && players[1].hashedMove != bytes32(0)) {
            gameState = GameState.Finishing;
        }
    }

    function revealMove(uint move, bytes32 salt) public validStage(GameState.Finishing) {
       assert(players[0].addr == msg.sender ||
                players[1].addr == msg.sender);
        uint idx = 0;
        if( players[1].addr == msg.sender) {
            idx = 1;
        }

        bytes32 revealed = sha256(abi.encodePacked(move,salt));
        assert(revealed == players[idx].hashedMove);
        players[idx].revealedMove = move;

        uint p0Revealed = players[0].revealedMove;
        uint p1Revealed = players[1].revealedMove;

        if(p0Revealed > 0 && p1Revealed > 0) {
            // Calculate winner and emit event - TODO clean this up!!!
            if(p0Revealed == p1Revealed) {
                emit StaleMate();
            } else {
                if(p0Revealed == ROCK) {
                     if( p1Revealed == SCISSORS) {
                        emit Winner(players[0].addr);
                    } else {
                        emit Winner(players[1].addr);
                    }
                } else if(p0Revealed == SCISSORS) {
                    if( p1Revealed == PAPER) {
                        emit Winner(players[0].addr);
                    } else {
                        emit Winner(players[1].addr);
                    }
                } else {
                    if( p1Revealed == ROCK) {
                        emit Winner(players[0].addr);
                    } else {
                        emit Winner(players[1].addr);
                    }
                }
            }

            // Reset game
            gameState = GameState.Initializing;
            initializeGame();
        }

    }





}