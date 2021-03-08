
/// GENERIC FUNCTIONS //

//checks if an element is in an array
function inArr(arr, e){
	if(arr.length == 0)
		return false;
	return arr.indexOf(e) !== -1
}

//
function inArr2D(arr2,e2){
	if(arr2.length == 0)
		return false;

	let str_e = e2.join();
	for(let a=0;a<arr2.length;a++){
		if(arr2[a].join() == str_e)
			return true;
	}
	return false;
}

//the different kinds of rooms to generate in the castle
//each room is 10x8 with borders separating the rooms
var roomLayouts = {
	0 : [			//blank
				[0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0]
	],
	1 : [			//circle
				[0,0,0,0,0,0,0,0,0,0],
				[0,1,1,0,0,0,0,1,1,0],
				[0,1,0,0,0,0,0,0,1,0],
				[0,0,0,0,1,1,0,0,0,0],
				[0,0,0,0,1,1,0,0,0,0],
				[0,1,0,0,0,0,0,0,1,0],
				[0,1,1,0,0,0,0,1,1,0],
				[0,0,0,0,0,0,0,0,0,0]
	],
	2 : [			//horizontal walls
				[0,0,0,0,0,0,0,0,0,0],
				[0,1,1,1,1,1,1,1,1,0],
				[0,0,0,0,0,0,0,0,0,0],
				[0,1,1,1,1,1,1,1,1,0],
				[0,1,1,1,1,1,1,1,1,0],
				[0,0,0,0,0,0,0,0,0,0],
				[0,1,1,1,1,1,1,1,1,0],
				[0,0,0,0,0,0,0,0,0,0]
	],
	3 : [			//vertical walls
				[0,0,0,0,0,0,0,0,0,0],
				[0,1,0,1,0,0,1,0,1,0],
				[0,1,0,1,0,0,1,0,1,0],
				[0,1,0,1,0,0,1,0,1,0],
				[0,1,0,1,0,0,1,0,1,0],
				[0,1,0,1,0,0,1,0,1,0],
				[0,1,0,1,0,0,1,0,1,0],
				[0,0,0,0,0,0,0,0,0,0]
	],
	4 : [			//pluses
				[0,0,0,0,0,0,0,0,0,0],
				[0,0,1,0,0,0,0,1,0,0],
				[0,1,1,1,0,0,1,1,1,0],
				[0,0,1,0,0,0,0,1,0,0],
				[0,0,0,0,1,1,0,0,0,0],
				[0,0,0,1,1,1,1,0,0,0],
				[0,0,0,0,1,1,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0]
	],
	5 : [			//clover
				[0,0,0,0,0,0,0,0,0,0],
				[0,0,0,1,0,0,1,0,0,0],
				[0,1,1,1,0,0,1,1,1,0],
				[0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0],
				[0,1,1,1,0,0,1,1,1,0],
				[0,0,0,1,0,0,1,0,0,0],
				[0,0,0,0,0,0,0,0,0,0]
	],
	6 : [			//checkerboard
				[0,0,0,0,0,0,0,0,0,0],
				[0,1,0,1,0,0,1,0,1,0],
				[0,0,0,0,0,0,0,0,0,0],
				[0,1,0,1,0,0,1,0,1,0],
				[0,0,0,0,0,0,0,0,0,0],
				[0,0,1,0,0,0,0,1,0,0],
				[0,1,0,1,0,0,1,0,1,0],
				[0,0,0,0,0,0,0,0,0,0]
	],
	7 : [			//dna
				[0,0,0,0,0,0,0,0,0,0],
				[0,1,1,1,0,0,1,1,1,0],
				[0,0,1,0,0,0,0,1,0,0],
				[0,1,0,1,0,0,1,0,1,0],
				[0,1,0,0,0,0,0,0,1,0],
				[0,0,1,0,0,0,0,1,0,0],
				[0,1,1,1,0,0,1,1,1,0],
				[0,0,0,0,0,0,0,0,0,0]
	]
}

//doors to move between rooms of the castle
function door(x,y,goto,isExit=false){
	this.x = x;
	this.y = y;
	this.goto = goto;
	this.isExit = isExit;
}

//returns a random number from i to n-1
function randInd(n,i=0){
	return Math.floor(Math.random()*(n-i))+i;
}

//returns random position on a map where there is a free space
function randPos(map){
	let x = Math.floor(Math.random()*map[0].length);
	let y = Math.floor(Math.random()*map.length);

	let i = 0;
	while((map[y][x] != 0) && (i < 100)){
		x = Math.floor(Math.random()*map[0].length);
		y = Math.floor(Math.random()*map.length);
		i++;
	}

	return [x,y];
}

//populates a room with monsters
function makeRoom(){
	let room = {
		'index' : 0,
		'map' : [],
		'mapIndex' : 0,
		'ogres' : [],
		'treasure' : [],
		'hearts' : [],
		'doors' : []
	}

	room['mapIndex'] = randInd(Object.keys(roomLayouts).length);
	room['map'] = roomLayouts[room.mapIndex];

	//add doors 

	return room;
}

//creates a new castle map with randomly placed rooms, enemies, and treasures
function genNewCastle(){
	let castle = {};
	let castleLayout = [];

	//make 4 x 4 map layout
	for(let i =0;i<4;i++){
		let a = [];		//row of the castle
		for(let j=0;j<4;j++){
			let r = makeRoom();
			r['index'] = i*4+j;
			castleLayout.push(r);
		}
		
	}	
	castle['layout'] = castleLayout;

	//add doors
	let dta = addDoorTree(castleLayout);
	let root = dta[0][0];
	let doors = dta[1];
	for(let d=0;d<16;d++){
		castle['layout'][d]['doors'] = doors[d];
	}
	castle['startRoom'] = root;

	//add the princess's and boss's locations
	let princessRoom = randInd(16)
	castle['princess'] = princessRoom;

	let kingRoom = randInd(16);
	castle['king'] = kingRoom;

	return castle;

}

//makes the full castle map with walls
function makeFullCastleMap(castle){
	let fullMap = [];
	let layout = castle['layout'];

	for(let s=0;s<4;s++){
		let a = [];
		for(let r=0;r<45;r++)
			a.push(1);
		fullMap.push(a)

		//top row of maps
		for(let r=0;r<8;r++){
			let a = [];
			for(let m=0;m<4;m++){
				a.push(1);						//separating wall
				for(let c=0;c<10;c++){			//map
					a.push(layout[s*4+m]['map'][r][c]);
				}
			}
			a.push(1);						//last wall
			fullMap.push(a)					//add row
		}
	}

	//last border wall
	let a = [];
	for(let r=0;r<45;r++)
		a.push(1);
	fullMap.push(a);
	

	return fullMap;

}

//makes a door tree so each room can be visited
function makeDoorTree(){
	let d = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
	let tree = {};

	//make root
	let r = d.splice(randInd(d.length),1);
	tree[r] = [];
	let parList = [r];

	//add to tree (no more than 2 child doors per room)
	while(d.length > 0){
		//pick a node without 2 children
		let p = parList[Math.floor(Math.random()*parList.length)];
		let n = d.splice(randInd(d.length),1)[0];
		tree[p].push(n)
		tree[n] = [];
		parList.push(n);

		if(tree[p].length == 2){
			parList.splice(parList.indexOf(p),1);
		}
	}
	//console.log(tree);

	return [r,tree];
}

//adds the door tree to the mao
function addDoorTree(castleRooms){
	let dta = makeDoorTree();
	let root = dta[0];
	let dt = dta[1];

	//initialize doors
	let doors = {};
	for(let d=0;d<16;d++){doors[d] = [];}

	//add root exit door
	doors[root] = [];
	let p = randPos(castleRooms[root]['map']);
	castleRooms[root]['map'][p[1]][p[0]] = "D";
	doors[root].push(new door(p[0],p[1],-1,true));

	//add child doors
	for(let d=0;d<16;d++){
		let children = dt[d];
		//no children
		if(children.length == 0)
			continue;
		//children
		else{
			//make a 2 way door for parent and child
			for(let c=0;c<children.length;c++){
				//add child door to parent
				let childRoomNo = children[c];
				let m = castleRooms[childRoomNo]['map'];
				let p = randPos(m);
				castleRooms[childRoomNo]['map'][p[1]][p[0]] = "D";
				doors[childRoomNo].push(new door(p[0],p[1],d))

				//add parent door to child
				let m2 = castleRooms[d]['map'];
				let p2 = randPos(m2);
				castleRooms[d]['map'][p2[1]][p2[0]] = "D";
				doors[d].push(new door(p2[0],p2[1],childRoomNo))
			}
		}
	}

	return [root,doors];
}



