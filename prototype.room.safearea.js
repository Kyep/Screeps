

RoomPosition.prototype.isPassable = function() {
    var everything_here = this.look();
    for (var k = 0; k < everything_here.length; k++) {
        if (everything_here[k]["type"] == "creep") {
            continue;
        }
        if (everything_here[k]["type"] == "structure") {
            if (everything_here[k].structure.structureType != STRUCTURE_ROAD) {
                new RoomVisual(this.name).circle(this, {radius: 0.5, opacity: 0.3, stroke: 'red'});
                return false;
            }
        }
        if (everything_here[k]["type"] == "terrain") {
            if (everything_here[k]["terrain"] == "wall") {
                new RoomVisual(this.name).circle(this, {radius: 0.5, opacity: 0.3, stroke: 'orange'});
                return false;
            }
        }
        /*
        if (everything_here[k]["type"] == "structure") {
            if (OBSTACLE_OBJECT_TYPES.includes(everything_here[k]["type"].structureType)) {
                return false;
            }
        }
        */
    }
    new RoomVisual(this.name).circle(this, {radius: 0.5, opacity: 0.3, stroke: 'green'});
    return true;
}

Room.prototype.save_empty = function() {
    var all_positions = [];
    for (var x = 0; x <= 49; x++) {
        for (var y = 0; y <= 49; y++) {
            all_positions.push(new RoomPosition(x, y, this.name));
        }
    }
    console.log(all_positions.length);
    var valid_positions = [];
    for (var i = 1; i < all_positions.length; i++) {
        if (all_positions[i].isPassable()) {
            new RoomVisual(this.name).circle(all_positions[i], {radius: 0.5, opacity: 0.3, stroke: 'green'});
            valid_positions.push(all_positions[i]);
        } else {
            new RoomVisual(this.name).circle(all_positions[i], {radius: 0.5, opacity: 0.3, stroke: 'red'});
        }
    }
    this.memory["p_empty"] = valid_positions;
    var exits = this.find(FIND_EXIT);
    var checked = [];
    for (var i = 1; i < exits.length; i++) {
        checked.push(exits[i]);
    }
    this.memory["p_checked"] = checked;
}

Room.prototype.analyse_empty = function() {
    var valid_positions = this.memory["p_empty"];
    var checked_positions = this.memory["p_checked"];
    if (checked_positions != undefined && checked_positions.length == 0) {
        return;
    }
    console.log(valid_positions.length + ' v ' + checked_positions.length);
    var new_checked_positions = [];
    var new_valid_positions = [];
    for (var i = 0; i < valid_positions.length; i++) {
        if (checked_positions.includes(valid_positions[i])) {
            continue;
        }
        var vpos = new RoomPosition(valid_positions[i]['x'], valid_positions[i]['y'], valid_positions[i]['roomName']);
        var new_added = false;
        for (var y = 0; y < checked_positions.length; y++) {
            var cpos = new RoomPosition(checked_positions[y]['x'], checked_positions[y]['y'], checked_positions[y]['roomName']);
            if (vpos.isNearTo(cpos)) {
                new_checked_positions.push(vpos);
                new_added = true;
                break;
            }
        }
        if (!new_added) {
            new_valid_positions.push(vpos);
        }
    }
    this.memory["p_checked"] = new_checked_positions;
    this.memory["p_empty"]  = new_valid_positions;
    for (var y = 1; y < checked_positions.length; y++) {
        new RoomVisual(this.name).circle(checked_positions[y], {radius: 0.5, opacity: 0.3, stroke: 'green'});
    }
}


/*

global.longNav = function() {
    
}

Object.defineProperty(Room.prototype, 'safeArea', {
    get : function() {
        if (this._safeArea) {
			// Use cached value if one has been generated
            return this._safeArea;
			// return this._safeArea.clone();	// if you want to change the result after without messing up the cached result
												// I don't bother, to save a bit of cpu
        }
		// longNav() is my general-purpose navigation cost matrix
		// it generates a matrix with constructions sites, structures, etc marked as impassible
        const mat = longNav(this.name) // TODO --USE YOUR OWN COST MATRIX HERE--MAKE SURE IT DOES NOT SET ROAD TILES TO A NON-ZERO VALUE AND THAT ALL CONSTRUCTED_WALLS ARE SET TO 255 / 0xFF
		// No magic numbers here today
        const IMPASSIBLE = 0xff;
        const UNCHECKED = 0x00;
        const RAMPART = 0x01;
        const PENDING = 0x10;
        const UNSAFE = 0x80;

		// Get 
        let exits = this.find(FIND_EXIT);
        let ramps = this.ramparts;

		// This algorithm uses an array as a queue.
		// The implementation could be made more efficient but I was under attack at the time I wrote this, so..
        let queue = [];

		// Add all room exit tiles to the queue
		// A possible improvement would be to skip any exits to rooms known to be safe
		// Like dead-end remotes, etc
		// Coordinates are stored as ints in format: 64*x+y

        for (let i in exits) {
            mat.set(exits[i].x, exits[i].y, PENDING);
            queue.push(64*exits[i].x+exits[i].y);
        }

		// Mark all ramparts on the cost matrix
        for (let i in ramps) {
            mat.set(ramps[i].pos.x, ramps[i].pos.y, RAMPART);
        }

		// The main flood fill loop
        let x, y, dx, dy, nx, ny;
        while (queue.length) {
			// Parse coords of tile at the head of the queue
            x = queue[0] >> 6;
            y = queue[0] & 0x3f;

			// Check the terrain of this tile
			// If it's a wall, mark the cost matrix accordingly
			// and remove the tile from the queue

            if (Game.map.getTerrainAt(x, y, this.name) === 'wall') {
                mat.set(x, y, IMPASSIBLE);
                queue.splice(0,1);
                continue;
            }

			// Since this tile is not a wall and was reached by the
			// flood fill, it is connected to a room exit
			// and therefore accessible to o4's goons
            mat.set(x, y, UNSAFE);

			// Add any unchecked adjacent tiles that are not
			// blocked or ramparted to the queue
            for (dx = -1; dx < 2; dx++) {
                for (dy = -1; dy < 2; dy++) {
                    if (dx === 0 && dy === 0) {continue}
                    nx = x+dx;
                    ny = y+dy;
                    if (nx < 0 || ny < 0 || nx > 49 || ny > 49) {continue}
                    if (mat.get(nx, ny) === UNCHECKED) {
                        mat.set(nx, ny, PENDING);
                        queue.push(nx*64+ny);
                    }
                }
            }

			// Remove this tile from the queue
            queue.splice(0,1);
        }

        
		// Display matrix in room visuals for debug purposes
        for (x = 0 ; x < 50; x++) {
            for (y = 0; y < 50; y++) {
                this.visual.text(mat.get(x,y), x, y, {font:0.4});
            }
        }
        

		// Cache and return result
        this._safeArea = mat;
		return this._safeArea;
        // return this._safeArea.clone();
    }
});

*/
