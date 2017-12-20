
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

global.GET_ALL_NUKE_FLAGS = function() {
    var white_flags = _.filter(Game.flags, (flag) => (flag.color == COLOR_WHITE) && (flag.secondaryColor == COLOR_WHITE));
    var nuke_targets = []
    for (var i = 0; i < white_flags.length; i++) {
        nuke_targets.push(white_flags[i]);
    }
    
    return nuke_targets;
}

global.LIST_ALL_NUKE_FLAGS = function() {
    var white_flags = global.GET_ALL_NUKE_FLAGS();
    for (var i = 0; i < white_flags.length; i++) {
        console.log('Nuke target: ' + white_flags[i].pos);
    }
    return true;
}

global.CLEAR_ALL_NUKE_FLAGS = function() {
    var white_flags = global.GET_ALL_NUKE_FLAGS();
    for (var i = 0; i < white_flags.length; i++) {
        console.log('Nuke target: ' + white_flags[i].pos + ' - deleted.');
        white_flags[i].remove();
    }
    return true;
}

global.GET_NUKE_FLAG_IN_ROOM = function(roomname) {
    var white_flags = _.filter(Game.flags, (flag) => (flag.color == COLOR_WHITE) && (flag.secondaryColor == COLOR_WHITE) && flag.pos.roomName == roomname);
    if (white_flags.length == 0) {
        return undefined;
    } else {
        return white_flags[0];
    }
}

global.LAUNCH_NUKE = function(roomname) {
    var available_nukers = global.READY_LAUNCHERS();

    console.log('NUKE: ' + available_nukers.length + ' launcher(s) available.'); 
    
    var target_flag = global.GET_NUKE_FLAG_IN_ROOM(roomname);
    
    if (target_flag == undefined) {
        console.log('NUKE: no target white/white flag in: ' + roomname);
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
