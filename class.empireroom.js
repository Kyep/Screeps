"use strict";

// New 3/1/2018 code for abstracting the management of empire rooms

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
    if (empire[this.name] == undefined) {
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
    if (empire[this.name] == undefined || empire[this.name]['spawn_room'] == undefined) {
        return undefined;
    }
    var myconf = this.makeConfigBase(empire[this.name]['spawn_room'], empire[this.name]['backup_spawn_room']);
    if (myconf != undefined) {
        myconf = this.makeAssignments(myconf);
        return myconf;
    }
    return undefined;
}

Room.prototype.updateConfig = function() {
    var myconf = this.getConfig();
    if (!myconf) {
        this.createConfig();
    } else {
        this.makeAssignments(myconf);
    }
    return true;
}

Room.prototype.fullUpdate = function() {
    this.createConfig();
    this.showConfig();
}

Room.prototype.makeConfigBase = function(spawn_room, backup_spawn_room) {
    var sproom = Game.rooms[spawn_room];
    if (!spawn_room || !sproom) {
        return undefined;
    }
    var sps = sproom.find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_SPAWN); } });
    var sppri = sps[0];

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
        rconfig['sources'][ts.id]['spaces'] = ts.getSlotPositions().length;
        var pfobj = PathFinder.search(sppri.pos, {'pos': ts.pos, 'range': 1}, {'swampCost': 1.1});
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
    if (shouldupdate) {
        this.memory[MEMORY_RCONFIG] = rconfig;
        console.log(this.name + ': makeConfig saved: ' + JSON.stringify(rconfig));
    }
    return rconfig;
}

Room.prototype.setSourceAssignment = function(rconfig, sourceid, ass_object, steps) {
    if (!rconfig || !sourceid || !ass_object || !steps) {
        return rconfig;
    }
    rconfig = global.ADD_ROOM_KEY_ASSIGNMENT(rconfig, sourceid, ass_object, 1000 + steps);
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

    var rlvl = this.getLevel();
    if (rlvl > 3) {
        // We are a normal base
        //console.log(this.name + ': makeAssignments assigned normal base units');
        for (var skey in myconf['sources']) {
            var snum = 1;
            if (myconf['sources'][skey]['spaces'] == 1) {
                myconf = this.setSourceAssignment(myconf, skey, { 'sharvester': 1}, myconf['sources'][skey]['steps']);
            } else if (rlvl == 8) {
                if (snum == 1) {
                    myconf = this.setSourceAssignment(myconf, skey, { 'bharvester': 1, 'up8': 1 }, myconf['sources'][skey]['steps']); 
                } else {
                    myconf = this.setSourceAssignment(myconf, skey, { 'sharvester': 1 }, myconf['sources'][skey]['steps']);
                }
            } else {
                myconf = this.setSourceAssignment(myconf, skey, { 'bharvester': 2}, myconf['sources'][skey]['steps']); 
            }
            snum++;
        }
    } else if (rlvl == 2) {
        // We are a low-level base.
        //console.log(this.name + ': makeAssignments assigned low-level base units');
        for (var skey in myconf['sources']) {
            myconf = this.setSourceAssignment(myconf, skey, { 'fharvester': 2}, myconf['sources'][skey]['steps']); 
        }
    } else if (this.isMine()) {
        // We are a low-level base.
        //console.log(this.name + ': makeAssignments assigned initial base-building units');
        for (var skey in myconf['sources']) {
            myconf = this.setSourceAssignment(myconf, skey, { 'fharvester': 2, 'remoteconstructor': 2}, myconf['sources'][skey]['steps']); 
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
            
            if (srl < 4) {
                for (var skey in myconf['sources']) {
                    myconf = this.setSourceAssignment(myconf, skey, { 'fharvester': 2}, myconf['sources'][skey]['steps']); 
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
                        myconf = this.setSourceAssignment(myconf, 'reserver', { 'reserver': 1 }, myconf['sources'][skey]['steps']);
                    }
                    myconf = this.setSourceAssignment(myconf, skey, { 'c30harvester': 1, 'hauler': hauler_count}, myconf['sources'][skey]['steps']);
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
                    myconf = this.setSourceAssignment(myconf, skey, { 'c15harvester': 1, 'hauler': hauler_count}, myconf['sources'][skey]['steps']);  
                }
            }
        } else {
            console.log(this.name + ': makeAssignments could not read object spawn_room for: ' + srn);
        }
    } else {
        console.log(this.name + ': makeAssignments assigned nothing because room lacks controller.');
    }

    // Adjust builders depending on unfinished projects.
    var projectsList = this.find(FIND_MY_CONSTRUCTION_SITES, { filter: (csite) => { return (csite.structureType != STRUCTURE_CONTAINER); } });
    if (projectsList.length > 0) {
        var btype = 'builderstorage';
        if (!this.isMine()) {
            btype = 'remoteconstructor';
        } else if (!this.storage) {
            btype = 'minirc';
        }
        var newobj = {}
        newobj[btype] = 1;
        for (var skey in myconf['sources']) {
            if (myconf['sources'][skey]['spaces'] != 1) {
                myconf = this.setSourceAssignment(myconf, skey, newobj, 250);
            }
        }
    }
    
    // Base-only spawns
    if(this.isMine()) {
        
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
                        myconf = this.setSourceAssignment(myconf, 'extractor', { 'extractor': 1}, 30);
                    }
                }
            }
        }
        
        // Upgraderstorage
        if (rlvl >= 4 && rlvl < 8 && this.storage && this.storage[RESOURCE_ENERGY] > 100000) {
            var upcount = Math.floor(this.storage[RESOURCE_ENERGY] / 50000);
            var upobj = {'upstorclose': upcount}
            myconf = this.setSourceAssignment(myconf, 'upgrades', upobj, 250);
        }

        // Tellers
        var teller_obj = this.getEnergyHistoryAdvisedSpawns();
        if (typeof teller_obj === "object" ) {
            console.log('this.name HAS TELLER OBJ: ' + JSON.stringify(teller_obj));
            myconf = ADD_ROOM_KEY_ASSIGNMENT(myconf, 'teller', teller_obj, -1000);
        }

        // Scavengers
        var dropped_resources = this.find(FIND_DROPPED_RESOURCES, {filter: (s) => s.energy > 0});
        if (dropped_resources.length > 0) {
            var energy_on_ground = 0;
            for (var i = 0; i < dropped_resources.length; i++) {
                energy_on_ground += dropped_resources[i].energy;
            }
            if (energy_on_ground > (1.5 * UNIT_COST(empire_workers['scavenger']['body']))) {
                myconf = this.setSourceAssignment(myconf, 'scavenger', {'scavenger': 1}, 250);
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
    }

    this.memory[MEMORY_RCONFIG] = myconf;
    return myconf;
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
    
    console.log(this.name + '(' + rlvl +'): average energy: '+ e_hist_avg + ', ' + e_hist_avg_pc + '% of ' + this.energyCapacityAvailable);
    if (e_hist_avg == 300) {
        console.log(this.name + ': emergency energy condition 1, energy == 300');
        return {'teller-mini': 2};
    } else if (e_hist_avg_pc < empire_defaults['room_crit_energy_pc']) {
        console.log(this.name + ': emergency energy condition 2, energy pc < critlcal energy pc');
        return {'teller': 2};
    } else if (e_hist_avg_pc < empire_defaults['room_minimum_energy_pc']) {
        console.log(this.name + ': emergency energy condition 3, energy pc < minimum energy pc');
        return {'teller': 1};
    }
    return false;
}
