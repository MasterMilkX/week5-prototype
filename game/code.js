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
var tpr = 3; //tiles per row


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

var dragonIMG = new Image();
dragonIMG.src = "img/dragon.png";
var dragonReady = false;
dragonIMG.onload = function(){dragonReady = true;};

//items
var bombIMG = new Image();
bombIMG.src = "img/bomb.png";
var bombReady = false;
bombIMG.onload = function(){bombReady = true;};

var explosionIMG = new Image();
explosionIMG.src = "img/explosion.png";
var explosionReady = false;
explosionIMG.onload = function(){explosionReady = true;};

var bomb2IMG = new Image();
bomb2IMG.src = "img/bomb2.png";
var bomb2Ready = false;
bomb2IMG.onload = function(){bomb2Ready = true;};

var explosion2IMG = new Image();
explosion2IMG.src = "img/explosion2.png";
var explosion2Ready = false;
explosion2IMG.onload = function(){explosion2Ready = true;};

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

var acidIMG = new Image();
acidIMG.src = "img/acid.png";
var acidReady = false;
acidIMG.onload = function(){acidReady = true;};


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

	color : 'blue',
	placedBomb : false,
	curBomb : null,

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
	ready : princessReady,
	show : true,
	dead : false
}

var king = {
	//position
	x : 0,
	y : 0,
	color : 'red',
	hp : 2,

	//animations
	img : bossKingIMG,
	ready : bossKingReady,
	show : true,
	placedBomb : false,
	curBomb : null
}

var dragon = {
	x : 224,
	y : 200,

	img : dragonIMG,
	ready : dragonReady,
	room : -1,
	show : false
}

//allow random item drops for ogre
function randDrop(){
	let r = Math.random();
	if(r < 0.6){
		return "";
	}else if(r < 0.95){
		return "diamond";
	}else{
		return "heart";
	}
}

//grunt enemies
function Ogre(x,y,room){
	this.x = x;
	this.y = y;
	this.drop = randDrop();
	this.dead = false;
}

//bombs placed on maps
function Bomb(x,y,type='blue'){
	this.x = x;
	this.y = y;
	this.type = type;
	this.fuse = 3;
}
var bombs = [];

//explosion from the bomb
function explosion(x,y,i,type='blue'){
	this.x = x;
	this.y = y;
	this.i = i;
	this.type = type;
}
var explosions = [];

//hearts to pickup
function Heart(x,y,room){
	this.x = x;
	this.y = y;
	this.room = room;
}

//treasure to collect
function Diamond(x,y,room){
	this.x = x;
	this.y = y;
	this.room = room;
}

function Acid(x,y,room){
	this.x = x;
	this.y = y;
	this.room = room;
}
var acids = [];

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
var curMap = [];		//map of current room
var castleSet = false;	//if castle setup yet


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

//search thru 2d array
function searchArr2D(arr2,e2){
	if(arr2.length == 0)
		return false;

	let str_e = e2.join();
	for(let a=0;a<arr2.length;a++){
		if(arr2[a].join() == str_e)
			return a;
	}
	return -1;
}
//check if an array is in a 2d array (boolean)
function inArr2D(arr2,e2){
	return searchArr2D(arr2,e2) == -1;
}


//get the tile from a map (if not a valid point returns -1)
function getTile(p,m){
	if(p[0] < 0 || p[1] < 0 || p[0] >= m[0].length || p[1] >= m.length)
		return -1;
	return  m[p[1]][p[0]];
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
	if(castle['princess'] == curRoom && !bomber.hasPrincess && !princess.dead){
		if(touching(bomber,princess)){
			bomber.hasPrincess = true;
		}
	}
	else if(bomber.hasPrincess && !princess.dead){
		princess.x = oldPos[0];
		princess.y = oldPos[1];
	}

	//king move
	if(castle['king'] == curRoom && !bomber.defeatKing && king.show){
		let np = drunkardsWalk(king,curMap);
		king.x = np[0];
		king.y = np[1];
	}

	//sacrifice princess
	if(dragon.room == curRoom && bomber.hasPrincess && dragon.show && !princess.dead){
		if(inArr([4,5],princess.x) && inArr([3,4],princess.y)){
			sacrifice();
		}
	}

	//ogres move
	let ogres = castle['layout'][curRoom]['ogres'];
	for(let o=0;o<ogres.length;o++){
		let ogre = ogres[o];
		let r = Math.random();

		if(r < 0.6){
			let np = drunkardsWalk(ogre,curMap);
			ogre.x = np[0];
			ogre.y = np[1];
		}
	}

	//explosions + bombs
	explosions = [];		//remove any leftover explosions

	let newBombs = [];
	for(let b=0;b<bombs.length;b++){
		let bb = bombs[b];
		bb.fuse--;
			
		//explode if at the last fuse
		if(bb.fuse < 0){
			if(bb.type == 'red')
				bombExplode(bb,3);
			else
				bombExplode(bb,2);

			//remove bomb from player
			if(bomber.curBomb == bb){
				bomber.curBomb = null;
				bomber.placedBomb = false;
			}
			else if(king.curBomb == bb){
				king.curBomb = null;
				king.placedBomb = false;
			}
		}
		//add to activate later
		else{
			newBombs.push(bb);
		}
	}
	bombs = newBombs;

	//take explosive bomb damage
	ogres = castle['layout'][curRoom]['ogres'];
	for(let e=0;e<explosions.length;e++){
		let ex=explosions[e];

		//any bombs can hurt player
		if(touching(ex,bomber))
			bomber.hp--;

		//any bombs can reset princess
		if(princess.show && (bomber.hasPrincess || castle['princess'] == curRoom) && touching(ex,princess)){
			bomber.hasPrincess = false;
			princess.dead = true;
			princess.show = false;
		}

		//blue bombs hurt king
		if(king.show && ex.type == 'blue' && !bomber.defeatKing && castle['king'] == curRoom && touching(ex,king) ){
			king.hp--;
			//ding dong the bitch is dead
			if(king.hp <= 0){
				king.show = false;
				bomber.defeatKing = true;
			}
		}

		//explosions kill ogres
		for(let o=0;o<ogres.length;o++){
			let og = ogres[o]
			if(og.dead)
				continue;

			//die 
			if(touching(ex,og)){
				og.dead = true;
				bomber.ogres++;

				//drop loot if available
				if(og.drop == "heart"){
					castle['layout'][curRoom]['hearts'].push(new Heart(og.x,og.y,curRoom));
				}else if(og.drop == "diamond"){
					castle['layout'][curRoom]['treasure'].push(new Diamond(og.x,og.y,curRoom));
				}
			}
		}

		//destroy acid 
		let ac2 = []
		for(let a=0;a<acids.length;a++){
			let acid = acids[a];
			if(!(acid.room == curRoom && touching(ex,acid))){
				ac2.push(acid);
			}
		}
		acids = ac2;
	}

	//collect treasure
	let treasure  = castle['layout'][curRoom]['treasure'];
	for(let t=0;t<treasure.length;t++){
		let diamond = treasure[t];
		if(touching(bomber, diamond)){
			bomber.money++;
			castle['layout'][curRoom]['treasure'].splice(t,1);
		}
	}

	//collect hearts
	let hearts  = castle['layout'][curRoom]['hearts'];
	for(let h=0;h<hearts.length;h++){
		let heart = hearts[h];
		if(touching(bomber, heart)){
			bomber.hp++;
			castle['layout'][curRoom]['hearts'].splice(h,1);
		}
	}
	
	//make ogres in the room walk around and damage player
	ogres = castle['layout'][curRoom]['ogres'];
	for(let o=0;o<ogres.length;o++){
		let ogre = ogres[o];
		if(ogre.dead)
			continue;

		//take damage for touching bomber
		if(touching(bomber,ogre)){
			bomber.hp--;
		}

		//ogres reset princess
		if(princess.show && (castle['princess'] == curRoom || bomber.hasPrincess) && touching(princess,ogre)){
			bomber.hasPrincess = false;
			princess.dead = true;
			princess.show = false;
		}

		//drop acid (tabs lol)
		let r = Math.random();
		if(r < 0.12){
			acids.push(new Acid(ogre.x, ogre.y, curRoom));
		}
	}

	//king damage player and place bombs
	if(castle['king'] == curRoom && !bomber.defeatKing && king.show){

		//place bomb randomly
		let r = Math.random();
		if(r < 0.2 && !king.placedBomb){
			let kb = new Bomb(king.x,king.y,'red');
			bombs.push(kb);
			king.curBomb = kb;
			king.placedBomb = true;
		}

		
		if(touching(bomber,king)){
			bomber.hp--;
		}
	}

	//bomber and princess take damage from acid
	for(let a=0;a<acids.length;a++){
		let acid = acids[a];
		if(acid.room == curRoom){
			if(touching(bomber,acid)){
				bomber.hp--;
				acids.splice(a,1);
			}
			if((bomber.hasPrincess) && !princess.dead && princess.show && touching(princess,acid)){
				bomber.hasPrincess = false;
				princess.dead = true;
				princess.show = false;
				acids.splice(a,1);
			}
		}
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

//random walk direction
function drunkardsWalk(p,m){
	let dirs = [[p.x+1,p.y],[p.x-1,p.y],[p.x,p.y-1],[p.x,p.y+1]];
	let validDir = [[p.x,p.y]];
	for(let d=0;d<dirs.length;d++){
		let pos = dirs[d];
		if(getTile(pos,m) == 0){
			validDir.push(pos);
		}
	}

	return validDir[Math.floor(Math.random()*validDir.length)];
}

//if a bomb is going to go off, add explosion
function bombExplode(b,len){
	explosions.push(new explosion(b.x,b.y,0,b.type));	//center of explosion where bomb was

	let t = {'v': 1, 'h':2, 'up': 3, 'left':4, 'down':5, 'right':6};

	//make points in all directions
	let pts = {'up':[],'down':[],'left':[],'right':[]};
	for(let l=1;l<=len;l++){
		pts['up'].push([b.x,b.y-l]);
	}
	for(let l=1;l<=len;l++){
		pts['down'].push([b.x,b.y+l]);
	}
	for(let l=1;l<=len;l++){
		pts['left'].push([b.x-l,b.y]);
	}
	for(let l=1;l<=len;l++){
		pts['right'].push([b.x+l,b.y]);
	}

	//check for validity of the points and make corresponding explosions along them
	let dirs = ['up','down','left','right'];
	for(let d=0;d<dirs.length;d++){
		let f = true;
		let addE = [];
		for(let i=len-1;i>=0;i--){
			let p = pts[dirs[d]][i];
			if(!inArr([-1,1],getTile(p,curMap))){
				if(!f){		//stem point
					addE.push(new explosion(p[0],p[1],t[(inArr(['up','down'],dirs[d]) ? 'v' : 'h')],b.type));
				}else{		//end point
					addE.push(new explosion(p[0],p[1],t[dirs[d]],b.type));
					f = false;
				}
			}
			//hit a wall
			else{
				addE = [];
				f = true;
			}
		}
		for(let a=0;a<addE.length;a++){explosions.push(addE[a]);}
	}
	
}

//sacrifice the princess to the dragon
function sacrifice(){
	dragon.show = false;
	bomber.hasPrincess = false;
	princess.dead = true;
	princess.show = false;

	//drop random loot
	for(let l=0;l<4;l++){
		let r = (Math.random() < 0.33 ? "heart" : "diamond");
		if(r == "heart"){
			castle['layout'][curRoom]['hearts'].push(new Heart(4+Math.floor(l/2),3+(l%2),curRoom));
		}else if(r == "diamond"){
			castle['layout'][curRoom]['treasure'].push(new Diamond(4+Math.floor(l/2),3+(l%2),curRoom));
		}
	}
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

	if(!bombReady){
		bombIMG.onload = function(){bombReady = true;};
		if(bombIMG.width !== 0){
			bombReady = true;
		}
	}
	if(!bomb2Ready){
		bomb2IMG.onload = function(){bomb2Ready = true;};
		if(bomb2IMG.width !== 0){
			bomb2Ready = true;
		}
	}

	if(!explosionReady){
		explosionIMG.onload = function(){explosionReady = true;};
		if(explosionIMG.width !== 0){
			explosionReady = true;
		}
	}

	if(!explosion2Ready){
		explosion2IMG.onload = function(){explosion2Ready = true;};
		if(explosion2IMG.width !== 0){
			explosion2Ready = true;
		}
	}

	if(!dragonReady){
		dragonIMG.onload = function(){dragonReady = true;};
		if(dragonIMG.width !== 0){
			dragonReady = true;
		}
	}

	if(!acidReady){
		acidIMG.onload = function(){acidReady = true;};
		if(acidIMG.width !== 0){
			acidReady = true;
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
				let t = gameMap[y][x];
				t = (typeof(t) == 'string' ? 0 : t);

				ctx.drawImage(tiles, 
					spr_size * Math.floor(t % tpr), spr_size * Math.floor(t / tpr), 
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
	//normal game screen
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
		if(castleSet){
			drawCastle();
			drawDoors();
		}
		

		//draw instructions
		if(dragon.room == curRoom && dragon.show){
			ctx.textAlign = "center";
			ctx.fillStyle = "#004AC4";
			ctx.font = "18px monospace";
			ctx.fillText("Give me the princess...",250, 130);
			ctx.fillText("and I shall reward you", 250, 145)
		}
		

		//draw characters
		for(let a=0;a<acids.length;a++){
			if(acids[a].room == curRoom){
				ctx.drawImage(acidIMG, 0,0,spr_size,spr_size,
					(3*size)+acids[a].x*size,(3*size)+acids[a].y*size,size,size)
			}
			
		}


		//dragon
		if(dragon.room == curRoom && dragon.show && dragonReady){
			ctx.drawImage(dragonIMG,50*(bomber.anim),0,50,50,dragon.x,dragon.y,64,64);
		}

		//bomber
		if(bomber.ready)
			ctx.drawImage(bomber.img, bomber.anim*spr_size,0,spr_size,spr_size,
				(3*size)+bomber.x*size,(3*size)+bomber.y*size,size,size);

		//princess
		if((bomber.hasPrincess || castle['princess'] == curRoom) && princess.ready && princess.show)
			ctx.drawImage(princess.img, ((bomber.anim+1)%2)*spr_size,0,spr_size,spr_size,
				(3*size)+princess.x*size,(3*size)+princess.y*size,size,size);

		//king
		if(castle['king'] == curRoom && bossKingReady && king.show)
			ctx.drawImage(king.img, bomber.anim*spr_size,0,spr_size,spr_size,
				(3*size)+king.x*size,(3*size)+king.y*size,size,size);

		//ogre
		if(castleSet){
			let ogres = castle['layout'][curRoom]['ogres'];
			for(let o=0;o<ogres.length;o++){
				let ogre = ogres[o];
				if(ogre.dead)
					continue;
				if(ogreReady)
					ctx.drawImage(ogreIMG, bomber.anim*spr_size,0,spr_size,spr_size,
						(3*size)+ogre.x*size,(3*size)+ogre.y*size,size,size);
			}
		}

		//draw items
		if(castleSet){
			let diamonds = castle['layout'][curRoom]['treasure'];
			for(let d=0;d<diamonds.length;d++){
				let diamond = diamonds[d];
				if(diamondReady)
					ctx.drawImage(diamondIMG, bomber.anim*36,0,36,36,
						(3*size)+diamond.x*size,(3*size)+diamond.y*size,size,size);
			}

			let hearts = castle['layout'][curRoom]['hearts'];
			for(let h=0;h<hearts.length;h++){
				let heart = hearts[h];
				if(heartReady)
					ctx.drawImage(heartIMG, bomber.anim*36,0,36,36,
						(3*size)+heart.x*size,(3*size)+heart.y*size,size,size);
			}
		}

		//draw all bombs
		for(let b=0;b<bombs.length;b++){
			let bo = bombs[b]
			let anim = (bo.fuse > 2 ? 2 : bo.fuse);
			if(bombReady && bomb2Ready)
				ctx.drawImage((bo.type == 'blue' ? bomb2IMG : bombIMG), (2-anim)*32,0,32,32,
					(3*size)+bo.x*size,(3*size)+bo.y*size,size,size);
		}

		//draw all explosions
		for(let e=0;e<explosions.length;e++){
			let ex = explosions[e];
			if(explosionReady && explosion2Ready)
				ctx.drawImage((ex.type == 'blue' ? explosion2IMG : explosionIMG), ex.i*32,0,32,32,
					(3*size)+ex.x*size,(3*size)+ex.y*size,size,size);
		}
		
		ctx.restore();
	}
	//finish castle screen
	else if(gamemode == "clear_screen"){
		ctx.save();
		//ctx.translate(-camera.x, -camera.y);		//camera
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		//background
		ctx.fillStyle = "#454545";
		ctx.fillRect(0,0,canvas.width, canvas.height);

		//title
		ctx.fillStyle = "#fff";
		ctx.textAlign = "center";
		ctx.font = "36px monospace";
		ctx.fillText("CASTLE CLEARED!", canvas.width/2, 70);

		ctx.textAlign = "left";
		ctx.font = "18px monospace";

		//diamonds
		ctx.fillStyle = "#00FCFC"
		ctx.drawImage(diamondIMG, bomber.anim*36,0,36,36,
			120, 105, 45, 45);
		ctx.fillText(bomber.money + " x Treasure Found", 180, 130);

		//ogres
		ctx.fillStyle = "#017900";
		ctx.drawImage(ogreIMG, bomber.anim*spr_size,0,spr_size,spr_size,
			120, 165, 48, 48);
		ctx.fillText(bomber.ogres + " x Ogres defeated", 180, 200);
		
		//princess and king
		if(bomber.hasPrincess || princess.dead){
			ctx.fillStyle = "#D56AD4";
			ctx.drawImage(princess.img, (princess.dead ? 0 : bomber.anim*spr_size),0,spr_size,spr_size,
				120, 235, 48, 48);
			if(!princess.dead)
				ctx.fillText("Princess Saved!", 180, 270);
			else{
				ctx.fillStyle = "#000";
				ctx.font = "52px monospace";
				ctx.fillText("X", 130,280);
				ctx.font = "18px monospace";
				ctx.fillText("Princess Died!", 180, 270);
			}
		}
		if(bomber.defeatKing){
			ctx.fillStyle = "#ff0000";
			ctx.drawImage(king.img, bomber.anim*spr_size,0,spr_size,spr_size,
				120, 305, 48, 48);
			ctx.fillText("King Defeated!", 180, 340);
		}

		ctx.textAlign = "center";
		ctx.fillStyle = "#F3C714";
		ctx.font = "24px monospace";
		ctx.fillText("Press Z to go to the next castle", canvas.width/2, 400);
		
	}
	else if(gamemode == "game_over"){
		ctx.save();
		//ctx.translate(-camera.x, -camera.y);		//camera
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		//background
		ctx.fillStyle = "#232323";
		ctx.fillRect(0,0,canvas.width, canvas.height);

		//title
		ctx.fillStyle = "#ff0000";
		ctx.textAlign = "center";
		ctx.font = "36px monospace";
		ctx.fillText("GAME OVER!", canvas.width/2, 70);

		ctx.fillStyle = "#fff";
		ctx.textAlign = "left";
		ctx.font = "18px monospace";

		//diamonds
		ctx.fillStyle = "#00FCFC";
		ctx.drawImage(diamondIMG, bomber.anim*36,0,36,36,
			30, 105, 45, 45);
		ctx.fillText((bomber.totalMoney+bomber.money) + " x Treasure Found", 100, 130);

		//ogres
		ctx.fillStyle = "#017900";
		ctx.drawImage(ogreIMG, bomber.anim*spr_size,0,spr_size,spr_size,
			30, 165, 48, 48);
		ctx.fillText((bomber.totalOgres+bomber.ogres) + " x Ogres defeated", 100, 200);
		
		//princess and king
		ctx.fillStyle = "#D56AD4";
		ctx.drawImage(princess.img, bomber.anim*spr_size,0,spr_size,spr_size,
			30, 235, 48, 48);
		ctx.fillText(bomber.totalPrincesses + " x Princesses Saved", 100, 270);
		
		
		ctx.fillStyle = "#ff0000";
		ctx.drawImage(king.img, bomber.anim*spr_size,0,spr_size,spr_size,
			30, 305, 48, 48);
		ctx.fillText(bomber.totalKings + " x Kings Defeated!", 100, 340);
		

		ctx.textAlign = "center";
		ctx.fillStyle = "#F3C714";
		ctx.font = "24px monospace";
		ctx.fillText("Press Z to restart", canvas.width/2, 420);

		//score
		
		let score = ((bomber.totalMoney+bomber.money)*10 + (bomber.totalOgres+bomber.ogres)*15 + bomber.totalPrincesses*50 + (bomber.totalKings+(bomber.defeatKing ? 1 : 0))*100);
		ctx.fillStyle = "#fff";
		ctx.font = "24px monospace";
		ctx.fillText("SCORE", 420,150);
		ctx.font = "28px monospace";
		ctx.fillText(score, 420,180);

		let highScore = (!localStorage.highScore || localStorage.highScore < score ? score : localStorage.highScore);
		ctx.font = "24px monospace";
		ctx.fillText("HIGH SCORE", 420,250);
		ctx.font = "28px monospace";
		ctx.fillText(highScore, 420,280);
		localStorage.highScore = highScore;
		
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
		stx.drawImage(heartIMG, 0,0,36,36,42,60,32,32);
	stx.fillText("x " + bomber.hp, 85,85);

	//diamonds
	if(diamondReady)
		stx.drawImage(diamondIMG, 0,0,36,36,42,105,32,32);
	stx.fillText("x " + bomber.money, 85,125);

	//ogres
	if(ogreReady)
		stx.drawImage(ogreIMG, 0,0,32,32,40,140,36,36);
	stx.fillText("x " + bomber.ogres, 85,165);



	//show characters on defeat
	if(bomber.hasPrincess || princess.dead)
		stx.drawImage(princessIMG, 0, 0, spr_size, spr_size, 40,200,36,36);
	if(bomber.defeatKing)
		stx.drawImage(bossKingIMG, 0, 0, spr_size, spr_size, 105,200,36,36);

	if(princess.dead){
		stx.fillStyle = "#000";
		stx.font = "48px monospace";
		stx.fillText("X", 45,230);

	}

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

//adds ogres to the castle
function addOgres(){
	let ogreNum = Math.floor(Math.random()*10)+4;
	for(let o=0;o<ogreNum;o++){
		let r = randInd(16);
		let m = castle['layout'][r]['map'];
		let p = randPos(m)
		let ogre = new Ogre(p[0],p[1],r);
		castle['layout'][r]['ogres'].push(ogre);
	}
}

//adds treasure to the map
function addTreasure(){
	let tnum = Math.floor(Math.random()*5)+3;
	for(let t=0;t<tnum;t++){
		let r = randInd(16);
		let m = castle['layout'][r]['map'];
		let p = randPos(m);
		let treasure = new Diamond(p[0],p[1],r);
		castle['layout'][r]['treasure'].push(treasure);
	}
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

	//revive characters
	princess.dead = false;
	princess.show = true;
	king.dead = false;
	king.show = true;

	//setup castle
	castle = genNewCastle();
	gameMap = makeFullCastleMap(castle);
	visitedRooms = [];

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
	addOgres();
	addTreasure();

	let rp = randPos(castle['layout'][castle['princess']]['map']);
	princess.x = rp[0];
	princess.y = rp[1];

	let rp2 = randPos(castle['layout'][castle['king']]['map']);
	king.x = rp2[0];
	king.y = rp2[1];

	//add dragon to the empty room
	dragon.room = -1;
	for(let r=0;r<16;r++){
		if(castle['layout'][r]['mapIndex'] == 0){		//blank room
			dragon.show = true;
			dragon.room = r;
			break;
		}
	}

	acids = [];


	castleSet = true;
}

//teleport to the next room
function nextRoom(r,pos=null){
	curRoom = r;
	curMap = castle['layout'][curRoom]['map'];

	//haven't seen yet
	if(visitedRooms.indexOf(r) == -1){
		visitedRooms.push(r);
	}

	//teleport player
	if(pos == null){
		let rp = randPos(curMap);
		bomber.x = rp[0];
		bomber.y = rp[1];
	}else{
		bomber.x = pos[0];
		bomber.y = pos[1];
	}

	//if princess add her
	if(bomber.hasPrincess){
		princess.x = bomber.x;
		princess.y = bomber.y;
	}
	
	//remove all bombs
	explosions = [];
	bombs = [];
	bomber.curBomb = null;
	king.curBomb = null;
	bomber.placedBomb = false;
	king.placedBomb = false;
}

//finish castle level
function finishCastle(){
	gamemode = "clear_screen";

	bomber.totalKings += (bomber.defeatKing ? 1 : 0);
	bomber.totalPrincesses += (bomber.hasPrincess ? 1 : 0);
	bomber.totalOgres += bomber.ogres;
	bomber.totalMoney += bomber.money;

	if(bomber.hasPrincess)
		bomber.hp+=1;

}

function resetGame(){
	bomber.totalMoney = 0;
	bomber.totalKings = 0;
	bomber.totalOgres = 0;
	bomber.totalPrincesses = 0;

	bomber.hp = 3;
	castles = 0;

	newCastle();
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
		kt = setInterval(function(){keyTick+=1}, 50);
	}else if(!akey){
		clearInterval(kt);
		kt = 0;
		keyTick=0;
	}

	//step action
	if(anyMoveKey() && (keyTick % 5 == 0)){
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
		}else if(gamemode == "game_over" && canGotoNext){
			canGotoNext = false;
			resetGame();
		}
	}else{
		canGotoNext = true;
	}

	//place a new bomb if allowed
	if(keys[b_key] && !bomber.placedBomb){
		let b = new Bomb(bomber.x,bomber.y,'blue');
		bomber.curBomb = b;
		bombs.push(b);
		bomber.placedBomb = true;
	}

	//show the king is possible
	if(castle['king'] != curRoom && king.show)
		king.show = false;
	else if(castle['king'] == curRoom && !bomber.defeatKing && !king.show)
		king.show = true;


	//game over
	if(bomber.hp == 0){
		gamemode = "game_over";
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
