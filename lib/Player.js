function Player(sid, pid, yPos) {
    /*=========
	  Variables
	  =========*/
	this.sid;		// Socket id. Used to uniquely identify players via the socket they are connected from [Public]
    this.pid;		// Player id. In this case, 1 or 2 [Public]
    this.paddle;	// player's paddle object [Public]
    this.delay;		// player's delay [Public]

    /*===========
	  Constructor
	  ===========*/
    this.sid = sid;
    this.pid = pid;
    this.paddle = new Paddle(yPos);
    this.delay = 0;
}

// For node.js require
global.Player = Player;