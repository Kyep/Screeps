
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

global.SPAWN_TELLERS = function () {
    for (var rname in Game.rooms) {
        var rlvl = Game.rooms[rname].getLevel();
        if (rlvl >= 5) {
            console.log('spawning teller for: ' + rname);
            Game.rooms[rname].createUnit('teller', rname);
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
    
    var bodycostarr = global.TEMPLATE_COST(unit_type);
    
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
