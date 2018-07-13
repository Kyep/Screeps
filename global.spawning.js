global.HANDLE_SPAWNING = function() {
    var spawn_queue = GET_SPAWN_QUEUE(GLOBALCONFIG['report_workers']);
    //console.log(JSON.stringify(spawn_queue));
    //console.log(typeof(spawn_queue));
    //console.log(JSON.stringify(Game.spawns));
    var count_spawning = 0;
    var count_waking = 0;
    var count_idle = 0;
            
    for(var spawnername in Game.spawns) {
        var spn = Game.spawns[spawnername];
        //console.log('eval ' + spawnername +': ' + JSON.stringify(spn));
        if (spn.memory[MEMORY_SPAWNINGROLE] != undefined) {
            if (spn.spawning == undefined) {
                delete spn.memory[MEMORY_SPAWNINGROLE];
                delete spn.memory[MEMORY_SPAWNINGDEST];
            } else if (empire_defaults['military_roles'].includes(spn.memory[MEMORY_SPAWNINGROLE])) {
                spn.room.visual.text(spn.spawning.remainingTime + ': ' + spn.spawning.name, spn.pos.x, spn.pos.y +1.5, {color: 'red', backgroundColor: 'white', font: 0.8});
            } else if (spn.memory[MEMORY_SPAWNINGDEST] != undefined && spn.memory[MEMORY_SPAWNINGDEST] == spn.room.name) {
                spn.room.visual.text(spn.spawning.remainingTime + ': ' + spn.spawning.name, spn.pos.x, spn.pos.y +1.5, {color: 'green', backgroundColor: 'white', font: 0.8});
            } else {
                spn.room.visual.text(spn.spawning.remainingTime + ': ' + spn.spawning.name, spn.pos.x, spn.pos.y +1.5, {color: 'blue', backgroundColor: 'white', font: 0.8});
            }
            count_spawning++;
        } else {
            count_idle++;
        }
    }
    for (var spawnername in spawn_queue) {
        var sobj = spawn_queue[spawnername];
        var spn = Game.spawns[spawnername];
        if (spn == undefined) {
            console.log(spawnername + ' not defined in game spawns');
            console.log(JSON.stringify(sobj));
        } else if (spn.room.energyAvailable >= spawn_queue[spawnername]['thecost']) {
            var crmemory = {};
            crmemory[MEMORY_ROLE] = spawn_queue[spawnername]['spawnrole'];
            crmemory[MEMORY_AISCRIPT] = spawn_queue[spawnername]['aiscript'];
            crmemory[MEMORY_SOURCE] = spawn_queue[spawnername]['skey'];
            crmemory[MEMORY_DEST] = spawn_queue[spawnername]['rname'];
            crmemory[MEMORY_DEST_X] = spawn_queue[spawnername]['dest_x'];
            crmemory[MEMORY_DEST_Y] = spawn_queue[spawnername]['dest_y'];
            crmemory[MEMORY_NEXTDEST] = spawn_queue[spawnername]['nextdest'];
            crmemory[MEMORY_HOME] = spawn_queue[spawnername]['myroomname'];
            crmemory[MEMORY_HOME_X] = spn.pos.x;
            crmemory[MEMORY_HOME_Y] = spn.pos.y;
            crmemory[MEMORY_RENEW] = spawn_queue[spawnername]['renew_allowed'];
            SPAWN_VALIDATED(spn, spawn_queue[spawnername]['partlist'], crmemory);
        } else {
            console.log(spawn_queue[spawnername]['sname'] + ': ' + spawn_queue[spawnername]['spawnrole'] + ' too expensive (' + spawn_queue[spawnername]['thecost'] + '/' + thespawner.room.energyAvailable + '), saving up.');
        }
        count_waking++;
    }
    //console.log( count_spawning + ' / ' + count_spawning + ' / ' + count_idle);
}


global.GET_SPAWN_QUEUE = function(report_summary) {
    
    var combined = {}
    for (var rname in Memory.rooms) {
        var rconfig = Memory.rooms[rname][MEMORY_RCONFIG];
        if (!rconfig) {
            continue;
        }
        var assigned = rconfig[MEMORY_RC_ASSIGNMENTS];
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
            cr.memory[MEMORY_NEEDED] = false;
            continue;
        }
        if (!cr.getRenewEnabled() && cr.memory[MEMORY_STEPS_EXPECTED] && cr.ticksToLive < (cr.memory[MEMORY_STEPS_EXPECTED] + 20)) {
            cr.memory[MEMORY_NEEDED] = false;
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
        if (!Memory.rooms[rname]) {
            continue;
        }
        var rconfig = Memory.rooms[rname][MEMORY_RCONFIG];
        if (!rconfig) {
            continue;
        }
        var spawn_room = rconfig[MEMORY_RC_PSR];
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
                    compstring = '<font color="orange">' + comp['liv'] + '</font>/' + comp['int'];
                }
                var rtext = role;
                if (empire_defaults['military_roles'].includes(role) || empire_defaults['priority_roles'].includes(role) ) {
                    rtext = '<font color="purple">' + role + '</font>';
                } else if (role == 'banker' || role == 'grower') {
                    rtext = '<font color="yellow">' + role + '</font>';
                }
                
                s_messages.push(rtext + ': ' + compstring);
            }
            r_messages.push(stext + ': ' + s_messages.join(', '));
    	}
    	if (report_summary && report_summary == rname) {
    	    var lvl = 'R';
    	    if (Game.rooms[rname] && Game.rooms[rname].getLevel() > 0) {
    	        lvl = Game.rooms[rname].getLevel();
    	    }
        	console.log(rname + '(' + lvl + '): ' + r_messages.join(' '));
    	}
    }
    //console.log(JSON.stringify(advised_spawns));

    var spawner_data = {}
    
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
            var spawn_room = rconfig[MEMORY_RC_PSR];
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
                    //console.log('GET_SPAWN_QUEUE from ' + pname + '/' + rname + ' is calling ' +  spawner.name + '(' + spawner.room.name +').RBAP(' + role + ', ' + rname + ',' + skey+') maybe should be ' + sname);
                    var rbap = spawner.getRoleBodyAndProperties(role, rname, sname);
                    var partlist = rbap['body'];
                    var aiscript = rbap['aiscript'];
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
                    } else if (rconfig[MEMORY_RC_CONTROLLER] && rconfig[MEMORY_RC_CONTROLLER]['x'] && rconfig[MEMORY_RC_CONTROLLER]['y']) {
                        dest_x = rconfig[MEMORY_RC_CONTROLLER]['x'];
                        dest_y = rconfig[MEMORY_RC_CONTROLLER]['y'];
                    }
                    var this_pri = 2500; // max.
                    if (rconfig && rconfig[MEMORY_RC_ASSIGNMENTS] && rconfig[MEMORY_RC_ASSIGNMENTS][sname] && rconfig[MEMORY_RC_ASSIGNMENTS][sname]['pri']) {
                        this_pri = rconfig[MEMORY_RC_ASSIGNMENTS][sname]['pri'];
                    } else {
                        console.log('No PRI: ' + JSON.stringify(rconfig[MEMORY_RC_ASSIGNMENTS][sname]));
                    }
                    if (spawner_data[spawner.name] != undefined) {
                        if (spawner_data[spawner.name]['priority'] < this_pri) {
                            //console.log(rname + '(' + stext + '/' + role + ') (p=' + this_pri + ') blocked by ' + spawner_data[spawner.name]['spawnrole'] + ' for ' + spawner_data[spawner.name]['rname'] 
                            //    + '(p=' + spawner_data[spawner.name]['priority'] + ')');
                            continue;
                        }
                    }
                    spawner_data[spawner.name] = {
                        'spawner': spawner.name, 'sname': stext, 'partlist': partlist, 'spawnrole': role, 'aiscript': aiscript, 'skey': sname, 'rname': rname, 
                        'thecost': thecost, 'myroomname': home_room, 'dest_x': dest_x, 'dest_y': dest_y, 'priority': this_pri,
                        'renew_allowed': renew_allowed, 'nextdest': []
                    }
                    //console.log(JSON.stringify(spawner_data));
                }
            }
        }
    }
    //console.log(JSON.stringify(spawner_data));
    return spawner_data;
}


global.VALIDATE_CREEP_MEMORY_OBJECT = function (obj) {
    if (obj == undefined) {
        console.log('VALIDATE_CREEP_MEMORY_OBJECT passed empty object');
        return false;
    }
    var req_memory = [MEMORY_ROLE, MEMORY_DEST, MEMORY_DEST_X, MEMORY_DEST_Y, MEMORY_HOME, MEMORY_HOME_X, MEMORY_HOME_Y, MEMORY_RENEW];
    for (var i = 0; i < req_memory.length; i++) {
        var this_mem = req_memory[i];
        if (obj[this_mem] == undefined) {
            console.log('VALIDATE_CREEP_MEMORY_OBJECT passed memory object lacking: ' + this_mem);
            return false;
        }
    }
    return true;
    
}

global.SPAWN_COUNT = function () {
    var sc = Memory['spawn_count'];
    if (sc == undefined || sc > 999) { sc = 0; }
    sc++;
    Memory['spawn_count'] = sc;
    return sc;
}

global.SPAWN_VALIDATED = function (spawner, bodylist, memory_object){
    var memvalid = VALIDATE_CREEP_MEMORY_OBJECT(memory_object);
    if (memvalid !== true) {
        console.log("SPAWN: failed to create: " + crnameprefix + " because memory validation failed: " + JSON.stringify(memory_object));
        return false;
    }
    var spawn_count = SPAWN_COUNT();
    var crnameprefix = memory_object[MEMORY_DEST].replace(/\D/g,'');
    var crname = crnameprefix + '_' + memory_object[MEMORY_ROLE] + '_' + spawn_count;
    if (empire_workers[memory_object[MEMORY_ROLE]] != undefined && empire_workers[memory_object[MEMORY_ROLE]]['abbr'] != undefined) {
        crname = crnameprefix + '_' + empire_workers[memory_object[MEMORY_ROLE]]['abbr'] + '_' + spawn_count;
    }
    if (Game.creeps[crname] != undefined) {
        console.log("SPAWN: failed to create: " + crname + " as that name is already taken.");
        return false;
    }
    if (memory_object[MEMORY_DEST] && memory_object[MEMORY_SOURCE]) {
        var sinfo = GET_SOURCE_INFO(memory_object[MEMORY_DEST], memory_object[MEMORY_SOURCE]);
        if (sinfo && sinfo['steps']) {
            memory_object[MEMORY_STEPS_EXPECTED] = sinfo['steps'];
        }
    }
    memory_object[MEMORY_SPAWNERNAME] = spawner.name;
    memory_object[MEMORY_SPAWNERROOM] = spawner.room.name;
    var result = spawner.spawnCreep(bodylist, crname, {memory: memory_object});
    if (result == OK) {
        spawner.memory[MEMORY_SPAWNINGROLE] = memory_object[MEMORY_ROLE];
        spawner.memory[MEMORY_SPAWNINGDEST] = memory_object[MEMORY_DEST];
        //console.log(spawner.room.name + '(' + spawner.name + '): created: ' + crname + ' -> ' + memory_object[MEMORY_DEST]);
    } else {
        console.log(spawner.room.name + '(' + spawner.name + '): (' + result + ') ' + crname + ' -> ' + memory_object[MEMORY_DEST]);
    }
    return result;
}

global.GET_SPAWNER_AND_PSTATUS_FOR_ROOM = function(theroomname, force) {
    var ourconf = global.GET_ROOM_CONFIG(theroomname);
    if (ourconf == undefined) {
        console.log('GET_SPAWNER_FOR_ROOM: undefined conf memory for ' + theroomname);
        return [undefined, 1];
    }
    if (force == undefined) {
        force = false;
    }
    // Room definitions
    var room_primary = undefined;
    if (ourconf['spawn_room'] == undefined) {
        console.log('GET_SPAWNER_FOR_ROOM: undefined or no-presence empire spawn_room for ' + theroomname);
        console.log(JSON.stringify(ourconf));
        return [undefined, 1];
    }
    if (Game.rooms[ourconf['spawn_room']] != undefined) {
        room_primary = Game.rooms[ourconf['spawn_room']];
    }

    var room_secondary = undefined;
    if (ourconf['backup_spawn_room'] != undefined && Game.rooms[ourconf['backup_spawn_room']] != undefined) {
        room_secondary = Game.rooms[ourconf['backup_spawn_room']];
    }

    // Spawner definitions
    var spawners_primary = []
    var spawners_primary_unavailable = []
    if (room_primary != undefined) {
        spawners_primary = room_primary.find(FIND_MY_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_SPAWN && structure.isAvailable(force)); } });
        spawners_primary_unavailable = room_primary.find(FIND_MY_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_SPAWN && !structure.isAvailable(force)); } });
    }

    var spawners_secondary = []
    if (room_secondary != undefined) {
        spawners_secondary = room_secondary.find(FIND_MY_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_SPAWN && structure.isAvailable(force)); } });
    }
    
    var room_primary_level = 0;
    if (spawners_primary.length > 0 && spawners_primary[0].room != undefined) {
        if (spawners_primary[0].room.controller != undefined) {
            if (spawners_primary[0].room.controller.level != undefined) {
                room_primary_level = spawners_primary[0].room.controller.level;
            }
        }
    }
    var spawners_secondary_preferred = 0;
    var spawners_secondary_allowed = 1;
    if (room_primary_level < 5) {
        spawners_secondary_preferred = 1;
    } else if (room_primary_level > 5) {
        //spawners_secondary_allowed = 0;
    }
    //console.log('GET_SPAWNER_FOR_ROOM: ' + theroomname + ': ' + spawners_primary.length + '/' + (spawners_primary.length + spawners_primary_unavailable.length) + ' primary, ' + spawners_secondary.length + ' secondary. Secondary pref: ' + spawners_secondary_preferred);
    if (spawners_primary.length && (!spawners_secondary_preferred || global.ROOM_UNDER_ATTACK(theroomname))) {
        // If we have a primary available, and we have no specific reason to use a secondary, use the primary.
        //console.log('GET_SPAWNER_FOR_ROOM: (A) primary available, no backup preference: ' + theroomname);
        return [spawners_primary[0], 1];
    }
    
    if (spawners_secondary.length && spawners_secondary_allowed) {
        // If we have a primary available, and we have no specific reason to use a secondary, use the primary.
        //console.log('GET_SPAWNER_FOR_ROOM: (B) primary unavailable, or preference for backup: ' + theroomname);
        return [spawners_secondary[0], 0];
    }
    
    if (spawners_primary.length) {
        // If we have a primary available, and we have no specific reason to use a secondary, use the primary.
        //console.log('GET_SPAWNER_FOR_ROOM: (C) primary available, preference for backup ignored as none available: ' + theroomname);
        return [spawners_primary[0], 1];
    }
    
    //console.log('GET_SPAWNER_FOR_ROOM: (D) no primary or backups available: ' + theroomname);
    return [undefined, 1];

}

