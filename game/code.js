//set up the canvas
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 448;

var statCanvas = document.getElementById("statCanvas");
var stx = statCanvas.getContext("2d");
statCanvas.width = 180;
statCanvas.height = 448;


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
doorIMG.src = 'img/portal.png';
var doorReady = false;
doorIMG.onload = function(){doorReady = true;};
var portalAnim = 0;

var diamondIMG = new Image();
diamondIMG.src = "img/diamond.png";
var diamondReady = false;
diamondIMG.onload = function(){diamondReady = true;};

var heartIMG = new Image();
heartIMG.src = "img/heart.png";
var heartReady = false;
heartIMG.onload = function(){heartReady = true;};


/////  AI AND PLAYER  //////

var bomber = {
	//position
	x : 0,
	y : 0,

	//properties
	hp : 3,
	money : 0,
	castles : 0,
	ogres : 0,

	//animations
	img : bomberIMG,
	ready : bomberReady,
	anim : 0,
	bt : 0,

	hasPrincess : false,
	defeatKing : false,

	//global game
	totalMoney : 0,
	totalOgres : 0,
	totalPrincesses : 0,
	totalKings : 0

}

var princess = {
	//position
	x : 0,
	y : 0,

	//animations
	img : princessIMG,
	ready : princessReady
}

var king = {
	//position
	x : 0,
	y : 0,

	//animations
	img : bossKingIMG,
	ready : bossKingReady,
	show : false
}

//bombs placed on maps
function bomb(x,y){
	this.x = x;
	this.y = y;
	this.fuse = 2;
}

//hearts to pickup
function heart(room,x,y){
	this.x = x;
	this.y = y;
	this.room = room;
}

function diamond(room, x,y){
	this.x = x;
	this.y = y;
	this.room = room;
}

///// CAMERA AND MAP  //////
/*
var camera = {
	x : 0,
	y : 0
};
*/
let camOffX = 0;
let camOffY = 0;


var castle = {}			//4x4 array of different room types labeled by number with key character locations
var gameMap = []		//full tiled map
var visitedRooms = []	//list of rooms the player has visited already (to show on the map)
var curRoom = [];		//current room map layout 
var curMap = [];


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


//game properties
var gamemode = "game";



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
	x = x;
	y = y;
	//return false;
	return x < 0 || x >= curMap[0].length || y < 0 || y >= curMap.length || inArr(collideTiles,curMap[y][x]);
}

//check if a is touching b
function touching(a,b){
	return a.x == b.x && a.y == b.y;
}


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

	//items
	if(!doorReady){
		doorIMG.onload = function(){doorReady = true;};
		if(doorIMG.width !== 0){
			doorReady = true;
		}
	}
	if(!heartReady){
		heartIMG.onload = function(){heartReady = true;};
		if(heartIMG.width !== 0){
			heartReady = true;
		}
	}
	if(!diamondReady){
		diamondIMG.onload = function(){diamondReady = true;};
		if(diamondIMG.width !== 0){
			diamondReady = true;
		}
	}
}

//calculate the camera offset to show the map
function calcCamOffset(){
	let xo = [-2,9,20,31];
	let yo = [-2,7,16,25];

	camOffX = xo[curRoom%4];
	camOffY = yo[Math.floor(curRoom/4)];
}

//determines if object with x,y is on screen or not
function onScreen(o){
	let w = canvas.width/size;
	let h = canvas.height/size;
	return (o.x >= camOffX) && (o.y >= camOffY) && (o.x <= camOffX+w) && (o.y <= camOffY + h);
}


//draws the castle
function drawCastle(){
	//don't draw if tiles not ready yet
	if(!tilesReady){
		checkRender();
		return;
	}

	if(gameMap.length == 0){return;}

	//calculate offset
	calcCamOffset();

	//draw map of current room and then some
	let mx = 0;
	let my = 0;
	for(let y=camOffY;y<camOffY+14;y++){
		mx = 0;
		for(let x=camOffX;x<camOffX+16;x++){
			//out of bounds (draw a black square)
			if(y < 0 || y >= gameMap.length || x < 0 || x >= gameMap[0].length){
				ctx.fillStyle = "#000";
				ctx.fillRect(mx*size,my*size,size,size);
			}	
			else{
				//otherwise draw the tile
				ctx.drawImage(tiles, 
					spr_size * Math.floor(gameMap[y][x] % tpr), spr_size * Math.floor(gameMap[y][x] / tpr), 
					spr_size, spr_size, 
					(mx * size), (my * size), 
					size, size);
			}
			
			mx++;
		}
		my++;
	}
}

//draw the doors in the game
function drawDoors(){
	if(!doorReady){return;}

	let cr = castle['layout'][curRoom]['doors'];
	for(let d=0;d<cr.length;d++){
		let door = cr[d];
		ctx.drawImage(doorIMG, spr_size*portalAnim,(door.isExit ? 1 : 0)*spr_size,spr_size,spr_size,
			(3*size)+door.x*size,(3*size)+door.y*size,size,size);
	}	
}

//draw images onto the canvas
function renderGame(){
	if(gamemode == "game"){
		checkRender();
		ctx.save();
		//ctx.translate(-camera.x, -camera.y);		//camera
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		//background
		ctx.fillStyle = "#dedede";
		ctx.fillRect(0,0,canvas.width, canvas.height);
		
		/*   add draw functions here  */
		//draw tiles from tileset
		drawCastle();
		drawDoors();

		//draw characters
		if(bomber.ready)
			ctx.drawImage(bomber.img, bomber.anim*spr_size,0,spr_size,spr_size,
				(3*size)+bomber.x*size,(3*size)+bomber.y*size,size,size);

		if((bomber.hasPrincess || castle['princess'] == curRoom) && princess.ready)
			ctx.drawImage(princess.img, ((bomber.anim+1)%2)*spr_size,0,spr_size,spr_size,
				(3*size)+princess.x*size,(3*size)+princess.y*size,size,size);

		if(castle['king'] == curRoom && bossKingReady)
			ctx.drawImage(king.img, bomber.anim*spr_size,0,spr_size,spr_size,
				(3*size)+king.x*size,(3*size)+king.y*size,size,size);


		
		ctx.restore();
	}else if(gamemode == "clear_screen"){
		ctx.save();
		//ctx.translate(-camera.x, -camera.y);		//camera
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		//background
		ctx.fillStyle = "#232323";
		ctx.fillRect(0,0,canvas.width, canvas.height);

		//title
		ctx.fillStyle = "#fff";
		ctx.textAlign = "center";
		ctx.font = "36px monospace";
		ctx.fillText("CASTLE CLEARED!", canvas.width/2, 70);

		ctx.textAlign = "left";
		ctx.font = "18px monospace";

		//ogres
		ctx.drawImage(diamondIMG, bomber.anim*36,0,36,36,
			125, 105, 45, 45);
		ctx.fillText(bomber.money + " x Treasure Collected", 180, 130);

		//ogres
		ctx.drawImage(ogreIMG, bomber.anim*spr_size,0,spr_size,spr_size,
			125, 165, 48, 48);
		ctx.fillText(bomber.ogres + " x Ogres defeated", 180, 200);
		
		//princess and king
		if(bomber.hasPrincess){
			ctx.fillStyle = "#D56AD4";
			ctx.drawImage(princess.img, bomber.anim*spr_size,0,spr_size,spr_size,
				125, 235, 48, 48);
			ctx.fillText("Princess Saved!", 180, 270);
		}
		if(bomber.defeatKing){
			ctx.fillStyle = "#ff0000";
			ctx.drawImage(king.img, bomber.anim*spr_size,0,spr_size,spr_size,
				125, 305, 48, 48);
			ctx.fillText("Black Knight Defeated!", 180, 340);
		}

		ctx.textAlign = "center";
		ctx.fillStyle = "#F3C714";
		ctx.font = "24px monospace";
		ctx.fillText("Press Z to go to the next castle", canvas.width/2, 400);
		
	}
	
}


function renderStat(){
	stx.save();
	stx.clearRect(0, 0, statCanvas.width, statCanvas.height);
	
	//background
	stx.fillStyle = "#898989";
	stx.fillRect(0,0,statCanvas.width, statCanvas.height);

	stx.fillStyle = "#F3C714";
	stx.textAlign = "center";
	stx.font = "32px monospace";
	stx.fillText("CASTLE " + (bomber.castles), statCanvas.width/2, 50);


	//font setup
	stx.fillStyle = "#000";
	stx.textAlign = "left";
	stx.font = "24px monospace";

	//hearts
	if(heartReady)
		stx.drawImage(heartIMG, 0,0,36,36,40,100,36,36);
	stx.fillText("x " + bomber.hp, 85,125);

	//diamonds
	if(diamondReady)
		stx.drawImage(diamondIMG, 0,0,36,36,40,170,36,36);
	stx.fillText("x " + bomber.money, 85,195);

	//map
	stx.fillStyle = "#000";
	stx.textAlign = "center";
	stx.font = "24px monospace";
	stx.fillText("MAP", statCanvas.width/2,290)

	for(let i=0;i<4;i++){
		for(let j=0;j<4;j++){
			let ind = i*4+j;
			stx.fillStyle = (visitedRooms.indexOf(ind) == -1 ? "#343434" : "#bcbcbc");
			stx.fillStyle = (ind == curRoom ? "#46B6B8" : stx.fillStyle);
			stx.fillRect(25+33*j,300+23*i,30,20);
		}
	}

}


//////////////   GAME LOOP FUNCTIONS   //////////////////

//game initialization function
function init(){
	newCastle();

	//start animations for all characters
	bomber.bt = setInterval(function(){bomber.anim = (bomber.anim == 1 ? 0 : 1);},400);
	setInterval(function(){portalAnim = (portalAnim == 3 ? 0 : portalAnim+1);},200);
}

//generate a new castle
function newCastle(){
	gamemode = "game";

	//set bomber properties
	bomber.castles++;
	bomber.hasPrincess = false;
	bomber.defeatKing = false;
	bomber.ogres = 0;
	bomber.money = 0;

	//setup castle
	castle = genNewCastle();
	gameMap = makeFullCastleMap(castle);

	let exitDoor = null;
	let doors = castle['layout'][castle['startRoom']]['doors'];
	for(let d=0;d<doors.length;d++){
		if(doors[d].isExit){
			exitDoor = doors[d];
			break;
		}
	}

	nextRoom(castle['startRoom'],[exitDoor.x,exitDoor.y]);

	//add characters to their respective rooms
}

//teleport to the next room
function nextRoom(r,pos=null){
	curRoom = r;
	curMap = castle['layout'][curRoom]['map'];

	//haven't seen yet
	if(visitedRooms.indexOf(r) == -1){
		visitedRooms.push(r);
	}

	if(pos == null){
		let rp = randPos(curMap);
		bomber.x = rp[0];
		bomber.y = rp[1];
	}else{
		bomber.x = pos[0];
		bomber.y = pos[1];
	}
	
}

//finish castle level
function finishCastle(){
	gamemode = "clear_screen";

	bomber.totalKings += (bomber.defeatKing ? 1 : 0);
	bomber.totalPrincesses += (bomber.hasPrincess ? 1 : 0);
	bomber.totalOgres += bomber.ogres;
	bomber.totalMoney += bomber.money;

}

//main game loop
let canGotoNext = true;
function main(){
	requestAnimationFrame(main);
	canvas.focus();

	//panCamera();

	renderGame();
	renderStat();

	//keyboard ticks
	var akey = anyKey();
	if(akey && kt == 0){
		kt = setInterval(function(){keyTick+=1}, 75);
	}else if(!akey){
		clearInterval(kt);
		kt = 0;
		keyTick=0;
	}

	//step action
	if(anyMoveKey() && (keyTick % 4 == 0)){
		if(!stepped)
			step();
	}else{
		stepped = false;
	}

	//next room if z key pressed and on top of door
	if(keys[a_key]){
		if(gamemode == "game" && canGotoNext){
			let doors = castle['layout'][curRoom]['doors'];
			for(let d=0;d<doors.length;d++){
				if(touching(bomber,doors[d])){

					if(doors[d].isExit){
						canGotoNext = false;
						finishCastle();
						break;
					}else{
						//get the door back and teleport next to it
						let oppDoors = castle['layout'][doors[d].goto]['doors'];
						for(let o=0;o<oppDoors.length;o++){
							if(oppDoors[o].goto == curRoom){
								let backDoor = oppDoors[o];
								nextRoom(doors[d].goto,[backDoor.x,backDoor.y]);
								canGotoNext = false;
							}
						}
					}
					
				}
			}
		}else if(gamemode == "clear_screen" && canGotoNext){
			canGotoNext = false;
			newCastle();
		}
	}else{
		canGotoNext = true;
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
