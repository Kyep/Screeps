

global.CONSTRUCT_MILITARY_BODY = function (tough_parts, move_parts, attack_parts, rangedattack_parts, heal_parts) {
    var partlist = [];
    for (var i = 0; i < tough_parts; i++) {
        partlist.push(TOUGH);
    }
    for (var i = 0; i < move_parts; i++) {
        partlist.push(MOVE);
    }
    for (var i = 0; i < attack_parts; i++) {
        partlist.push(ATTACK);
    }
    for (var i = 0; i < rangedattack_parts; i++) {
        partlist.push(RANGED_ATTACK);
    }
    for (var i = 0; i < heal_parts; i++) {
        partlist.push(HEAL);
    }
    return partlist;
}



global.UNIT_COST = (body) => _.sum(body, p => BODYPART_COST[p]);
global.CREEP_COST = (body) => _.sum(body, p => BODYPART_COST[p.type])

global.TEMPLATE_COST = function (template_name) {
    if ( empire_workers[template_name] == undefined) {
        console.log('Invalid role');
        return 0;
    }
    if ( empire_workers[template_name]['body'] == undefined) {
        console.log('Invalid role');
        return 0;
    }
    var thebody = empire_workers[template_name]['body'];
    var parts = {};
    parts[ATTACK] = 0;
    parts[RANGED_ATTACK] = 0;
    parts[HEAL] = 0;

    for (var i = 0; i < thebody.length; i++) {
        if (thebody[i] == ATTACK) {
            parts[ATTACK]++;
        }
        if (thebody[i] == RANGED_ATTACK) {
            parts[ATTACK]++;
        }
        if (thebody[i] == HEAL) {
            parts[HEAL]++;
        }
    }
    var retval = {}
    retval['cost'] = global.UNIT_COST(thebody);
    retval['parts'] = parts;
    console.log(JSON.stringify(retval));
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

global.REPORT_EARNINGS = function() {
    for (var cr in Game.creeps) {
        var earnings = Game.creeps[cr].getEarnings(); 
        var ept = Math.round(Game.creeps[cr].getEarningsPerTick()); 
        var tal = Game.creeps[cr].getTicksAlive();
        if (!Game.creeps[cr].getRenewEnabled()) {
            var projected_life_cost = global.CREEP_COST(Game.creeps[cr].body) * -1;
            ept = projected_life_cost / 1500;
            //console.log('CREEP ' + cr + ' HAS PLC: ' + projected_life_cost + ' and EPT: ' + ept);
        }
        if (Game.creeps[cr].memory[MEMORY_SOURCE] == undefined) {
            console.log('CREEP ' + cr + ' HAS NO SOURCE');
            continue;
        }
        if (Game.creeps[cr].memory[MEMORY_DEST] == undefined) {
            console.log('CREEP ' + cr + ' HAS NO TARGET');
            continue;
        }
        if (empire[Game.creeps[cr].memory[MEMORY_DEST]] == undefined) {
            // target not in our empire.
            continue;
        }
        if (Game.creeps[cr].memory[MEMORY_SOURCE] == '') {
            continue;
        }
        if (empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]] == undefined) {
            console.log(cr + ': SOURCE ' + Game.creeps[cr].memory[MEMORY_SOURCE] + ' IS MISSING FROM EMPIRE DEFINITION.');
            Game.creeps[cr].disableRenew();
            continue;
        }
        if (empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]]['sourcename'] == undefined) {
            console.log('CREEP ' + cr + ' HAS NO SOURCENAME FOR SOURCE: ' + creep.memory.source);
            Game.creeps[cr].disableRenew();
            continue;
        }
        console.log('Creep ' + cr + ' working on ' + empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]]['sourcename'] + ' has earned ' + ept + ' energy per tick over its ' + tal + ' tick lifespan, ' + earnings + ' energy in total.'); 
    }
}

global.REPORT_EARNINGS_SOURCES = function() {
    for (var cr in Game.creeps) {
        var earnings = Game.creeps[cr].getEarnings(); 
        var ept = Math.round(Game.creeps[cr].getEarningsPerTick()); 
        var tal = Game.creeps[cr].getTicksAlive();

        if (Game.creeps[cr].memory[MEMORY_SOURCE] == undefined) {
            console.log('CREEP ' + cr + ' HAS NO SOURCE');
            continue;
        }
        if (Game.creeps[cr].memory[MEMORY_DEST] == undefined) {
            console.log('CREEP ' + cr + ' HAS NO TARGET');
            continue;
        }
        if (empire[Game.creeps[cr].memory[MEMORY_DEST]] == undefined) {
            // target not in our empire.
            continue;
        }
        if (empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]] == undefined) {
            console.log(cr + ': SOURCE ' + Game.creeps[cr].memory[MEMORY_SOURCE] + ' IS MISSING FROM EMPIRE DEFINITION.');
            Game.creeps[cr].disableRenew();
            continue;
        }
        if (empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]]['sourcename'] == undefined) {
            console.log('CREEP ' + cr + ' HAS NO SOURCENAME FOR SOURCE: ' + creep.memory.source);
            Game.creeps[cr].disableRenew();
            continue;
        }

        if (!Game.creeps[cr].getRenewEnabled()) {
            var projected_life_cost = global.CREEP_COST(Game.creeps[cr].body) * -1;
            ept = projected_life_cost / 1500;
            //console.log('CREEP ' + cr + ' HAS PLC: ' + projected_life_cost + ' and EPT: ' + ept);
        }

        if(empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]] != undefined) {
            if (empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]]['earnings'] == undefined) {
                empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]]['earnings'] = earnings;
            } else {
                empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]]['earnings'] += earnings;
            }
            if (empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]]['ticks'] == undefined) {
                empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]]['ticks'] = tal;
            } else {
                empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]]['ticks'] += tal;
            }
        }
    }
    var rt_earnings = 0;
    var rt_ticks = 0;
    for(var rname in empire) {
        var r_earnings = 0;
        var r_ticks = 0;
        for (var sname in empire[rname].sources) {
            var earnings = empire[rname].sources[sname]['earnings'];
            if(earnings == undefined) {
                continue;
            }
            var ticks = empire[rname].sources[sname]['ticks'];
            var ept = Math.round(earnings/ticks);
            console.log('- Source ' + empire[rname].sources[sname]['sourcename'] + ' has earned ' + earnings + ' over ' + ticks + ' or EPT: ' + ept); 
            rt_earnings += earnings;
            rt_ticks += ticks;
            r_earnings += earnings;
            r_ticks += ticks;
        }
        var r_ept = Math.round(r_earnings / r_ticks);
        if (r_earnings != 0) {
            console.log(rname +' has earned ' + r_earnings + ' over ' + r_ticks + ' or EPT: ' + r_ept); 
            console.log(' ');
        }
    }
    console.log('TOTAL: ' + rt_earnings + ' over ' + rt_ticks + ' ticks, or ' + Math.round(rt_earnings/rt_ticks) + ' earnings/tick.');

}

global.REPORT_CREEPS = function(prune) {
    var roleslist = {};
    for (var cr in Game.creeps) {
        if(Game.creeps[cr].memory[MEMORY_NEEDED] == 0) {
            console.log(cr + ', doing ' + Game.creeps[cr].memory[MEMORY_JOB] + ', is not needed. Renewal: ' + Game.creeps[cr].memory[MEMORY_RENEW] + '. Expires in: ' + Game.creeps[cr].ticksToLive);
            if (prune == undefined) {
                // do nothing.
            } else if (prune == 1) {
               Game.creeps[cr].disableRenew(); 
            } else if (prune == 2) {
                Game.creeps[cr].memory[MEMORY_ROLE] = 'recycler';
            } else if (prune == 3) {
                Game.creeps[cr].suicide();
            }
        } else {
            //console.log(cr + ', doing ' + Game.creeps[cr].memory[MEMORY_JOB] + ', is needed. Renewal: ' + Game.creeps[cr].memory[MEMORY_RENEW] + '. Expires in: ' + Game.creeps[cr].ticksToLive);
        }
        if (roleslist[Game.creeps[cr].memory[MEMORY_ROLE]] == undefined) {
            roleslist[Game.creeps[cr].memory[MEMORY_ROLE]] = 1;
        } else {
            roleslist[Game.creeps[cr].memory[MEMORY_ROLE]] += 1;
        }
    }
    console.log(JSON.stringify(roleslist));
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
    //console.log("SPAWNING: " + roletext + " for (" + sourcetext + ') target: ' + targettext + ' (' + target_x + ',' + target_y + ') with cost: ' + thecost + ' based out of ' + homesector);
    //var result = spawner.createCreep(partlist, crname, 
    //    {'role': roletext, 'source': sourcetext, 'target': targettext, 'home': homesector, 'target_x': target_x, 'target_y': target_y, 'spawnername': spawner.name, 'renew_allowed': renew_allowed});
    var result = spawner.createCreep(partlist, crname, crmemory);
    //console.log(spawner.name + ': ' + result);
    Memory['spawn_count'] += 1;
    return result;
}

global.ATTACK_WAVE = function (spawn_list, unit_type, target_room, roompath) {
    if (spawn_list.length < 1) {
        console.log('arg 1 must be spawn_list');
        return;
    }
    if (unit_type == undefined) {
        console.log('arg 2 must be unit_type');
        return;
    }
    if (target_room == undefined) {
        console.log('arg 3 must be target_room');
        return;
    }

    for (var i = 0; i < spawn_list.length; i++) {
        var suresult = SPAWN_UNIT(spawn_list[i], unit_type, target_room, roompath);
        console.log(spawn_list[i].name + ': ' + suresult);
    }
}

global.ROOMLIST_ATTACK_WAVE = function (roomlist, unit_type, target_room, roompath) {
    if (unit_type == undefined) {
        console.log('arg 2 must be unit_type');
        return;
    }
    if (target_room == undefined) {
        console.log('arg 3 must be target_room');
        return;
    }
    for (var sname in Game.spawns) {
        if (roomlist.indexOf(Game.spawns[sname].room.name) == -1) {
            continue;   
        }
        var suresult = SPAWN_UNIT(sname, unit_type, target_room, roompath);
        console.log(sname + ': ' + suresult);
    }
}

global.PRESET_ATTACK_WAVE = function () {
    /* TARGETS: 
        W60S10: junction that eduter insists on sending scouts through.
    */

    SPAWN_UNIT('Spawn6','scout','W55S10',['W57S10','W60S10']); // north base.
	//SPAWN_UNIT('Spawn14','scout','W55S10',['W57S10','W60S10','W60S9']); // north base.

    /*
    //SPAWN_UNIT('Spawn6','slasher','W56S12',['W56S13','W57S13', 'W57S12']); // north base.
    //SPAWN_UNIT('Spawn6','siegemini','W55S10',['W59S10','W59S11']); // north base.
    SPAWN_UNIT('Spawn6','siegemini','W55S10',['W57S10','W57S11']); // north base.

    SPAWN_UNIT('Spawn3','scout','W55S10',['W56S10','W56S11']); // NE base
    SPAWN_UNIT('Spawn9','siegemini','W55S10',['W56S10','W56S11']);
    
    //SPAWN_UNIT('Spawn11','scout','W60S17',['W60S16','W60S12', 'W59S12']); // W base, harass his NW mining operation
    SPAWN_UNIT('Spawn11','siegemini','W60S17',['W60S16','W60S12', 'W57S12', 'W57S11']); // W base, his primary

    SPAWN_UNIT('Spawn8','slasher','W54S17',['W54S16', 'W54S15', 'W55S15', 'W55S14', 'W56S14','W57S14', 'W57S11']); // gaurdian base, harass his s base mining
    SPAWN_UNIT('Spawn12','siegemini','W54S17',['W54S16', 'W54S15', 'W55S15', 'W55S14', 'W56S14','W57S14', 'W57S11']); // siege him too

    SPAWN_UNIT('Spawn1','siegemini','W54S16',['W54S15', 'W55S15', 'W55S14', 'W56S14','W57S14', 'W57S11']); // keep it small, swamps!
    SPAWN_UNIT('Spawn4','siegemini','W54S16',['W54S15', 'W55S15', 'W55S14', 'W56S14','W57S14', 'W57S11']); // keep it small, swamps!

    SPAWN_UNIT('Spawn2','siegemini','W53S18',['W54S16', 'W54S15', 'W55S15', 'W55S14', 'W56S14','W57S14','W57S11']); // keep it small, swamps!
    SPAWN_UNIT('Spawn5','siegemini','W53S18',['W54S16', 'W54S15', 'W55S15', 'W55S14', 'W56S14','W57S14','W57S11']); // keep it small, swamps!
    */    
}

global.MASS_RETARGET = function (role, newtarget, waypoints) {
    for (var crname in Game.creeps) {
        if (Game.creeps[crname].memory[MEMORY_ROLE] == role) {
            Game.creeps[crname].memory[MEMORY_DEST] = newtarget;
            if (waypoints == undefined || waypoints == null) {
                waypoints = [];
            }
            Game.creeps[crname].memory[MEMORY_NEXTDEST] = waypoints;
        }
    }
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
    if (room_primary_level > 0 && room_primary_level < 4) {
        spawners_secondary_preferred = 1;
    } else if (room_primary_level > 5) {
        spawners_secondary_allowed = 0;
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
        if(Game.rooms[rname].terminal.store[mtype] == undefined || Game.rooms[rname].terminal.store[mtype] == undefined || Game.rooms[rname].terminal.store[mtype] < 1000) {
            //console.log('MARKET: ' + rname + ': has <1k of sale mineral: ' + mtype);
            continue;
        }
        var amount_sellable = Game.rooms[rname].terminal.store[mtype];
        var room_orders = Game.market.getAllOrders({'type': ORDER_SELL, 'roomName': rname, 'resourceType': mtype});
        var order_id = undefined;
        var old_price = 0;
        for (var thisorder in room_orders) {
            if (thisorder.remainingAmount == 0) {
                continue;
            }
            order_id = room_orders[thisorder]['id'];
            old_price = room_orders[thisorder]['price'];
        }
        if (order_id == undefined) {
            //console.log(rname + ': has no order for ' + mtype);
        } else {
            //console.log(rname + ': existing order ' + order_id);
        }
        var sell_price = 0;
        var global_sell_orders = Game.market.getAllOrders({'type': ORDER_SELL, 'resourceType': mtype});
        for (var porder in global_sell_orders) {
            if(global_sell_orders[porder]['remainingAmount'] == 0) {
                continue;
            }
           if (sell_price == 0) {
               sell_price = global_sell_orders[porder]['price'];
            } else if (global_sell_orders[porder]['price'] < sell_price) {
               sell_price = global_sell_orders[porder]['price'];
           }
            //console.log(global_sell_orders[porder]['price']);
        }
        var buy_price = 0;
        var effective_buy_price = 0;
        var buy_order_id = undefined;
        var buy_order_amount = undefined;
        var global_buy_orders = Game.market.getAllOrders({'type': ORDER_BUY, 'resourceType': mtype});
        for (var porder in global_buy_orders) {
            if(global_buy_orders[porder]['remainingAmount'] == 0) {
                continue;
            }
            var price_of_energy = 0.08;
            var e_cost = (Game.market.calcTransactionCost(100, rname, global_buy_orders[porder]['roomName']) / 100);
            var this_efbp = global_buy_orders[porder]['price'] - (e_cost * price_of_energy); 
            //console.log(rname + ', ' + mtype + ', ' + global_buy_orders[porder]['id'] + ', ' + global_buy_orders[porder]['price'] + ' -> ' + this_efbp + '(' + e_cost + ')');
            if (buy_price == 0) {
               buy_price = global_buy_orders[porder]['price'];
               effective_buy_price = this_efbp;
               buy_order_id = global_buy_orders[porder]['id'];
               buy_order_amount = global_buy_orders[porder]['remainingAmount'];
            } else if (this_efbp > effective_buy_price) {
               buy_price = global_buy_orders[porder]['price'];
               effective_buy_price = this_efbp;
               buy_order_id = global_buy_orders[porder]['id'];
               buy_order_amount = global_buy_orders[porder]['remainingAmount'];
           }
        }
        var amount_to_sell = amount_sellable;
        if (amount_to_sell > 10000) {
            amount_to_sell = 10000;
        }
        if(effective_buy_price > sell_price && buy_order_id != undefined) {
            if (buy_order_amount < amount_to_sell) {
                amount_to_sell = buy_order_amount;
            }
            //var retval = 'TEST'; 
            var retval = Game.market.deal(buy_order_id, amount_to_sell, rname);
            console.log('MARKET: DEAL buy order: ' + buy_order_id + ' on: ' + mtype + ' from: ' + rname + ' at: ' + buy_price + ' (effectively: ' + effective_buy_price + ', still better than ' + sell_price + ') sending: ' + amount_to_sell + ' result: ' + retval);
        } else if(order_id == undefined) {

            var retval = Game.market.createOrder(ORDER_SELL, mtype, sell_price, amount_to_sell, rname);
            console.log('MARKET: CREATE sell order ' + mtype + ' from ' + rname + ' at ' + sell_price + ' result ' + retval);
        } else {
            if (old_price == sell_price) {
                //console.log('MARKET: PERFECT existing order ' + order_id + ' for ' + mtype + ' in ' + rname + ' selling at ' + old_price);
            } else if (old_price < sell_price) {
                // not possible? 
            } else {
                console.log('MARKET: REPRICE order ' + order_id + ' from ' + old_price + ' to ' + sell_price);
                Game.market.changeOrderPrice(order_id, sell_price);
            }
        }
    }
    return 'OK';
}

global.READY_LAUNCHERS = function() {
    var ticks_per_second = 2.7;
    var available_nukers = [];
    for(var id in Game.structures){
        if(Game.structures[id].structureType == STRUCTURE_NUKER){
            if (!Game.structures[id].isActive()) {
                console.log('LAUNCHER: inactive ' + Game.structures[id].room.name);
                continue;
            }
            if (Game.structures[id].cooldown > 0) {
                var hrs = ((Game.structures[id].cooldown * ticks_per_second) / (60 * 60));
                console.log('LAUNCHER: on cooldown ' + Game.structures[id].room.name + ', for ' + hrs + ' hours');
                continue;
            }
            if (Game.structures[id].energy != Game.structures[id].energyCapacity) {
                console.log('LAUNCHER: lacks energy ' + Game.structures[id].room.name);
                continue;
            }
            if (Game.structures[id].ghodium != Game.structures[id].ghodiumCapacity) {
                console.log('LAUNCHER: lacks ghodium ' + Game.structures[id].room.name);
                continue;
            }
            console.log('LAUNCHER: OK in ' + Game.structures[id].room.name);
            available_nukers.push(id);
        }
    }
    return available_nukers;
}

global.IS_NUKABLE = function(roomname) {
    var all_nukers = []
    for(var id in Game.structures){
        if(Game.structures[id].structureType == STRUCTURE_NUKER){
            all_nukers.push(id);
        }
    }
    var launchrooms_in_range = []
    for (var i = 0; i < all_nukers.length; i++) {
        var thenuker = Game.structures[all_nukers[i]];
        var therange = Game.map.getRoomLinearDistance(thenuker.room.name, roomname);
        if (therange > NUKE_RANGE) {
            console.log('NUKE: launcher in room ' + thenuker.room.name + ' is out of range. (' + therange + ' > ' + NUKE_RANGE + ')');
            continue;
        } 
        launchrooms_in_range.push(thenuker.room.name);
    }
    if (launchrooms_in_range.length == 0) {
        console.log('No nuke launchers were in range of: ' + roomname);
        return 0;
    }
    console.log('You have ' + launchrooms_in_range.length + ' launchers able to hit ' + roomname + ': ' + launchrooms_in_range);
    return launchrooms_in_range.length;
}

global.LAUNCH_NUKE = function(roomx, roomy, roomname) {
    var available_nukers = global.READY_LAUNCHERS();

    console.log('NUKE: ' + available_nukers.length + ' launcher(s) available.'); 
    for (var i = 0; i < available_nukers.length; i++) {
        var thenuker = Game.structures[available_nukers[i]];
        if (Game.map.getRoomLinearDistance(thenuker.room.name, roomname) > NUKE_RANGE) {
            console.log('NUKE: launcher in room ' + thenuker.room.name + ' is available, but out of range.');
            continue;
        }
        console.log('NUKE: launcher in room ' + thenuker.room.name + ' is available.');
        var result = thenuker.launchNuke(new RoomPosition(roomx, roomy, roomname));
        if (result == OK) {
            console.log('NUCLEAR LAUNCH DETECTED! ' + result);
            
            // Spawn a refiller.
            
            var gsapfr = GET_SPAWNER_AND_PSTATUS_FOR_ROOM(thenuker.room.name);
            var spawner = gsapfr[0];
            var using_primary = gsapfr[1];
            
            if (spawner != undefined) {
                var suresult = SPAWN_UNIT(spawner.name, 'nuketech', thenuker.room.name, []);
                console.log('Spawning nuke refiller: ' + suresult);
            } else {
                console.log('Unable to spawn nuke refiller... all spawns may be busy.');
            }
            return 1;
            
        } else {
            console.log('RESULT: ' + result);
        }
    }
    console.log('NUKE: no available launcher can target: ' + roomname);
    return 0;
}

global.SHARE_SPARE_ENERGY = function() {
    
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
        if (storage_free < 80000) {
            console.log('SHARE_SPARE_ENERGY: ' + send_to + ' is too full (only ' + storage_free + ' free) to accept more energy.');
            return;
        }
    }
    
    for (var rname in Game.rooms) {
        var lvl = Game.rooms[rname].getLevel();
        if (lvl < 8) {
            continue;
        }
        if (!Game.rooms[rname].hasTerminalNetwork()) {
            continue;
        }
        var e_stored = Game.rooms[rname].getStoredEnergy();
        var e_class = Game.rooms[rname].classifyStoredEnergy(e_stored);
        if (e_class != ENERGY_FULL) {
            continue;
        }
        var amount_to_send = 10000;
        var term = Game.rooms[rname].terminal;
        if (term.cooldown > 0) {
            console.log('SHARE_SPARE_ENERGY: ' + rname + ' is on terminal cooldown for: ' + term.cooldown);
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

global.UPDATE_OBSERVERS = function(observe_energy) {
    
    var rooms_to_observe = [];
    if (Memory['energy_share_dests'] != undefined && observe_energy) {
        rooms_to_observe = Memory['energy_share_dests'];
    }

    var available_observers = _.shuffle(global.LIST_OBSERVERS());

    //console.log('OBS: ' + available_observers.length + ' observer(s) available, ' + rooms_to_observe.length + ' observation targets: ' + JSON.stringify(rooms_to_observe)); 
    if (available_observers.length == 0) {
        return;
    }
    if (rooms_to_observe.length > available_observers.length) {
        console.log('OBS: WARNING: we only have ' + available_observers.length + ' observers, but you are trying to monitor ' + rooms_to_observe.length + ' rooms!');
    } else if (available_observers.length > rooms_to_observe.length) {
        var espionage_targets = global.ESPIONAGE_LIST_TARGETS();
        var spare_capacity = available_observers.length - rooms_to_observe.length;
        for (var i = 0; i < spare_capacity && i < espionage_targets.length; i++) {
            var new_element = espionage_targets[i];
            rooms_to_observe.push(new_element);
            //console.log('OBS: ' + spare_capacity + ' spare capacity, adding ' + new_element + ' for espionage');
        }
    } else {
        //console.log('OBS: no spare_capacity for espionage');
    }
    for (var i = 0; i < available_observers.length && i < rooms_to_observe.length; i++) {
        var theobs = available_observers[i];
        var obsrange = Game.map.getRoomLinearDistance(theobs.room.name, rooms_to_observe[i]);
        if (obsrange > OBSERVER_RANGE) {
            //console.log('OBS: observer in ' + theobs.room.name + ' cannot monitor ' + rooms_to_observe[i] + ' as it is ' + obsrange + ' >10 rooms away.');
            continue;
        }
        var result = theobs.observeRoom(rooms_to_observe[i]);
        //console.log('OBS: observer in ' + theobs.room.name + ' now observing ' + rooms_to_observe[i] + ' with result: ' + result);
    }
}

/*
global.DETECT_NUKES = function() {
    for(var rname in Game.rooms) {
        var lvl = Game.rooms[rname].getLevel();
        if (lvl < 1) {
            continue;
        }
        if (Game.rooms[rname].controller.owner.username != overlord) {
            continue;
        }

        var incoming_nukes = Game.rooms[rname].find(FIND_NUKES);
        if (incoming_nukes.length == 0) {
            console.log('SCANNING: ' + rname + ' for nukes. None found.');
            continue;
        }
        var nmsg = '!!!!! NUKE: ' + incoming_nukes.length + ' nuke(s) incoming on ' + rname;
        console.log(nmsg);
        Game.notify(nmsg);
        for (var i = 0; i < incoming_nukes.length; i++) {
            var thenuke = incoming_nukes[i];
            if (thenuke.timeToLand < 200) {
                
            }
        }
    }
}
*/

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
    /* // no point, nuke does damage through safemode
    if (myalert['nukeCount'] > 0 && myalert['nukeTimeToLand'] < 100){
        try_safemode = 1;
    }
    */
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
    if (towercount > 0 && myalert['hostileUsername'] == 'Invader' && alert_age < 60) {
        theirthreat -= (1000 * towercount);
        if (Game.rooms[roomname] != undefined && Game.rooms[roomname].storage != undefined) {
            baseforce['teller-towers'] = 1;
            if (theirthreat > 8000) {
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
            console.log('KITING DETECTED: ' + roomname);
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

global.ESPIONAGE_CREATE_TARGETS = function() {
	var start_x = 49;
	var end_x = 59;
	//var end_x = 50;
	var start_y = 1;
	var end_y = 29;
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
    if (Memory['espionage'] == undefined) {
        Memory['espionage'] = {}
    }
    if (Memory['espionage']['targets'] == undefined) {
        Memory['espionage']['targets'] = []
    }
	return Memory['espionage']['targets'];
}

global.ESPIONAGE_SET_TARGETS = function(thelist) {
	Memory['espionage']['targets'] = thelist;
}

global.ESPIONAGE_REMOVE_TARGET = function(thetarget) {
    var all_targets = global.ESPIONAGE_LIST_TARGETS();
    var index = all_targets.indexOf(thetarget);
    if (index != -1) {
        all_targets.splice(index, 1);
        global.ESPIONAGE_SET_TARGETS(all_targets);
    }
	return Memory['espionage']['targets'];
}

global.ESPIONAGE_GET_TARGET = function() {
    var all_targets = Memory['espionage']['targets'];
    if (all_targets.length == 0) {
        return undefined;
    }
    return _.sample(all_targets);
}

global.ESPIONAGE_REGEN_TARGETS = function() {
    Memory['espionage']['players'] = {}
    var new_target_list = _.shuffle(global.ESPIONAGE_CREATE_TARGETS());
    global.ESPIONAGE_SET_TARGETS(new_target_list);
    console.log('ESPIONAGE: REGEN: ' + new_target_list.length + ' targets identified');
}

global.ESPIONAGE = function() {
    if (Memory['espionage'] == undefined) {
        Memory['espionage'] = {}
        global.ESPIONAGE_REGEN_TARGETS();
    }
    var target_list = global.ESPIONAGE_LIST_TARGETS();

    if (target_list.length == 0) {
        //console.log('Espionage report: ' + JSON.stringify(Memory['espionage']['players']));
        return;
    }
    var num_processed = 0;
    var levels_added = 0;
    for (var rname in Game.rooms) {
        if (target_list.indexOf(rname) != -1) {
            //console.log('ESPIONAGE: scoring ' + rname);
            var theroom = Game.rooms[rname];
            if (theroom.controller != undefined) {
                if (theroom.controller.owner != undefined) {
                    if (theroom.controller.owner.username != undefined) {
                        if (theroom.controller.owner.username != overlord) {
                            var room_owner = theroom.controller.owner.username;
                            if (Memory['espionage']['players'][room_owner] == undefined) {
                                Memory['espionage']['players'][room_owner] = theroom.controller.level;
                            }
                            Memory['espionage']['players'][room_owner] += theroom.controller.level;
                            levels_added += theroom.controller.level;
                        }
                    }
                }
            }
            ESPIONAGE_REMOVE_TARGET(rname);
            num_processed++;
        }
    }
    console.log('ESPIONAGE: processed ' + num_processed + '/' + target_list.length + ', adding: ' + levels_added + ' running: ' + JSON.stringify(Memory['espionage']['players']));    
}
