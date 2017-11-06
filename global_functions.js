

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

global.SPAWN_UNIT = function (spawnername, role, targetroomname, roompath) {
    if (Game.spawns[spawnername] == undefined) {
        console.log('No such spawner.');
        return 0;
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
    SPAWNCUSTOM(Game.spawns[spawnername], '', empire_workers[role]['body'], role, 
                        '', targetroomname, global.UNIT_COST(empire_workers[role]['body']), 
                        Game.spawns[spawnername].room.name, 25, 
                        25, 0, roompath);
    return 'DONE';
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
        SPAWN_UNIT(spawn_list[i], unit_type, target_room, roompath);
    }
}

global.PRESET_ATTACK_WAVE = function () {
    /* TARGETS: 
    W57S12 - their biggest mining base.
    W57S15 - their south mining base
    W59S12 - their west mining base
    W56S11 - their between the rooms base
    */

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


global.GET_SPAWNER_FOR_ROOM = function(theroomname) {
    if (empire[theroomname] == undefined) {
        console.log('GET_SPAWNER_FOR_ROOM: undefined empire block for ' + theroomname);
        return undefined;
    }
    var backup_spawn_room = undefined;
    if (empire[theroomname]['backup_spawn_room'] != undefined) {
           backup_spawn_room = Game.rooms[empire[theroomname]['backup_spawn_room']];
    }
    if (empire[theroomname]['spawn_room'] == undefined) {
        console.log('GET_SPAWNER_FOR_ROOM: undefined spawn_room for ' + theroomname);
        return undefined;
    }
    var spawn_room = Game.rooms[empire[theroomname]['spawn_room']];
    if (spawn_room == undefined) {
        if(backup_spawn_room == undefined) {
            console.log('GET_SPAWNER_FOR_ROOM: undefined GAME.ROOMS for spawn_room and backup_spawn_room of ' + theroomname);
            return undefined;
        }
    }
    var spawners = [];
    if (spawn_room != undefined) {
        spawners = spawn_room.find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_SPAWN && structure.isAvailable() == 1); } });
    }
    if (!spawners.length) {
        if (backup_spawn_room != undefined) {
            var primary_spawners = spawn_room.find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_SPAWN); } });
            if(!primary_spawners.length) {
                var backup_spawners = backup_spawn_room.find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_SPAWN && structure.isAvailable()); } });
                if (backup_spawners.length) {
                    console.log('GET_SPAWNER_FOR_ROOM: returning backup spawner for:  ' + theroomname);
                    return backup_spawners[0];
                }
            }
        }
        //console.log('GET_SPAWNER_FOR_ROOM: spawners is zero length ' + theroomname);
        return undefined;
    }
    //console.log('GSFR: for ' + theroomname + ' returned ' +spawners[0].name);
    return spawners[0];
}

global.UPDATE_MARKET_ORDERS = function() {
    for (var rname in Game.rooms) {
        if (Game.rooms[rname].terminal == undefined) {
            continue;
        }
        if (Game.rooms[rname].terminal.cooldown > 0) {
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
