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

    this.getDelay = function() {
		var errorPercentage = 20;
	    var to = this.delay + this.delay/errorPercentage;
	    var from = this.delay - this.delay/errorPercentage;
		if (this.delay != 0) {
				return this.delay + Math.floor(Math.random() * (to - from + 1) + from);
		}
		else 
				return 0
	}
}

// For node.js require
global.Player = Player;
