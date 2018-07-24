
global.CONVERT_TICKS = function(ticks) {
    var mins = ((ticks * 3.2) / 60);
    if (mins > 60) {
        return (mins / 60) + ' hours';
    }
    return mins + ' mins';
}

global.ADD_SIEGEPLAN = function(ticksahead, fromroom, destroom, waypoints, destx, desty) {
    var current_plans = Memory['MEMORY_GLOBAL_SIEGEPLANS'];
    // Game.rooms['W39S17'].createSiegeTeam('W39S20', ['W30S20','W30S27'], 25, 25);
    if (!fromroom || !ticksahead || !destroom || !Game.rooms[fromroom] || !destx || !desty) {
        console.log('params missing');
        return false;
    }
    current_plans[Game.time + ticksahead] = [fromroom, destroom, waypoints, destx, desty];
    Memory['MEMORY_GLOBAL_SIEGEPLANS'] = current_plans;
    return true;
}

global.RUN_SIEGEPLANS = function(verbose) {
    var current_plans = Memory['MEMORY_GLOBAL_SIEGEPLANS'];
    for (var starttime in current_plans) {
        var timetogo = starttime - Game.time;
        var optsarray = current_plans[starttime];
        if (timetogo < 0) {

            if(!Game.rooms[optsarray[0]]) {
                delete Memory['MEMORY_GLOBAL_SIEGEPLANS'][starttime];
                return true;
            }
            var spawnresult = Game.rooms[optsarray[0]].createSiegeTeam(optsarray[1], optsarray[2], optsarray[3], optsarray[4]);
            var textresult = 'NOW: ' + optsarray[0] + ' -> ' + optsarray[1] + '(' + optsarray[3] + ',' + optsarray[4] + ') then: ' + JSON.stringify(optsarray[2]) + ', result: ' + spawnresult
            console.log(textresult);
            if (spawnresult == true) {
                Game.notify(textresult);
                delete Memory['MEMORY_GLOBAL_SIEGEPLANS'][starttime];
                return true;
            }
            break;
        } else if (verbose) {
            console.log('In ' + timetogo + ': ' + optsarray[0] + ' -> ' + optsarray[1] + '(' + optsarray[3] + ',' + optsarray[4] + ') then: ' + JSON.stringify(optsarray[2]));
        }
    }
    return false;
}



global.REBUILD_EMPIRE_DATA = function() {
    var espt = ESPIONAGE_LIST_TARGETS();
    if (espt.length) {
        console.log('REBUILD_EMPIRE_DATA failed, espionage in progress. Remaining rooms: ' + espt.length);
        return false;
    }
    // Wipe existing data.
    Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT] = {}

    // Define bases first.
    var bases = global.LIST_BASES();
    for (var i = 0; i < bases.length; i++) {
        var rname = bases[i];
        CLAIM_ROOM(rname, rname); // rname, primary, secondary, override
        Game.rooms[rname].setRemotes();
    }

    // Add secondaries for bases.
    global.VERIFY_SECONDARIES(true);

    // Completely wipe and regenerate all room configs.

    global.REBUILD_RCONFIG();

}

global.REBUILD_RCONFIG = function() {
    for (var rname in Memory.rooms) {
        if (Memory.rooms[rname][MEMORY_RCONFIG]) {
            delete Memory.rooms[rname][MEMORY_RCONFIG];
        }
    }
    global.ESPIONAGE_REGEN_TARGETS();
}

global.VERIFY_SECONDARIES = function(force) {
    var bases = global.LIST_BASES();
    for (var i = 0; i < bases.length; i++) {
        var rname = bases[i];
        if (!Game.rooms[rname]){
            console.log(rname + ' not defined.');
            continue;
        }
        if (!Game.rooms[rname].inEmpire()){
            console.log(rname + ' owned, but not in empire!');
            continue;
        }
        Game.rooms[rname].seekSecondary(force);
    }
}

Room.prototype.seekSecondary = function(force_recalc) {
    if (!this.inEmpire()) {
        return false;
    }
    var bsr = Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][this.name]['backup_spawn_room'];

    if (bsr && bsr != this.name && Game.rooms[bsr] && Game.rooms[bsr].isMine() && !force_recalc) {
        return bsr;
    }
    
    if (this.isRemote()) {
        var rconfig = this.memory[MEMORY_RCONFIG];
        if (!rconfig) {
            return false;
        }
        var spawn_room = rconfig[MEMORY_RC_PSR];
        if (Memory.rooms[spawn_room] && Memory.rooms[spawn_room][MEMORY_RCONFIG] && Memory.rooms[spawn_room][MEMORY_RCONFIG][MEMORY_RC_BSR]) {
            Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][this.name][MEMORY_RC_BSR] = Memory.rooms[spawn_room][MEMORY_RCONFIG][MEMORY_RC_BSR];
            this.memory[MEMORY_RCONFIG][MEMORY_RC_BSR] = Memory.rooms[spawn_room][MEMORY_RCONFIG][MEMORY_RC_BSR];
            if (Memory.rooms[spawn_room][MEMORY_RC_BSS]) {
                Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][this.name][MEMORY_RC_BSS] = Memory.rooms[spawn_room][MEMORY_RCONFIG][MEMORY_RC_BSS];
                this.memory[MEMORY_RCONFIG][MEMORY_RC_BSS] = Memory.rooms[spawn_room][MEMORY_RCONFIG][MEMORY_RC_BSS];
            }
            return true;
        }
        return false;
    }

    var alts = global.LIST_BASES();
    var champ_name = undefined;
    var champ_steps = 99999999;
    var my_spawns = Game.rooms[this.name].find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_SPAWN); } });
    if (!my_spawns.length) {
        return false;
    }
    for (var j = 0; j < alts.length; j++) {
        var r2 = alts[j];
        if (r2 == this.name) {
            continue;
        }
        var this_dist = Game.map.getRoomLinearDistance(this.name, r2);
        if (this_dist > 4) {
            // Do not even bother trying to compute a path for secondaries 5 or more rooms away.
            continue;
        }
        var their_spawns = Game.rooms[r2].find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_SPAWN); } });
        if (!their_spawns.length) {
            continue;
        }
        var pfobj = PathFinder.search(my_spawns[0].pos, {'pos': their_spawns[0].pos, 'range': 2}, {'maxOps': 10000, 'swampCost': 2});
        var pfpath = pfobj['path'];
        var pflength = pfpath.length;
        var pfops = pfobj['ops'];
        if (pfobj['incomplete']) {
            console.log(this.name + ' <- ' + r2 + ': incomplete path of ' + pflength + ' steps from: ' + JSON.stringify(my_spawns[0].pos) + ' to ' + JSON.stringify(my_sources[0].pos) + ' in ' + pfops + ' operations.');
            continue;
        }
        console.log(this.name + ': considering secondary: ' + r2 + ' based on steps of ' + pflength);
        if (pflength < champ_steps) {
            champ_name = r2;
            champ_steps = pflength;
        }
    }
    if (champ_name) {
        Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][this.name][MEMORY_RC_BSR] = champ_name;
        Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][this.name][MEMORY_RC_BSS] = champ_steps;
        this.memory[MEMORY_RCONFIG][MEMORY_RC_BSR] = champ_name;
        this.memory[MEMORY_RCONFIG][MEMORY_RC_BSS] = champ_steps;
        if (champ_name != bsr) {
            console.log(this.name + ': is assigned secondary of: ' + champ_name + ' based on steps of ' + champ_steps + ' (current: ' + bsr +')');
        } else {
            console.log(this.name + ': keeps existing secondary of: ' + champ_name + ' based on steps of ' + champ_steps);
        }
        return champ_name;
    } else {
        console.log(this.name + ': no secondary to assign.');
    }
    return true;
}

global.LIST_BASES = function() {
    var bases = [];
    for (var rname in Game.rooms) {
        if (!Game.rooms[rname].isMine()) {
            continue;
        }
        if (!Game.rooms[rname].inEmpire()) {
            continue;
        }
        bases.push(rname);
    }
    return bases;
}

global.UPDATE_CSITES = function() {
    var rc = {}
    for (var hash in Game.constructionSites) {
        var thisc = Game.constructionSites[hash];
        if (rc[thisc.room.name] == undefined) {
            rc[thisc.room.name] = [];
        }
        rc[thisc.room.name].push(hash);
    }
    for (var rname in rc) {
        console.log(rname + ': ' + rc[rname].length);
    }
}

global.BUY_ENERGY = function() {
    if (Game.market.credits < 2000000) {
        return false;
    }
    for (var rname in Game.rooms) {
        var robj = Game.rooms[rname];
        if (!robj.isMine()) {
            continue;
        }
        if (robj.getLevel() == 8) {
            //continue;
        }
        var rterm = robj.terminal;
        if (!rterm || !rterm.isActive()) {
            continue;
        }
        if (rterm.store[RESOURCE_ENERGY] >= 50000) {
            continue;
        }
        var ber = robj.buyEnergy();
        if (ber) {
            console.log(rname + ': BUY_ENERGY(): attempted energy buy: SUCCESS');
            return true;
        } else {
            console.log(rname + ': BUY_ENERGY(): attempted energy buy: FAILURE');
        }
        break;
    }
    return false;
}

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
        if (rconfig[MEMORY_RC_PSR] == rname) { continue; }
        for (var skey in rconfig[MEMORY_RC_SOURCES]) {
            var ts = rconfig[MEMORY_RC_SOURCES][skey];
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

global.REPORT_STRUCTURES = function(verbose, force) {
    var ns = 0;
    for (var rname in Game.rooms) {
        ns += Game.rooms[rname].checkStructures(verbose, force);
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
    var assigned_labs = Memory[MEMORY_GLOBAL_SCIENCELABS];
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

global.FIND_MINERAL = function(mintype, silent, threshold = 3000) {
    var running_total = 0;
    for (var rname in Game.rooms) {
        if (!Game.rooms[rname].isMine() || !Game.rooms[rname].terminal) {
            continue;
        }
        var t = Game.rooms[rname].terminal;
        var a = t.store[mintype];
        if (!a) {
            continue;
        }
        if (a < threshold) {
            continue;
        }
        var adj_amt = a - threshold;
        running_total += adj_amt;
        if (!silent) {
            console.log(rname + ': ' + a);
        }
    }
    return running_total;
}

global.SHOW_SIEGE_BOOSTS = function() {
    for (var i = 0; i < ALL_SIEGE_BOOSTS.length; i++) {
        var amt = FIND_MINERAL(ALL_SIEGE_BOOSTS[i], true, 3000);
        console.log(ALL_SIEGE_BOOSTS[i] + ': ' + amt);
    }
}

global.SHOW_MINERALS = function(mintype) {
    var minobj = global.MINERAL_INVENTORY();
    for (var mt in minobj) {
        console.log(mt + ': ' + minobj[mt].toLocaleString('en'));
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
            console.log(' - ' + chem + ': (' + bpropstr + '): ' + amt.toLocaleString('en'));
        }
    }

}

global.REPORT_WORKERS = function(keyval) {
    SET_GLOBAL_CONFIG_KEY('report_workers', keyval);
    return keyval;
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
        grm.createRoadNetwork();
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
            var msg = rname + ': ' + incoming.length + ' incoming nuke(s)';
            console.log(msg);
            Game.notify(msg);
        }
    }
}

global.ENERGY_STATUS = function() {
    for (var rname in Game.rooms) {
        var rm = Game.rooms[rname];
        var rp = rm.getEnergyPriority();
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
        console.log(rname + ': Storage:' + storage_energy.toLocaleString('en') + ' (Term:' + terminal_energy.toLocaleString('en') + ') L:' + rm.getLevel() + ' P:' + rp);
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
            console.log(Game.creeps[cr].room.name + ': ' + cr + ' is not needed. Renewal: ' + Game.creeps[cr].memory[MEMORY_RENEW] + '. Expires in: ' + Game.creeps[cr].ticksToLive);
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

global.SPAWN_EVERYWHERE_2 = function (btype) {
    for (var sname in Game.spawns) {
        var rname = Game.spawns[sname].room.name;
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
    var affected = 0;
    if (waypoints == undefined || waypoints == null) {
        waypoints = [];
    }
    for (var crname in Game.creeps) {
        if (Game.creeps[crname].memory[MEMORY_ROLE] == role) {
            Game.creeps[crname].memory[MEMORY_DEST] = newtarget;
            Game.creeps[crname].memory[MEMORY_NEXTDEST] = waypoints;
            affected++;
        }
    }
    return affected;
}

global.SWITCH_ROLE = function (rolea, roleb) {
    var switchedCount = 0;
    for (var crname in Game.creeps) {
        if (Game.creeps[crname].memory[MEMORY_ROLE] == rolea) {
            Game.creeps[crname].memory[MEMORY_ROLE] = roleb;
            switchedCount++;
        }
    }
    return switchedCount;
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
    var resource_xfer = false;
    for(var rname in Game.rooms) {
        var robj = Game.rooms[rname];
        if(robj.isMine() && robj.getLevel() == 8) {
            missing_nukers.push(rname);
        }
    }
    for(var id in Game.structures){
        if(Game.structures[id].structureType == STRUCTURE_NUKER){
            if (!Game.structures[id].room.isMine()) {
                //console.log('LAUNCHER: located in room ' + Game.structures[id].room.name + ' which I do not own.');
                continue;
            }
            _.pull(missing_nukers, Game.structures[id].room.name);
            if (!Game.structures[id].isActive()) {
                //console.log('LAUNCHER: inactive ' + Game.structures[id].room.name + '(RLVL: ' + Game.structures[id].room.getLevel() + ')');
                continue;
            }
            var g_amt = Game.structures[id].ghodium;
            if (g_amt == undefined) {
                g_amt = 0;
            }
            var g_storage = 0;
            if (Game.structures[id].room.terminal) {
                if (Game.structures[id].room.terminal.store[RESOURCE_GHODIUM]) {
                    g_storage = Game.structures[id].room.terminal.store[RESOURCE_GHODIUM];
                }
                if (g_storage < 5000) {
                    if (g_amt == 5000) {

                    } else if (resource_xfer) {
                        console.log(Game.structures[id].room.name + ': want to acquire GHODIUM next cycle.');
                    } else {
                        resource_xfer = true;
                        var retval = Game.structures[id].room.terminal.acquireMineralAmount(RESOURCE_GHODIUM, 5000, 5000);
                        console.log(Game.structures[id].room.name + ': acquiring GHODIUM: ' + retval);
                    }
                }
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
