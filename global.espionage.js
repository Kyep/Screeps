
global.ANY_OBSERVER_IN_RANGE = function(tgt_room) {
    var available_observers = global.LIST_OBSERVERS();
    for (var i = 0; i < available_observers.length; i++) {
        var obsrange = Game.map.getRoomLinearDistance(available_observers[i].room.name, tgt_room);
        //console.log(available_observers[i].room.name + ' v ' + tgt_room + ' = ' + obsrange);
        if (obsrange <= OBSERVER_RANGE) {
            return 1;
        }
    }
    return 0;
}


global.LIST_OBSERVERS = function() {
    var available_observers = [];
    for(var id in Game.structures){
        if(Game.structures[id].structureType == STRUCTURE_OBSERVER){
            if (!Game.structures[id].isActive()) {
                continue;
            }
            //console.log('OBSERVER: OK in ' + Game.structures[id].room.name);
            available_observers.push(Game.structures[id]);
        }
    }
    return available_observers;
}

global.ASSIGN_OBSERVERS = function(available_observers, target_rooms) {
    var spy_count = 0;
    var already_spied = []
    for (var i = 0; i < available_observers.length; i++) {
        for (var t = 0; t < target_rooms.length; t++) {
            var this_target = target_rooms[t];
            if (already_spied.includes(this_target)) {
                continue;
            }
            var obsrange = Game.map.getRoomLinearDistance(available_observers[i].room.name, this_target);
            if (obsrange > OBSERVER_RANGE) {
                continue;
            }
            var result = available_observers[i].observeRoom(this_target);
            already_spied.push(this_target);
            //console.log('OBS: observer in ' + available_observers[i].room.name + ' now observing ' + this_target + ' with result: ' + result);
            spy_count++;
            break;
        }
    }
    return spy_count;
}

global.UPDATE_OBSERVERS = function() {

    var available_observers = _.shuffle(global.LIST_OBSERVERS());
    var espionage_targets = _.shuffle(global.ESPIONAGE_LIST_TARGETS());
    var rooms_to_observe = [];
    var rtc = EXPANSION_GETROOM();
    if (rtc) {
        rooms_to_observe.push(rtc);
    }
    rooms_to_observe = rooms_to_observe.concat(ESPIONAGE_LIST_CANARIES());
    if (espionage_targets.length) {
        var retval = global.ASSIGN_OBSERVERS(available_observers, espionage_targets);
        return retval;
    }
    var retval = global.ASSIGN_OBSERVERS(available_observers, rooms_to_observe);
    return retval;
}

global.ESPIONAGE_CREATE_TARGETS = function() {
	var start_x = 31;
	var end_x = 60;
	var start_y = 1;
	var end_y = 29;
	if (Game.shard.name == 'vsrv2') {
	    start_x = 1;
	    end_x = 17;
	    start_y = 1;
	    end_y = 9;
	}
	var espionage_targets = [];
	for (var i = start_x; i < end_x; i++) {
		for (var j = start_y; j < end_y; j++) {
			var this_target = 'W' + i + 'S' + j;
			if (ANY_OBSERVER_IN_RANGE(this_target)) {
                espionage_targets.push(this_target);
			    //console.log('added: ' + this_target);
			} else {
			    //console.log('cannot add (no range): ' + this_target);
			}
		}
	}
	return espionage_targets;
}

global.ESPIONAGE_LIST_TARGETS = function() {
    if (Memory[MEMORY_GLOBAL_ESPIONAGE] == undefined) {
        Memory[MEMORY_GLOBAL_ESPIONAGE] = {}
    }
    if (Memory[MEMORY_GLOBAL_ESPIONAGE]['targets'] == undefined) {
        Memory[MEMORY_GLOBAL_ESPIONAGE]['targets'] = []
    }
	return Memory[MEMORY_GLOBAL_ESPIONAGE]['targets'];
}

global.ESPIONAGE_LIST_CANARIES = function() {
    if (Memory[MEMORY_GLOBAL_ESPIONAGE] == undefined) {
        Memory[MEMORY_GLOBAL_ESPIONAGE] = {}
    }
    if (Memory[MEMORY_GLOBAL_ESPIONAGE]['canaries'] == undefined) {
        Memory[MEMORY_GLOBAL_ESPIONAGE]['canaries'] = []
    }
	return Memory[MEMORY_GLOBAL_ESPIONAGE]['canaries'];
}

global.ESPIONAGE_SET_TARGETS = function(thelist) {
	Memory[MEMORY_GLOBAL_ESPIONAGE]['targets'] = thelist;
}

global.ESPIONAGE_ADD_TARGET = function(thetarget) {
    var all_targets = global.ESPIONAGE_LIST_TARGETS();
    var index = all_targets.indexOf(thetarget);
    if (index === -1) {
        all_targets.push(thetarget);
        ESPIONAGE_SET_TARGETS(all_targets);
        return true;
    }
    return false;
}

global.ESPIONAGE_REMOVE_TARGET = function(thetarget) {
    var all_targets = global.ESPIONAGE_LIST_TARGETS();
    var index = all_targets.indexOf(thetarget);
    if (index != -1) {
        all_targets.splice(index, 1);
        global.ESPIONAGE_SET_TARGETS(all_targets);
    }
	return Memory[MEMORY_GLOBAL_ESPIONAGE]['targets'];
}

global.ESPIONAGE_GET_TARGET = function() {
    var all_targets = Memory[MEMORY_GLOBAL_ESPIONAGE]['targets'];
    if (all_targets.length == 0) {
        return undefined;
    }
    return _.sample(all_targets);
}

global.ESPIONAGE_REGEN_TARGETS = function() {
    Memory[MEMORY_GLOBAL_ESPIONAGE] = {}
    Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'] = {}
    Memory[MEMORY_GLOBAL_ESPIONAGE]['fob'] = {}
    var new_target_list = _.shuffle(global.ESPIONAGE_CREATE_TARGETS());
    global.ESPIONAGE_SET_TARGETS(new_target_list);
    console.log('ESPIONAGE: REGEN: ' + new_target_list.length + ' targets identified');
}

global.ESPIONAGE_LIST_FOBS = function() {
    if (Memory[MEMORY_GLOBAL_ESPIONAGE]['fob'] == undefined) {
        return undefined;
    }
    for (var fobname in Memory[MEMORY_GLOBAL_ESPIONAGE]['fob']) {
        console.log('ESPIONAGE FOB: ' + fobname + ' -> ' + JSON.stringify(Memory[MEMORY_GLOBAL_ESPIONAGE]['fob'][fobname]));
    }
    return Memory[MEMORY_GLOBAL_ESPIONAGE]['fob'];
}

global.ESPIONAGE_GET_ROOM = function(rname) {
    if (rname == undefined) {
        return defined;
    }
    if (Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]) {
        return Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname];
    }
    return undefined;
}

global.ESPIONAGE_SHOW_ROOM = function(rname) {
    var ei = ESPIONAGE_GET_ROOM(rname);
    if (!ei) {
        var target_list = ESPIONAGE_LIST_TARGETS();
        var t_i = target_list.indexOf(rname);
        console.log(rname + ': index ' + t_i + ' in targets list.');
    }
    return JSON.stringify(ei);
}

global.ESPIONAGE_ATTACK_PLANS = function(spawn_units, spawn_signers) {
    
    var attacker_limit = 1;
    var drainer_limit = 1;
    var cleaner_limit = 1;
    
    var range_limit = 5;
    
    if (Memory[MEMORY_GLOBAL_ESPIONAGE]['fob'] == undefined) {
        return false;
    }
    var fobs = Memory[MEMORY_GLOBAL_ESPIONAGE]['fob'];
    //console.log(JSON.stringify(fobs));
    for (var fobname in fobs) {
        console.log(fobname + ':');
        
        for (var i = 0; i < fobs[fobname].length; i++) {
            var tgt = fobs[fobname][i];
            var einfo = Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][tgt];
            if (!einfo) {
                console.log('- ATTACK PLAN: ' + fobname + ' -> ' + tgt + ': could not find einfo for the latter');
                continue;
            }

            var fbase = undefined;
            if (Game.rooms[fobname] != undefined) {
                fbase = Game.rooms[fobname];
            }

            if (!einfo['enemy_structures']) {
                if (fbase) {
                    if (einfo['needs_siege'] && ESPIONAGE_GET_MYCREEP_COUNT_IN_ROOM(tgt, 'siege') == 0) {
                        if(spawn_units) {
                            var created = fbase.createUnit('siege', tgt);
                            console.log(' -> ' + tgt + ' (' + einfo['level'] + '), siege: ' + created);
                        } else {
                            console.log(' -> ' + tgt + ' (' + einfo['level'] + '), WOULD send siege.');
                        }
                    } else if (spawn_signers && einfo['needs_signing'] && ESPIONAGE_GET_MYCREEP_COUNT_IN_ROOM(tgt, 'signer') == 0) {
                        var created = fbase.createUnit('signer', tgt);
                        console.log(' -> ' + tgt + ' (' + einfo['level'] + '), signer: ' + created);
                    } else if (einfo['needs_atk'] && ESPIONAGE_GET_MYCREEP_COUNT_IN_ROOM(tgt, 'siege') == 0) {
                        if(spawn_units) {
                            var created = fbase.createUnit('rogue', tgt);
                            console.log(' -> ' + tgt + ' (' + einfo['level'] + '), rogue: ' + created);
                        } else {
                            console.log(' -> ' + tgt + ' (' + einfo['level'] + '), WOULD send siege.');
                        }
                    } else if ((!einfo['allied'] || einfo['myremote']) && einfo['lootable_structures'] > 0 && einfo['spawn_dist'] <= 1 && ESPIONAGE_GET_MYCREEP_COUNT_IN_ROOM(tgt, 'dismantler') < 3) {
                        //if(spawn_units) {
                            var created = fbase.createUnit('dismantler', tgt);
                            console.log(' -> ' + tgt + ' (' + einfo['level'] + '), dismantler: ' + created);
                        //} else {
                        //    console.log(' -> ' + tgt + ' (' + einfo['level'] + '), WOULD send dismantler.');
                        //}
                    }
                }
                continue;
            }

            if (einfo['spawn_dist'] >= range_limit) {
                //console.log('- ATTACK PLAN: ' + fobname + ' -> ' + tgt + ': range ' + einfo['spawn_dist'] + ' over distance.');
                continue;
            }

            var ostring = '-';
            if (einfo['owner']) {
                ostring = einfo['owner'];
            }

            var count_my_creeps = ESPIONAGE_GET_MYCREEP_COUNT_IN_ROOM(tgt);
            var groundzero_flag = GET_NUKE_FLAG_IN_ROOM(tgt);
            var gz_flag_info = '';
            if (groundzero_flag) {
                gz_flag_info = 'Nuclear target flag: ' + groundzero_flag.pos;
                if(IS_NUKABLE(tgt, true)) {
                    gz_flag_info += ' (NUKABLE)';
                }
            }

            if (einfo['allied']) {
                // do nothing, ally room.
            } else if (einfo['safemode_until'] && einfo['safemode_until'] > Game.time) {
                console.log(' -> ' + tgt + ' (' + einfo['level'] + '), ' + einfo['enemy_structures'] + ' targets ' + 
                    einfo['spawn_dist'] + ' rooms away, owned by ' + ostring + '. ' + einfo['enemy_spawns']  + ' spawners. (SAFEMODE, NOT ATTACKABLE)'  + gz_flag_info );
            } else if (einfo['missiles'] != undefined && einfo['missiles'].length > 0) {
                var nuke_locs = []
                for (var m = 0; m < einfo['missiles'].length; m++) {
                    nuke_locs.push(einfo['missiles'][m][0] + '/' + einfo['missiles'][m][1]);
                }
                var nuke_locs_string = nuke_locs.join(', ');
                console.log(' -> ' + tgt + ' (' + einfo['level'] + '), ' + einfo['enemy_structures'] + ' targets ' + 
                    einfo['spawn_dist'] + ' rooms away, owned by ' + ostring + '. ' + einfo['enemy_spawns']  + ' spawners, ' + nuke_locs.length + ' incoming nukes at: ' + nuke_locs_string);
            } else if (einfo['enemy_spawns'] && einfo['level'] >= 1) {
                console.log(' -> ' + tgt + ' (' + einfo['level'] + '), ' + einfo['enemy_structures'] + ' targets ' + 
                    einfo['spawn_dist'] + ' rooms away, owned by ' + ostring + '. ' + einfo['enemy_spawns']  + ' spawners. '  + gz_flag_info );
            } else if (einfo['enemy_towers']) {
                console.log(' -> ' + tgt + ' (' + einfo['level'] + '), ' + einfo['enemy_structures'] + ' targets ' 
                    + einfo['spawn_dist'] + ' rooms away, owned by ' + ostring + '. Spawn drainers as it has towers only. '  + count_my_creeps + '/' + drainer_limit + ' assigned.');
                if(fbase && spawn_units && count_my_creeps < drainer_limit) {
                    var created = fbase.createUnit('drainerbig', tgt);
                    console.log('SPAWNED: ' + created);
                }
            } else if (einfo['reserver']) {
                // Ignore... not worth our time to fuss over.
            } else if (spawn_units && fbase && count_my_creeps < cleaner_limit) {
                console.log(' -> ' + tgt + ' (' + einfo['level'] + '), ' + einfo['enemy_structures'] + ' targets ' 
                + einfo['spawn_dist'] + ' rooms away, owned by ' + ostring + '. Cleanup junk room. '  + count_my_creeps + '/' + cleaner_limit + ' assigned.');
                var stype = 'siege';
                if (einfo['enemy_creeps'] > 0) {
                    stype = 'boss';
                }
                var created = fbase.createUnit(stype, tgt);
                console.log('SPAWNED: ' + created);
            } 
        }
    }
}

global.ESPIONAGE_GET_MYCREEP_COUNT_IN_ROOM = function(rname, roletext) {
    if(!rname) {
        return undefined;
    }
    var crnum = 0;
    for (var crname in Game.creeps) {
        var cr = Game.creeps[crname];
        if (cr.memory[MEMORY_DEST] != rname) {
            continue;
        }
        if (roletext != undefined) {
            if (cr.memory[MEMORY_ROLE] != roletext) {
                continue;
            }
        }
        crnum++;
    }
    
    return crnum;
}

global.ESPIONAGE = function() {
    if (Memory[MEMORY_GLOBAL_ESPIONAGE] == undefined) {
        Memory[MEMORY_GLOBAL_ESPIONAGE] = {}
        global.ESPIONAGE_REGEN_TARGETS();
    }
    if (Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'] == undefined) {
        Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'] = {}
    }
    if (Memory[MEMORY_GLOBAL_ESPIONAGE]['fob'] == undefined) {
        Memory[MEMORY_GLOBAL_ESPIONAGE]['fob'] = {}
    }

    var canary_list = global.ESPIONAGE_LIST_CANARIES();
    var bases = global.LIST_BASES();
    for (var i = 0; i < canary_list.length; i++) {
        if (Game.rooms[canary_list[i]]) {
            var hostiles = Game.rooms[canary_list[i]].getHostileCreeps();
            //console.log('canary ' + canary_list[i] + ' H: ' + hostiles.length);
            if (hostiles.length) {
                for (var j = 0; j < bases.length; j++) {
                    if (Game.map.getRoomLinearDistance(canary_list[i], bases[j]) < 7) {
                        if (Game.time % 10 === 0) {
                            console.log('Canary: hostiles in ' + canary_list[i] + ' would trigger an alert in ' + bases[j]);
                        }
                        Game.rooms[bases[j]].memory[MEMORY_LAST_PLAYER_ATTACK] = Game.time;
                    }    
                }
            }
        }
    }

    var target_list = global.ESPIONAGE_LIST_TARGETS();
    var num_processed = 0;
    var levels_added = 0;
    var max_per_tick = 15; // do not attempt to recreate data for more than this many rooms per tick.
    for (var rname in Game.rooms) {
        if (target_list.indexOf(rname) != -1) {
            //console.log('ESPIONAGE: scoring ' + rname);
            var theroom = Game.rooms[rname];
            Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname] = {}

            Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['allied'] = false;
            var rowner = theroom.getOwnerOrReserver();
            if(rowner) {
                Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['owner'] = rowner;
                if(IS_ENEMY(rowner) && rname != 'W52S2') {
                    Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['wartarget'] = true;
                    var alertmsg = 'Detected warget ' + rowner + ' owns ' + rname + '!'; 
                    console.log(alertmsg);
                    Game.notify(alertmsg);
                    
                }
                if (IS_ALLY(rowner)) {
                    Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['allied'] = true;
                }
            }
            var signed_by_me = false;
            if (theroom.controller) {
                if (theroom.controller.reservation) {
                    Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['reserver'] = theroom.controller.reservation.username;
                }
                if (theroom.controller.sign && theroom.controller.sign.username == overlord && theroom.controller.sign.text == empire_defaults['sign'] && theroom.controller.sign.time > (Game.time - 400000)) {
                    signed_by_me = true;
                }
                if (theroom.controller.safeMode) {
                    Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['safemode_until'] = Game.time + theroom.controller.safeMode;
                }
            }
            var all_sources = theroom.find(FIND_SOURCES);
            Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['scount'] = all_sources.length;
            if (theroom.isRemote()) {
                Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['myremote'] = true;
            }

            var enemy_structures = theroom.getHostileStructures();
            var enemy_csites = theroom.getHostileConstructionSites();
            var lootable_structures = theroom.getDismanteableStructures();
            
            var enemy_creeps = theroom.getHostileCreeps();
            Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['enemy_structures'] = enemy_structures.length;
            Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['enemy_csites'] = enemy_csites.length;
            Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['enemy_creeps'] = enemy_creeps.length;
            Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['enemy_towers'] = 0;
            Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['enemy_spawns'] = 0;
            
            Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['lootable_structures'] = lootable_structures.length;

            var rlvl = theroom.getLevel();

            Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['spawn_from'] = undefined;
            Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['spawn_dist'] = 999;
            for (var sname in Game.rooms) {
                if (Game.rooms[sname].isMine()) {
                    var this_dist = Game.map.getRoomLinearDistance(sname, rname);
                    if ((sname == rname || this_dist > 0) && this_dist <= 10 && this_dist < Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['spawn_dist']) {
                        Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['spawn_from'] = sname;
                        Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['spawn_dist'] = this_dist;
                    }
                }
            }
            if (Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['spawn_from'] != undefined) {
                var sfrom = Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['spawn_from'];
                if (Memory[MEMORY_GLOBAL_ESPIONAGE]['fob'][sfrom] == undefined) {
                    Memory[MEMORY_GLOBAL_ESPIONAGE]['fob'][sfrom] = [];
                }
                Memory[MEMORY_GLOBAL_ESPIONAGE]['fob'][sfrom].push(rname);
            }
            // Auto-gen for nearby rooms
            if (Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['spawn_dist'] < 3 && Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['enemy_structures'] == 0) {
                if (theroom.controller && !signed_by_me) {
                    if (theroom.isMine() || !Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['allied']) {
                        Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['needs_signing'] = true;
                    }
                }
                if (Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['enemy_csites'] > 0) {
                    Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['needs_siege'] = true;
                }
            }
            
            if(enemy_structures.length) {
                
                theroom.generateFlags();
                
                var enemy_spawns = [];
                for(var i = 0; i < enemy_structures.length; i++) {
                    if (rlvl >= 3 && enemy_structures[i].structureType == STRUCTURE_TOWER) {
                        if(enemy_structures[i].energy > 0) {
                            Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['enemy_towers']++;
                        }
                    }
                    if (enemy_structures[i].structureType == STRUCTURE_SPAWN) {
                        Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['enemy_spawns']++;
                        enemy_spawns.push(enemy_structures[i]);
                    }
                }
            }
            var nuke_list = theroom.find(FIND_NUKES);
            if (nuke_list.length > 0) {
                for (var i = 0; i < nuke_list.length; i++) {
                    if (Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['missiles'] == undefined) {
                        Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['missiles'] = []
                    }
                    Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['missiles'].push([nuke_list[i].pos.x,nuke_list[i].pos.y]);
                }
            }
            Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['level'] = rlvl;
            Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]['last_update'] = Game.time;

            if(!theroom.isMine() && enemy_structures.length) {
                //console.log('ESPIONAGE: saved room ' + rname + ' (' + num_processed + '/' + target_list.length + '): ' + JSON.stringify(Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][rname]));
            }
            if (theroom.inEmpire()) {
                var rconf = theroom.getConfig();
                if (!rconf) {
                    theroom.fullUpdate();
                }
            }

            ESPIONAGE_REMOVE_TARGET(rname);
            num_processed++;
            if (num_processed >= max_per_tick) {
                break;
            }
        }
    }
    //console.log('ESPIONAGE: processed ' + num_processed + '/' + target_list.length + ', adding: ' + levels_added);
    //console.log('ESPIONAGE: ' + JSON.stringify(Memory[MEMORY_GLOBAL_ESPIONAGE]));
}
