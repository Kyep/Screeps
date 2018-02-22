Room.prototype.createRoadNetwork = function(origin_x, origin_y) {
    
    if (origin_x == undefined || origin_y == undefined) {
        console.log('createRoadNetworkk: FAIL, no origin_x or no origin_y');
        return false;
    }
    var origin = new RoomPosition(origin_x, origin_y, this.name);

    /*
    var white_flags = _.filter(Game.flags, (flag) => (flag.color == COLOR_WHITE) && (flag.secondaryColor == COLOR_GREY) && (flag.room != undefined) && (flag.room.name == this.name));
    for (var i = 0; i < white_flags.length; i++) {
        white_flags[i].remove();
    }
    */
    
    var all_csites = Game.constructionSites;
    for (var site_key in all_csites) {
        var cs = all_csites[site_key];
        //var cs = Game.getObjectById(csites[i]);
        if (cs.room == undefined) {
            continue;
        }
        if (cs.room.name != this.name) {
            continue;
        }
        if (cs.structureType != STRUCTURE_ROAD) {
            continue;
        }
        cs.remove();
    }
    
    this.memory[MEMORY_ROAD_NETWORK] = [];
    
    var all_sources = this.find(FIND_SOURCES);
    var all_dest_flags = this.find(FIND_FLAGS, { filter: function(flag){ if(flag.color == COLOR_WHITE && flag.secondaryColor == COLOR_RED) { return 1; } else { return 0; } } });
    //console.log(this.name + ' ' + all_sources.length + ' sources, ' + all_dest_flags.length + ' dest flags.');
    var all_dests = []
    all_dests = all_sources.concat(all_dest_flags);
    
    
    //console.log(this.name + ': total sources: ' + all_dests.length + ': ' + JSON.stringify(all_dests));
    var rnum = 1;
    for (var i = 0; i < all_dests.length; i++) {
        var this_dest = all_dests[i];
        var path_to_dest = origin.findPathTo(this_dest, {'ignoreCreeps': true, 'maxRooms': 1});
        //console.log('createRoads: source: ' + this_dest.id + ', i: ' + i + ', path length: ' + path_to_dest.length);
        for (var j = 0; j < path_to_dest.length; j++) {
            rnum++;
            var pos_x = path_to_dest[j]['x'];
            var pos_y = path_to_dest[j]['y'];
            var path_pos = new RoomPosition(pos_x, pos_y, this.name);
            var objects_here = this.lookAt(path_pos);
            var roads_here = 0;
            for (var k = 0; k < objects_here.length; k++) {
                if (objects_here[k].structureType == STRUCTURE_ROAD) {
                    roads_here++;
                }    
            }
            if (!roads_here) {
                Game.rooms[this.name].createConstructionSite(pos_x, pos_y, STRUCTURE_ROAD);
                //console.log(this.name + ': CREATED ROAD at: ' + pos_x + ',' + pos_y);
            }
            this.memory[MEMORY_ROAD_NETWORK].push(path_pos);
            
            //var flag_var = path_pos.createFlag(this.name + ' road ' + rnum, COLOR_WHITE, COLOR_GREY);
            //console.log(flag_var);
            
        }
        //console.log('createRoads: dest: ' + this_dest.id + ', completed');
    }
}

Room.prototype.showRoadNetwork = function() {
    var rnet = this.memory[MEMORY_ROAD_NETWORK];
    if (rnet == undefined || rnet.length == 0) {
        return false;
    }
    for (var i = 0; i < rnet.length; i++) {
        var thispos = rnet[i];
        new RoomVisual(this.name).circle(thispos, {stroke: 'green'});
    }
}



Room.prototype.getHostileCreeps = function() {
    return this.find(FIND_HOSTILE_CREEPS, {filter: function(c){ if (IS_ALLY(c.owner.username)) { return false } else { return true } } });
}
Room.prototype.getHostileStructures = function() {
    var structure_blacklist = [STRUCTURE_CONTROLLER, STRUCTURE_POWER_BANK, STRUCTURE_KEEPER_LAIR];
    return this.find(FIND_HOSTILE_STRUCTURES, {filter: function(s){ if (IS_ALLY(s.owner.username) || structure_blacklist.includes(s.structureType)) { return false } else { return true } } });
}

Room.prototype.getShouldUpgrade = function() {
    //  Memory['gcl_farm'] = ['W59S18', 'W58S17', 'W57S14', 'W56S18', 'W53S18']
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
        return 1000;
    } else if (lvl == 4) {
        return 5000;
    } else if (lvl == 5) {
        return 10000;
    } else if (lvl == 6) {
        return 20000;
    } else if (lvl == 7) {
        return 500000;
    } else if (lvl == 8) {
        return 1000000; 
    }
    return 50000 * lvl;
}

Room.prototype.getStoredEnergy = function() {
    var total_energy = 0;
    if (this.storage != undefined) {
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

Room.prototype.getOwner = function() {
    if (this.controller == undefined) {
        return undefined;
    }
    if (this.controller.owner == undefined) {
        return undefined;
    }
    if (this.controller.owner.username) {
        return this.controller.owner.username;
    }
    return undefined;
}

Room.prototype.getOwnerOrReserver = function() {
    if (this.controller == undefined) {
        return undefined;
    }
    if (this.controller.owner != undefined && this.controller.owner.username != undefined) {
        return this.controller.owner.username;
    }
    if (this.controller.reservation != undefined && this.controller.reservation.username != undefined) {
        return this.controller.reservation.username;
    }
    var enemy_structures = this.find(FIND_HOSTILE_STRUCTURES); 
    for (var i = 0; i < enemy_structures.length; i++) {
        if(enemy_structures[i].structureType == STRUCTURE_SPAWN) {
            if(enemy_structures[i].owner && enemy_structures[i].owner.username) {
                return enemy_structures[i].owner.username;
            }
        }
    }    
    return undefined;
}

Room.prototype.isMine = function() {
    var owner = this.getOwner();
    if (owner && owner == overlord) {
        return true;
    }
    return false;
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
        if (!IS_ALLY(enemy_details['hostileUsername'])) {
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
        if (!exit_arr.includes(Game.creeps[tc].room.name)) { // if they aren't next door, skip them.
            continue;
        }
        if (Game.creeps[tc].memory[MEMORY_ROLE] == undefined) {
            continue;
        }
        if (!Game.creeps[tc].isMilitary()) {
            continue;
        }
        if (Game.creeps[tc].isSiege()) {
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
                console.log('HARASS: sent ' + crname + ' to harass' + empire_defaults['alerts_reassign'][spname]);
                Game.notify('HARASS: sent ' + crname + ' to harass' + empire_defaults['alerts_reassign'][spname]);
            }

        }
    }


    var end_msg = 'ATTACK on ' + this.name + ' by ' + myalert['hostileUsername'] + ' worth ' + myalert['hostileCostMax'] + ' ENDED after ' + alert_age + ' ticks.';
    console.log(end_msg);
    if (myalert['hostileUsername'] != 'Invader') {
        if (myalert['hostileCostMax'] > 50) {
            Game.notify(end_msg);
        }
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
            if (thisalert['hostileCostMax'] > 50) {
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

Room.prototype.destroyHostileSpawns = function() {
    var stuff_destroyed = 0;
    var enemy_structures = this.find(FIND_HOSTILE_STRUCTURES); 
    for (var i = 0; i < enemy_structures.length; i++) {
        if(enemy_structures[i].structureType != undefined && enemy_structures[i].structureType == STRUCTURE_SPAWN) {
            enemy_structures[i].destroy();
            stuff_destroyed++;
        }
    }
    /*
    var enemy_csites = this.find(FIND_HOSTILE_CONSTRUCTION_SITES);
    for (var i = 0; i < enemy_csites.length; i++) {
        enemy_csites[i].remove();
        stuff_destroyed++;
    }
    */
    console.log(stuff_destroyed);

    return stuff_destroyed;
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
        //console.log('Room.prototype.createUnit: No PRIMARY spawner free when attempting spawn in ' + this.name);
        //return 0;
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

Room.prototype.createSiegeTeam = function (targetroomname, roompath, dest_x, dest_y) {
    var free_spawns = this.find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_SPAWN && structure.isAvailable(true)); } });
    if (free_spawns.length < 2) {
        console.log('createSiegeTeam('+this.name+'): <2 free spawners.');
        return false;
    }
    var tank_design = 'siegebig';
    var healer_design = 'siegehealer';
    var tank_properties = TEMPLATE_PROPERTIES(tank_design);
    var healer_properties = TEMPLATE_PROPERTIES(healer_design);
    var tank_cost = tank_properties['cost'];
    var tank_body = tank_properties['parts'];
    var healer_cost = healer_properties['cost'];
    var healer_body = healer_properties['parts'];
    var total_cost = tank_cost + healer_cost;
    var room_free_energy = this.energyAvailable;
    if (total_cost > room_free_energy) {
        console.log('createSiegeTeam('+this.name+'): total energy cost ' + total_cost + ' exceeds current room energy level: ' + room_free_energy);
        return false;
    }
    var thetank = SPAWNCUSTOM(free_spawns[0], '', tank_body, tank_design, '', targetroomname, tank_cost, this.name, dest_x, dest_y, 0, roompath);
    var thehealer = SPAWNCUSTOM(free_spawns[1], '', healer_body, healer_design, '', targetroomname, healer_cost, this.name, dest_x, dest_y, 0, roompath);
    //var thetank = this.createUnit('siege', targetroomname, roompath, this.name, dest_x, dest_y);
    console.log('tank: ' + thetank);
    //var thehealer = this.createUnit('siegehealer', targetroomname, roompath, this.name, dest_x, dest_y);
    console.log('healer: ' + thehealer);
    return true;
}

Room.prototype.sellResource = function (mtype) {
    var amount_sellable = this.terminal.store[mtype];
    if(amount_sellable == undefined || amount_sellable <= 10000) {
        console.log(this.name + ': cannot sell ' + mtype + ' - none available to sell.');
        return 0;
    }
    amount_sellable = amount_sellable - 10000;
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
        // %%%%%%
        var rm_range = Game.map.getRoomLinearDistance(this.name, global_sell_orders[porder]['roomName']);
        if (Game.rooms[global_sell_orders[porder]['roomName']] != undefined) {
            //console.log('MKT: selling ' + mtype + ' in ' + this.name + ' skip order ' + JSON.stringify(global_sell_orders[porder]) + ' because its room ' + global_sell_orders[porder]['roomName'] + ' is mine');
        //} else if (rm_range >= 40) {
            //console.log('MKT: selling ' + mtype + ' in ' + this.name + ' skip order ' + JSON.stringify(global_sell_orders[porder]) + ' at ' +  global_sell_orders[porder]['price'] + ' because its room ' + global_sell_orders[porder]['roomName'] + ' has distance: ' + rm_range + ' to me');
        } else if (sell_price == 0) {
           sell_price = global_sell_orders[porder]['price'];
           //console.log(global_sell_orders[porder]['id'] + ' selling FIRST at: ' + global_sell_orders[porder]['price'] + ' from ' + global_sell_orders[porder]['roomName']);
        } else if (global_sell_orders[porder]['price'] < sell_price) {
           sell_price = global_sell_orders[porder]['price'];
           //console.log(global_sell_orders[porder]['id'] + ' selling BETTER at: ' +global_sell_orders[porder]['price'] + ' from ' + global_sell_orders[porder]['roomName']);
       }
        //console.log(global_sell_orders[porder]['price']);
    }
    if (mtype == RESOURCE_ENERGY) {
        if (sell_price < 0.008) {
            sell_price = 0.008;
            console.log('MKT: selling ' + mtype + ' in ' + this.name + ': increasing price to configured minimum: ' + sell_price + ' for resource: ' + mtype);
        }
        if (sell_price > 0.1) {
            sell_price = 0.1;
            console.log('MKT: selling ' + mtype + ' in ' + this.name + ': reducing price to configured maximum: ' + sell_price + ' for resource: ' + mtype);
        }
    } else {
        if (sell_price < 0.085) {
            sell_price = 0.085;
            console.log('MKT: selling ' + mtype + ' in ' + this.name + ': increasing price to configured minimum: ' + sell_price + ' for resource: ' + mtype);
        }
        if (sell_price > 8) {
            sell_price = 8;
            console.log('MKT: selling ' + mtype + ' in ' + this.name + ': reducing price to configured maximum: ' + sell_price + ' for resource: ' + mtype);
        }
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
    if (mtype == RESOURCE_ENERGY) {
        if (amount_to_sell > 20000) {
            amount_to_sell = 20000;
        }
    } else {
        if (amount_to_sell > 10000) {
            amount_to_sell = 10000;
        }
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
            console.log('MARKET: REPRICE UP order ' + order_id + ' from ' + old_price + ' to ' + sell_price);
            Game.market.changeOrderPrice(order_id, sell_price);
        } else {
            console.log('MARKET: REPRICE DOWN order ' + order_id + ' from ' + old_price + ' to ' + sell_price);
            Game.market.changeOrderPrice(order_id, sell_price);
        }
    }
}

Room.prototype.recycleObsolete = function () {
    var nrcount = 0;
    for (var crname in Game.creeps) {
        if(Game.creeps[crname].memory[MEMORY_SPAWNERROOM] == undefined) {
            continue;
        }
        if(Game.creeps[crname].memory[MEMORY_SPAWNERROOM] != this.name) {
            continue;
        }
        if(!Game.creeps[crname].getRenewEnabled()) {
            continue;
        }
        
        var unit_cost = global.CREEP_COST(Game.creeps[crname].body);
        var energy_cap = this.energyCapacityAvailable;
        if (unit_cost < energy_cap) {
            nrcount++;
            console.log(this.name + ': want to disableRenew ' + crname + ' as their cost ' + unit_cost + ' < ' + energy_cap);
            Game.creeps[crname].disableRenew();
        }
    }
    console.log(this.name + ': set ' + nrcount + ' probably-obsolete creeps to not renew');
    
}
