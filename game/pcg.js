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
	5 : [			//loss
				[0,0,0,0,0,0,0,0,0,0],
				[0,1,0,0,0,1,0,0,0,0],
				[0,1,0,0,0,1,0,0,1,0],
				[0,1,0,0,0,1,0,0,1,0],
				[0,0,0,0,0,0,0,0,0,0],
				[0,1,0,1,0,1,0,0,0,0],
				[0,1,0,1,0,1,0,1,1,1],
				[0,1,0,1,0,1,0,0,0,0]
	]
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
	while(map[y][x] != 0 && i < 100){
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
		'portals' : []
	}

	room['mapIndex'] = randInd(Object.keys(roomLayouts).length);
	room['map'] = roomLayouts[room.mapIndex];

	// ADD OGRES, TREASURE CHESTS, AND PORTALS

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
			a.push(r);
		}
		castleLayout.push(a);
	}	
	castle['layout'] = castleLayout;

	//add the princess's and boss's locations
	castle['princess'] = randInd(16);
	castle['king'] = randInd(16);

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
					a.push(layout[s][m]['map'][r][c]);
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