global.CHECK_FOR_OVERBURDENED_SPAWNERS = function () {
    // 'ROOM IS MANAGING TOO MANY PARTS' ALERT
    var max_parts_per_spawner = 400;
    var room_parts = {}
    for (var crname in Game.creeps) {
        var cr = Game.creeps[crname];
        var sroom = cr.memory[MEMORY_SPAWNERROOM]
        if (!sroom) {
            continue;
        }
        var pcount = cr.body.length;
        if (room_parts[sroom] == undefined) {
            room_parts[sroom] = 0;
        }
        room_parts[sroom] += pcount;
    }
    for (var rmname in room_parts) {
        var rmspawns = Game.rooms[rmname].find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } } );
        var num_spawns = rmspawns.length;
        if (room_parts[rmname] > (max_parts_per_spawner * num_spawns)) {
            console.log('CHECK_FOR_OVERBURDENED_SPAWNERS: room ' + rmname + ' is maintaining ' + room_parts[rmname] + ' with ' + num_spawns + ' spawner(s). This is > ' + max_parts_per_spawner + ' parts per spawner');
        }
    }
}

global.ROUND_NUMBER_TO_PLACES = function (value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

global.FLAG_TYPE_TO_COLORS_COLORS = function (sconstant) {
    var result = global.empire_flags[sconstant];
    return result;
}


global.IS_ALLY = function (uname) {
    if (global.LOANlist != undefined) {
        if (global.LOANlist.includes(uname)) {
            return true;
        }
    }
    if (allies.includes(uname)) {
        return true;
    }
    return false;
}

global.IS_ENEMY = function (uname) {
    if (enemies.includes(uname)) {
        return true;
    }
    return false;
}

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

global.UNIT_COST = function (thebody) {
    var total_cost = 0;
    if (!thebody) {
        console.log('UNIT_COST: called with no body argument!');
        return total_cost;
    }
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
    
    var work_parts = 0;
    var attack_parts = 0;
    var ranged_attack_parts = 0;
    var heal_parts = 0;
    var claim_parts = 0;
    
    for (var i = 0; i < thebody.length; i++) {
        if (thebody[i] == WORK) {
            work_parts++;
        }
        if (thebody[i] == ATTACK) {
            attack_parts++;
        }
        if (thebody[i] == RANGED_ATTACK) {
            ranged_attack_parts++;
        }
        if (thebody[i] == HEAL) {
            heal_parts++;
        }
        if (thebody[i] == CLAIM) {
            claim_parts++;
        }
    }
    if (work_parts > 0) {
        var dismantle_dps = work_parts * DISMANTLE_POWER;
        retval['dismantle_dps'] = dismantle_dps;
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
    if (claim_parts > 0) {
        var ctrlatk = claim_parts * CONTROLLER_CLAIM_DOWNGRADE;
        retval['controllerAttack'] = ctrlatk;
    }
    console.log(JSON.stringify(retval));
    retval['parts'] = thebody;

    return retval;
}


global.CARRY_PARTS = function (capacity, steps) {
    var p = Math.ceil(capacity / ENERGY_REGEN_TIME * 2 * steps / CARRY_CAPACITY);
    //if (p % 2) { p++; } // makes it even by adding one. We get two CARRYs for the sake of a MOVE, anyway, so no point not having it.
    return p;
}

global.CONSTRUCT_HAULER_BODY = function (roomid, sourceid, max_cost) {
    var sinfo = GET_SOURCE_INFO(roomid, sourceid);
    if (sinfo) {
        if (sinfo['carry_per_hauler']) {
            //console.log('CONSTRUCT_HAULER_BODY: success: GET_SOURCE_INFO(' + roomid + ',' + sourceid +') carryparts:' + sinfo['carry_per_hauler']); 
            var partlist = [WORK, MOVE];
            for (var i = 0; i < Math.floor(sinfo['carry_per_hauler'] / 2); i++) {
                partlist.push(CARRY);
                partlist.push(CARRY);
                partlist.push(MOVE);
            }
            return partlist;
        } else {
            console.log('CONSTRUCT_HAULER_BODY: call returned a sinfo without carry_per_hauler: GET_SOURCE_INFO(' + roomid + ',' + sourceid +')'); 
        }
    } else {
        console.log('CONSTRUCT_HAULER_BODY: call failed: GET_SOURCE_INFO(' + roomid + ',' + sourceid +')');
    }

    var sourcecapacity = 1500;
    var steps = 60;
    
    /*var exactsteps = GET_STEPS_TO_SOURCE(roomid, sourceid);
    if (exactsteps != undefined) {
        steps = exactsteps;
    }*/
    //console.log('S: ' + sourcecapacity + ' Y: ' + steps);
    var carry_parts = global.CARRY_PARTS(sourcecapacity, steps);
    var partlist = [WORK, MOVE];
    for (var i = 0; i < Math.floor(carry_parts / 2); i++) {
        if ((UNIT_COST(partlist) + UNIT_COST([CARRY, CARRY, MOVE])) > max_cost) {
            console.log(roomid + ': Trying to build a hauler of ' + ((carry_parts / 2) - i) + ' bigger size than our spawner allows. Capping it.');
            break;
        }
        partlist.push(CARRY);
        partlist.push(CARRY);
        partlist.push(MOVE);
    }
    return partlist;
}

/*
global.CONSTRUCT_HAULER_BODY = function (roomid, sourceid, max_cost) {
    var sourcecapacity = 1500;
    var steps = 100;
    var exactsteps = GET_STEPS_TO_SOURCE(roomid, sourceid);
    if (exactsteps != undefined) {
        steps = exactsteps;
    }
    //console.log('S: ' + sourcecapacity + ' Y: ' + steps);
    var carry_parts = global.CARRY_PARTS(sourcecapacity, steps);
    var partlist = [WORK, MOVE];
    for (var i = 0; i < Math.floor(carry_parts / 2); i++) {
        if ((UNIT_COST(partlist) + UNIT_COST([CARRY, CARRY, MOVE])) > max_cost) {
            console.log(roomid + ': Trying to build a hauler of ' + ((carry_parts / 2) - i) + ' bigger size than our spawner allows. Capping it.');
            break;
        }
        partlist.push(CARRY);
        partlist.push(CARRY);
        partlist.push(MOVE);
    }
    return partlist;
}
*/

global.CONSTRUCT_RESERVER_BODY = function (resticksremaining, maxroomenergy) {
    if (resticksremaining > 2000 || maxroomenergy < 1300) {
        return [MOVE, CLAIM];
    } else {
        return [MOVE, MOVE, CLAIM, CLAIM];
    }
}


global.REFRESH_CREEPS = function(role) {
    var nc = 0;
    for (var cr in Game.creeps) {
        if (role && Game.creeps[cr].memory[MEMORY_ROLE] != role) {
            continue;
        }
       Game.creeps[cr].disableRenew(); 
       nc++;
    }
    return nc;
}

global.SUICIDE_ROLE = function(role, source) {
    if (!role) {
        return false;
    }
    var nc = 0;
    for (var cr in Game.creeps) {
        if (Game.creeps[cr].memory[MEMORY_ROLE] != role) {
            continue;
        }
        if (source && Game.creeps[cr].memory[MEMORY_SOURCE] != source) {
            continue;
        }
       Game.creeps[cr].suicide(); 
       nc++;
    }
    return nc;
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
        console.log('DELETE OLD ORDER: Room ' + my_orders[thisorder]['roomName'] + ', id ' + my_orders[thisorder]['id'] + ', for ' + my_orders[thisorder]['resourceType'] + ', with remainingAmount ' + my_orders[thisorder]['remainingAmount']);
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
        var myinfo = GET_ROOM_CONFIG(rname);
        if (myinfo == undefined) {
            continue;
        }

        if (myinfo['mineraltype'] != undefined) {
            var mtype = myinfo['mineraltype'];
            if(Game.rooms[rname].terminal.store[mtype] == undefined || Game.rooms[rname].terminal.store[mtype] == undefined || Game.rooms[rname].terminal.store[mtype] < 30000) {
                //console.log('MARKET: ' + rname + ': has <1k of sale mineral: ' + mtype);
            } else {
                Game.rooms[rname].sellResource(mtype);
            }
        }
        
        // Right now, disable all selling of energy.
        /*
        if (false) {
            var rlvl = Game.rooms[rname].getLevel();
            var stored_e = Game.rooms[rname].terminal.store[RESOURCE_ENERGY];
            if (rlvl < 8) {
                console.log(rname + ' not selling energy... level:' + rlvl + ' < 8,  avail:' + stored_e);
            } else if (!stored_e || stored_e < terminal_energy_sell) {
                console.log(rname + ' not selling energy... level:' + rlvl + ', avail:' + stored_e + ' < ' + terminal_energy_sell);
            } else {
                Game.rooms[rname].sellResource(RESOURCE_ENERGY);
            }
        }
        */
    }
    return 'OK';
}






