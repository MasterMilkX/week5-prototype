//set up the canvas
var canvas = document.createElement("canvas");
canvas.id = "game";
var ctx = canvas.getContext("2d");
canvas.width = 480;
canvas.height = 384;
document.body.appendChild(canvas);


////// SPRITES  ////
var spr_size = 32;
var size = 32;


//tileset
var collideTiles = [1];			//collidable tiles

var tiles = new Image();
tiles.src = "img/tileset_demo.png";
var tilesReady = false;
tiles.onload = function(){
	tilesReady = true;
};
var tpr = 2; //tiles per row


//characters
var bomberIMG = new Image();
bomberIMG.src = "img/bomber.png";
var bomberReady = false;
bomberIMG.onload = function(){bomberReady = true;};

var princessIMG = new Image();
princessIMG.src = "img/princess.png";
var princessReady = false;
princessIMG.onload = function(){princessReady = true;};

var ogreIMG = new Image();
ogreIMG.src = "img/ogre.png";
var ogreReady = false;
ogreIMG.onload = function(){ogreReady = true;};

var bossKingIMG = new Image();
bossKingIMG.src = "img/evil_king.png";
var bossKingReady = false;
bossKingIMG.onload = function(){bossKingReady = true;};

//items
var bombIMG = new Image();
bombIMG.src = "img/bomb.png";
var bombReady = false;
bombIMG.onload = function(){bombReady = true;};

var doorIMG = new Image();
doorIMG.src = 'img/door.png';
var doorReady = false;
doorIMG.onload = function(){doorReady = true;};


/////  AI AND PLAYER  //////

var bomber = {
	//position
	x : 0,
	y : 0,

	//animations
	img : bomberIMG,
	ready : bomberReady,
	anim : 0,
	bt : 0,

	hasPrincess : false
}

var princess = {
	//position
	x : 0,
	y : 0,

	//animations
	img : princessIMG,
	ready : princessReady
}

//bombs placed on maps
function bomb(x,y){
	this.x = x;
	this.y = y;
	this.fuse = 2;
}


///// CAMERA AND MAP  //////
var camera = {
	x : 0,
	y : 0
};


var castle = {}			//4x4 array of different room types labeled by number with key character locations
var gameMap = []		//full tiled map
var visitedRooms = []	//list of rooms the player has visited already (to show on the map)
var curRoom = [];		//current room map layout 


//KEYS

// directionals
var upKey = 38;     //[Up]
var leftKey = 37;   //[Left]
var rightKey = 39;  //[Rigt]
var downKey = 40;   //[Down]
var moveKeySet = [upKey, leftKey, rightKey, downKey];

// A and b
var a_key = 90;   //[Z]
var b_key = 88;   //[X]
var actionKeySet = [a_key, b_key];

var keys = [];

var stepped = false;	//move once



//////////////////    GENERIC FUNCTIONS   ///////////////


//checks if an element is in an array
function inArr(arr, e){
	if(arr.length == 0)
		return false;
	return arr.indexOf(e) !== -1
}


////////////////   KEYBOARD FUNCTIONS  //////////////////


// key events
var keyTick = 0;
var kt = null; 

function anyKey(){
	return anyMoveKey() || anyActionKey();
}

//check if any directional key is held down
function anyMoveKey(){
	return (keys[upKey] || keys[downKey] || keys[leftKey] || keys[rightKey])
}

function anyActionKey(){
	return (keys[a_key] || keys[b_key]);
}

//makes a step for the game to go (characters and players move)
function step(){
	let oldPos = [bomber.x,bomber.y];

	//move bomber
	if(keys[upKey] && !collidable(bomber.x,bomber.y-1))
		bomber.y--;
	else if(keys[downKey] && !collidable(bomber.x,bomber.y+1))
		bomber.y++;
	else if(keys[leftKey] && !collidable(bomber.x-1,bomber.y))
		bomber.x--;
	else if(keys[rightKey] && !collidable(bomber.x+1,bomber.y))
		bomber.x++;

	//make princess follow bomber
	if(bomber.hasPrincess){
		princess.x = oldPos[0];
		princess.y = oldPos[1];
	}
	

	stepped = true;

}

//check if a specific tile is collidable
function collidable(x,y){
	//return false;
	return x < 0 || x > (gameMap[0].length-1) || y < 0 || y > (gameMap.length-1) || inArr(collideTiles,gameMap[y][x]);
}


////////////////   CAMERA FUNCTIONS   /////////////////

/*  OPTIONAL IF LARGE GAME MAP
//if within the game bounds
function withinBounds(x,y){
	var xBound = (x >= Math.floor(camera.x / size) - 1) && (x <= Math.floor(camera.x / size) + (canvas.width / size));
	return xBound;
}

//have the camera follow the player
function panCamera(){
	camera.x = 0;
	camera.y = 0;

	if(map.length != 0 && player.x > ((map[0].length) - ((canvas.width/size)/2)))
		camera.x = (map[0].length * size) - canvas.width;
	else if(player.x < ((canvas.width/size)/2))
		camera.y = 0;
	else
		camera.x = player.x *size - (canvas.width / 2);

	if(map.length != 0 && player.y > ((map.length) - ((canvas.height/size) / 2)))
		camera.y = (map.length * size) - canvas.height;
	else if(player.y < ((canvas.height/size)/2))
		camera.y = 0;
	else
		camera.y = player.y *size - (canvas.height / 2) + (size/2);

	camera.x += cam_offset.x;
	camera.y += cam_offset.y;
}
*/


//////////////////  RENDER FUNCTIONS  ////////////////////

//check that all images are loaded into the game
function checkRender(){
	//tiles
	if(!tilesReady){
		tiles.onload = function(){
			tilesReady = true;
		};
	}


	//player
	if(!bomber.ready){
		bomber.img.onload = function(){bomber.ready = true;}
		if(bomber.img.width !== 0){
			bomber.ready = true;
		}
	}
	//princess
	if(!princess.ready){
		princess.img.onload = function(){princess.ready = true;}
		if(princess.img.width !== 0){
			princess.ready = true;
		}
	}
}

//draws the castle
function drawCastle(){
	//don't draw if tiles not ready yet
	if(!tilesReady){
		checkRender();
		return;
	}

	//test map generation
	for(let y=0;y<canvas.height/size;y++){
		for(let x=0;x<canvas.width/size;x++){
			ctx.drawImage(tiles, 
					spr_size * Math.floor(gameMap[y][x] % tpr), spr_size * Math.floor(gameMap[y][x] / tpr), 
					spr_size, spr_size, 
					(x * size), (y * size), 
					size, size);
		}
	}
}


//draw images onto the canvas
function render(){
	ctx.save();
	//ctx.translate(-camera.x, -camera.y);		//camera
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	//background
	ctx.fillStyle = "#dedede";
	ctx.fillRect(0,0,canvas.width, canvas.height);
	
	/*   add draw functions here  */
	//draw tiles from tileset
	drawCastle();


	//draw characters


	if(bomber.ready)
		ctx.drawImage(bomber.img, bomber.anim*spr_size,0,spr_size,spr_size,bomber.x*size,bomber.y*size,size,size);

	if(princess.ready && princess.show)
		ctx.drawImage(princess.img, ((bomber.anim+1)%2)*spr_size,0,spr_size,spr_size,princess.x*size,princess.y*size,size,size);


	
	ctx.restore();
}



//////////////   GAME LOOP FUNCTIONS   //////////////////

//game initialization function
function init(){
	newCastle();

	//start animations for all characters
	bomber.bt = setInterval(function(){bomber.anim = (bomber.anim == 1 ? 0 : 1);},400);
}

function newCastle(){
	castle = genNewCastle();
	gameMap = makeFullCastleMap(castle);

	//TEMPORARY
	bomber.y = randInd(11,1);
	bomber.x = randInd(9,1);
	curRoom = 0;
}

//main game loop
function main(){
	requestAnimationFrame(main);
	canvas.focus();

	//panCamera();

	render();

	//keyboard ticks
	var akey = anyKey();
	if(akey && kt == 0){
		kt = setInterval(function(){keyTick+=1}, 75);
	}else if(!akey){
		clearInterval(kt);
		kt = 0;
		keyTick=0;
	}

	if(anyMoveKey() && (keyTick % 4 == 0)){
		if(!stepped)
			step();
	}else{
		stepped = false;
	}

	//debug
	var settings = "debug here";

	//document.getElementById('debug').innerHTML = settings;
}


/////////////////   HTML5 FUNCTIONS  //////////////////

//determine if valud key to press
document.body.addEventListener("keydown", function (e) {
	if(inArr(moveKeySet, e.keyCode)){
		keys[e.keyCode] = true;
	}else if(inArr(actionKeySet, e.keyCode)){
		keys[e.keyCode] = true;
	}
});

//check for key released
document.body.addEventListener("keyup", function (e) {
	if(inArr(moveKeySet, e.keyCode)){
		keys[e.keyCode] = false;
	}else if(inArr(actionKeySet, e.keyCode)){
		keys[e.keyCode] = false;
	}
});

//prevent scrolling with the game
window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if(([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1)){
        e.preventDefault();
    }
}, false);


main();
