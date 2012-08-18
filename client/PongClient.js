function PongClient() {
	/*=========
	  Variables
	  =========*/
	var socket;			// socket used to connect to server [Private]
	var playArea;		// HTML5 canvas game window [Private]
	var ball;			// ball object in game [Private]
	var myPaddle;		// player's paddle in game [Private]
	var opponentPaddle;	// opponent paddle in game [Private]
	var delay;			// delay simulated on current client [Private]

	/*=================
	  display [Private]
	  =================*/
	var display = function(location, msg) {
		// Adds the msg ON TOP of all the previous messages
		var temp = document.getElementById(location).innerHTML;
		document.getElementById(location).innerHTML = msg + "<br />" + temp;
	}

	/*=====================
	  initNetwork [Private]
	  =====================*/
	var initNetwork = function() {
		// Attempts to connect to game server
		//try {
			socket = io.connect("http://" + Pong.SERVER_NAME + ":" + Pong.PORT);

			/*----------------------
	  		  Socket Event Listeners
	  		  ----------------------*/

			// Upon connecting to server
			socket.on("connect", function () {
				console.log("Connected to gameServer");
			});

			// Upon disconnecting from server
			socket.on("disconnect", function() {
				console.log("You have disconnected from game server.");

				// Display information on HTML page
				display("serverMsg", "You have disconnected from gameServer");
			});
			
			// Upon receiving a message tagged with "serverMsg", along with an obj "data"
			socket.on("serverMsg", function(data) {
				//console.log(data); // For debugging
				console.log(data.msg);

				// Display information on HTML page
				display("serverMsg", data.msg);
			});

			// Upon receiving a message tagged with "update", along with an obj "data"
			socket.on("update", function(data) {
				updateStates(data.ballX, data.ballY, data.myPaddleX, data.myPaddleY, data.opponentPaddleX, data.opponentPaddleY);
			});
		//} catch (e) {
		//	console.log("Failed to connect to " + "http://" + Pong.SERVER_NAME + ":" + Pong.PORT);
		//}
	}

	/*=================
	  initGUI [Private]
	  =================*/
	var initGUI = function() {
		while(document.readyState !== "complete") {console.log("loading...");};

		// Sets up the canvas element
		playArea = document.getElementById("playArea");
		playArea.height = Pong.HEIGHT;
		playArea.width = Pong.WIDTH;

		// Add event handlers
		playArea.addEventListener("mousemove", function(e) {
													onMouseMove(e);
												}, false);
		playArea.addEventListener("click", function(e) {
												onMouseClick(e);
											}, false);
		document.addEventListener("keydown", function(e) {
												onKeyPress(e);
											}, false);
	}

	/*===================================
	  onMouseMove [Private Event Handler]
	  ===================================*/
	var onMouseMove = function(e) {
		var canvasMinX = playArea.offsetLeft;
		var canvasMaxX = canvasMinX + playArea.width;
		var canvasMinY = playArea.offsetTop;
		var canvasMaxY = canvasMinX + playArea.height;
		var new_mouseX = e.pageX - canvasMinX;
		var new_mouseY = e.pageY - canvasMinY;

		// Send signal to server
		socket.emit("move", {x: new_mouseX, y: new_mouseY});
	}

	/*====================================
	  onMouseClick [Private Event Handler]
	  ====================================*/
	var onMouseClick = function(e) {
		if (!ball.isMoving()) {
			//Send signal to server
			socket.emit("start", {});
		}
		// else, do nothing. It's already playing!
	}

	/*==================================
	  onKeyPress [Private Event Handler]
	  ==================================*/
	var onKeyPress = function(e) {
		/*
		keyCode represents keyboard button
		38: up arrow
		40: down arrow
		37: left arrow
		39: right arrow
		*/
		switch(e.keyCode) {
			case 38: { // Up
				delay += 50;
				// Send signal to server
				socket.emit("delay", {delay: delay});
				console.log("New delay: " + delay);
				break;
			}
			case 40: { // Down
				if (delay >= 50) {
					delay -= 50;
					// Send signal to server
					socket.emit("delay", {delay: delay});
					console.log("New delay: " + delay);
				}
				break;
			}
		}
	}

	/*======================
	  updateStates [Private]
	  ======================*/
	var updateStates = function(ballX, ballY, myPaddleX, myPaddleY, opponentPaddleX, opponentPaddleY) {
		ball.x = ballX;
		ball.y = ballY;
		myPaddle.x = myPaddleX;
		myPaddle.y = myPaddleY;
		opponentPaddle.x = opponentPaddleX;
		opponentPaddle.y = opponentPaddleY;
	}

	/*===================
	  gameCycle [Private]
	  ===================*/
	var gameCycle = function() {
		// Get context
		var context = playArea.getContext("2d");

		// Clears the playArea
		context.clearRect(0, 0, playArea.width, playArea.height);

		// Draw playArea border
		context.strokeRect(0, 0, playArea.width, playArea.height);

		// Draw the items
		context.drawImage(Sprites.ball[0], ball.x - Ball.WIDTH/2, ball.y - Ball.HEIGHT/2, Ball.WIDTH, Ball.HEIGHT);
		context.drawImage(Sprites.paddle[0], myPaddle.x - Paddle.WIDTH/2, myPaddle.y - Paddle.HEIGHT/2, Paddle.WIDTH, Paddle.HEIGHT);
		context.drawImage(Sprites.paddle[0], opponentPaddle.x - Paddle.WIDTH/2, opponentPaddle.y - Paddle.HEIGHT/2, Paddle.WIDTH, Paddle.HEIGHT);
	}

	/*==================
	  start [Privileged]
	  ==================*/
	this.start = function() {
		// Initialize game objects
		ball = new Ball();
		myPaddle = new Paddle(Pong.HEIGHT);
		opponentPaddle = new Paddle(Paddle.HEIGHT);
		delay = 0;

		// Initialize network and GUI
		initNetwork();
		initGUI();

		// Start gameCycle
		setInterval(function() {gameCycle();}, 1000/Pong.FRAME_RATE);
	}
}

// "public static void main(String[] args)"
// This will auto run after this script is loaded

// Load libraries
var lib_path = "../lib/";
loadScript(lib_path, "Sprites.js");
loadScript(lib_path, "Ball.js");
loadScript(lib_path, "Paddle.js");
loadScript("", "http://" + Pong.SERVER_NAME + ":" + Pong.PORT + "/socket.io/socket.io.js");

// Run Client. Give leeway of 0.1second for libraries to load
var client = new PongClient();
setTimeout(function() {client.start();}, 1000);