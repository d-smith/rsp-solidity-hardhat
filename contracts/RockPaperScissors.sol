//SPDX-License-Identifier: MIT

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.9;

contract RockPaperScissors {

    struct Player {
        address addr;
        bytes32 hashedMove;
        string revealedMove ;
    }

    string public constant ROCK = "rock";
    string public constant PAPER = "paper";
    string public constant SCISSORS = "scissors";
   

    Player[2] private players;


    enum GameState {
        Initializing,
        AwaitingPlayers,
        AwaitingMoves,
        Finishing
    }


    GameState private  gameState;

    address public owner;
    uint256 moveBase;

    event Winner(address player);
    event StaleMate();
    event Move(bytes32 hash);
    event RevealHash(uint move, string seed, bytes32 hash);

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
        players[0] = Player(address(0),bytes32(0),"");
        players[1] = Player(address(0),bytes32(0),"");
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

        emit Move(hashedMove);

        assert(players[idx].hashedMove == bytes32(0));
        players[idx].hashedMove = hashedMove;

        if(players[0].hashedMove != bytes32(0) && players[1].hashedMove != bytes32(0)) {
            gameState = GameState.Finishing;
        }
    }

    function revealMove(string calldata move , string calldata salt) public validStage(GameState.Finishing) {
       assert(players[0].addr == msg.sender ||
                players[1].addr == msg.sender);
        uint idx = 0;
        if( players[1].addr == msg.sender) {
            idx = 1;
        }

        bytes32 revealed = sha256(abi.encodePacked(move,salt));

        assert(revealed == players[idx].hashedMove);
        players[idx].revealedMove = move;

        string memory p0Revealed = players[0].revealedMove;
        string memory p1Revealed = players[1].revealedMove;

        if(!strempty(p0Revealed) && !strempty(p1Revealed) ) {
            // Calculate winner and emit event - TODO clean this up!!!
            if(streq(p0Revealed, p1Revealed)) {
                emit StaleMate();
            } else {
                if(streq(p0Revealed,ROCK)) {
                     if( streq(p1Revealed, SCISSORS) ) {
                        emit Winner(players[0].addr);
                    } else {
                        emit Winner(players[1].addr);
                    }
                } else if( streq(p0Revealed, SCISSORS) ) {
                    if( streq(p1Revealed, PAPER) ) {
                        emit Winner(players[0].addr);
                    } else {
                        emit Winner(players[1].addr);
                    }
                } else {
                    if( streq(p1Revealed, ROCK) ) {
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


    function streq(string memory a, string memory b) internal pure returns (bool) {
        if(bytes(a).length != bytes(b).length) {
            return false;
        } else {
            return keccak256(abi.encode(a)) == keccak256(abi.encode(b));
        }
    }

    function strempty(string memory s) internal pure returns (bool) {
        return bytes(s).length == 0;
    }


}