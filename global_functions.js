


global.CONSTRUCT_BODY = function (bdetails) {
    var partlist = [];
    var part_types = Object.getOwnPropertyNames(bdetails);
    //console.log('CONSTRUCT_BODY: ' + JSON.stringify(bdetails) + ' -> ' + part_types);
    for (var i = 0; i < part_types.length; i++) {
        var this_type = part_types[i];
        var this_amount = bdetails[this_type];
        for (var j = 0; j < this_amount; j++) {
            partlist.push(this_type.toLowerCase());
        }
    }
    return partlist;
}

global.LAB_STATUS = function() {
    console.log(JSON.stringify(Memory['ongoing_reactions']));
    console.log(JSON.stringify(Memory['assigned_labs']));
}

global.RESET_ALL_LABS = function() {
    Memory['ongoing_reactions'] = {}
    Memory['assigned_labs'] = {}
    for (var crname in Game.creeps) {
        var crmem = Game.creeps[crname].memory
        if (crmem[MEMORY_ROLE] == "labtech") {
            if (crmem[MEMORY_JOB] == "fill_lab") {
                crmem[MEMORY_JOB] = "idle";
            }
        }
    }
}

global.UNIT_COST = function (thebody) {
    var total_cost = 0;
    for(var i = 0; i < thebody.length; i++) {
        var this_part = thebody[i].toLowerCase();
        if (BODYPART_COST[this_part] == undefined) {
            console.log('UNIT_COST: unknown bodypart: ' + this_part);
        } else {
            total_cost += BODYPART_COST[this_part];
        }
    }
    return total_cost;
}

//global.UNIT_COST = (body) => _.sum(body, p => BODYPART_COST[p]);
global.CREEP_COST = (body) => _.sum(body, p => BODYPART_COST[p.type])

global.CAN_CREATE_CSITE = function () {
    var all_csites = Game.constructionSites;
    var auto_csite_limit = MAX_CONSTRUCTION_SITES - 30;
    //console.log('current csites: ' + Object.keys(all_csites).length + ', cap: ' + auto_csite_limit);
    if (Object.keys(all_csites).length >= auto_csite_limit) {
        return 0;
    }
    return 1
}

global.DESTROY_ALL_CSITES = function () {
    var all_csites = Game.constructionSites;
    for (var site_key in all_csites) {
        if (all_csites[site_key].structureType != STRUCTURE_ROAD) {
            continue;
        }
        all_csites[site_key].remove();
    }
}

global.ROOM_CLAMP_COORD = function (value) {
  if (value < 0) {
    return 0;
  }
  if (value > 49) {
    return 49;
  }
  return value;
}

global.TEMPLATE_PROPERTIES = function (template_name) {
    if ( empire_workers[template_name] == undefined) {
        console.log('Invalid role');
        return 0;
    }
    if ( empire_workers[template_name]['body'] == undefined) {
        console.log('Invalid role');
        return 0;
    }
    
    var thebody = empire_workers[template_name]['body'];
    var retval = {}
    retval['cost'] = global.UNIT_COST(thebody);
    //retval['parts'] = thebody;
    
    var attack_parts = 0;
    var ranged_attack_parts = 0;
    var heal_parts = 0;
    
    for (var i = 0; i < thebody.length; i++) {
        if (thebody[i] == ATTACK) {
            attack_parts++;
        }
        if (thebody[i] == RANGED_ATTACK) {
            ranged_attack_parts++;
        }
        if (thebody[i] == HEAL) {
            heal_parts++;
        }
    }
    if (attack_parts > 0) {
        var dps = attack_parts * ATTACK_POWER;
        retval['dps'] = dps;
    }
    if (ranged_attack_parts > 0) {
        var ranged_dps = ranged_attack_parts * RANGED_ATTACK_POWER;
        retval['ranged_dps'] = ranged_dps;
    }
    if (heal_parts > 0) {
        var hps = heal_parts * HEAL_POWER;
        retval['hps'] = hps;
    }
    retval['parts'] = thebody;
    console.log(JSON.stringify(retval));
    return retval;
}


global.CARRY_PARTS = (capacity, steps) => Math.ceil(capacity / ENERGY_REGEN_TIME * 2 * steps / CARRY_CAPACITY);
global.CONSTRUCT_HAULER_BODY = function (roomid, sourceid, max_cost) {
    var sourcecapacity = 1500;
    var steps = 100;
    if (empire[roomid] != undefined) {
        if (empire[roomid].sources != undefined) {
            if (empire[roomid].sources[sourceid] != undefined) {
                if (empire[roomid].sources[sourceid]['capacity'] != undefined) {
                    sourcecapacity = empire[roomid].sources[sourceid]['capacity'];
                }
                if (empire[roomid].sources[sourceid]['steps'] != undefined) {
                    steps = empire[roomid].sources[sourceid]['steps'];
                } else {
                    console.log('Warning: CONSTRUCT_HAULER_BODY is creating a hauler for room ' + roomid + ' using a source that no steps value defined: ' + sourceid);
                }
            } else {
                console.log('Warning: CONSTRUCT_HAULER_BODY is creating a hauler for room ' + roomid + ' using a source that does not exist: ' + sourceid);
            }
        } else {
            console.log('Warning: CONSTRUCT_HAULER_BODY is creating a hauler for a room with no sources in its empire definition: ' + roomid);
        }
    } else {
        console.log('Warning: CONSTRUCT_HAULER_BODY is creating a hauler for a room not defined in empire: ' + roomid);
    }
    //console.log('S: ' + sourcecapacity + ' Y: ' + steps);
    var carry_parts = global.CARRY_PARTS(sourcecapacity, steps);
    var partlist = [WORK, MOVE];
    for (var i = 0; i < Math.floor(carry_parts / 2); i++) {
        if ((UNIT_COST(partlist) + UNIT_COST([CARRY, CARRY, MOVE])) > max_cost) {
            console.log(empire[roomid]['roomname'] + ': Trying to build a hauler of ' + ((carry_parts / 2) - i) + ' bigger size than our spawner allows. Capping it.');
            break;
        }
        partlist.push(CARRY);
        partlist.push(CARRY);
        partlist.push(MOVE);
    }
    return partlist;
}


global.CONSTRUCT_RESERVER_BODY = function (resticksremaining, maxroomenergy) {
    if (resticksremaining > 2000 || maxroomenergy < 1300) {
        return [MOVE, CLAIM];
    } else {
        return [MOVE, MOVE, CLAIM, CLAIM];
    }
}


global.REFRESH_CREEPS = function() {
    for (var cr in Game.creeps) {
       Game.creeps[cr].disableRenew(); 
    }
}

global.SPAWN_UNIT = function (spawnername, role, targetroomname, roompath, homeroom) {
    if (Game.spawns[spawnername] == undefined) {
        console.log('No such spawner.');
        return 0;
    }
    if (homeroom == undefined) {
        homeroom = Game.spawns[spawnername].room.name;
    }
    if ( empire_workers[role] == undefined) {
        console.log('Invalid role');
        return 0;
    }
    if ( empire_workers[role]['noresize'] != undefined) {
        if ( empire_workers[role]['noresize'] == 1) {
            console.log('That role requires resizing.');
            return 0;
        }        
    }
    if (roompath == undefined) {
        roompath = [];
    }
    var the_spawner = Game.spawns[spawnername];
    var rbap = the_spawner.getRoleBodyAndProperties(role);
    var partlist = rbap['body'];
    var renew_allowed = rbap['renew_allowed'];
    var result = SPAWNCUSTOM(Game.spawns[spawnername], '', partlist, role, 
                        '', targetroomname, global.UNIT_COST(empire_workers[role]['body']), 
                        homeroom, 25, 
                        25, 0, roompath);
    return result;
}



global.SPAWNCUSTOM = function (spawner, sname, partlist, roletext, sourcetext, targettext, thecost, homesector, target_x, target_y, renew_allowed, nextdest){
    if (Memory['spawn_count'] == undefined) {
        Memory['spawn_count'] = 0;
    }
    if (Memory['spawn_count'] > 999) {
        Memory['spawn_count'] = 0;
    }
    var crname = sname + '_' + roletext + '_' + Memory['spawn_count'];
    if(empire_workers[roletext] != undefined && empire_workers[roletext]['abbr'] != undefined) {
        crname = sname + '_' + empire_workers[roletext]['abbr'] + '_' + Memory['spawn_count'];
    }
    if (Game.creeps[crname] != undefined) {
        console.log("SPAWN: failed to create: " + crname + " as that name is already taken.");
        Memory['spawn_count'] += 1;
        return -1;
    }
    var crmemory = {};
    crmemory[MEMORY_ROLE] = roletext;
    crmemory[MEMORY_SOURCE] = sourcetext;
    crmemory[MEMORY_DEST] = targettext;
    crmemory[MEMORY_HOME] = homesector;
    crmemory[MEMORY_HOME_X] = spawner.pos.x;
    crmemory[MEMORY_HOME_Y] = spawner.pos.y;
    crmemory[MEMORY_DEST_X] = target_x;
    crmemory[MEMORY_DEST_Y] = target_y;
    crmemory[MEMORY_SPAWNERNAME] = spawner.name;
    crmemory[MEMORY_SPAWNERROOM] = spawner.room.name;
    crmemory[MEMORY_RENEW] = renew_allowed;
    crmemory[MEMORY_NEXTDEST] = nextdest;
    var result = spawner.createCreep(partlist, crname, crmemory);
    //console.log(spawner.name + ': (' + result + ') for ' + crname + ' and ' + partlist + ' and ' + crmemory);

    Memory['spawn_count'] += 1;
    return result;
}



global.GET_SPAWNER_AND_PSTATUS_FOR_ROOM = function(theroomname) {
    if (empire[theroomname] == undefined) {
        console.log('GET_SPAWNER_FOR_ROOM: undefined empire block for ' + theroomname);
        return [undefined, 1];
    }

    // Room definitions
    var room_primary = undefined;
    if (empire[theroomname]['spawn_room'] == undefined) {
        console.log('GET_SPAWNER_FOR_ROOM: undefined or no-presence empire spawn_room for ' + theroomname);
        return [undefined, 1];
    }
    if (Game.rooms[empire[theroomname]['spawn_room']] != undefined) {
        room_primary = Game.rooms[empire[theroomname]['spawn_room']];
    }

    var room_secondary = undefined;
    if (empire[theroomname]['backup_spawn_room'] != undefined && Game.rooms[empire[theroomname]['backup_spawn_room']] != undefined) {
        room_secondary = Game.rooms[empire[theroomname]['backup_spawn_room']];
    }

    // Spawner definitions
    var spawners_primary = []
    var spawners_primary_unavailable = []
    if (room_primary != undefined) {
        spawners_primary = room_primary.find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_SPAWN && structure.isAvailable()); } });
        spawners_primary_unavailable = room_primary.find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_SPAWN && !structure.isAvailable()); } });
    }

    var spawners_secondary = []
    if (room_secondary != undefined) {
        spawners_secondary = room_secondary.find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_SPAWN && structure.isAvailable()); } });
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
    if (room_primary_level > 0 && room_primary_level < 5) {
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

global.DELETE_OLD_ORDERS = function() {
    var my_orders = Game.market.orders;
    for (var thisorder in my_orders) {
        if (my_orders[thisorder]['remainingAmount'] != 0) {
            continue;
        }
        if (my_orders[thisorder]['active'] != false) {
            continue;
        }
        if (my_orders[thisorder]['amount'] != 0) {
            continue;
        }
        console.log('DELETE OLD ORDER: Room ' + my_orders[thisorder]['roomName'] + ', id ' + my_orders[thisorder]['id'] + ', rA ' + my_orders[thisorder]['remainingAmount']);
        Game.market.cancelOrder(my_orders[thisorder]['id']);
    }
}

global.UPDATE_MARKET_ORDERS = function() {
    
    global.DELETE_OLD_ORDERS();
    
    var terminal_energy_sell = empire_defaults['terminal_energy_sell'];
    
    
    for (var rname in Game.rooms) {
        if (Game.rooms[rname].terminal == undefined) {
            continue;
        }
        if (Game.rooms[rname].terminal.cooldown > 0) {
            continue;
        }
        if (!Game.rooms[rname].terminal.isActive()) {
            continue;
        }
        if (Game.rooms[rname].controller == undefined) {
            continue;
        }
        if (Game.rooms[rname].controller.owner == undefined) {
            continue;
        }
        if (Game.rooms[rname].controller.owner.username != overlord) {
            continue;
        }
        if (empire[rname] == undefined) {
            continue;
        }
        if (empire[rname]['mineraltype'] == undefined) {
            continue;
        }
        var mtype = empire[rname]['mineraltype'];
        if(Game.rooms[rname].terminal.store[mtype] == undefined || Game.rooms[rname].terminal.store[mtype] == undefined || Game.rooms[rname].terminal.store[mtype] < 30000) {
            //console.log('MARKET: ' + rname + ': has <1k of sale mineral: ' + mtype);
            continue;
        }

        Game.rooms[rname].sellResource(mtype);
        
        var rlvl = Game.rooms[rname].getLevel();
        if (rlvl == 8 && Game.rooms[rname].terminal.store[RESOURCE_ENERGY] && Game.rooms[rname].terminal.store[RESOURCE_ENERGY] > terminal_energy_sell) {
            Game.rooms[rname].sellResource(RESOURCE_ENERGY);
        }
        
    }
    return 'OK';
}


global.SHARE_SPARE_ENERGY = function() {
    
    var terminal_energy_share = empire_defaults['terminal_energy_share'];
    
    if (Memory['energy_share_dests'] == undefined) {
        console.log('SHARE_SPARE_ENERGY: energy_share_dests is undefined');
        return;
    }
    if (Memory['energy_share_dest_index'] == undefined) {
        Memory['energy_share_dest_index'] = 0;
        console.log('SHARE_SPARE_ENERGY: energy_share_dest_index is undefined');
        return;
    }
    var send_targets = Memory['energy_share_dests'];
    if (send_targets.length == 0) {
        console.log('SHARE_SPARE_ENERGY: energy_share_dests is 0-length');
        return;
    }
    var dindex = Memory['energy_share_dest_index'];
    if (dindex >= (send_targets.length - 1)) {
        dindex = 0;
    } else {
        dindex++;
    }
    Memory['energy_share_dest_index'] = dindex;
    
    //var send_to = _.sample(send_targets);
    var send_to = send_targets[dindex];
    console.log('Share: sending energy to ' + send_to);

    if (Game.rooms[send_to] != undefined) {
        console.log('SHARE_SPARE_ENERGY: we have vision of: ' + send_to);
        if (Game.rooms[send_to].terminal == undefined) {
            console.log('SHARE_SPARE_ENERGY: ' + send_to + ' has no terminal.');
            return;
        }
        var storage_used = _.sum(Game.rooms[send_to].terminal.store);
        var storage_capacity = Game.rooms[send_to].terminal.storeCapacity;
        var storage_free = storage_capacity - storage_used;
        if (storage_free < 100000) {
            console.log('SHARE_SPARE_ENERGY: ' + send_to + ' is too full (only ' + storage_free + ' free) to accept more energy.');
            return;
        }
    }
    
    for (var rname in Game.rooms) {
        var lvl = Game.rooms[rname].getLevel();
        if (lvl < 5) {
            //console.log('SHARE_SPARE_ENERGY: ' + rname + ' has too low level ' + lvl);
            continue;
        }
        if (!Game.rooms[rname].hasTerminalNetwork()) {
            console.log('SHARE_SPARE_ENERGY: ' + rname + ' has no terminal network');
            continue;
        }
        var e_stored = Game.rooms[rname].getStoredEnergy();
        var e_class = Game.rooms[rname].classifyStoredEnergy(e_stored);
        if (e_class != ENERGY_FULL) {
            console.log('SHARE_SPARE_ENERGY: ' + rname + ' is not full on energy');
            continue;
        }
        var amount_to_send = 10000;
        var term = Game.rooms[rname].terminal;
        if (term.cooldown > 0) {
            console.log('SHARE_SPARE_ENERGY: ' + rname + ' is on terminal cooldown for: ' + term.cooldown);
            continue;
        }
        if (term.store[RESOURCE_ENERGY] < terminal_energy_share) {
            console.log('SHARE_SPARE_ENERGY: ' + rname + ' has energy (' + term.store[RESOURCE_ENERGY] + ') < terminal_energy_share ('+ terminal_energy_share +')');
            continue;
        }
        if (term.store[RESOURCE_ENERGY] < amount_to_send) {
            console.log('SHARE_SPARE_ENERGY: ' + rname + ' does not have enough energy to send.');
            continue;
        }
        var result = term.send(RESOURCE_ENERGY, amount_to_send, send_to);
        if (result == OK) {
            if (Memory['energy_shared'] == undefined) {
                Memory['energy_shared'] = amount_to_send;
            } else {
                Memory['energy_shared'] += amount_to_send;
            }
            var total_k_shared = Memory['energy_shared'] / 1000;
            console.log('SHARE_SPARE_ENERGY: ' + rname + ': OK' + ' (total sent: ' + total_k_shared + 'k )');
        } else {
            console.log('SHARE_SPARE_ENERGY: ' + rname + ': ' + result);
        }
    }   
}


global.ROOM_UNDER_ATTACK = function(roomname) {
    var myalert = Memory['sectors_under_attack'][roomname];
    if (myalert == undefined) {
        return 0;
    }
    return 1;
}

global.HANDLE_ALL_ROOM_ALERTS = function() {
    for (var thisname in Memory['sectors_under_attack']) {
        global.HANDLE_ROOM_ALERT(thisname);
    }
}

global.HANDLE_ROOM_ALERT = function(roomname) {
    var myalert = Memory['sectors_under_attack'][roomname];

    if (myalert == undefined) {
        console.log('ERROR: TRYING TO HANDLE NON-EXISTENT ALERT FOR ' + roomname);
        return;
    }
    if (myalert['updateCount'] == undefined || myalert['updateCount'] < 1) {
        console.log('HANDLE_ROOM_ALERT: skipping alert as its not been updated with threat data yet: ' + roomname);
        return;
    }
    var baseforce = {};
    var patrolforce = {};
    var room_has_spawn = 0;
    for (var thisspawn in Game.spawns) {
        if (Game.spawns[thisspawn].room.name == roomname) {
            room_has_spawn = 1;
        }
    }
    var towercount = 0;
    if (Game.rooms[roomname] != undefined) {
        var towerlist = Game.rooms[roomname].find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } } );
        towercount = towerlist.length;
    }
    var try_safemode = 0;
    if(room_has_spawn) {
        var newcount = Game.rooms[roomname].getMyStructuresCount();
        var oldcount = myalert['myStructureCount'];
        if (newcount < oldcount) {
            try_safemode = 1;
        }
    }

    if (try_safemode) {
        var cc = Game.rooms[roomname].controller;
        var is_in_safemode = 0;
        if (cc.safeMode != undefined && cc.safeMode > 0) {
            is_in_safemode = cc.safeMode;
        }
        if (is_in_safemode > 0) {
            // nothing.
        } else if (cc.safeModeAvailable) {
            //cc.activateSafeMode();
            Game.notify('!!!!! WOULD SAFEMODE ACTIVATION: ' + roomname);
            console.log('SAFE MODE ACTIVATED: ATTACK: ' + roomname);
        } else {
            Game.notify('!!!!! CANNOT ACTIVATE SAFEMODE: ' + roomname);
            console.log('SAFE MODE UNAVAILABLE: ATTACK: ' + roomname);
        }
    }
    var theirthreat = myalert['hostileCost'];
    var alert_age = Game.time - myalert['attackStart'];
    if (towercount > 0) {
        if (myalert['hostileUsername'] == 'Invader' && alert_age < 120) {
            theirthreat -= (1000 * towercount);
        }
        if (Game.rooms[roomname] != undefined && Game.rooms[roomname].storage != undefined) {
            baseforce['teller-towers'] = 1;
            if (theirthreat > 15000) {
                baseforce['teller-towers'] = 2;
                baseforce['teller'] = 2;
            } else if (theirthreat > 8000) {
                baseforce['teller'] = 1;
            }
        }
    }
    if (empire[roomname]['spawn_room'] == undefined) {
        console.log('ATTACK CONFIG WARNING, SECTOR ' + roomname + ' HAS NO spawn_room SET ON ITS ROOM!');
        patrolforce['rogue'] = 1; // the sad default.
    } else if (theirthreat > 0) {
        var gsapfr = GET_SPAWNER_AND_PSTATUS_FOR_ROOM(roomname);
        var spawner = gsapfr[0];
        var using_primary = gsapfr[1];
        if (spawner == undefined) {
            //console.log('XAT: ' + roomname + " has no free 1x spawner");
            return;
        }
        var home_room = spawner.room.name;
        if (!using_primary && empire[roomname]['spawn_room'] != undefined) {
            home_room = empire[roomname]['spawn_room'];
        }
        if (spawner == undefined) {
            //console.log('XAT: ' + roomname + " has no free 1x-b spawner");
            return;
        } else {
            //console.log('XAT: Deciding what to spawn for the ' + theirthreat + ' attack on ' + roomname + ' defended by ' + spawner.name);
        }
        var enow = spawner.room.energyAvailable;
        var emax = spawner.room.energyCapacityAvailable;
        var defense_roles = empire_defaults['defense_roles'];
        if (myalert['hostileCount'] == 1 && myalert['hostileRanged'] == 1) {
            // there is one guy, he's ranged, and he cannot heal. This is probably a kiting attack.
            defense_roles = empire_defaults['defense_roles_ranged'];
            //console.log('KITING DETECTED: ' + roomname);
        }
        for (var i = 0; i < defense_roles.length; i++) {
            var oname = defense_roles[i];
            //console.log('checking cost for' + oname);
            var obody = empire_workers[oname]['body'];
            var outfit_cost = global.UNIT_COST(obody);
            if (outfit_cost > emax) {
                //console.log('XAT: No point using ' + oname + ' as it exceeds our spawn power ' + emax);
                // no point using this... we can't possibly afford it.
                continue;
            }
            if ((i + 1) != defense_roles.length) {
                if (outfit_cost > (theirthreat * 1.2)) { 
                    //console.log('XAT: No point using ' + oname + ' as it is > 1.2*their_threat ' + theirthreat + ' (i: ' + i +  ', DRL:' + defense_roles.length + ')');
                    continue; // overkill...
                }
            }
            if (patrolforce[oname] == undefined) {
                if (i == defense_roles.length && theirthreat > (outfit_cost * 2)) {
                    patrolforce[oname] = 2;
                } else {
                    patrolforce[oname] = 1;
                }
            } else {
                patrolforce[oname] += 1;
            }
            theirthreat -= outfit_cost;
            //console.log('XAT: Defending ' + roomname + ' with ' + patrolforce[oname] + ' ' + oname + ' (cost: ' + outfit_cost + ' ea) against threat of: ' + myalert['hostileCost'] + '. ' + theirthreat + ' threat remaining');
            if (theirthreat < 0) {
                break;
            }
        }
    } else {
        console.log('DEFENSE: Decided that  ' + roomname + ' can handle the incoming threat of ' + theirthreat + ' without any units being spawned');
    }
    empire[roomname].sources['BASEFORCE'] = {'sourcename': empire[roomname]['roomname'] + '-bforce', 'x':25, 'y':25,
        'assigned': baseforce, 'expected_income': 95, 'dynamic': 1}
    empire[roomname].sources['PATROLFORCE'] = {'sourcename': empire[roomname]['roomname'] + '-pforce', 'x':25, 'y':25,
        'assigned': patrolforce, 'expected_income': 94, 'dynamic': 1}
}
