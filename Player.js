function Player(sid, pid, yPos) {
    /*=========
	  Variables
	  =========*/
	this.sid;		// Socket id. Used to uniquely identify players via the socket they are connected from [Public]
    this.pid;		// Player id. In this case, 1 or 2 [Public]
    this.paddle;	// player's paddle object [Public]
    var delay;		// player's delay [Private]

    /*===========
	  Constructor
	  ===========*/
    this.sid = sid;
    this.pid = pid;
    this.paddle = new Paddle(yPos);
    var delay = 0;

    this.setDelay = function(newDelay) {
    	delay = newDelay;
    }

    this.getDelay = function() {
		var errorPercentage = 20;
	    var to = delay + delay/errorPercentage;
	    var from = delay - delay/errorPercentage;
		if (delay != 0) {
				return delay + Math.floor(Math.random() * (to - from + 1) + from);
		}
		else 
				return 0
	}
}

// For node.js require
global.Player = Player;
