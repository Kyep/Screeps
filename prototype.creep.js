Creep.prototype.getClosestHostileCreep = function() {
    return this.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {filter: function(c){ if (IS_ALLY(c.owner.username)) { return false } else { return true } } });
}

Creep.prototype.getHostileCreepsInRange = function(therange) {
    return this.pos.findInRange(FIND_HOSTILE_CREEPS, therange, {filter: function(c){ if (IS_ALLY(c.owner.username)) { return false } else { return true } } });
}

Creep.prototype.getClosestHostileStructure = function(include_public_ramparts) {
    return this.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
        filter: function(s){
            if(s.isInvincible()) {
                return false;
            }
            if (!include_public_ramparts && s.structureType == STRUCTURE_RAMPART) {
                if (s.isPublic) {
                    return false;
                }
            }
            if (s.owner) {
                if (s.owner.username) {
                    if (IS_ALLY(s.owner.username)) {
                        return false;
                    }
                }
            }
            return true;
        }
    });
}

Creep.prototype.getClosestDismantableStructure = function(include_public_ramparts) {
    var rmowner = this.room.getOwnerOrReserver();
    var target = undefined;
    if (rmowner) {
        return this.getClosestHostileStructure();
    }
    return this.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: function(s){
            if(s.isInvincible()) {
                return false;
            }
            if (!include_public_ramparts && s.structureType == STRUCTURE_RAMPART) {
                if (s.isPublic) {
                    return false;
                }
            }
            if (s.owner) {
                if (s.owner.username) {
                    if (s.owner.username == overlord) {
                        return false;
                    }
                    if (IS_ALLY(s.owner.username)) {
                        return false;
                    }
                }
            }
            return true;
        }
    });
}


Creep.prototype.getClosestHostileStructureInTypes = function(valid_types) {
    return this.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
        filter: function(s){
            if (s.isInvincible()) {
                return false
            }
            if(!valid_types.includes(s.structureType)) {
                return false; 
            }
            if (s.owner) {
                if (s.owner.username) {
                    if (IS_ALLY(s.owner.username)) {
                        return false;
                    }
                }
            }
            return true;
        }
    });
}

Creep.prototype.getClosestHostileUnRampartedStructureInTypes = function(valid_types) {
    return this.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
        filter: function(s){
            if (s.isInvincible()) {
                return false
            }
            if(valid_types.length && !valid_types.includes(s.structureType)) {
                return false; 
            }
            if(s.getRampartHP() > 0) {
                return false;
            }
            if (s.owner) {
                if (s.owner.username) {
                    if (IS_ALLY(s.owner.username)) {
                        return false;
                    }
                }
            }
            return true;
        }
    });
}

Creep.prototype.hasSetDefaults = function() {
    if (this.memory[MEMORY_INIT] == undefined) {
        return false;
    }
    return true;
}

Creep.prototype.setDefaults = function() {
    if (this.isMilitary() || this.isSiege()) {
        this.notifyWhenAttacked(false);
    }
    this.memory[MEMORY_INIT] = Game.time;
}

Creep.prototype.hideInBase = function() {
    if (!this.isAtHomeRoom()) {
        this.moveToRUP(this.getHomePos());
        this.say('🚧 hide@base!');
        return true;
    }
    var safe_flags = this.room.getFlagsByType("hideout");
    if (safe_flags.length == 0) {
        this.say('🚧 NO SAFE!');
        console.log(this.room + ':  no safespot!');
        return false;
    } else {
        this.say('🚧 safespot!');
        this.moveToRUP(safe_flags[0]);
        return true;
    }
}

Creep.prototype.announceJob = function() {
    if(this.memory[MEMORY_JOB] == undefined) {
        console.log('WARN: ' + this.name + ' has no job!');
        return -1;
    }
    this.say(this.memory[MEMORY_JOB]);
}

Creep.prototype.sleepFor = function(ticks) {
    if(this.memory[MEMORY_SLEEPFOR] == undefined) {
        this.memory[MEMORY_SLEEPFOR] = 0;
    }
    this.memory[MEMORY_SLEEPFOR] += ticks;
}


Creep.prototype.setupMemory = function() {
    if(this.memory[MEMORY_CREATED_AT] == undefined) {
        this.memory[MEMORY_CREATED_AT] = Game.time;
        //console.log('WARN: ' + this.name + ' has no created_at! Setting it to inital value of game time: ' + this.memory[MEMORY_CREATED_AT]);
    }
}

Creep.prototype.adjustEarnings = function(deposit) {
    if(this.memory[MEMORY_EARNINGS] == undefined) {
        this.memory[MEMORY_EARNINGS] = CREEP_COST(this.body) * -1;
        //console.log('WARN: ' + this.name + ' has no earnings! Setting it to inital value of creep cost: ' + this.memory[MEMORY_EARNINGS]);
    }
    this.memory[MEMORY_EARNINGS] = this.memory[MEMORY_EARNINGS] + deposit;
    if(this.memory[MEMORY_CREATED_AT] == undefined) {
        this.memory[MEMORY_CREATED_AT] = Game.time;
        //console.log('WARN: ' + this.name + ' has no created_at! Setting it to inital value of game time: ' + this.memory[MEMORY_CREATED_AT]);
    }
}

Creep.prototype.getEarnings = function() {
    this.adjustEarnings(0); 
    return (this.memory[MEMORY_EARNINGS]); 
}

Creep.prototype.getTicksAlive = function() {
    this.adjustEarnings(0); 
    return (Game.time - this.memory[MEMORY_CREATED_AT]);
}

Creep.prototype.getEarningsPerTick = function() {
    this.adjustEarnings(0); // to ensure they're defined.
    return (this.getEarnings() / this.getTicksAlive()); 
}

Creep.prototype.disableRenew = function() {
    this.memory[MEMORY_RENEW] = 0;
}

Creep.prototype.getRenewEnabled = function() {
    if (this.memory[MEMORY_RENEW] == 0) {
        return 0;
    }
    return 1;
}

Creep.prototype.getNeeded = function() {
    if (this.memory[MEMORY_NEEDED] == undefined) {
        return 1;
    }
    if (this.memory[MEMORY_NEEDED] == 0) {
        return 0;
    }
    return 1;
}

Creep.prototype.getShouldHide = function() {
    if (this.memory[MEMORY_HOME] == this.memory[MEMORY_DEST]) {
        return 0;
    }
    if (this.memory[MEMORY_ATTACKEDIN] != undefined) {
        if (global.ROOM_UNDER_ATTACK(this.memory[MEMORY_ATTACKEDIN])) {
            return 1;
        }
    }
    if (this.room.hasAlert()) {
        this.memory[MEMORY_ATTACKEDIN] = this.room.name;
        return 1;        
    }

    return 0;
}

Creep.prototype.getHomePos = function() {
    var home_x = 25;
    var home_y = 25;
    if (this.memory[MEMORY_HOME_X] != undefined && this.memory[MEMORY_HOME_Y] != undefined) {
        home_x = this.memory[MEMORY_HOME_X];
        home_y = this.memory[MEMORY_HOME_Y];
    } else if (Game.spawns[this.memory[MEMORY_SPAWNERNAME]] != undefined) {
        var thespawn = Game.spawns[this.memory[MEMORY_SPAWNERNAME]];
        this.memory[MEMORY_HOME_X] = thespawn.pos.x;
        this.memory[MEMORY_HOME_Y] = thespawn.pos.y;
    } else {
        console.log(this.name + ': has no home co-ords in JOB_TRAVEL_BACK');
    }
    return new RoomPosition(home_x, home_y, this.memory[MEMORY_HOME]);
}


Creep.prototype.getRepairMax = function() {
    if (this.room.controller == undefined) {
        return 0;
    }
    var lvl = this.room.controller.level;
    if (lvl < 3) {
        return 1000;
    } else if (lvl == 3) {
        return 10000;
    } else if (lvl == 4) {
        return 25000;
    } else if (lvl == 8) {
        return 2000000;
    } else {
        return 40000 * lvl;
    }
}

Creep.prototype.redRally = function() {
    var redflags = this.room.getFlagsByType(FLAG_RALLYMIL);
    if(redflags.length) {
        this.moveTo(redflags[0], {visualizePathStyle: {stroke: COLOR_PATROL}});
        return true;
    }
    return false;
}

Creep.prototype.isMilitary = function() {
    if (empire_defaults['military_roles'].includes(this.memory[MEMORY_ROLE])) {
        return 1;
    }
    return 0;
}

Creep.prototype.isSiege = function() {
    if (empire_defaults['siege_roles'].includes(this.memory[MEMORY_ROLE])) {
        return 1;
    }
    return 0;
}

/*
Creep.prototype.needsHealer = function() {
    if (!this.isSiege()) {
        return false;
    }
    var myhealer = this.getHealer();
    if (myhealer == undefined) {
        return true;
    }
    return false;
}

Creep.prototype.isHealer = function() {
    var heal_parts = this.getActiveBodyparts(HEAL);
    if (heal_parts == 0) {
        return false;
    }
    var attack_parts = this.getActiveBodyparts(ATTACK);
    if (attack_parts > 0) {
        return false;
    }
    var rattack_parts = this.getActiveBodyparts(RANGED_ATTACK);
    if (rattack_parts > 0) {
        return false;
    }
    return true;
}



*/
Creep.prototype.getHealer = function() {
    if (this.memory[MEMORY_HEALER] == undefined) {
        return undefined;
    }
    var healer_name = this.memory[MEMORY_HEALER];
    if (Game.creeps[healer_name] == undefined) {
        console.log(this.name + ': clearing saved healer name, as ' + healer_name + ' is apparently dead now.');
        this.memory[MEMORY_HEALER] = undefined;
        return undefined;
    }
    return Game.creeps[healer_name];
}


Creep.prototype.getTank = function() {
    if (this.memory[MEMORY_TANK] == undefined) {
        return undefined;
    }
    var tank_name = this.memory[MEMORY_TANK];
    if (Game.creeps[tank_name] == undefined) {
        console.log(this.name + ': clearing saved tank_name, as ' + tank_name + ' is apparently dead now.');
        this.memory[MEMORY_TANK] = undefined;
        return undefined;
    }
    return Game.creeps[tank_name];
}

Creep.prototype.assignTank = function() {
    var my_creeps_here = this.room.find(FIND_MY_CREEPS);
    for (var i = 0; i < my_creeps_here.length; i++) {
        var thisguy = my_creeps_here[i];
        if (thisguy == this) {
            continue;
        }
        if (!thisguy.isSiege()) {
            continue;
        }
        //console.log(this.name + ': assignTank, considering ' + thisguy.name);

        if (thisguy.getHealer() != undefined) {
            continue;
        }
        // GOOD CANDIDATE.
        this.memory[MEMORY_TANK] = thisguy.name;
        thisguy.memory[MEMORY_HEALER] = this.name;
        this.say('<3 tnk!');
        thisguy.say('<3 hlr!');
        return true;
    }
    return false;
}

Creep.prototype.avoidEdges = function() {
    if (this.pos.x == 0) {
        this.move(_.sample([TOP_RIGHT, RIGHT, BOTTOM_RIGHT]));
        return true;
    } else if (this.pos.x == 49) {
        this.move(_.sample([TOP_LEFT, LEFT, BOTTOM_LEFT]));
        return true;
    } else if (this.pos.y == 0) {
        this.move(_.sample([BOTTOM_LEFT, BOTTOM, BOTTOM_RIGHT]));
        return true;
    } else if (this.pos.y == 49) {
        this.move(_.sample([TOP_LEFT, TOP, TOP_RIGHT]));
        return true;
    }
    return false;
}

Creep.prototype.isAtDestinationRoom = function() {
    if (this.memory[MEMORY_DEST] == undefined) {
        console.log(this.name + 'checked isAtDestinationRoom with no MEMORY_DEST');
        return 1;
    }
    if (this.room.name == this.memory[MEMORY_DEST]) {
        return 1;
    }
    return 0;
}

Creep.prototype.isAtHomeRoom = function() {
    if (this.memory[MEMORY_HOME] == undefined) {
        console.log(this.name + 'checked isAtHomeRoom with no MEMORY_HOME');
        return 1;
    }
    if (this.room.name == this.memory[MEMORY_HOME]) {
        return 1;
    }
    return 0;
}

Creep.prototype.isAtDestination = function() {
    if (this.memory[MEMORY_DEST] == undefined) {
        console.log(this.name + 'checked isAtDestination with no MEMORY_DEST');
        return 1;
    }
    if (this.memory[MEMORY_DEST_X] == undefined) {
        console.log(this.name + ' checked isAtDestination with no MEMORY_DEST_X');
        return 1;
    }
    if (this.memory[MEMORY_DEST_Y] == undefined) {
        console.log(this.name + ' checked isAtDestination with no MEMORY_DEST_Y');
        return 1;
    }
    if (this.room.name != this.memory[MEMORY_DEST]) {
        return 0;
    }
    if (this.pos.x != this.memory[MEMORY_DEST_X] || this.pos.y != this.memory[MEMORY_DEST_Y]) {
        return 0;
    }
    return 1;
}

Creep.prototype.moveToRUP = function(dest, rupsteps) {
    if (rupsteps == undefined || rupsteps == 0) {
        if (this.memory[MEMORY_REUSEPATH] == undefined) {
            this.memory[MEMORY_REUSEPATH] = 15;
            if (empire_workers[this.memory[MEMORY_ROLE]] != undefined) {
                if (empire_workers[this.memory[MEMORY_ROLE]]['rup'] == undefined) {
                    return 0;
                }
                this.memory[MEMORY_REUSEPATH] = empire_workers[this.memory[MEMORY_ROLE]]['rup'];
            }
        }
        rupsteps = this.memory[MEMORY_REUSEPATH];
    }
    this.moveTo(dest, {reusePath: rupsteps});
}

Creep.prototype.moveToDestination = function() {
    if (this.memory[MEMORY_DEST] == undefined) {
        console.log(this.name + ' was ordered to moveToDestination with no MEMORY_DEST');
        return 0;
    }
    if (this.memory[MEMORY_DEST_X] == undefined) {
        console.log(this.name + ' was ordered to moveToDestination with no MEMORY_DEST_X');
        this.memory[MEMORY_DEST_X] = 25;
        return 0;
    }
    if (this.memory[MEMORY_DEST_Y] == undefined) {
        console.log(this.name + ' was ordered to moveToDestination with no MEMORY_DEST_Y');
        this.memory[MEMORY_DEST_Y] = 25;
        return 0;
    }
    if (this.isMilitary()) {
        if(this.memory[MEMORY_LAST_WAYPOINT] == undefined || this.memory[MEMORY_LAST_WAYPOINT] != this.room.name) {
            var redflags = this.room.find(FIND_FLAGS, { filter: function(flag){ if(flag.color == COLOR_RED && flag.secondaryColor == COLOR_RED) { return 1; } else { return 0; } } });
            if(redflags.length) {
                var tflag = redflags[0];
                if (this.pos.getRangeTo(tflag) > 2) {
                    this.moveTo(tflag);
                    return 1;
                } else {
                    this.memory[MEMORY_LAST_WAYPOINT] = this.room.name;
                }
            } else {
                this.memory[MEMORY_LAST_WAYPOINT] = this.room.name;
            }
        }
    }
    var dest_room = this.memory[MEMORY_DEST];
    var dest_x = this.memory[MEMORY_DEST_X];
    var dest_y = this.memory[MEMORY_DEST_Y];
    this.moveToRUP(new RoomPosition(dest_x, dest_y, dest_room));

    return 1;
}

Creep.prototype.moveToHome = function() {
    if (this.memory[MEMORY_HOME] == undefined) {
        console.log(this.name + ' was ordered to moveToHome with no MEMORY_HOME');
        return 0;
    }
    if (this.memory[MEMORY_HOME_X] == undefined) {
        console.log(this.name + ' was ordered to moveToHome with no MEMORY_HOME_X');
        this.memory[MEMORY_HOME_X] = 25;
        return 0;
    }
    if (this.memory[MEMORY_HOME_Y] == undefined) {
        console.log(this.name + ' was ordered to moveToHome with no MEMORY_HOME_Y');
        this.memory[MEMORY_HOME_Y] = 25;
        return 0;
    }
    var home_room = this.memory[MEMORY_HOME];
    var home_x = this.memory[MEMORY_HOME_X];
    var home_y = this.memory[MEMORY_HOME_Y];
    this.moveToRUP(new RoomPosition(home_x, home_y, home_room));

    return 1;
}

Creep.prototype.updateDestination = function() {
    if (this.memory[MEMORY_NEXTDEST] == undefined) {
        return 0;
    }
    if (this.memory[MEMORY_NEXTDEST].length == 0) {
        return 0;
    }
    var redflags = this.room.find(FIND_FLAGS, { filter: function(flag){ if(flag.color == COLOR_RED && flag.secondaryColor == COLOR_RED) { return 1; } else { return 0; } } });
    if(redflags.length) {
        var theflag = redflags[0];
        var flrange = this.pos.getRangeTo(theflag);
        if (flrange > 3) {
            this.moveTo(theflag, {visualizePathStyle: {stroke: COLOR_PATROL}});
            return 1;
        }
    }
    this.memory[MEMORY_DEST] = this.memory[MEMORY_NEXTDEST][0];
    this.memory[MEMORY_NEXTDEST].shift();
    //console.log('WAYPOINT: ' + this.name + ' has reached ' + this.room.name + ', continuing on to ' + this.memory[MEMORY_DEST]);
    return 1;
}


Creep.prototype.classifyMilitaryType = function() {
    var attack_parts = this.getActiveBodyparts(ATTACK)
    var ranged_parts = this.getActiveBodyparts(RANGED_ATTACK);
    var heal_parts = this.getActiveBodyparts(HEAL);
    var work_parts = this.getActiveBodyparts(WORK);
    var total_parts = this.body.length;
    var interesting_parts = attack_parts + ranged_parts + heal_parts;
    if (attack_parts > 0 && attack_parts >= (ranged_parts + heal_parts)) {
        return ATTACK;
    } else if (ranged_parts > 0 && ranged_parts >= (attack_parts + heal_parts)) {
        return RANGED_ATTACK;
    } else if (heal_parts > 0 && heal_parts >= (attack_parts + ranged_parts)) {
        return HEAL;
    } else if (work_parts > 0) {
        return WORK;
    } else {
        return MOVE;
    }
}

/*
Creep.prototype.isFullSpeed = function() {
    // assumes no roads.
    var move_parts = this.getActiveBodyparts(MOVE);
    var total_parts = this.body.length;
    var move_factor = move_parts / total_parts;
    if (move_factor >= 0.5) {
        return 1;
    } else {
        return 0;
    }
}
Creep.prototype.isKiter = function() {
    var move_factor = this.getMoveSpeed();
    if (move_factor < 1) {
        return 0;
    }
    var ranged_parts = this.getActiveBodyparts(RANGED_ATTACK);
    var tough_parts = this.getActiveBodyparts(TOUGH);
    var move_parts = this.getActiveBodyparts(MOVE);
    var total_parts = this.body.length;
    var interesting_parts = total_parts - (tough_parts + move_parts);
    if (ranged_parts > (interesting_parts * 0.5)) {
        return 1;
    }
    return 0;
}
*/

Creep.prototype.getTargetPriority = function() {
    var heal_parts = this.getActiveBodyparts(HEAL);
    var attack_parts = this.getActiveBodyparts(ATTACK);
    var ranged_parts = this.getActiveBodyparts(RANGED_ATTACK);
    var dps = ((attack_parts * ATTACK_POWER) + (ranged_parts * RANGED_ATTACK_POWER));
    var hps = (heal_parts * HEAL_POWER);
    var hp = this.hits;
    var threat = dps + hps;
    return threat / hp;
}

Creep.prototype.isBoosted = function() {
    var boosted_parts = 0;
    for (var i = 0; i < this.body.length; i++) {
        if (this.body[i][1] != undefined) {
            boosted_parts++;
            console.log(creep.name + ': is boosted with: ' + this.body[i][1]);
        }
    }
    return boosted_parts;
}

Creep.prototype.getStructuresInDist = function(dradius) {
    var top = global.ROOM_CLAMP_COORD(this.pos.y - dradius);
    var left = global.ROOM_CLAMP_COORD(this.pos.x - dradius);
    var bottom = global.ROOM_CLAMP_COORD(this.pos.y + dradius);
    var right =  global.ROOM_CLAMP_COORD(this.pos.x + dradius);
    var nearby_structures = this.room.lookForAtArea(LOOK_STRUCTURES, top, left, bottom, right, true);
    //console.log(this.name + ': at ' + this.pos.x + ',' + this.pos.y + ': gSID between ' + top + ',' + left + ' and ' + bottom + ',' + right + ' returns count: ' + nearby_structures.length);
    //this.say('rect!');
    return nearby_structures;
}

Creep.prototype.pointStructuresInDist = function(dradius) {
    var nearby = this.getStructuresInDist(dradius);
    for (var i = 0; i < nearby.length; i++) {
        console.log(JSON.stringify(nearby[i]));
        new RoomVisual(this.room.name).line(this.pos.x, this.pos.y, nearby[i].x, nearby[i].y);
    }
}

Creep.prototype.getDropsInDist = function(dradius) {
    var top = global.ROOM_CLAMP_COORD(this.pos.y - dradius);
    var left = global.ROOM_CLAMP_COORD(this.pos.x - dradius);
    var bottom = global.ROOM_CLAMP_COORD(this.pos.y + dradius);
    var right =  global.ROOM_CLAMP_COORD(this.pos.x + dradius);
    var nearby_drops = this.room.lookForAtArea(LOOK_RESOURCES, top, left, bottom, right, true);
    return nearby_drops;
}

Creep.prototype.createRoadIfNone = function() {
    if (this.memory[MEMORY_ATTACKEDAT] != undefined) {
        var ticks_ago = Game.time - this.memory[MEMORY_ATTACKEDAT];
        if (ticks_ago < 100) {
            return -1;
        }
    }
    this.memory['checkroad'] = false;
    var can_drop_site = global.CAN_CREATE_CSITE();
    if (can_drop_site) {
        var objects_here = this.room.lookAt(this);
        var roads_here = 0;
        for (var i = 0; i < objects_here.length; i++) {
            if (objects_here[i].structureType == STRUCTURE_ROAD) {
                roads_here++;
            }    
        }
        if (!roads_here) {
            Game.rooms[this.room.name].createConstructionSite(this.pos.x, this.pos.y, STRUCTURE_ROAD);
            console.log(this.name + ': CREATED ROAD at ' + this.room.name + ': ' + this.pos.x + ',' + this.pos.y);
            this.memory['checkroad'] = true;
        }
    }
}
