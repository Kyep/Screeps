global.REPORT_RES_HAVE = function() {
    for (var rname in Game.rooms) {
        var robj = Game.rooms[rname];
        if (!robj.isMine()) {
            continue;
        }
        if (!robj.terminal) {
            continue;
        }
        console.log(rname + ': ' + JSON.stringify(robj.terminal.store));
    }
}

global.REPORT_STRUCTURES = function() {
    var ns = 0;
    for (var rname in Game.rooms) {
        ns += Game.rooms[rname].checkStructures();
    }
    return ns;
}

global.REPORT_CSITES = function() {
    var csites = {}
    for (var csite in Game.constructionSites) {
        var this_site = Game.constructionSites[csite];
        if(csites[this_site.room.name] == undefined) {
            csites[this_site.room.name] = 0;
        }
        csites[this_site.room.name]++;
    }
    console.log(JSON.stringify(csites));
}


global.REPORT_TERMINALS = function() {
    for (var rname in Game.rooms) { if(Game.rooms[rname].terminal) { console.log(rname + ' ' + JSON.stringify(Game.rooms[rname].terminal.store)); } }
}

global.REPORT_WORKERS = function() {
    Memory['config.reportworkers'] = 1;
}

global.RECREATE_ROAD_NETWORKS = function() {
    var remaining = Object.keys(empire);
    for (var rname in Game.rooms) {
        if (empire[rname] == undefined) {
            continue;
        }
        var psr = empire[rname]['spawn_room'];
        if (Game.rooms[psr] && Game.rooms[psr].getLevel() < 4) {
            continue;
        }
        
        var grm = Game.rooms[rname];
        grm.memory[MEMORY_ROAD_NETWORK] = [];
        var origins = grm.getFlagsByType(FLAG_ROADORIGIN);
        if (origins.length) {
            for (var a = 0; a < origins.length; a++) {
                grm.createRoadNetwork(origins[a].pos.x, origins[a].pos.y);
            }
            var ipos = remaining.indexOf(rname);
            if (ipos > -1) {
                remaining.splice(ipos, 1);
            }
        } else {
            console.log('RECREATE_ROAD_NETWORKS: ' + rname + ': no ORIGIN flag');
        }
    }
    console.log('RECREATE_ROAD_NETWORKS: remaining after creation: ' + remaining);
    global.SHOW_ROAD_NETWORKS();
}

global.SHOW_ROAD_NETWORKS = function() {
    for (var rname in Game.rooms) {
        var grm = Game.rooms[rname];
        grm.showRoadNetwork();
    }
}

global.SHOW_INCOMING_NUKES = function() {
    for (var rname in Game.rooms) {
        var grm = Game.rooms[rname];
        if (!grm.isMine()) {
            continue;
        }
        var incoming = grm.find(FIND_NUKES);
        if (incoming.length > 0) {
            console.log(rname + ': ' + incoming.length + ' incoming nuke(s)');
        }
    }
}

global.ENERGY_STATUS = function() {
    console.log(JSON.stringify(Memory['energy_network']));
    for (var rname in Game.rooms) {
        var rm = Game.rooms[rname];
        if (!rm.isMine()) {
            continue;
        }
        var storage_energy = 0;
        if (rm.storage != undefined && rm.storage.store != undefined && rm.storage.store[RESOURCE_ENERGY] != undefined) {
           storage_energy = rm.storage.store[RESOURCE_ENERGY];
        }
        var terminal_energy = 0;
        if (rm.terminal != undefined && rm.terminal.store != undefined && rm.terminal.store[RESOURCE_ENERGY] != undefined) {
           terminal_energy = rm.terminal.store[RESOURCE_ENERGY];
        }
        var total_energy = storage_energy + terminal_energy;
        console.log(rname + ': E:' + total_energy + ' (term:' + terminal_energy + ') L:' + rm.getLevel() + ' T:' + rm.hasTerminalNetwork() + ' S:' + rm.classifyStoredEnergy());
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

// ----------------------- WAR ----------------------------------------------------------

global.SPAWN_EVERYWHERE = function (btype) {
    if (btype == undefined) {
        btype = 'teller';
    }
    for (var rname in Game.rooms) {
        var rlvl = Game.rooms[rname].getLevel();
        if (rlvl >= 5) {
            var retval = Game.rooms[rname].createUnit(btype, rname);
            console.log('spawning ' + btype + ' for: ' + rname + ' result: ' + retval);
        }
    }
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

global.ROOMLIST_ATTACK_WAVE = function (roomlist, unit_type, target_room, roompath, target_x, target_y) {
    if (roomlist == undefined) {
        console.log('arg 2 must be roomlist');
        return -1;
    }
    if (!roomlist.length) {
        console.log('arg 2 must be roomlist, at least one room name');
        return -1;
    }
    if (unit_type == undefined) {
        console.log('arg 2 must be unit_type');
        return -1;
    }
    if (target_room == undefined) {
        console.log('arg 3 must be target_room');
        return -1;
    }
    
    var tprops = global.TEMPLATE_PROPERTIES(unit_type);
    
    var spawncount = 0;
    for (var rname in Game.rooms) {
        if (roomlist.indexOf(rname) != -1) {
            var res = Game.rooms[rname].createUnit(unit_type, target_room, roompath, rname, target_x, target_y);
            console.log('ROOMLIST_ATTACK_WAVE: ' + rname + ' ' + res);
            if(res) {
                spawncount++;
            }
        }
    }
    return spawncount;
}

global.PRESET_ATTACK_WAVE = function (btype) {
    /* TARGETS: 
        W59 and then W85, S3: edtuer's rooms.
    */
    
    //slower but safer route: ROOMLIST_ATTACK_WAVE(['W58S17','W59S18'], 'boss', 'W60S17', ['W60S25','W57S25','W57S24'], 18, 29);
    //ROOMLIST_ATTACK_WAVE(['W58S17','W59S18'], 'boss', 'W60S17', ['W60S20','W57S20','W57S21','W58S21','W58S22','W57S23','W57S24'], 18, 29);
    //ROOMLIST_ATTACK_WAVE(['W53S18','W56S18'], 'boss', 'W55S20', ['W56S20','W57S23','W55S23'], 30, 30);
    
    var source_room_list = ['W59S18', 'W53S18', 'W56S18'] // 'W59S18', 'W58S17'
    //['W57S11','W57S14','W53S12','W51S14'];
    
    for (var i = 0; i < source_room_list.length; i++) {
    	//Game.rooms[source_room_list[i]].createSiegeTeam('W55S20', ['W57S23', 'W57S25', 'W56S26', 'W56S27'], 31, 9);
    	var result = Game.rooms[source_room_list[i]].createUnit('siegebig', 'W55S20', ['W57S23', 'W57S25', 'W56S26', 'W56S27'], 31, 9);
    	console.log(source_room_list[i] + ': ' + result);
    }
    //ROOMLIST_ATTACK_WAVE(['W58S17','W59S18'], 'siegebig', 'W60S17', ['W60S20','W57S20','W57S21','W58S21','W58S22','W57S23','W57S24'], 18, 29);
    //ROOMLIST_ATTACK_WAVE(['W53S18','W56S18'], 'siegehealer', 'W55S20', ['W56S20','W57S23','W55S23'], 30, 30);

    //ROOMLIST_ATTACK_WAVE(['W56S18'], 'bclaimer', 'W55S20', ['W56S20','W57S23','W55S23'], 30, 30);
    //ROOMLIST_ATTACK_WAVE(['W56S18'], 'bclaimer', 'W55S20', ['W56S20','W57S23','W57S24'], 30, 30);

    /*
    var primary_target = 'W52S9'; // W60S10 W53S10
    var waypoint_list = []; // 'W60S3', 'W59S3', 'W58S3'];
    var target_x = 40;
    var target_y = 40;
    var roomlist = ['W57S14','W57S11','W53S12','W51S14','W53S18','W51S18'];
    if (btype == undefined) {
        btype = 'drainerbig';
    }
    
    //btype = 'siegebig';
    ROOMLIST_ATTACK_WAVE(roomlist, btype, primary_target, waypoint_list, target_x, target_y);
    */

    //ROOMLIST_ATTACK_WAVE(['W57S11'], 'scout', primary_target, waypoint_list, target_x, target_y); // ,'W57S14'    
    // nearby rooms spawn large drainers
    //ROOMLIST_ATTACK_WAVE(['W57S11','W57S14'], 'drainerbig', primary_target, waypoint_list, target_x, target_y);

    // further away units spawn big siege creeps
    //ROOMLIST_ATTACK_WAVE(['W53S12','W58S17','W51S14'], 'siegebig', primary_target, waypoint_list, target_x, target_y);

}

global.RETARGET_ROLE = function (role, newtarget, waypoints) {
    if (waypoints == undefined || waypoints == null) {
        waypoints = [];
    }
    for (var crname in Game.creeps) {
        if (Game.creeps[crname].memory[MEMORY_ROLE] == role) {
            Game.creeps[crname].memory[MEMORY_DEST] = newtarget;
            Game.creeps[crname].memory[MEMORY_NEXTDEST] = waypoints;
        }
    }
}

global.SWITCH_ROLE = function (rolea, roleb) {
    for (var crname in Game.creeps) {
        if (Game.creeps[crname].memory[MEMORY_ROLE] == rolea) {
            Game.creeps[crname].memory[MEMORY_ROLE] = roleb;
        }
    }
}

global.RETARGET_SIEGE = function (newtarget, waypoints, newx, newy) {
    if (waypoints == undefined || waypoints == null) {
        waypoints = [];
    }
    for (var crname in Game.creeps) {
        if (!Game.creeps[crname].isSiege()) {
            continue;
        }
        Game.creeps[crname].memory[MEMORY_FRUSTRATION] = 0;
        Game.creeps[crname].memory[MEMORY_DEST] = newtarget;
        Game.creeps[crname].memory[MEMORY_NEXTDEST] = waypoints;
        if (newx != undefined) {
            Game.creeps[crname].memory[MEMORY_DEST_X] = newx;
        }
        if (newy != undefined) {
            Game.creeps[crname].memory[MEMORY_DEST_Y] = newy;
        }
    }
}

// ----------------------------- NUKES ------------------------------------------------


global.READY_LAUNCHERS = function() {
    var ticks_per_second = 2.9;
    var available_nukers = [];
    var missing_nukers = []
    for(var rname in Game.rooms) {
        var robj = Game.rooms[rname];
        if(robj.isMine() && robj.getLevel() == 8) {
            missing_nukers.push(rname);
        }
    }
    for(var id in Game.structures){
        if(Game.structures[id].structureType == STRUCTURE_NUKER){
            if (!Game.structures[id].room.isMine()) {
                console.log('LAUNCHER: located in room ' + Game.structures[id].room.name + ' which I do not own.');
                continue;
            }
            _.pull(missing_nukers, Game.structures[id].room.name);
            if (!Game.structures[id].isActive()) {
                console.log('LAUNCHER: inactive ' + Game.structures[id].room.name + '(RLVL: ' + Game.structures[id].room.getLevel() + ')');
                continue;
            }
            var g_amt = Game.structures[id].ghodium;
            if (g_amt == undefined) {
                g_amt = 0;
            }
            var g_storage = 0;
            if (Game.structures[id].room.terminal && Game.structures[id].room.terminal.store[RESOURCE_GHODIUM]) {
                g_storage = Game.structures[id].room.terminal.store[RESOURCE_GHODIUM];
            }

            if (Game.structures[id].cooldown > 0) {
                var hrs = ((Game.structures[id].cooldown * ticks_per_second) / (60 * 60));
                console.log('LAUNCHER: on cooldown ' + Game.structures[id].room.name + ', for ' + hrs + ' hours'  + ' (' + g_amt + ' G in launcher, ' + g_storage + ' G in storage)');
                continue;
            }
            if (Game.structures[id].energy != Game.structures[id].energyCapacity) {
                console.log('LAUNCHER: lacks energy ' + Game.structures[id].room.name  + ' (' + g_amt + ' G in launcher, ' + g_storage + ' G in storage)');
                continue;
            }
            if (Game.structures[id].ghodium != Game.structures[id].ghodiumCapacity) {
                console.log('LAUNCHER: lacks ghodium ' + Game.structures[id].room.name + ' (' + g_amt + ' G in launcher, ' + g_storage + ' G in storage)');
                continue;
            }
            console.log('LAUNCHER: OK in ' + Game.structures[id].room.name  + ' (' + g_amt + ' G in launcher, ' + g_storage + ' G in storage)');
            available_nukers.push(id);
        }
    }
    console.log('MISSING: ' + JSON.stringify(missing_nukers));
    return available_nukers;
}

global.IS_NUKABLE = function(roomname, silent) {
    var all_nukers = []
    for(var id in Game.structures){
        if(Game.structures[id].structureType == STRUCTURE_NUKER){
            all_nukers.push(id);
        }
    }
    var valid_launchers = [];
    var temporarily_invalid_launchers = [];
    var outranged_launchers = [];
    for (var i = 0; i < all_nukers.length; i++) {
        var thenuker = Game.structures[all_nukers[i]];
        var readycode = thenuker.getReadiness(roomname);
        if (readycode == OK) {
            valid_launchers.push(thenuker.room.name);
        } else if (readycode == ERR_NOT_IN_RANGE) {
            outranged_launchers.push(thenuker.room.name);
        } else if (readycode == ERR_NOT_ENOUGH_RESOURCES || readycode == ERR_TIRED || readycode == ERR_RCL_NOT_ENOUGH) {
            temporarily_invalid_launchers.push(thenuker.room.name);
        }
    }
    if(!silent) {
        console.log('IS_NUKABLE() target ' + roomname + ': ');
        console.log('- ' + valid_launchers.length + ' ready to fire: ' + valid_launchers);
        console.log('- ' + temporarily_invalid_launchers.length + ' not ready to fire: ' + temporarily_invalid_launchers);
        console.log('- ' + outranged_launchers.length + ' out of range: ' + outranged_launchers);
    }
    return valid_launchers.length;
}

global.GET_ALL_NUKE_FLAGS = function() {
    var flag_colors = FLAG_TYPE_TO_COLORS_COLORS(FLAG_GROUNDZERO);
    var c1 = flag_colors[0];
    var c2 = flag_colors[1];
    return _.filter(Game.flags, (flag) => (flag.color == c1) && (flag.secondaryColor == c2));
}

global.LIST_ALL_NUKE_FLAGS = function() {
    var nuke_flags = global.GET_ALL_NUKE_FLAGS();
    for (var i = 0; i < nuke_flags.length; i++) {
        console.log('Nuke target: ' + nuke_flags[i].pos);
    }
    return true;
}

global.CLEAR_ALL_NUKE_FLAGS = function() {
    var nuke_flags = global.GET_ALL_NUKE_FLAGS();
    for (var i = 0; i < nuke_flags.length; i++) {
        console.log('Nuke target: ' + nuke_flags[i].pos + ' - deleted.');
        nuke_flags[i].remove();
    }
    return true;
}

global.GET_NUKE_FLAG_IN_ROOM = function(roomname) {
    var flag_colors = FLAG_TYPE_TO_COLORS_COLORS(FLAG_GROUNDZERO);
    var c1 = flag_colors[0];
    var c2 = flag_colors[1];
    var nuke_flags = _.filter(Game.flags, (flag) => (flag.color == c1) && (flag.secondaryColor == c2) && flag.pos.roomName == roomname);
    if (nuke_flags.length == 0) {
        return undefined;
    } else {
        return nuke_flags[0];
    }
}

global.LAUNCH_NUKE = function(roomname) {
    var available_nukers = global.READY_LAUNCHERS();

    console.log('NUKE: ' + available_nukers.length + ' launcher(s) available.'); 
    
    var target_flag = global.GET_NUKE_FLAG_IN_ROOM(roomname);
    
    if (target_flag == undefined) {
        console.log('NUKE: no target target flag in: ' + roomname);
        return 0;
    }
    var missile_target_pos = target_flag.pos;
    
    for (var i = 0; i < available_nukers.length; i++) {
        var thenuker = Game.structures[available_nukers[i]];
        if (Game.map.getRoomLinearDistance(thenuker.room.name, roomname) > NUKE_RANGE) {
            console.log('NUKE: launcher in room ' + thenuker.room.name + ' is available, but out of range.');
            continue;
        }
        console.log('NUKE: launcher in room ' + thenuker.room.name + ' is available.');
        var result = thenuker.launchNuke(missile_target_pos);
        if (result == OK) {
            console.log('NUCLEAR LAUNCH DETECTED! ' + result);
            
            // Delete the target flag
            target_flag.remove();
            
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
