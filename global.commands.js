global.CHECK_HAULER_BODIES = function(sid) {
    var combined = {}
    for (var crname in Game.creeps) {
        var cr = Game.creeps[crname];
        if (cr.memory[MEMORY_ROLE] != 'hauler') {
            continue;
        }
        var cps = cr.getActiveBodyparts(CARRY);
        if (combined[cr.memory[MEMORY_DEST]] == undefined) {
            combined[cr.memory[MEMORY_DEST]] = {}
        }
        if (combined[cr.memory[MEMORY_DEST]][cr.memory[MEMORY_SOURCE]] == undefined) {
            combined[cr.memory[MEMORY_DEST]][cr.memory[MEMORY_SOURCE]] = {'needed': 0, 'actual': 0, 'cr': 0};
        }
        if (sid && sid == cr.memory[MEMORY_SOURCE]) {
            console.log(crname + ' has ' + cps + ' carry parts');
        }
        combined[cr.memory[MEMORY_DEST]][cr.memory[MEMORY_SOURCE]]['actual'] += cps;
        combined[cr.memory[MEMORY_DEST]][cr.memory[MEMORY_SOURCE]]['cr'] += 1;
    }
    for (var rname in Game.rooms) {
        var rconfig = Game.rooms[rname].getConfig();
        if (!rconfig) { continue; }
        if (rconfig['spawn_room'] == rname) { continue; }
        for (var skey in rconfig['sources']) {
            var ts = rconfig['sources'][skey];
            var steps = ts['steps'];
            var intended = ts['carry_total'];
            if (!intended) {
                console.log(JSON.stringify(ts));
            }
            //CARRY_PARTS(3000, steps);
            if (combined[rname] == undefined) {
                combined[rname] = {};
            }
            if (combined[rname][skey] == undefined) {
                combined[rname][skey] = {'needed': 0, 'actual': 0, 'cr': 0};
            }
            combined[rname][skey]['needed'] += intended;
        }
    }
    var num_green = 0;
    var num_yellow = 0;
    var num_red = 0;
    for (var rname in combined) {
        var s_msgs = []
        for (var skey in combined[rname]) {
            var actual = combined[rname][skey]['actual'];
            var needed = combined[rname][skey]['needed'];
            var cr = combined[rname][skey]['cr'];
            if (sid && skey != sid) {
                continue;
            }
            if (actual == needed) {
                actual = '<font color="green">' + actual + '</font>';
                num_green++;
            } else if (actual > needed) {
                actual = '<font color="yellow">' + actual + '</font>';
                num_yellow++;
            } else {
                actual =  '<font color="red">' + actual + '</font>';
                num_red++;
            }
            var crtext = '';
            if (cr != undefined && cr > 1) {
                crtext = '(' + cr + ')';
            }
            s_msgs.push(skey + ': ' + actual + crtext + ' / ' + needed);   
        }
        console.log(rname + ': ' + s_msgs.join(', '));
    }
    console.log('<font color="green">' + num_green + '</font>, <font color="yellow">' + num_yellow + '</font>,  <font color="red">' + num_red + '</font>');
}

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

global.REPORT_STRUCTURES = function(verbose) {
    var ns = 0;
    for (var rname in Game.rooms) {
        ns += Game.rooms[rname].checkStructures(verbose);
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


global.REPORT_TERMINALS = function(mintype) {
    for (var rname in Game.rooms) { 
        if(Game.rooms[rname].terminal) { 
            if (mintype && Game.rooms[rname].terminal.store[mintype] == undefined) {
                continue;
            }
            console.log(rname + ' ' + JSON.stringify(Game.rooms[rname].terminal.store));
        }
    }
}

global.SHOW_BOOSTERS = function() {
    var assigned_labs = Memory['assigned_labs'];
    for (var labid in assigned_labs) {
        var labobj = assigned_labs[labid];
        if (labobj['purpose'] != 'boost') {
            continue;
        }
        console.log(labid + ': ' + JSON.stringify(labobj));
    }
}

global.MINERAL_INVENTORY = function() {
    var minobj = {}
    for (var rname in Game.rooms) { 
        if(Game.rooms[rname].isMine() && Game.rooms[rname].terminal) { 
            for (var mtype in Game.rooms[rname].terminal.store) {
                var mcount = Game.rooms[rname].terminal.store[mtype];
                if (!minobj[mtype]) {
                    minobj[mtype] = 0;
                }
                minobj[mtype] += mcount;
            }
        }
    }
    return minobj;
}

global.MINERAL_REACTION_COUNT = function(mname) {
    var reobj = REACTIONS[mname];
    if (!reobj) {
        return 0;
    }
    return Object.keys(reobj).length;
}

global.SHOW_MINERALS = function(mintype) {
    var minobj = global.MINERAL_INVENTORY();
    for (var mt in minobj) {
        console.log(mt + ': ' + minobj[mt]);
    }

    for (var method in BOOSTS) {
        console.log(method);
        for (var chem in BOOSTS[method]) {
            var bprops = BOOSTS[method][chem];
            var bpropstr = Object.keys(bprops).join(', ');
            var amt = 0;
            if (minobj[chem]) {
                amt = minobj[chem];
            }
            console.log(' - ' + chem + ': (' + bpropstr + '): ' + amt);
        }
    }

}

global.REPORT_WORKERS = function(onoff) {
    if (onoff) {
        SET_GLOBAL_CONFIG_KEY('report_workers', true);
        return true;
    } else {
        SET_GLOBAL_CONFIG_KEY('report_workers', false);
        return false;
    }
}

global.RECREATE_ROAD_NETWORKS = function() {
    for (var rname in Game.rooms) {
        if (!Game.rooms[rname].inEmpire()) {
            continue;
        }
        var psr = Game.rooms[rname].getSpawnRoom();
        if (!psr || !Game.rooms[psr] || Game.rooms[psr].getLevel() < 4) {
            continue;
        }
        
        var grm = Game.rooms[rname];
        grm.memory[MEMORY_ROAD_NETWORK] = [];
        var origins = grm.getFlagsByType(FLAG_ROADORIGIN);
        if (origins.length) {
            for (var a = 0; a < origins.length; a++) {
                grm.createRoadNetwork(origins[a].pos.x, origins[a].pos.y);
            }
        } else {
            console.log('RECREATE_ROAD_NETWORKS: ' + rname + ': no ORIGIN flag');
        }
    }
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
        console.log(rname + ': E:' + total_energy + ' (term:' + terminal_energy + ') L:' + rm.getLevel());
    }
    
}


global.REPORT_EARNINGS_SOURCES = function(filtervalue) {
    var report = {}
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

        if (!Game.creeps[cr].getRenewEnabled()) {
            var projected_life_cost = global.CREEP_COST(Game.creeps[cr].body) * -1;
            ept = projected_life_cost / 1500;
            //console.log('CREEP ' + cr + ' HAS PLC: ' + projected_life_cost + ' and EPT: ' + ept);
        }

        if (report[Game.creeps[cr].memory[MEMORY_DEST]] == undefined) {
            report[Game.creeps[cr].memory[MEMORY_DEST]] = {}
        }
        if (report[Game.creeps[cr].memory[MEMORY_DEST]][Game.creeps[cr].memory[MEMORY_SOURCE]] == undefined) {
            report[Game.creeps[cr].memory[MEMORY_DEST]][Game.creeps[cr].memory[MEMORY_SOURCE]] = {'earnings': 0, 'ticks': 0}
        }
        report[Game.creeps[cr].memory[MEMORY_DEST]][Game.creeps[cr].memory[MEMORY_SOURCE]]['earnings'] += earnings
        report[Game.creeps[cr].memory[MEMORY_DEST]][Game.creeps[cr].memory[MEMORY_SOURCE]]['ticks'] += tal
    }
    for (rname in report) {
        var r_e = 0;
        var r_t = 0;
        for (sname in report[rname]) {
            report[rname][sname]['ept'] = Math.round(report[rname][sname]['earnings'] / report[rname][sname]['ticks']);
            if (filtervalue == undefined || report[rname][sname]['ept'] < filtervalue) {
                console.log(rname + '/' + sname + ': has earned ' + report[rname][sname]['earnings'] + ' over ' + report[rname][sname]['ticks'] + ' or EPT: ' + report[rname][sname]['ept']); 
            }
            r_e += report[rname][sname]['earnings'];
            r_t += report[rname][sname]['ticks'];
        }
        var r_ept = Math.round(r_e/r_t);
        report[rname]['ept'] = r_ept;
        if (filtervalue == undefined || r_ept < filtervalue) {
            console.log(rname +'/ALL has earned ' + r_e + ' over ' + r_t + ' or EPT: ' + ROUND_NUMBER_TO_PLACES(r_ept, 2)); 
        }
    }

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
        var robj = Game.rooms[rname];
        if (!robj.isMine()) {
            continue;
        }
        var retval = Game.rooms[rname].createUnit(btype, rname);
        console.log('spawning ' + btype + ' for: ' + rname + ' result: ' + retval);
    }
}


global.ROOMLIST_ATTACK_WAVE = function (roomlist, unit_type, dest_room, roompath, dest_x, dest_y) {
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
    if (dest_room == undefined) {
        console.log('arg 3 must be dest_room');
        return -1;
    }
    
    var tprops = global.TEMPLATE_PROPERTIES(unit_type);
    
    var spawncount = 0;
    for (var rname in Game.rooms) {
        if (roomlist.indexOf(rname) != -1) {
            var res = Game.rooms[rname].createUnit(unit_type, dest_room, roompath, rname, dest_x, dest_y);
            console.log('ROOMLIST_ATTACK_WAVE: ' + rname + ' ' + res);
            if(res) {
                spawncount++;
            }
        }
    }
    return spawncount;
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
            
            return 1;
            
        } else {
            console.log('RESULT: ' + result);
        }
    }
    console.log('NUKE: no available launcher can target: ' + roomname);
    return 0;
}
