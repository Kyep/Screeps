"use strict";



global.CLAIM_ROOM = function(rname, primary, secondary, override) {
    if (!rname) {
        console.log('claimRoom: rname not set!');
        return false;
    }
    if (!primary) {
        console.log(rname + ': claimRoom: PRIMARY not set!');
        return false;
    }
    if (!Game.rooms[primary] || !Game.rooms[primary].isMine()) {
        if (override) {
            console.log(rname + ': claimRoom: PRIMARY does not belong to us! Allowing claim anyway as this is registering a new primary room.');
        } else {
            console.log(rname + ': claimRoom: PRIMARY does not belong to us!');
            return false;
        }
    }
    if (secondary && (!Game.rooms[secondary] || !Game.rooms[secondary].isMine())) {
        console.log(rname + ': claimRoom: SECONDARY does not belong to us!');
        return false;
    }
    Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][rname] = {}
    Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][rname]['spawn_room'] = primary;
    if (secondary) {
        Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][rname]['backup_spawn_room'] = secondary;
    }
    return true;
}

Room.prototype.isRemote = function() {
    if (!Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT]) {
        return false;
    }
    if (!Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][this.name]) {
        return false;
    }
    if (!Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][this.name]['spawn_room']) {
        return false;
    }
    if (Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][this.name]['spawn_room'] == this.name) {
        return false;
    }
    return true;
}

Room.prototype.getRemote = function() {
    var current_remotes = []
    for (var rname in Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT]) {
        if (rname == this.name) {
            continue;
        }
        if (Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][rname] && Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][rname]['spawn_room'] && Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][rname]['spawn_room'] == this.name) {
            current_remotes.push(rname);
        }
    }
    //console.log(JSON.stringify(current_remotes));
    return current_remotes;
}


Room.prototype.endNotifications = function() {
    var mys = this.find(FIND_MY_STRUCTURES);
    for (var i = 0; i < mys.length; i++) {
        var ts = mys[i];
        var res = ts.notifyWhenAttacked(false);
        console.log(ts.id + ': ' + res);
    }
}

Room.prototype.abandonRoom = function() {
    this.endNotifications();
    for (var rname in Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT]) {
        if (rname == this.name) {
            continue;
        }
        if (Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][rname]['spawn_room'] == this.name) {
            console.log(rname + ': deleted from empire, because Primary Spawn Room is being deleted');
            delete Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][rname];
            delete Memory.rooms[rname];
        } else if (Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][rname]['backup_spawn_room'] == this.name) {
            console.log(rname + ': cleared backup_spawn_room');
            delete Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][rname]['backup_spawn_room'];
        }
    }
    if (Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][this.name]) {
        console.log(this.name + ': deleted from empire');
        delete Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][this.name];
    }
    if (this.memory[MEMORY_RCONFIG]){
        delete this.memory[MEMORY_RCONFIG];
    }
    if (Memory.rooms[this.name]) {
        console.log(this.name + ': deleted room memory');
        delete Memory.rooms[this.name];
    }
    return true;
}

Room.prototype.getRepairableHP = function(blacklist, mindmg) {
    if (blacklist == undefined) {
        blacklist = [];
    }
    if (mindmg == undefined) {
        mindmg = 0;
    }
    var rlist = this.getRepairable(blacklist, mindmg);
    var total_hp = 0;
    var repairMax = this.getRepairMax();
    for (var i = 0; i < rlist.length; i++) {
        if (blacklist && blacklist.length && blacklist.includes(rlist[i].structureType)) {
            return false;
        } else if (rlist[i].structureType == STRUCTURE_WALL || rlist[i].structureType == STRUCTURE_RAMPART){
            total_hp += ((repairMax - mindmg) - rlist[i].hits);
        } else {
            total_hp += ((rlist[i].hitsMax - mindmg) - rlist[i].hits);
        }
    }
    return total_hp;
}

Room.prototype.getRepairable = function(blacklist, mindmg) {
    if (blacklist == undefined) {
        blacklist = [];
    }
    if (mindmg == undefined) {
        mindmg = 0;
    }
    var repairMax = this.getRepairMax();
    return this.find(FIND_STRUCTURES, {
        filter: function(structure){
            if (blacklist && blacklist.length && blacklist.includes(structure.structureType)) {
                return false;
            } else if(structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART){
                return (structure.hits < (repairMax - mindmg))
            } else{
                return (structure.hits < (structure.hitsMax - mindmg))
            }
        }
    });
}

Room.prototype.getRepairMax = function() {
    if (!this.isMine()) {
        return 0;
    }
    var lvl = this.getLevel();
    if (lvl < 3) {
        return 0; // no towers at this level anyway
    } else if (lvl == 3) {
        return 2000;
    } else if (lvl == 4) {
        return 5000;
    } else if (lvl == 5) {
        return 10000;
    } else if (lvl == 6) {
        return 20000;
    } else if (lvl == 7) {
        return 1000000;
    } else if (lvl == 8) {
        return 1000000; 
    }
    return 50000 * lvl;
}

Room.prototype.getMaxCarryPartsPerHauler = function() {
    if (!this.isMine()) {
        return 0;
    }
	var ebudget = (this.energyCapacityAvailable - 150); // for the work part, and the move part it requires.
	var num_blocks = Math.floor(ebudget / 150); // each block is 2 CARRY, 1 MOVE, on roads.
	var carry_parts = num_blocks * 2;
	if (carry_parts > 32) { 
	    carry_parts = 32; // plus 16 move parts (48) plus a WORK part (49) plus that work part's move part (50);
	}
	return carry_parts;
}

global.GET_ROOM_CONFIG = function(rname) {
    if (!Memory.rooms[rname] || !Memory.rooms[rname][MEMORY_RCONFIG]) {
        return undefined;
    }
    return Memory.rooms[rname][MEMORY_RCONFIG];
}

global.SHOW_ROOM_CONFIG = function(rname) {
    console.log(JSON.stringify(GET_ROOM_CONFIG(rname)));
}

global.ADD_ROOM_KEY_ASSIGNMENT = function(rconfig, sourceidorkey, ass_object, priority, overwrite) {
    if (!rconfig || !sourceidorkey || !ass_object || !priority) {
        return rconfig;
    }
    if (rconfig['assignments'] == undefined) {
        console.log('ADD_ROOM_KEY_ASSIGNMENT warning - called with no rconfig to set: ' + sourceidorkey + '/' + JSON.stringify(ass_object));
        return rconfig;
    }
    if (rconfig['assignments'][sourceidorkey] == undefined || overwrite) {
        rconfig['assignments'][sourceidorkey] = {'ass': {}, 'pri': priority}
    }
    for (var skey in ass_object) {
        rconfig['assignments'][sourceidorkey]['ass'][skey] = ass_object[skey];
    }   
    return rconfig;
}

global.GET_SOURCE_INFO = function(rname, sid) {
    if (Memory.rooms[rname] 
        && Memory.rooms[rname][MEMORY_RCONFIG]
        && Memory.rooms[rname][MEMORY_RCONFIG]['sources']
        && Memory.rooms[rname][MEMORY_RCONFIG]['sources'][sid]
    ) {
        return Memory.rooms[rname][MEMORY_RCONFIG]['sources'][sid];
    }
    return undefined;
}



Room.prototype.inEmpire = function() {
    if (Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][this.name] == undefined) {
        return false;
    }
    return true;
}



Room.prototype.getSpawnRoom = function() {
    var myconf = this.getConfig();
    if (!myconf) {
        return undefined;
    }
    return myconf['spawn_room'];
}

Room.prototype.showConfig = function() {
    var myconf = this.getConfig();
    if(myconf) {
        console.log(JSON.stringify(myconf));
        return true;
    }
    return false;
}

Room.prototype.getConfig = function() {
    var myconf = this.memory[MEMORY_RCONFIG];
    return myconf;
}

Room.prototype.createConfig = function() {
    if (!this.inEmpire()) {
        console.log('createConfig: ' + this.name + ' is not in empire.');
        return undefined;
    }
    var myconf = this.makeConfigBase(Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][this.name]['spawn_room'], Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][this.name]['backup_spawn_room']);
    if (myconf != undefined) {
        myconf = this.makeAssignments(myconf);
        return myconf;
    }
    return undefined;
}

Room.prototype.updateConfig = function() {
    var myconf = this.getConfig();
    if (!myconf) {
        myconf = this.createConfig();
    } else {
        this.makeAssignments(myconf);
    }
    return true;
}

Room.prototype.deleteConfig = function() {
    delete this.memory[MEMORY_RCONFIG];
}

Room.prototype.fullUpdate = function() {
    var myconf = this.createConfig();
    if (!myconf) {
        this.deleteConfig();
    }
    this.showConfig();
}

Room.prototype.makeConfigBase = function(spawn_room, backup_spawn_room) {
    var sproom = Game.rooms[spawn_room];
    if (!spawn_room || !sproom) {
        return undefined;
    }
    var pspawns = sproom.find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_SPAWN); } });

    var shouldupdate = true;
    var rconfig = {}
    rconfig['spawn_room'] = spawn_room;
    rconfig['backup_spawn_room'] = backup_spawn_room;
    rconfig['shortname'] = this.name.replace(/\D+/g, '');;
    var slist = this.find(FIND_SOURCES);
    rconfig['sources'] = {}
    rconfig['assignments'] = {}
    rconfig['scount'] = slist.length;
    for (var i = 0; i < slist.length; i++) {
        var ts = slist[i];
        rconfig['sources'][ts.id] = {}
        rconfig['sources'][ts.id]['shortname'] = String.fromCharCode(97+i); // a, b, c, etc.
        rconfig['sources'][ts.id]['longname'] = rconfig['shortname'] + '-' + String.fromCharCode(97+i); // a, b, c, etc.
        rconfig['sources'][ts.id]['x'] = ts['pos']['x'];
        rconfig['sources'][ts.id]['y'] = ts['pos']['y'];
        var open_slots = ts.getSlotPositions();
        rconfig['sources'][ts.id]['spaces'] = open_slots.length;
        if (pspawns.length) {
            var pfobj = PathFinder.search(pspawns[0].pos, {'pos': ts.pos, 'range': 1}, {'swampCost': 1.1});
            var pfpath = pfobj['path'];
            var pflength = pfpath.length;
            for (var j = 0; j < pfpath.length; j++) {
                var thispos = pfpath[j];
                new RoomVisual(thispos['roomName']).circle(thispos, {stroke: 'yellow'});
            }
            if (pfobj['incomplete']) {
                console.log(this.name + ': WARNING, makeConfig generated an incomplete path to source ' + ts.id);
                shouldupdate = false;
                continue;
            }
            rconfig['sources'][ts.id]['steps'] = 50;
            if (pflength > 0) {
                rconfig['sources'][ts.id]['steps'] = pflength;
            }
            var lastpos = pfpath.slice(-1)[0];
            rconfig['sources'][ts.id]['dest_x'] = lastpos['x'];
            rconfig['sources'][ts.id]['dest_y'] = lastpos['y'];
            new RoomVisual(thispos['roomName']).circle(lastpos, {radius: 0.5, stroke: 'red'});
        } else {
            rconfig['sources'][ts.id]['steps'] = 50;
            var random_slot = _.sample(open_slots);
            rconfig['sources'][ts.id]['dest_x'] = random_slot.x;
            rconfig['sources'][ts.id]['dest_y'] = random_slot.y;
        }
    }
    if (this.controller) {
        rconfig['controller'] = {'x': this.controller.pos['x'], 'y': this.controller.pos['y'] }
    } else {
        console.log(this.name + ': makeConfig saved no controller.');
    }
    var all_minerals = this.find(FIND_MINERALS);
    if (all_minerals.length) {
        rconfig['mineralid'] = all_minerals[0].id;
        rconfig['mineraltype'] = all_minerals[0].mineralType;
    }
    rconfig['lastbaseupdate'] = Game.time;
    rconfig['lastassignupdate'] = 0;
    if (shouldupdate) {
        this.memory[MEMORY_RCONFIG] = rconfig;
        console.log(this.name + ': makeConfig saved: ' + JSON.stringify(rconfig));
    }
    return rconfig;
}

Room.prototype.addSourceAssignment = function(rconfig, sourceid, ass_object, steps, overwrite) {
    if (!rconfig || !sourceid || !ass_object || !steps) {
        return rconfig;
    }
    rconfig = global.ADD_ROOM_KEY_ASSIGNMENT(rconfig, sourceid, ass_object, 1000 + steps, overwrite);
    return rconfig;
}

Room.prototype.updateAssignments = function() {
    var rconf = this.getConfig();
    if (rconf) {
        return this.makeAssignments(rconf);
    }
    return this.createConfig();
}

Room.prototype.makeAssignments = function(myconf) {
    if( myconf == undefined) {
        console.log(this.name + ': makeAssignments got asked to assign units to room without a base config');
        return myconf;
    }
    myconf['assignments'] = {}
    if (!this.inEmpire()) {
        console.log(this.name + ': makeAssignments got asked to assign units to non-empire room. Deleting all assignments.');
        this.memory[MEMORY_RCONFIG] = myconf;
        return myconf;
    }
    
    var spawn_room = myconf['spawn_room'];
    if (!spawn_room) {
        console.log(this.name + ': makeAssignments got asked to assign units here, when we have no idea of which room is our spawn!');
        return myconf;
    }
    if (!Game.rooms[spawn_room]) {
        console.log(this.name + ': makeAssignments got asked to assign units here, when have no vision of our spawn room: ' + spawn_room);
        return myconf;
    }

    var eroom = EXPANSION_GETROOM();
    if (eroom) {
        if (this.name == eroom) {
            var clobj = {'remoteconstructor': 2}
            if (!this.isMine()) {
                clobj['claimer'] = 1;
            }
            for (var skey in myconf['sources']) {
                myconf = this.addSourceAssignment(myconf, skey, clobj, 5); 
            }
            return myconf;
        }
    }

    var rlvl = this.getLevel();
    if (rlvl >= 4) {
        // We are a lvl 4-8 base
        //console.log(this.name + ': makeAssignments assigned normal base units');
        for (var skey in myconf['sources']) {
            var snum = 1;
            if (myconf['sources'][skey]['spaces'] == 1) {
                myconf = this.addSourceAssignment(myconf, skey, { 'sharvester': 1}, myconf['sources'][skey]['steps']);
            } else if (rlvl == 8) {
                myconf = this.addSourceAssignment(myconf, skey, { 'bharvester': 2 }, myconf['sources'][skey]['steps']);
                //if (snum == 1) {
                //    myconf = this.addSourceAssignment(myconf, skey, { 'bharvester': 1, 'up8': 1 }, myconf['sources'][skey]['steps']); 
                //} else {
                //    myconf = this.addSourceAssignment(myconf, skey, { 'sharvester': 1 }, myconf['sources'][skey]['steps']);
                //}
            } else {
                if (this.storage) {
                    myconf = this.addSourceAssignment(myconf, skey, { 'bharvester': 2}, myconf['sources'][skey]['steps']); 
                } else {
                    myconf = this.addSourceAssignment(myconf, skey, { 'fharvester': 2}, myconf['sources'][skey]['steps']); 
                }
            }
            snum++;
        }
    } else if (rlvl >= 2) {
        // We are a level 2-3 base
        for (var skey in myconf['sources']) {
            var n2a = 2;
            if (n2a > myconf['sources'][skey]['spaces']) {
                n2a = myconf['sources'][skey]['spaces'];
            }
            myconf = this.addSourceAssignment(myconf, skey, { 'fharvester': n2a}, myconf['sources'][skey]['steps']); 
        }
    } else if (this.isMine()) {
        // We are a level 1 base
        //console.log(this.name + ': makeAssignments assigned initial base-building units');
        for (var skey in myconf['sources']) {
            /*
            var n2a = 2;
            if (n2a > myconf['sources'][skey]['spaces']) {
                n2a = myconf['sources'][skey]['spaces'];
            }
            */
            myconf = this.addSourceAssignment(myconf, skey, { 'fharvester': 1, 'remoteconstructor': 1}, myconf['sources'][skey]['steps']); 
        }
    } else if (myconf['controller']) {
        // We are a remote mining outpost.
        //console.log(this.name + ': makeAssignments assigned remote mining units');

        var srn = myconf['spawn_room'];
        var sro = Game.rooms[srn];
        if (sro) {
            var srl = sro.getLevel();
            var max_carry = sro.getMaxCarryPartsPerHauler();
            //
            
            if (srl < 4 || !sro.storage) {
                for (var skey in myconf['sources']) {
                    myconf = this.addSourceAssignment(myconf, skey, { 'fharvester': 2}, myconf['sources'][skey]['steps']); 
                }  
                if (myconf['backup_spawn_room']) {
                    myconf = this.addSourceAssignment(myconf, 'reserver', { 'reserver': 1 }, 75);
                }
            } else if (myconf['scount'] > 1 || true) {
                var snum = 1;
                for (var skey in myconf['sources']) {

                    myconf['sources'][skey]['carry_total'] = CARRY_PARTS(3000, myconf['sources'][skey]['steps']);
                    myconf['sources'][skey]['carry_per_hauler'] = myconf['sources'][skey]['carry_total'];
                    myconf['sources'][skey]['max_carry'] = max_carry;
                    var hauler_count = 1;
                    if (myconf['sources'][skey]['carry_per_hauler'] > max_carry) {
                        hauler_count = 2;
                        myconf['sources'][skey]['carry_per_hauler'] = Math.floor(myconf['sources'][skey]['carry_per_hauler'] / 2);
                    }

                    if (snum == 1) {
                        myconf = this.addSourceAssignment(myconf, 'reserver', { 'reserver': 1 }, myconf['sources'][skey]['steps']);
                    }
                    myconf = this.addSourceAssignment(myconf, skey, { 'c30harvester': 1, 'hauler': hauler_count}, myconf['sources'][skey]['steps']);
                    snum++;
                }
            } else {
                for (var skey in myconf['sources']) {
                    myconf['sources'][skey]['carry_total'] = CARRY_PARTS(1500, myconf['sources'][skey]['steps']);
                    myconf['sources'][skey]['carry_per_hauler'] = myconf['sources'][skey]['carry_total'];
                    myconf['sources'][skey]['max_carry'] = max_carry;
                    var hauler_count = 1;
                    if (myconf['sources'][skey]['carry_per_hauler'] > max_carry) {
                        hauler_count = 2;
                        myconf['sources'][skey]['carry_per_hauler'] = Math.floor(myconf['sources'][skey]['carry_per_hauler'] / 2);
                    }
                    myconf = this.addSourceAssignment(myconf, skey, { 'c15harvester': 1, 'hauler': hauler_count}, myconf['sources'][skey]['steps']);  
                }
            }
        } else {
            console.log(this.name + ': makeAssignments could not read object spawn_room for: ' + srn);
        }
    } else {
        console.log(this.name + ': makeAssignments assigned nothing because room lacks controller.');
    }

    var spawned_builders = false;

    // Adjust builders depending on unfinished projects.

    if (Game.rooms[spawn_room] && Game.rooms[spawn_room].storage) { //  
        var projectsList = this.find(FIND_MY_CONSTRUCTION_SITES, { filter: (csite) => { return (csite.structureType != STRUCTURE_CONTAINER); } });
        var repairablehp = 0;
        if (this.isMine() && this.storage && this.storage.store[RESOURCE_ENERGY] > 100000) {
            repairablehp = this.getRepairableHP([], 0); 
        }
        if (projectsList.length > 0 || repairablehp > 50000) {
            var btype = 'builderstorage';
            if (!this.isMine()) {
                btype = 'remoteconstructor';
            } else if (!this.storage) {
                btype = 'minirc';
            }
            var newobj = {}
            newobj[btype] = 1;
            if (repairablehp > 2000000) {
                newobj[btype] = 3;
            } else if (repairablehp > 500000) {
                newobj[btype] = 2;
            }
            if (this.isMine()) {
                myconf = ADD_ROOM_KEY_ASSIGNMENT(myconf, 'BS', newobj, 1200);
            } else {
                for (var skey in myconf['sources']) {
                    var owrite = false;
                    if (myconf['scount'] == 1) {
                        owrite = true;
                    }
                    myconf = this.addSourceAssignment(myconf, skey, newobj, 1400, owrite);
                }
            }
            spawned_builders = true;
        }
    }
    
    // Base-only spawns
    if(this.isMine()) {
        
        var stuff_to_dismantle = this.getHostileStructures(true);
        if (stuff_to_dismantle.length) {
            myconf = ADD_ROOM_KEY_ASSIGNMENT(myconf, 'dismantler', {'dismantler': 3}, 1200);
        }
        
        // Mineral mining
        if (myconf['mineralid'] && rlvl >= 6) {
            var mineralpatch = Game.getObjectById(myconf['mineralid']);
            if (mineralpatch) {
                var term = this.terminal;
                if (term) {
                    var got_minerals = term.store[myconf['mineralid']];
                    if (got_minerals >= empire_defaults['mineralcap']) {
                        //console.log(rname + ' is capped on minerals with ' + got_minerals + ' > ' + empire_defaults['mineralcap']);
                    } else if (mineralpatch.mineralAmount > 0) {
                        myconf = this.addSourceAssignment(myconf, 'extractor', { 'extractor': 1}, 30);
                    }
                }
            }
        }
        
        // Upgraders
        if (!spawned_builders) {
            var total_e = 0;
            if (this.storage && this.storage.store[RESOURCE_ENERGY] && this.storage.isActive()) {
                total_e += this.storage.store[RESOURCE_ENERGY];
            }
            if (this.terminal && this.terminal.store[RESOURCE_ENERGY] && this.terminal.isActive()) {
                total_e += this.terminal.store[RESOURCE_ENERGY]
            }
            if (total_e > 50000) {
                if (rlvl == 8) {
                    var upobj = {'upstor8': 1}
                    myconf = ADD_ROOM_KEY_ASSIGNMENT(myconf, 'upstor8', upobj, 1100);
                } else {
                    var upcount = Math.floor(total_e / 40000);
                    var upobj = {'upstorclose': upcount}
                    myconf = ADD_ROOM_KEY_ASSIGNMENT(myconf, 'upgrades', upobj, 1200);
                }
            }
        }

        // Tellers
        if (this.storage && this.storage.isActive()) {
            var teller_obj = this.getEnergyHistoryAdvisedSpawns();
            if (typeof teller_obj === "object" ) {
                //console.log('this.name HAS TELLER OBJ: ' + JSON.stringify(teller_obj));
                myconf = ADD_ROOM_KEY_ASSIGNMENT(myconf, 'teller', teller_obj, -1000);
            }
        }

        // Scavengers
        if (this.storage) {
            var dropped_resources = this.find(FIND_DROPPED_RESOURCES, {filter: (s) => s.energy > 0});
            if (dropped_resources.length > 0) {
                var energy_on_ground = 0;
                for (var i = 0; i < dropped_resources.length; i++) {
                    energy_on_ground += dropped_resources[i].energy;
                }
                if (energy_on_ground > (1.5 * UNIT_COST(empire_workers['scavenger']['body']))) {
                    myconf = ADD_ROOM_KEY_ASSIGNMENT(myconf, 'scavenger', {'scavenger': 1}, 250);
                }
            }
        }
    
        // Nuke refilling
        if (this.getLevel() == 8) {
            if (this.terminal && this.terminal.store[RESOURCE_GHODIUM] && this.terminal.store[RESOURCE_GHODIUM] >= 5000) {
                var empty_silos = this.find(FIND_MY_STRUCTURES, { filter: (structure) => { return ((structure.structureType == STRUCTURE_NUKER && structure.ghodium != structure.ghodiumCapacity));}});
                if (empty_silos.length) {
                    myconf = ADD_ROOM_KEY_ASSIGNMENT(myconf, 'nuke', {'nuketech': 1}, 500);
                }
            }
        }
        
        // Energy push to level < 8 rooms
        if (this.storage && this.storage.isActive()) {
            if (this.terminal && this.terminal.isActive()) {
                if (rlvl < 8 && this.storage.store[RESOURCE_ENERGY] < 200000 && this.terminal.getEnergyAboveMinimum() >= -5000) {
                    myconf = ADD_ROOM_KEY_ASSIGNMENT(myconf, 'banker', {'banker': 2}, 700);
                } else if (rlvl == 8 && this.storage.store[RESOURCE_ENERGY] > 800000 && !this.terminal.metEnergyMax()) {
                    myconf = ADD_ROOM_KEY_ASSIGNMENT(myconf, 'banker', {'banker': 1}, 700);
                }
            } else if (rlvl == 4 || rlvl == 5) {
                if (myconf['backup_spawn_room']) {
                    myconf = ADD_ROOM_KEY_ASSIGNMENT(myconf, 'grower', {'grower': 3}, 700);
                }
            }
        }
        
        // Science
        var science_labs = Memory[MEMORY_GLOBAL_SCIENCELABS];
        for (var labid in science_labs) {
            if (science_labs[labid]['roomname'] != this.name) {
                continue;
            }
            var labobj = Game.structures[labid];
            if (labobj.needsLabTech()) {
                myconf = ADD_ROOM_KEY_ASSIGNMENT(myconf, 'labtech', {'labtech': 1}, 500);
                break;
            }
        }
    }
    myconf['lastassignupdate'] = Game.time;
    this.memory[MEMORY_RCONFIG] = myconf;
    return myconf;
}

Room.prototype.getBaseConfigAge = function() {
    var rc = this.getConfig();
    if (!rc) {
        return Number.POSITIVE_INFINITY;
    }
    var old = rc['lastassignupdate'];
    if (!old) {
        return Number.POSITIVE_INFINITY;
    }
    return Game.time - old;
}
    

Room.prototype.getAndUpdateSpawnEnergyHistory = function() {
    if(!this.isMine()) {
        return [];
    }
    if (!this.memory[MEMORY_EHISTORY]) {
        this.memory[MEMORY_EHISTORY] = [];
    }
    var ehmem = this.memory[MEMORY_EHISTORY];
    var max_history = empire_defaults['room_history_ticks'];
    if (ehmem.length >= max_history) {
        ehmem = ehmem.slice(0, max_history); // returns the first max_history elements, IE: cuts off elements beyond the maximum
    }
    ehmem.unshift(this.energyAvailable); // adds element to start of array, returns length of array.
    var e_hist_total = 0;
    for (var i = 0; i < ehmem.length; i++) {
        e_hist_total += ehmem[i];
    }
    var e_hist_avg = Math.round(e_hist_total / ehmem.length);
    var e_hist_avg_pc = Math.round(e_hist_avg / this.energyCapacityAvailable * 100);
    
    this.memory[MEMORY_EHISTORY] = ehmem;
    
    return [e_hist_avg, e_hist_avg_pc];
}

Room.prototype.getEnergyHistoryAdvisedSpawns = function() {
    if(!this.isMine()) {
        return false;
    }
    var ehistarr = this.getAndUpdateSpawnEnergyHistory();
    if (!ehistarr || ehistarr.length == 0) {
        console.log(this.name + ': getEnergyHistoryAdvisedSpawns got zero-length ehistarr');
        return false;
    }
    var rlvl = this.getLevel();
    var e_hist_avg = ehistarr[0];
    var e_hist_avg_pc = ehistarr[1];
    
    //console.log(this.name + '(' + rlvl +'): average energy: '+ e_hist_avg + ', ' + e_hist_avg_pc + '% of ' + this.energyCapacityAvailable);
    if (e_hist_avg == 300) {
        //console.log(this.name + ': emergency energy condition 1, energy == 300');
        return {'teller-mini': 2};
    } else if (e_hist_avg_pc < empire_defaults['room_crit_energy_pc']) {
        //console.log(this.name + ': emergency energy condition 2, energy pc < critlcal energy pc');
        return {'teller': 2};
    } else if (e_hist_avg_pc < empire_defaults['room_minimum_energy_pc']) {
        //console.log(this.name + ': emergency energy condition 3, energy pc < minimum energy pc');
        return {'teller': 1};
    }
    return false;
}
