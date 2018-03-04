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
                spn.memory[MEMORY_SPAWNINGROLE] = undefined;
                spn.memory[MEMORY_SPAWNINGDEST] = undefined;
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
            SPAWN_VALIDATED(spn, spawn_queue[spawnername]['sname'], spawn_queue[spawnername]['partlist'], crmemory);
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
        if (!rconfig) {
            continue;
        }
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
                    }
                    var this_pri = 2500; // max.
                    if (rconfig && rconfig['assignments'] && rconfig['assignments'][sname] && rconfig['assignments'][sname]['pri']) {
                        this_pri = rconfig['assignments'][sname]['pri'];
                    } else {
                        console.log('No PRI: ' + JSON.stringify(rconfig['assignments'][sname]));
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
    return spawner_data;
}
