
Room.prototype.getShouldUpgrade = function() {
    
    //  Memory['gcl_farm'] = ['W53S18', 'W59S18', 'W53S17', 'W57S14']
    
    var gcl_farm_rooms = Memory['gcl_farm'];
    if (Memory['gcl_farm'].indexOf(this.name) == -1) {
        return 1;
    }
    var room_level = this.getLevel();
    if (room_level == 8) {
        return 0;
    }
    return 1;
}

Room.prototype.dropRoads = function() {
    if(empire[this.name] == undefined) {
        return -1;
    }
    var gsapfr = GET_SPAWNER_AND_PSTATUS_FOR_ROOM(this.name);
    var spawner = gsapfr[0];
    var using_primary = gsapfr[1];
    if (!using_primary) {
        return -2;
    }
    var spawner_pos = spawner.pos;
    for (var sid in empire[this.name]['sources']) {
        if (empire[this.name]['sources']['dynamic'] != undefined && empire[this.name]['sources']['dynamic'] == true) {
            continue;
        }
        var source = Game.getObjectById(sid);
        if (!source) {
            continue;
        }
        var path = PathFinder.search(spawner.pos, source.pos, {'range': 1, 'swampCost': 1});
        console.log(this.name + ': dropRoads: ' + sid + ': ' + path.path.length);
        for (var thispos in path.path) {
            var roadpos = path.path[thispos];
            var rname = roadpos.roomName;
            if (rname == this.name) {
                Game.rooms[rname].visual.circle(roadpos.x, roadpos.y, rname);
                Game.rooms[rname].createConstructionSite(roadpos.x, roadpos.y, STRUCTURE_ROAD);
            }
        }
    }

}

Room.prototype.getMyStructuresCount = function() {
    var mystructures = this.find(FIND_MY_STRUCTURES);
    var mywalls = this.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_WALL } } );
    return mystructures.length + mywalls.length;
}


Room.prototype.getTowerRepairMax = function() {
    var lvl = this.controller.level;
    if (lvl < 3) {
        return 0; // no towers at this level anyway
    } else if (lvl == 3) {
        return 10000;
    } else if (lvl == 4) {
        return 25000;
    } else if (lvl == 8) {
        return 2000000; // two million max.
    } else {
        return 50000 * lvl;
    }
}

Room.prototype.getStoredEnergy = function() {
    var total_energy = 0;
    if (this.storage != undefined && this.storage.isActive()) {
        total_energy += this.storage.store.energy;
    }
    if (this.terminal != undefined && this.terminal.isActive()) {
        var terminal_energy = this.terminal.store.energy;
        if (terminal_energy > empire_defaults['terminal_energy_min']) {
            terminal_energy -= empire_defaults['terminal_energy_min'];
            total_energy += terminal_energy;
        }
    }
    return total_energy;
}

Room.prototype.classifyStoredEnergy = function(energyamount) {
    if (!arguments.length) {
        energyamount = this.getStoredEnergy();
    }
    var energy_minimum = empire_defaults['room_energy_min'];
    var energy_maximum = empire_defaults['room_energy_max']; // 1,000,000 units in storage.
    if (energyamount < energy_minimum) {
        return ENERGY_EMPTY;
    } else if (energyamount > energy_maximum) {
        return ENERGY_FULL; 
    } else {
        if(energyamount >= (energy_minimum + 50000)) {
            if (this.controller && this.controller.level && this.controller.level == 8) {
                // Level 8 rooms actively try to get rid of their energy, in favor of pushing it to other rooms that can better use it.
                return ENERGY_FULL;
            } else {
                return ENERGY_SPARE;
            }
        }
        return ENERGY_OK;
    }
}

Room.prototype.hasTerminalNetwork = function() {
    if (this.controller == undefined) {
        return 0;
    }
    if (this.controller.owner == undefined) {
        return 0;
    }
    if (this.controller.owner.username == undefined) {
        return 0;
    }
    if (this.controller.owner.username != overlord) {
        return 0;
    }
    if (this.controller.level == undefined) {
        return 0;
    }
    if (this.controller.level < 6) {
        return 0;
    }
    if (this.terminal == undefined) {
        return 0;
    }
    if (!this.terminal.isActive()) {
        return 0;
    }
    return 1;
}

Room.prototype.getLevel = function() {
    if (this.controller == undefined) {
        return 0;
    }
    if (this.controller.owner == undefined) {
        return 0;
    }
    if (this.controller.level == undefined) {
        return 0;
    }
    return this.controller.level;
}

Room.prototype.hasAlert = function() {
    if (this.name in Memory['sectors_under_attack']) {
        return 1;
    }
    return 0;
}

Room.prototype.getAlertObject = function() {
    if (this.name in Memory['sectors_under_attack']) {
        return Memory['sectors_under_attack'][this.name];
    }
    console.log('ERROR: getAlertObject called on ' + this.name + ' that has no alert...');
    return {};
}

Room.prototype.shouldHaveAlert = function(enemy_details, nuke_details) {
    var debug = 0;
    if (enemy_details['hostileCount'] > 0) { 
        //console.log(this.name + ': shouldHaveAlert: ' + 'eval');   
        //debug = 1;
    }
    if (empire[this.name] == undefined) {
        if (debug) { console.log(this.name + ': shouldHaveAlert: ' + ' not in empire');   }
        return 0; // never create alerts for rooms we do not claim.
    }
    if (this.controller != undefined && this.controller.owner != undefined && this.controller.owner.username != overlord) {
        if (debug) { console.log(this.name + ': shouldHaveAlert: ' + 'not ours');   }
        return 0; // never create alerts for rooms owned by other players, even if they are defined as part of our empire.
    }
    if (empire[this.name]['ignoreattacks'] != undefined) {
        if (debug) { console.log(this.name + ': shouldHaveAlert: ' + 'ignoreattacks');   }
        return 0; // never create alerts for rooms specifically marked to never go on alert.
    }
    
    if (enemy_details['hostileCount'] > 0) {
        if (!allies.includes(enemy_details['hostileUsername'])) {
            return 1;
        }
    }
    if (nuke_details['nukeCount'] > 0 && nuke_details['nukeTimeToLand'] < 200) {
        return 1;
    }
    
    if (this.hasAlert()) {
        var thealert = this.getAlertObject();
        var tgap = Game.time - thealert['lastRefreshed']; 
        if (tgap >= empire_defaults['alerts_duration']) {
            return 0;
        }
    }
    if (debug) {  console.log(this.name + ': shouldHaveAlert: ' + 'no condition met');   }
    return 0;
}

Room.prototype.detailEnemies = function() {
    var details = {};

    details['hostileCost'] = 0;

    var enemiesList = this.find(FIND_HOSTILE_CREEPS);
    details['hostileCount'] = enemiesList.length;
    details['hostileRanged'] = 0;
    details['hostileUsername'] = 'Invader';

    if(enemiesList.length) {
        for(var i = 0; i < enemiesList.length; i++) {
            var this_enemy_cost = global.CREEP_COST(enemiesList[i].body);
            if(enemiesList[i].isBoosted()) {
                this_enemy_cost *= 2; // This treats boosted creeps as twice as dangerous. They can be up to 4x... but this is a simple method of treating these creeps more seriously.
            }
            details['hostileCost'] += this_enemy_cost;
            if (enemiesList[i].owner != undefined) {
                if (enemiesList[i].owner.username != undefined) {
                    if (enemiesList[i].owner.username != details['hostileUsername']) {
                        details['hostileUsername'] = enemiesList[i].owner.username;
                    }
                }
            }
            if (details['hostileUsername'] == 'Invader' && enemiesList[i].classifyMilitaryType() == RANGED_ATTACK && enemiesList[i].getActiveBodyparts(HEAL) == 0 ) {
                details['hostileRanged']++;
            }
        }
    }
    return details;
}


Room.prototype.detailNukes = function() {
    var details = {};
    details['nukeCount'] = 0;
    details['nukeTimeToLand'] = Infinity;
    details['nukeLaunchRoomName'] = '';
    var nuke_list = this.find(FIND_NUKES);
    for (var i = 0; i < nuke_list.length; i++) {
        details['nukeCount']++;
        if (nuke_list[i].timeToLand < details['nukeTimeToLand']) {
            details['nukeTimeToLand'] = nuke_list[i].timeToLand;
            details['nukeLaunchRoomName'] = nuke_list[i].launchRoomName;
        }
    }
    return details;
}

Room.prototype.createAlert = function(enemy_details, nuke_details) {
    var thisalert = {};
    thisalert['attackStart'] = Game.time;
    thisalert['myStructureCount'] = this.getMyStructuresCount();
    thisalert['updateCount'] = 0;
    
    var texits = Game.map.describeExits(this.name);
    var exit_arr = []
    for (var ex in texits) {
        exit_arr.push(texits[ex]);
    }
    for (var tc in Game.creeps) {
        if(!exit_arr.includes(Game.creeps[tc].room.name)) { // if they aren't next door, skip them.
            continue;
        }
        if(Game.creeps[tc].memory[MEMORY_ROLE] == undefined) {
            continue;
        }
        if (!empire_defaults['military_roles'].includes(Game.creeps[tc].memory[MEMORY_ROLE])) {
            continue;
        }
        var theirEnemies = Game.creeps[tc].room.find(FIND_HOSTILE_CREEPS);
        if (theirEnemies.length) {
            continue;
        }
        Game.creeps[tc].memory[MEMORY_DEST] = this.name;
        console.log('createAlert REASSIGN: sent ' + Game.creeps[tc].name + ' to defend ' + this.name);
        //Game.notify('REASSIGN: sent ' + Game.creeps[tc].name + ' to defend ' + this.name);
    }
    thisalert['myStructureData'] = {}
    var my_structures = this.find(FIND_STRUCTURES);
    for (var i = 0; i < my_structures.length; i++) {
        if(thisalert['myStructureData'][my_structures[i].structureType] == undefined) {
            thisalert['myStructureData'][my_structures[i].structureType] = [];
        }
        thisalert['myStructureData'][my_structures[i].structureType].unshift(my_structures[i].pos);
    }

    Memory['sectors_under_attack'][this.name] = thisalert;
    return thisalert;
}

Room.prototype.deleteAlert = function() {
    
    var myalert = Memory['sectors_under_attack'][this.name];
    
    if (myalert == undefined) {
        var alert_string = this.name +': ERROR: trying to delete a non-existent alert.';
	    console.log(alert_string);
	    Game.notify(alert_string);
        return 1;
    }

    var alert_age = Game.time - myalert['attackStart'];

    // Rebuild any structures that were destroyed during the alert.
    var old_structurelist = myalert['myStructureData'];
    for (var stype in old_structurelist) {
        for (var i = 0; i < old_structurelist[stype].length; i++) {
            var structure_pos = old_structurelist[stype][i];
        	var structures_at = this.lookForAt(LOOK_STRUCTURES, structure_pos.x, structure_pos.y, structure_pos);
        	var is_intact = 0;
        	for (var j = 0; j < structures_at.length; j++) {
        		if (structures_at[j].structureType == stype) {
        			is_intact = 1;
        		}
        	}
        	if (!is_intact) {
        	    var alert_string = this.name +': MISSING ' + stype + ' AT: ' +structure_pos.x + ',' + structure_pos.y + ' after attack from ' + myalert['hostileUsername'] + ' - REBUILDING!';
        	    console.log(alert_string);
        	    Game.notify(alert_string);
        		this.createConstructionSite(structure_pos.x, structure_pos.y, stype);
        	}
        }
    }
    
    // Reassign or recycle mobs created because of the alert.
    if(empire_defaults['alerts_recycle'] == 1) {
        for(var name in Game.creeps) {
            if(Game.creeps[name].memory[MEMORY_DEST] == this.name && (empire_defaults['military_roles'].includes(Game.creeps[name].memory[MEMORY_ROLE]))) {
                Game.creeps[name].memory[MEMORY_ROLE] = 'recycler';
                Game.creeps[name].say('🔄 recycle');
                console.log('RECYCLE: ' + name + ' due to it being part of sector defense forces for a sector that is no longer under attack.');
            }
        }
    } else if (empire_defaults['alerts_reassign'] != undefined) {
        for(var crname in Game.creeps) {

            if(Game.creeps[crname].memory.target == this.name && empire_defaults['military_roles'].includes(Game.creeps[crname].memory[MEMORY_ROLE])) {
                if (Game.creeps[crname].memory[MEMORY_SPAWNERNAME] == undefined) {
                    continue;
                }
                var spname = Game.creeps[crname].memory[MEMORY_SPAWNERNAME];
            }

            if (empire_defaults['alerts_reassign'][spname] != undefined) {
                Game.creeps[crname].memory[MEMORY_DEST] = empire_defaults['alerts_reassign'][spname];
                Game.creeps[crname].notifyWhenAttacked(false);
                console.log('HARASS: sent ' + crname + ' to harass' + empire_defaults['alerts_reassign'][spname]);
                Game.notify('HARASS: sent ' + crname + ' to harass' + empire_defaults['alerts_reassign'][spname]);
            }

        }
    }


    var end_msg = 'ATTACK on ' + this.name + ' by ' + myalert['hostileUsername'] + ' worth ' + myalert['hostileCostMax'] + ' ENDED after ' + alert_age + ' ticks.';
    console.log(end_msg);
    if (myalert['hostileUsername'] != 'Invader') {
        //if (myalert['hostileCostMax'] > 50 || myalert['hostileUsername'] != 'eduter') {
            Game.notify(end_msg);
        //}
    }

    // Actually delete the alert.
    var all_alerts = Memory['sectors_under_attack'];
    if (all_alerts[this.name] != undefined) {
        delete all_alerts[this.name];
    }
    Memory['sectors_under_attack'] = all_alerts;
    return 1;

}

Room.prototype.updateAlert = function(enemy_details, nuke_details) {
    //console.log('Updatealert enemy_details' + JSON.stringify(enemy_details));
    var thisalert = {};
    if(this.hasAlert) {
        thisalert = this.getAlertObject();
    } else {
        var tmsg = 'updateAlert ERROR: ' + this.name + ' has no alert to start with!';
        console.log(tmsg);
        Game.notify(tmsg);
        return {};
    }

    if (thisalert['updateCount'] == undefined) {
        thisalert['updateCount'] = 0;
    }
    if (thisalert['hostileCostMax'] == undefined) {
        thisalert['hostileCostMax'] = 0;
    }
    if (enemy_details['hostileCost'] > thisalert['hostileCostMax']) {
        thisalert['hostileCostMax'] = enemy_details['hostileCost'];
    }
    
    thisalert['updateCount']++;
    
    if (thisalert['updateCount'] == 2) {
        // why 2? because we need to run update at least once.
        var attack_details = this.name + ': ' + thisalert['hostileCount'] + ' hostiles, ' + thisalert['hostileCost'] + ' cost, ' + thisalert['hostileRanged'] + ' ranged, ' + thisalert['nukeCount'] + ' nukes, sent by: ' + thisalert['hostileUsername'];
        if (thisalert['nukeCount'] > 0 && thisalert['nukeTimeToLand'] < 200) {
            var tmsg = 'ATTACK: !!!!!NUCLEAR!!!!! ATTACK LANDING in: ' + this.name + ', launched from: ' + thisalert['nukeLaunchRoomName'];
            console.log(tmsg);
            Game.notify(tmsg);
        } else if (thisalert['hostileUsername'] == 'Invader') {
            console.log('ATTACK: NEW NPC ATTACK DETECTED: ' + attack_details );
        } else {
            if (thisalert['hostileCostMax'] > 50 || thisalert['hostileUsername'] != 'eduter') {
                Game.notify('NON-NPC ATTACK! ' + attack_details);
            }
            console.log('ATTACK: NEW *PLAYER* ATTACK DETECTED: ' + attack_details );
        }
    }

    

    for (var thiskey in enemy_details) { 
        //console.log('saving ' + thiskey);
        thisalert[thiskey] = enemy_details[thiskey];
    }
    for (var thiskey in nuke_details) {
        //console.log('saving ' + thiskey);
        thisalert[thiskey] = nuke_details[thiskey];
    }


    Memory['sectors_under_attack'][this.name] = thisalert;
    return thisalert;
}

Room.prototype.destroyHostileStructures = function() {
    var enemy_structures = this.find(FIND_HOSTILE_STRUCTURES); 
    for (var i = 0; i < enemy_structures.length; i++) {
        enemy_structures[i].destroy();
    }
    var enemy_csites = this.find(FIND_HOSTILE_CONSTRUCTION_SITES);
    for (var i = 0; i < enemy_csites.length; i++) {
        enemy_csites[i].remove();
    }
    
}


Room.prototype.createUnit = function (role, targetroomname, roompath, homeroom, dest_x, dest_y) {

    var gsapfr = GET_SPAWNER_AND_PSTATUS_FOR_ROOM(this.name);
    var spawner = gsapfr[0];
    var using_primary = gsapfr[1];
    
    if(!spawner) {
        console.log('Room.prototype.createUnit: No spawner free when attempting spawn in ' + this.name);
        return 0;
    }
    if(!using_primary) {
        console.log('Room.prototype.createUnit: No PRIMARY spawner free when attempting spawn in ' + this.name);
        return 0;
    }
    if (role == undefined) {
        console.log('Room.prototype.createUnit: ARG1 (role) missing ' + this.name);
        return 0;
    }
    if (targetroomname == undefined) {
        targetroomname = this.name;
    }
    if (homeroom == undefined) {
        homeroom = this.name;
    }
    if (homeroom == undefined) {
        homeroom = this.name;
    }
    if (dest_x == undefined) {
        dest_x = 25;
    }
    if (dest_y == undefined) {
        dest_y = 25;
    }
    if (empire_workers[role] == undefined) {
        console.log('Room.prototype.createUnit: Invalid role');
        return 0;
    }
    if (empire_workers[role]['noresize'] != undefined) {
        if (empire_workers[role]['noresize'] == 1) {
            console.log('That role requires resizing.');
            return 0;
        }        
    }
    var rbap = spawner.getRoleBodyAndProperties(role);
    var partlist = rbap['body'];
    var renew_allowed = rbap['renew_allowed'];
    var result = SPAWNCUSTOM(spawner, '', partlist, role, 
                        '', targetroomname, global.UNIT_COST(empire_workers[role]['body']), 
                        homeroom, dest_x, dest_y, 0, roompath);
    return result;
}



Room.prototype.sellResource = function (mtype) {
    var amount_sellable = this.terminal.store[mtype];
    if(!amount_sellable) {
        console.log(this.name + ': cannot sell ' + mtype + ' - none available to sell.');
        return 0;
    }
    if(this.terminal.cooldown) {
        console.log(this.name + ': cannot sell ' + mtype + ' - terminal is on cooldown.');
        return 0;
    }
    var room_orders = Game.market.getAllOrders({'type': ORDER_SELL, 'roomName': this.name, 'resourceType': mtype});
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
        var e_cost = (Game.market.calcTransactionCost(100, this.name, global_buy_orders[porder]['roomName']) / 100);
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
        var retval = Game.market.deal(buy_order_id, amount_to_sell, this.name);
        console.log('MARKET: DEAL buy order: ' + buy_order_id + ' on: ' + mtype + ' from: ' + this.name + ' at: ' + buy_price + ' (effectively: ' + effective_buy_price + ', still better than ' + sell_price + ') sending: ' + amount_to_sell + ' result: ' + retval);
    } else if(order_id == undefined) {
        var retval = Game.market.createOrder(ORDER_SELL, mtype, sell_price, amount_to_sell, this.name);
        console.log('MARKET: CREATE sell order for ' + amount_to_sell + ' units of ' + mtype + ' from ' + this.name + ' at ' + sell_price + ' result ' + retval);
    } else {
        if (old_price == sell_price) {
            console.log('MARKET: PERFECT existing order ' + order_id + ' for ' + mtype + ' in ' + this.name + ' selling at ' + old_price);
        } else if (old_price < sell_price) {
            // not possible? 
        } else {
            console.log('MARKET: REPRICE order ' + order_id + ' from ' + old_price + ' to ' + sell_price);
            Game.market.changeOrderPrice(order_id, sell_price);
        }
    }
}
