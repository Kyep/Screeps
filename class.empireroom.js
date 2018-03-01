"use strict";

// New 3/1/2018 code for abstracting the management of empire rooms

global.GET_ROOM_CONFIG = function(rname) {
    if (!Memory.rooms[rname] || !Memory.rooms[rname][MEMORY_RCONFIG]) {
        return undefined;
    }
    return Memory.rooms[rname][MEMORY_RCONFIG];
}

global.SHOW_ROOM_CONFIG = function(rname) {
    console.log(JSON.stringify(GET_ROOM_CONFIG(rname)));
}

global.ADD_ROOM_KEY_ASSIGNMENT = function(rconfig, sourceidorkey, ass_object, priority) {
    // rconfig = this.setSourceAssignment(rconfig, '1111key1111', { 'sharvester': 1});
    if (!rconfig || !sourceidorkey || !ass_object || !priority) {
        return rconfig;
    }
    if (rconfig['assignments'] == undefined) {
        console.log('ADD_ROOM_KEY_ASSIGNMENT warning - called with no rconfig to set: ' + sourceidorkey + '/' + JSON.stringify(ass_object));
        return rconfig;
    }
    if (rconfig['assignments'][sourceidorkey] == undefined) {
        rconfig['assignments'][sourceidorkey] = {'ass': {}, 'pri': priority}
    }
    for (var skey in ass_object) {
        rconfig['assignments'][sourceidorkey]['ass'][skey] = ass_object[skey];
    }
    return rconfig;
}

global.GET_STEPS_TO_SOURCE = function(rname, sid) {
    if (Memory.rooms[rname] 
        && Memory.rooms[rname][MEMORY_RCONFIG]
        && Memory.rooms[rname][MEMORY_RCONFIG]['sources']
        && Memory.rooms[rname][MEMORY_RCONFIG]['sources'][sid]
        && Memory.rooms[rname][MEMORY_RCONFIG]['sources'][sid]['steps']
    ) {
        return Memory.rooms[rname][MEMORY_RCONFIG]['sources'][sid]['steps'];
    }
    return undefined;
}


global.GET_SPAWN_QUEUE = function(report_summary) {
    
    var combined = {}
    for (var rname in Memory.rooms) {
        var rconfig = Memory.rooms[rname][MEMORY_RCONFIG];
        if (!rconfig) {
            continue;
        }
        var assigned = rconfig['assignments'];
        if (!assigned) {
            continue;
        }
        combined[rname] = {}
        var under_attack = ROOM_UNDER_ATTACK(rname);
        for (var skey in assigned) {
            if (!combined[rname][skey]) {
                combined[rname][skey] = {}
            }
            for (var srole in assigned[skey]['ass']) {
                if (under_attack && !empire_defaults['military_roles'].includes(srole) && !empire_defaults['priority_roles'].includes(srole) ) {
                    continue;
                }
                if (!combined[rname][skey][srole]) { 
                    combined[rname][skey][srole] = {'int': assigned[skey]['ass'][srole], 'liv': 0, 'need': assigned[skey]['ass'][srole]}; 
                }
            }
        }
    }
    for (var crname in Game.creeps) {
        var cr = Game.creeps[crname];
        var crdest = cr.memory[MEMORY_DEST];
        var crsource = cr.memory[MEMORY_SOURCE];
        var crrole = cr.memory[MEMORY_ROLE];
        if (!crdest || !crsource || !crrole) {
            continue;
        }
        if (!combined[crdest]) { combined[crdest] = {} }
        if (!combined[crdest][crsource]) { combined[crdest][crsource] = {} }
        if (!combined[crdest][crsource][crrole]) { combined[crdest][crsource][crrole] = {'int': 0, 'liv': 0, 'need': 0}; }
        combined[crdest][crsource][crrole]['liv']++;
        if (combined[crdest] && combined[crdest][crsource] && combined[crdest][crsource][crrole]['need'] > 0) {
            cr.memory[MEMORY_NEEDED] = true;
            combined[crdest][crsource][crrole]['need']--;
        } else {
            cr.memory[MEMORY_NEEDED] = false;
        }
    }

    var advised_spawns = {}
    for (var rname in combined) {
        var r_messages = []
        var rconfig = Memory.rooms[rname][MEMORY_RCONFIG];
        var spawn_room = rconfig['spawn_room'];
    	for (var sname in combined[rname]) {
    	    var s_messages = []
            var stext = sname;
            if (stext.length > 20) {
                stext = sname.slice(-3);
            }
            for (var role in combined[rname][sname]) {

                var comp = combined[rname][sname][role];
                var compstring = comp['liv'] + '/' + comp['int'];
                if (comp['liv'] < comp['int']) {
                    compstring = '<font color="red">' + comp['liv'] + '</font>/' + comp['int'];
                    if (spawn_room != undefined) {
                        if (!advised_spawns[spawn_room]) { advised_spawns[spawn_room] = {} }
                        if (!advised_spawns[spawn_room][rname]) { advised_spawns[spawn_room][rname] = {} }
                        if (!advised_spawns[spawn_room][rname][sname]) { advised_spawns[spawn_room][rname][sname] = {} }
                        if (!advised_spawns[spawn_room][rname][sname][role]) { advised_spawns[spawn_room][rname][sname][role] = 0; }
                        advised_spawns[spawn_room][rname][sname][role]++;
                    }
                } else if (comp['liv'] > comp['int']) {
                    compstring = '<font color="yellow">' + comp['liv'] + '</font>/' + comp['int'];
                }
                var rtext = role;
                if (empire_defaults['military_roles'].includes(role) || empire_defaults['priority_roles'].includes(role) ) {
                    rtext = '<font color="purple">' + role + '</font>';
                }
                
                s_messages.push(rtext + ': ' + compstring);
            }
            r_messages.push(stext + ': ' + s_messages.join(', '));
    	}
    	if (report_summary) {
        	console.log(rname + ': ' + r_messages.join(' '));
    	}
    }
    

    var spawner_data = {}
    //console.log(JSON.stringify(advised_spawns));
    for (var pname in advised_spawns) {
        THIS_SPAWN_ROOM:
        for (var rname in advised_spawns[pname]) {
        	var gsapfr = GET_SPAWNER_AND_PSTATUS_FOR_ROOM(rname);
        	var spawner = gsapfr[0];
        	var using_primary = gsapfr[1];
        	if (spawner == undefined) {
        		break;
        	}
        	var home_room = spawner.room.name;
            var renew_allowed = 1;
            var rconfig = Memory.rooms[rname][MEMORY_RCONFIG];
            var spawn_room = rconfig['spawn_room'];
            if (!using_primary) {
        		home_room = spawn_room;
        		if (Game.rooms[rname] && Game.rooms[rname].getLevel() < 5) {
        		    renew_allowed = 0;
        		}
        	}
        	var spawned_something = false;
        	for (var sname in advised_spawns[pname][rname]) {
                for (var role in advised_spawns[pname][rname][sname]) {
                    if (empire_workers[role] == undefined) {
                        console.log(spawner.name + ': UNDEFINED ROLE: ' + role);
                        continue;
                    }
                    //console.log(rname + '(' + sname + ') short ' + advised_spawns[pname][rname][sname][role] + ' of ' + role);
                    var rbap = spawner.getRoleBodyAndProperties(role, rname, skey);
                    var partlist = rbap['body'];
                    if(rbap['renew_allowed'] == 0) {
                        renew_allowed = 0;
                    }
                    var thecost = global.UNIT_COST(partlist);
                    if (spawner.room.energyAvailable < thecost) {
                        continue;
                    }
                    var stext = sname;
                    if (stext.length > 20) {
                        stext = sname.slice(-3);
                    }
                    var dest_x = 25;
                    var dest_y = 25;
                    if (rconfig.sources[sname] != undefined) {
                        if (rconfig.sources[sname]['x'] != undefined) { dest_x = rconfig.sources[sname]['x']; }
                        if (rconfig.sources[sname]['y'] != undefined) { dest_y = rconfig.sources[sname]['y']; }
                        if (rconfig.sources[sname]['dest_x'] != undefined) { dest_x = rconfig.sources[sname]['dest_x']; }
                        if (rconfig.sources[sname]['dest_y'] != undefined) { dest_y = rconfig.sources[sname]['dest_y']; }
                    }
                    spawner_data[spawner.name] = {
                        'spawner': spawner.name, 'sname': stext, 'partlist': partlist, 'spawnrole': role, 'skey': sname, 'rname': rname, 
                        'thecost': thecost, 'myroomname': home_room, 'dest_x': dest_x, 'dest_y': dest_y,  
                        'renew_allowed': renew_allowed, 'nextdest': []
                    }
                    break THIS_SPAWN_ROOM;
                }
            }
        }
    }
    
    //console.log(JSON.stringify(spawner_data));
    return spawner_data;
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
    var slist = this.find(FIND_SOURCES);
    rconfig['sources'] = {}
    rconfig['assignments'] = {}
    rconfig['scount'] = slist.length;
    for (var i = 0; i < slist.length; i++) {
        var ts = slist[i];
        rconfig['sources'][ts.id] = {}
        rconfig['sources'][ts.id]['sourcename'] = i;
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
        //console.log(this.name + ': makeConfig saved: ' + JSON.stringify(rconfig));
    }
    return rconfig;
}

Room.prototype.setSourceAssignment = function(rconfig, sourceid, ass_object, steps) {
    //global.ADD_ROOM_KEY_ASSIGNMENT = function(rconfig, sourceidorkey, ass_object, priority) {
    if (!rconfig || !sourceid || !ass_object || !steps) {
        return rconfig;
    }
    rconfig = global.ADD_ROOM_KEY_ASSIGNMENT(rconfig, sourceid, ass_object, 500 - steps);
    return rconfig;
}

Room.prototype.makeAssignments = function(myconf) {
    if( myconf == undefined) {
        console.log(this.name + ': makeAssignments got asked to assign units to room without a base config');
        return myconf;
    }
    if (empire[this.name] == undefined) {
        console.log(this.name + ': makeAssignments got asked to assign units to non-empire room');
        return myconf;
    }
    myconf['assignments'] = {}
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
    } else if (rlvl > 0) {
        // We are a low-level base.
        //console.log(this.name + ': makeAssignments assigned low-level base units');
        for (var skey in myconf['sources']) {
            myconf = this.setSourceAssignment(myconf, skey, { 'fharvester': 2}, myconf['sources'][skey]['steps']); 
        }
    } else if (myconf['controller']) {
        // We are a remote mining outpost.
        //console.log(this.name + ': makeAssignments assigned remote mining units');

        var srn = myconf['spawn_room'];
        var sro = Game.rooms[srn];
        if (sro) {
            var srl = sro.getLevel();
            if (srl < 4) {
                for (var skey in myconf['sources']) {
                    myconf = this.setSourceAssignment(myconf, skey, { 'fharvester': 2}, myconf['sources'][skey]['steps']); 
                }  
            } else if (myconf['scount'] > 1) {
                var snum = 1;
                for (var skey in myconf['sources']) {
                    if (snum == 1) {
                        myconf = this.setSourceAssignment(myconf, 'reserver', { 'reserver': 1 }, myconf['sources'][skey]['steps']);
                    }
                    myconf = this.setSourceAssignment(myconf, skey, { 'c30harvester': 1, 'hauler': 2}, myconf['sources'][skey]['steps']);
                    snum++;
                }
            } else {
                for (var skey in myconf['sources']) {
                    myconf = this.setSourceAssignment(myconf, skey, { 'c15harvester': 1, 'hauler': 1}, myconf['sources'][skey]['steps']);  
                }
            }
        } else {
            console.log(this.name + ': makeAssignments could not read object spawn_room for: ' + srn);
        }
    } else {
        console.log(this.name + ': makeAssignments assigned nothing because room lacks controller.');
    }

    // Minerals
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

    // Adjust builders depending on unfinished projects.
    var projectsList = this.find(FIND_MY_CONSTRUCTION_SITES);
    if(projectsList.length > 0) {
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
    
    var energy_reserves = this.getStoredEnergy();
    var energy_class = this.classifyStoredEnergy(energy_reserves);
    myconf['energy_reserves'] = energy_reserves;
    myconf['energy_class'] = energy_class;
    
    if (rlvl >= 4 && rlvl < 8 && energy_class != ENERGY_EMPTY) {
        var upcount = Math.floor(energy_reserved / 50000);
        if (this.terminal && this.terminal.isActive() && this.terminal.store[RESOURCE_ENERGY] > 50000) {
            upcount = 6;
        }
        var upobj = {'upstorclose': upcount}
        myconf = this.setSourceAssignment(myconf, 'upgrades', upobj, 250);
    }

    // ENERGY AVAILABILITY MANAGEMENT
    if(this.energyCapacityAvailable > 0) {
        if (this.storage != undefined) {
            var rmem = this.memory;
            var max_history = empire_defaults['room_history_ticks'];
            if (rmem['energyhistory'] == undefined) {
                rmem['energyhistory'] = [];
            }
            if (rmem['energyhistory'].length >= max_history) {
                rmem['energyhistory'].pop();
            }
            rmem['energyhistory'].unshift(Game.rooms[rname].energyAvailable);
            var e_hist_total = 0;
            for (var i = 0; i < rmem['energyhistory'].length; i++) {
                e_hist_total += rmem['energyhistory'][i];
            }
            var e_hist_avg = Math.round(e_hist_total / rmem['energyhistory'].length);
            var e_hist_avg_pc = Math.round(e_hist_avg / Game.rooms[rname].energyCapacityAvailable * 100);
            if (e_hist_avg_pc < empire_defaults['room_minimum_energy_pc']) {
                var rhid = empire[rname]['roomname'];
                var mysname = rhid + '-T';
                if(empire[rname].sources[mysname] == undefined) {
                    empire[rname].sources[mysname] = { 'sourcename': mysname, 'x':20, 'y':20, 'assigned': {}, 'expected_income': 100 }
                }
                if (e_hist_avg_pc < empire_defaults['room_crit_energy_pc']) {
                    myconf = this.setSourceAssignment(myconf, 'teller', {'teller': 2}, 250);
                } else {
                    myconf = this.setSourceAssignment(myconf, 'teller', {'teller': 1}, 250);
                }
            }
            this.memory['energyhistory'] = rmem['energyhistory'];
        }
    }

    // SCAVENGER MANAGEMENT
    if(this.energyCapacityAvailable > 0) {
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
    }

    this.memory[MEMORY_RCONFIG] = myconf;
    return myconf;
}
