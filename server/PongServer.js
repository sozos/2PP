/*
Uses node.js
-> Run via "node PongServer.js" in Terminal
-> Run "sudo node PongServer.js" for restricted ports
*/

/*===============
  Library Imports
  ===============*/
var lib_path = "../lib/";
require(lib_path + "Pong.js");
require(lib_path + "Ball.js");
require(lib_path + "Paddle.js");
require(lib_path + "Player.js");
  
function PongServer() {
    /*=========
      Variables
      =========*/
    var port;                       // Game port [Private]
    var count;                      // Keeps track how many people are connected to server [Private]
    var nextPID;                    // PID to assign to next connected player (i.e. which player slot is open) [Private]
    var gameInterval = undefined;   // Interval variable used for gameCycle [Private]
    var ball;                       // the game ball [Private]
    var players;                    // Associative array for players, indexed via sid [Private]
                                    // To get a Player object, do "players[sid]"
                                    // Can extend to more players if needed
    

    /*===================
      getPlayer [Private]
      ===================*/
    var getPlayer = function(pid) {
        // Returns the player in the players object, based on given PID
        for (p in players) {
            if (players[p].pid === pid)
                return players[p];
        }
    }

    /*===================
      resetGame [Private]
      ===================*/
    var resetGame = function() {
        // Clears gameInterval and set it to undefined
        clearInterval(gameInterval);
        gameInterval = undefined;
    }

    /*===================
      gameCycle [Private]
      ===================*/
    var gameCycle = function() {
        // Check if ball is moving
        if (ball.isMoving()) {
            // Grab players
            var p1 = getPlayer(1);
            var p2 = getPlayer(2);

            // Move ball
            ball.moveOneStep(p1.paddle, p2.paddle);

            // Update on player side
            setTimeout(function() {
                        io.sockets.socket(p1.sid).emit('update',
                                                        {ballX: ball.x,
                                                         ballY: ball.y,
                                                         myPaddleX: p1.paddle.x,
                                                         myPaddleY: p1.paddle.y,
                                                         opponentPaddleX: p2.paddle.x,
                                                         opponentPaddleY: p2.paddle.y});
                        },
                        new Date().getMilliseconds() + p1.delay);
            setTimeout(function() {
                        io.sockets.socket(p2.sid).emit('update',
                                                        {ballX: ball.x,
                                                         ballY: ball.y,
                                                         myPaddleX: p2.paddle.x,
                                                         myPaddleY: p2.paddle.y,
                                                         opponentPaddleX: p1.paddle.x,
                                                         opponentPaddleY: p1.paddle.y});
                        },
                        new Date().getMilliseconds() + p2.delay);
        } else {
            // Reset
            resetGame();
        }
    }

    /*==================
      start [Privileged]
      ==================*/
    this.start = function() {
        try {
            // Initialization
            port = Pong.PORT;
            io = require('socket.io').listen(port);

            count = 0;
            nextPID = 1;
            gameInterval = undefined;
            ball = new Ball();
            players = new Object;
            
            /*----------------------
              Socket Event Listeners
              ----------------------*/
            // Upon connection established from a client socket
            io.sockets.on('connection', function (socket) {
                count++;

                // Sends to client
                socket.emit('serverMsg', {msg: "There is now " + count + " players."});

                if (count > 2) {
                    // Send back message that game is full
                    socket.emit('serverMsg', {msg: "Sorry, game full. Come back another time!"});

                    // Force a disconnect
                    socket.disconnect();
                    count--;
                } else {
                    // Sends to everyone connected to server except the client
                    socket.broadcast.emit('serverMsg', {msg: "There is now " + count + " players."});
                    
                    // 1st player is always top, 2nd player is always bottom
                    var watchPaddle = (nextPID === 1) ? "top" : "bottom";
                    var startPos = (nextPID === 1) ? Paddle.HEIGHT : Pong.HEIGHT;

                    // Send message to new player (the current client)
                    socket.emit('serverMsg', {msg: "You are Player " + nextPID + ". Your paddle is at the " + watchPaddle});                    

                    // Create player object and insert into players with key = socket.id
                    players[socket.id] = new Player(socket.id, nextPID, startPos);

                    // Updates the nextPID to issue (flip-flop between 1 and 2)
                    nextPID = ((nextPID + 1) % 2 === 0) ? 2 : 1;
                }

                // When the client closes the connection to the server/closes the window
                socket.on('disconnect',
                        function(e) {
                            // Stop game if it's playing
                            if (gameInterval !== undefined) {
                                resetGame();
                            }

                            // Decrease count
                            count--;

                            // Set nextPID to quitting player's PID
                            nextPID = players[socket.id].pid;

                            // Remove player who wants to quit/closed the window
                            delete players[socket.id];

                            // Sends to everyone connected to server except the client
                            socket.broadcast.emit('serverMsg', {msg: "There is now " + count + " players."});
                        });

                // Upon receiving a message tagged with "start", along with an obj "data" (the "data" sent is {}. Refer to PongClient.js)
                socket.on('start',
                        function(data) {
                            if (gameInterval !== undefined) {
                                console.log("Already playing!");
                            } else if (Object.keys(players).length < 2) {
                                console.log("Not enough players!");
                                socket.emit('serverMsg', {msg: "Not enough players!"});
                            } else {
                                console.log("Let the games begin!");
                                ball.startMoving();
                                gameInterval = setInterval(function() {gameCycle();}, 1000/Pong.FRAME_RATE);
                            }
                        });

                // Upon receiving a message tagged with "move", along with an obj "data"
                socket.on('move',
                        function(data) {
                            setTimeout(function() {
                                            players[socket.id].paddle.move(data.x);
                                        },
                                        new Date().getMilliseconds() + players[socket.id].delay);
                        });

                // Upon receiving a message tagged with "delay", along with an obj "data"
                socket.on('delay',
                        function(data) {
                            console.log(data.delay);
                            players[socket.id].delay = data.delay;
                        });
            });
        } catch (e) {
            console.log("Cannot listen to " + port);
        }
    }
}

// "public static void main(String[] args)"
// This will auto run after this script is loaded
var gameServer = new PongServer();
gameServer.start();