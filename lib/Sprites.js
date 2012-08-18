/*=====================================================
  Declared as literal object (All variables are static)	  
  =====================================================*/
var Sprites = {
	ball : new Array(),		// array to keep all the sprites for Ball
	paddle : new Array()	// array to keep all the sprites for Paddle
}

// Commence Sprites loading
// MUST load before Canvas runs, otherwise nothing will appear until you refresh page
console.log("Loading sprites...");

var img; // variable used to initialise images before pushing into array
var sprites_path = "../lib/sprites/"; // link to sprites library

// Push ball related sprites here. Can push more if needed to simulate motion
img = new Image();
img.src = sprites_path + "ball.png";
Sprites.ball.push(img);

// Push paddle related sprites here. Can push more if needed to simulate motion
img = new Image();
img.src = sprites_path + "stick.png";
Sprites.paddle.push(img);

console.log("Sprites are loaded.");