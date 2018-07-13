"use strict";

Creep.prototype.wasteEnemyTime = function() {
    
    if(!this.isAtDestinationRoom()){
        this.moveToDestination();
        return;
    } else if (this.updateDestination()) {
        return;
    }
    var enemies = this.room.getHostileCreeps();
    if (enemies.length) {
        var myfoe = this.pos.findClosestByRange(enemies);
        var pfobj = PathFinder.search(this.pos, {'pos': myfoe.pos, 'range': 3}, {'flee': true});
        var pfpath = pfobj['path'];
        var pflength = pfpath.length;
        if (pflength > 0) {
            this.moveByPath(pfpath);
        }
    } else if (this.redRally()) {
        return; // Siege creeps rallying to a flag won't do anything else!
    }
}

Creep.prototype.safeMoveToTarget = function(tgt) {
    this.safeMoveToPos(tgt.pos);
}

Creep.prototype.safeMoveToPos = function(dest, opts) {
    if (!(dest instanceof RoomPosition)) return ERR_INVALID_ARGS;
    PathFinder.use(true);
    let aPath = this.room.findPath(this.pos, dest, {range: 1, maxRooms: 1,
        costCallback: function(roomName, costMatrix) {
            if (_.isUndefined(global.costMatrixes)) {
                global.costMatrixes = [];
            }
            if (_.isUndefined(global.costMatrixes[roomName])) {
                let ccRoom = Game.rooms[roomName];
                if (!ccRoom) {
                    console.log(this.name + " safeMoveTo room name failure!");
                    return costMatrix;
                }
                let myRamparts = ccRoom.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_RAMPART}});
                if (myRamparts.length > 0) {
                    for (let cmr = (myRamparts.length-1); cmr >= 0; cmr--) {
                        if (!myRamparts[cmr].internal) {
                            let theCost = 50 + (myRamparts[cmr].pos.getRangeTo(dest)*50);
                            costMatrix.set(myRamparts[cmr].pos.x,myRamparts[cmr].pos.y, theCost);
                            //console.log(myRamparts[cmr].pos.x,myRamparts[cmr].pos.y, theCost);
                        }
                    }
                }
                global.costMatrixes[roomName] = costMatrix.clone();
            } else {
                costMatrix = global.costMatrixes[roomName];
            }
            return costMatrix;
        }
    });
    return this.moveByPath(aPath);
}

Creep.prototype.safeMoveToEnemy = function(enemy) {
    let ramparts = _.filter(this.room.lookForAt(LOOK_STRUCTURES,this.pos), (struct) => (struct.structureType == STRUCTURE_RAMPART));
    var eRange = this.pos.getRangeTo(enemy);
    if (eRange > 1) {
        if (enemy.pos.x == 0) enemy.pos.x = 1;
        if (enemy.pos.y == 0) enemy.pos.y = 1;
        if (enemy.pos.x == 49) enemy.pos.x = 48;
        if (enemy.pos.y == 49) enemy.pos.y = 49;
        if ((ramparts.length == 0) && (true)) {
            this.safeMoveToPos(enemy.pos);
        } else {
            if ((ramparts.length > 0) && (true) && (eRange > 3)) {
                if (ramparts[0].internal) {
                    this.safeMoveToPos(enemy.pos);
                } else {
                    this.safeMoveToPos(Game.spawns[this.room.memory.spawns[0]].pos);
                }
            } else if (false) {
                this.moveTo(enemy, {maxRooms: 1});
            }
        }
        if (this.getActiveBodyparts(HEAL)) this.heal(this);
    } else {
        if (ramparts.length == 0) this.moveTo(enemy, {maxRooms: 1});
        //if (this.getActiveBodyparts(HEAL)) this.rangedHeal(creep);
    }
}