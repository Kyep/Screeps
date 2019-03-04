Room.prototype.getEnergyMode = function() {
    if (!this.isMine() || !this.storage || !this.storage.isActive() || !this.terminal || !this.terminal.isActive()) {
        return -1;
    }
    var rlvl = this.getLevel();
    if (this.terminal.store[RESOURCE_ENERGY] >= 50000) {
        if (this.priorityRebuild() && this.storage.store[RESOURCE_ENERGY] < 50000) {
            return 1; // terminal -> storage.
        }
        if (this.isFortified() && this.storage.store[RESOURCE_ENERGY] < 50000) {
            return 1; // terminal -> storage.
        }
        if (rlvl < 8 && this.storage.store[RESOURCE_ENERGY] < 200000 && this.terminal.getEnergyAboveMinimum() > 0) {
            return 1; // terminal -> storage.
        }
    }
    if (rlvl == 8 && this.storage.store[RESOURCE_ENERGY] > 500000 && !this.terminal.metEnergyMax() && !this.priorityDefend() && !this.priorityRebuild() ) {
        return 2; // storage -> terminal
    }
    if (this.storage && this.terminal && this.storage.store[RESOURCE_ENERGY] > 250000 && this.terminal.store[RESOURCE_ENERGY] < 25000) {
        return 2;
    } 
    return 0;
}


Room.prototype.getEnergyPriority = function() {
    // Returns a number indicating how important it is that this room have energy in its terminal.
    // Higher = better.
    if (!this.isMine()) {
        return 0;
    }
    if (this.priorityDefend()) {
        return 5;
    }
    if (this.priorityRebuild()) {
        return 4;
    }
    if (this.isFortified()) {
        return 3;
    }
    if (this.getLevel() < 8 && this.terminal && this.terminal.isActive() && this.terminal.isMine()) {
        return 2;
    }
    return 1;
}


Room.prototype.priorityRebuild = function() {
    if (!this.isMine()) {
        return false;
    }
    if (this.controller) {
        if (this.controller.safeMode && this.controller.safeMode > 0) {
            return true;
        }
    }
    return false;
}

Room.prototype.inCritical = function() {
    return (this.inSafeMode() || this.getSafeModeCooldown() > 0);
}

Room.prototype.inSafeMode = function() {
    if (this.controller) {
        if (this.controller.safeMode && this.controller.safeMode > 0) {
            return true;
        }
    }
    return false;
}

Room.prototype.getSafeModeCooldown = function() {
    if (this.controller) {
        if (this.controller.safeModeCooldown && this.controller.safeModeCooldown > 0) {
            return this.controller.safeModeCooldown;
        } 
    }
    return 0;
}

Room.prototype.priorityDefend = function() {
    if (!this.isMine()) {
        return false;
    }
    if (this.inSafeMode()) {
        return false;
    }
    if (this.getSafeModeCooldown() > 0) {
        return true;
    }
    if(!ROOM_UNDER_ATTACK(this.name)) {
        if (this.memory[MEMORY_LAST_PLAYER_ATTACK] && this.memory[MEMORY_LAST_PLAYER_ATTACK] > 0) {
           var attacked_ago = Game.time - this.memory[MEMORY_LAST_PLAYER_ATTACK];
           if (attacked_ago < 1000) {
               return true;
           }
        }
    }
    return false;
}



Room.prototype.buyEnergy = function(buyAmount = 5000) {
    var myRoomName = this.name;
    let maxPrice = 0.05;
    if (Game.market.credits > (maxPrice*buyAmount)) {
        let matchedOrders = Game.market.getAllOrders(order => order.resourceType == RESOURCE_ENERGY && order.type == ORDER_SELL && order.amount >= buyAmount && order.price <= maxPrice && Game.market.calcTransactionCost(buyAmount, myRoomName, order.roomName) <= (buyAmount*0.75));
        if (matchedOrders.length > 0) {
            matchedOrders.sort(function(a, b){return ((a.price * buyAmount) / (buyAmount - Game.market.calcTransactionCost(buyAmount, myRoomName, a.roomName))) - ((b.price * buyAmount) / (buyAmount - Game.market.calcTransactionCost(buyAmount, myRoomName, b.roomName)))});
            if (Game.market.deal(matchedOrders[0].id, buyAmount, myRoomName) == OK) {
                let logEntry = "".concat(myRoomName, " Bought ", buyAmount, " Energy from ", matchedOrders[0].roomName, " for ", matchedOrders[0].price, "/ea using ", Game.market.calcTransactionCost(buyAmount, myRoomName, matchedOrders[0].roomName), " energy.");
                console.log(logEntry);
                Game.notify(logEntry,180);
                return true;
            } else {
                console.log(myRoomName, "Market buy failed!");
            }
        } else {
            console.log(myRoomName, "No optimal market orders found to buy.");
        }
    }
    return false;
}



Room.prototype.getFlagsByType = function(structuretype) {
    var color_list = FLAG_TYPE_TO_COLORS_COLORS(structuretype);
    if (color_list == undefined || !color_list.length) {
        return [];
    }
    return this.getFlagsByColors(color_list[0],color_list[1]);
}

Room.prototype.createFlagByType = function(ftype, pos_x, pos_y) {
    var color_list = FLAG_TYPE_TO_COLORS_COLORS(ftype);
    if (color_list == undefined || !color_list.length) {
        return undefined;
    }
    return this.createFlag(pos_x, pos_y, undefined, color_list[0], color_list[1]);
}

Room.prototype.getFlagsByColors = function(primary, secondary) {
    if (primary == undefined || secondary == undefined) {
        return [];
    }
    return this.find(FIND_FLAGS, { filter: function(flag){ if(flag.color == primary && flag.secondaryColor == secondary) { return 1; } else { return 0; } } });
}

Room.prototype.deleteFlagList = function(listofflags) {
    var count_deleted = 0;
    for (var f = 0; f < listofflags.length; f++) {
        listofflags[f].remove();
        count_deleted++;
    }
    return count_deleted;
}

Room.prototype.deleteAllFlags = function() {
    var count_deleted = 0;
    var all_flags = this.find(FIND_FLAGS);
    for (var f = 0; f < all_flags.length; f++) {
        all_flags[f].remove();
        count_deleted++;
    }
    return count_deleted;
}

Room.prototype.deleteFlagsByType = function(structuretype) {
    return this.deleteFlagList(this.getFlagsByType(structuretype));
}

Room.prototype.convertFlagsToStructures = function(structuretype, count, silent) {
    var count_built = 0;
    if (!structuretype) {
        console.log(this.name + ': convertFlagsToStructures: missing structuretype');
        return count_built;
    }
    if (!count) {
        console.log(this.name + ': convertFlagsToStructures: missing count');
        return count_built;
    }
    if (!silent) {
        console.log(this.name + ': convertFlagsToStructures('+structuretype+', '+count+')');
    }
    var aflags = this.getFlagsByType(structuretype);
    if (!aflags.length && !silent) {
        console.log(this.name + ': convertFlagsToStructures: missing flags for ' + structuretype);
        return count_built;
    }
    for (var i = 0; i < count && i < aflags.length; i++) {
        var tflag = aflags[i];
        var cresult = this.createConstructionSite(tflag.pos.x, tflag.pos.y, structuretype);
        if (cresult == OK) {
            tflag.remove();
            count_built++;
            console.log(this.name + ': convertFlagsToStructures: STARTED CONSTRUCTION:' + structuretype);
        } else {
            console.log(this.name + ': convertFlagsToStructures: FAILED to convert ' + tflag + ' into a ' + structuretype);
        }
    }
    return count_built;    
}

Room.prototype.deleteConstructionSites = function() {
    var csites = this.find(FIND_CONSTRUCTION_SITES);
    for (var i = 0; i < csites.length; i++) {
        csites[i].remove();
    }
    return csites.length;
}

Room.prototype.checkStructures = function(verbose, force) {
    if (!this.isMine() || !this.inEmpire()) {
        return 0;
    }
    var lastcheck_time = this.memory[MEMORY_CHECKSTRUCTURES_TIME];
    if (lastcheck_time && lastcheck_time >= (Game.time - 1000) && !force) {
        return 0;
    }
    this.memory[MEMORY_CHECKSTRUCTURES_TIME] = Game.time;
    
    var always_blacklist = ['container', 'link', 'lab', 'road'];
    var newly_built = 0;
    if (!this.isMine()) {
        return newly_built;
    }
    var r_messages = [];
    var rlvl = this.getLevel();
    if (rlvl < 4) {
        always_blacklist.push("constructedWall");
        always_blacklist.push("rampart");
    }
    var s_actual = {}
    var my_structures = this.find(FIND_STRUCTURES);
    for (var i = 0; i < my_structures.length; i++) {
        if(s_actual[my_structures[i].structureType] == undefined) {
            s_actual[my_structures[i].structureType] = 0;
        }
        s_actual[my_structures[i].structureType]++;
    }
    var my_csites = this.find(FIND_MY_CONSTRUCTION_SITES);
    for (var i = 0; i < my_csites.length; i++) {
        if(s_actual[my_csites[i].structureType] == undefined) {
            s_actual[my_csites[i].structureType] = 0;
        }
        s_actual[my_csites[i].structureType]++;
    }
    var s_intended = {}
    for (var stype in CONTROLLER_STRUCTURES) {
        var key_value = CONTROLLER_STRUCTURES[stype][rlvl];
        s_intended[stype] = key_value;
    }
    for (var skey in s_intended) {
        var actual = 0;
        if (s_actual[skey] != undefined) {
            actual = s_actual[skey];
        }
        var intended = s_intended[skey];
        if (intended == 0) {
            continue;
        }
        if (intended <= actual) {
            continue;
        }
        var silent = false;
        if (intended > 100) {
            silent = true;
        }
        if (always_blacklist.includes(skey)) {
            continue;
        }
        if (!silent) {
            r_messages.push(skey + ': ' + actual + '/' + intended);
        }
        newly_built += this.convertFlagsToStructures(skey, intended - actual, silent);
        
    }
    if (verbose && r_messages.length > 0) {
        console.log(this.name + ': ' + r_messages );
    }
    return newly_built;
}

Room.prototype.generateFlags = function() {
    if(this.isMine()) {
        
    } else if (this.isEnemy()) {
        this.markNuclearTargets();
    }
}

Room.prototype.markNuclearTargets = function() {
    if(this.isMine() || !this.isEnemy()) {
        return false;
    }

    var nuke_list = this.find(FIND_NUKES);
    if (nuke_list.length) {
        //console.log(this.name + ': markNuclearTargets: ' + ' skipped due to incoming nukes.');
        return false;
    }

    this.deleteAllFlags();
    //this.deleteFlagsByType(FLAG_GROUNDZERO); 

    if (this.getLevel() < 1) {
        // Don't auto-set nuke flags on rooms which aren't owned by anyone.
        return false;
    }

    var flag_colors = FLAG_TYPE_TO_COLORS_COLORS(FLAG_GROUNDZERO);
    if (!flag_colors || !flag_colors.length) {
        console.log(this.name + ': markNuclearTargets: ' + ' nuclear flag colors not defined.');
        return false;
    }
    var flag_primary = flag_colors[0];
    var flag_secondary = flag_colors[1];
    
    var enemy_structures = this.getHostileStructures();
    var enemy_spawns = [];
    for (var i = 0; i < enemy_structures.length; i++) {
        if(enemy_structures[i].structureType == STRUCTURE_SPAWN) {
            enemy_spawns.push(enemy_structures[i]);
        }
    }
    var rowner = this.getOwner();
    var tgtid = this.name;
    if (rowner) {
        tgtid += ' (' + rowner + ')';
    }
    if (enemy_spawns.length == 0) {
        //console.log(tgtid + ': markNuclearTargets: ' + ' no spawns to target');
    } else if (enemy_spawns.length == 1) {
        if (enemy_spawns[0].killableWithNukes(1)) {
            //console.log(tgtid + ': markNuclearTargets: ' + ' 1 spawn, >10m HP.');
        } else {
            var flg = this.createFlag(enemy_spawns[0].pos.x, enemy_spawns[0].pos.y, undefined, flag_primary, flag_secondary);
            //console.log(tgtid + ': markNuclearTargets: ' + ' 1 spawn, set marker: ' + flg);
            return true;
        }
    } else {
        var total_x = 0;
        var total_y = 0;
        for (var i = 0; i < enemy_spawns.length; i++) {
            total_x += enemy_spawns[i].pos.x;
            total_y += enemy_spawns[i].pos.y;
            if (!enemy_spawns[i].killableWithNukes(1)) {
                continue;
            }
            var valid_plan = true;
            for (var j = 0; j < enemy_spawns.length; j++) {
                if (enemy_spawns[i] == enemy_spawns[j]) {
                    continue;
                }
                if (enemy_spawns[i].pos.getRangeTo(enemy_spawns[j]) > 2) {
                    valid_plan = false;
                }
                if (!enemy_spawns[j].killableWithNukes(0.5)) {
                    valid_plan = false;
                }
            }
            if (valid_plan) {
                var flg = this.createFlag(enemy_spawns[i].pos.x, enemy_spawns[i].pos.y, undefined, flag_primary, flag_secondary);
                //console.log(tgtid + ': markNuclearTargets: ' + enemy_spawns.length + ' spawns to target, set simple marker: ' + flg);
                return true;
            }
            
        }
        var avg_x = Math.round(total_x / enemy_spawns.length);
        var avg_y = Math.round(total_y / enemy_spawns.length);
        var alpha_pos = new RoomPosition(avg_x, avg_y, this.name);
        var valid_plan = true;
        for (var i = 0; i < enemy_spawns.length; i++) {
            var this_sp = enemy_spawns[i];
            var dist = alpha_pos.getRangeTo(this_sp);
            if (dist == 0) {
                if (!enemy_spawns[i].killableWithNukes(1)) {
                    //console.log(this.name + ': mNT: ' + avg_x + '/' + avg_y + ': spawn on my tile has >10m hp');
                    valid_plan = false;
                }
            } else if (dist < 3) {
                if (!enemy_spawns[i].killableWithNukes(0.5)) {
                    //console.log(this.name + ': mNT: ' + avg_x + '/' + avg_y + ': spawn ' + dist + ' away has >5m HP.');
                    valid_plan = false;
                }
            } else {
                //console.log(this.name + ': mNT: ' + avg_x + '/' + avg_y + ': spawn ' + dist + ' away is out of range.');
                valid_plan = false;
            }
            if (valid_plan == false) {
                break;
            }
        }
        if (valid_plan) {
            var flg = this.createFlag(avg_x, avg_y, undefined, flag_primary, flag_secondary);
            //console.log(tgtid + ': markNuclearTargets: ' + enemy_spawns.length + ' spawns to target. Set avg marker: ' + flg);
            return true;
        } else {
            //console.log(tgtid + ': markNuclearTargets: ' + enemy_spawns.length + ' spawns. >1 nuke required.');
        }
    }
    return false;
}


Room.prototype.createRoadNetwork = function() {
    if (!this.isMine() && !this.isRemote()) {
        if (this.memory[MEMORY_ROAD_NETWORK]) {
            delete this.memory[MEMORY_ROAD_NETWORK];
        }
        return false;
    }
    var origins = this.getFlagsByType(FLAG_ROADORIGIN);
    if (!origins || !origins.length) {
        var myspawns = this.find(FIND_MY_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_SPAWN); } });
        if (myspawns.length) {
            this.createFlagByType(FLAG_ROADORIGIN, myspawns[0].pos.x, myspawns[0].pos.y);
            console.log(this.name + ': createRoadNetworkk: FAIL, no origin flag... created one on the spawner.');
            return false;
        } else {
            console.log(this.name + ': createRoadNetworkk: FAIL, no origin flag');
            return false;
        }
    }
    var origin = origins[0].pos;

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
        if (cs.progress != 0) {
            continue;
        }
        cs.remove();
    }
    
    this.memory[MEMORY_ROAD_NETWORK] = [];
    
    let created_max = 25;
    let created_total = 0;
    
    var all_sources = this.find(FIND_SOURCES);
    var all_dest_flags = []
    var rdfs = this.getFlagsByType(FLAG_ROADDEST);
    for (var i = 0; i < rdfs.length; i++) {
        if (rdfs[i].isRoadActive()) {
            all_dest_flags.push(rdfs[i]);
        }
        
    }
    var all_dests = []
    all_dests = all_sources.concat(all_dest_flags);
    
    if (this.getLevel() >= 6) {
        var all_minerals = this.find(FIND_MINERALS);
        all_dests = all_dests.concat(all_minerals);
    }
    
    var rnum = 1;
    for (var i = 0; i < all_dests.length; i++) {
        var this_dest = all_dests[i];
        var path_to_dest = origin.findPathTo(this_dest, {'ignoreCreeps': true, 'swampCost': 1, 'maxRooms': 1});
        for (var j = 0; j < path_to_dest.length; j++) {
            rnum++;
            var pos_x = path_to_dest[j]['x'];
            var pos_y = path_to_dest[j]['y'];
            var path_pos = new RoomPosition(pos_x, pos_y, this.name);

            if (path_pos.hasStructureOfType(STRUCTURE_ROAD)) {
                new RoomVisual(this.name).circle(path_pos, {stroke: 'green'});
            } else {
                created_total++;
                if (created_total >= created_max) {
                    new RoomVisual(this.name).circle(path_pos, {stroke: 'red'});
                    //console.log(this.name + ': not creating road as we are at ' + created_total + ' beyond max roads ' + created_max);
                } else {
                    new RoomVisual(this.name).circle(path_pos, {stroke: 'yellow'});
                    Game.rooms[this.name].createConstructionSite(pos_x, pos_y, STRUCTURE_ROAD);
                }
            }
            this.memory[MEMORY_ROAD_NETWORK].push(path_pos);
        }
    }
    return true;
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

Room.prototype.deleteNonNetworkRoads = function() {
    var roads = this.find(FIND_STRUCTURES, { filter: function(s){ return s.structureType == STRUCTURE_ROAD; } });
    for (var i = 0; i < roads.length; i++) {
        var thisroad = roads[i];
        if (thisroad.inRoadNetwork()) {
            new RoomVisual(this.name).circle(thisroad.pos, {stroke: 'green'});
        } else {
            new RoomVisual(this.name).circle(thisroad.pos, {stroke: 'red'});
            thisroad.destroy();
        }
    }
}

Room.prototype.getDismanteableStructures = function() {
    if (this.isMine && this.inEmpire()) {
        return [];
    }
    return this.find(FIND_STRUCTURES, {
        filter: function(s){
            if(s.isInvincible()) {
                return false;
            }
            if (s.isMine()) {
                if (s.structureType == STRUCTURE_WALL) {
                    return false;
                }
                if (s.structureType == STRUCTURE_RAMPART) {
                    return false;
                }
                if (s.structureType == STRUCTURE_SPAWN) {
                    return false;
                }
            }
            if (s.owner && s.owner.username && s.owner.username == "Kamots") {
                return false;
            }
            if (s.structureType == STRUCTURE_ROAD) {
                return false;
            }
            return true;
        }
    });
}



Room.prototype.getLiveHostileTowers = function() {
    return this.find(FIND_HOSTILE_STRUCTURES, {filter: function(s){ 
        if (s.structureType != STRUCTURE_TOWER) {
            return false;
        }
        if (IS_ALLY(s.owner.username) || s.isInvincible()) { 
            return false;
        }
        if (s.energy < 10) {
            return false;
        }
        if (!s.isActive()) {
            return false;
        }
        return true;
    } });
}

Room.prototype.getShouldUpgrade = function() {
    //  Memory['gcl_farm'] = ['W59S18', 'W58S17', 'W57S14', 'W56S18', 'W53S18']
    var gcl_farm_rooms = Memory['gcl_farm'];
    if (Memory['gcl_farm'].indexOf(this.name) == -1) {
        return 1;
    }
    /*
    var room_level = this.getLevel();
    if (room_level == 8) {
        return 0;
    }
    */
    return 1;
}


Room.prototype.getMyStructuresCount = function() {
    var mystructures = this.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType != STRUCTURE_LINK);
        }
    });
    var mywalls = this.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_WALL } } );
    return mystructures.length + mywalls.length;
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
    /*
    var enemy_structures = this.find(FIND_HOSTILE_STRUCTURES); 
    for (var i = 0; i < enemy_structures.length; i++) {
        if(enemy_structures[i].structureType == STRUCTURE_SPAWN) {
            if(enemy_structures[i].owner && enemy_structures[i].owner.username) {
                return enemy_structures[i].owner.username;
            }
        }
    } 
    */
    return undefined;
}

Room.prototype.isMine = function() {
    var myowner = this.getOwner();
    if (myowner && myowner == overlord) {
        return true;
    }
    return false;
}

Room.prototype.isEnemy = function() {
    var myowner = this.getOwner();
    if (IS_ENEMY(myowner)) {
        return true;
    }
    return false;
}


Room.prototype.clearHostileStructures = function() {
    var stuff_destroyed = 0;
    var enemy_structures = this.find(FIND_HOSTILE_STRUCTURES); 
    var types_to_keep = [STRUCTURE_TERMINAL, STRUCTURE_NUKER, STRUCTURE_OBSERVER, STRUCTURE_RAMPART]
    for (var i = 0; i < enemy_structures.length; i++) {
        var stype = enemy_structures[i].structureType;
        if(!types_to_keep.includes(stype)) {
            enemy_structures[i].destroy();
            stuff_destroyed++;
        }
    }
    var enemy_csites = this.find(FIND_HOSTILE_CONSTRUCTION_SITES);
    for (var i = 0; i < enemy_csites.length; i++) {
        enemy_csites[i].remove();
        stuff_destroyed++;
    }
    console.log(stuff_destroyed);
    return stuff_destroyed;
}

Room.prototype.clearMyStructures = function() {
    var stuff_destroyed = 0;
    var my_structures = this.find(FIND_MY_STRUCTURES); 
    for (var i = 0; i < my_structures.length; i++) {
        my_structures[i].destroy();
        stuff_destroyed++;
    }
    var my_csites = this.find(FIND_MY_CONSTRUCTION_SITES);
    for (var i = 0; i < my_csites.length; i++) {
        my_csites[i].remove();
        stuff_destroyed++;
    }
    console.log('Destroyed in ' + this.name + ': ' + stuff_destroyed + ' structures/sites');
    return stuff_destroyed;
}

Room.prototype.clearStructuresOfType = function(stype) {
    var stuff_destroyed = 0;
    var my_structures = this.find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == stype); } } ); 
    for (var i = 0; i < my_structures.length; i++) {
        my_structures[i].destroy();
        new RoomVisual(this.name).circle(my_structures[i].pos, {radius: 0.5, opacity: 0.3, stroke: 'red'});
        stuff_destroyed++;
    }
    console.log('Destroyed in ' + this.name + ': ' + stuff_destroyed + ' structures');
    return stuff_destroyed;
}

Room.prototype.createUnit = function (role, targetroomname, roompath, homeroom, dest_x, dest_y, force) {

    if (force == undefined) {
        force = false;
    }

    var gsapfr = GET_SPAWNER_AND_PSTATUS_FOR_ROOM(this.name, force);
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
    //console.log('createunit is calling RBAP with role: ' + role + ' from spawner' + spawner.name);
    var rbap = spawner.getRoleBodyAndProperties(role);
    var partlist = rbap['body'];
    var renew_allowed = rbap['renew_allowed'];
    var crmemory = {};
    crmemory[MEMORY_ROLE] = role;
    crmemory[MEMORY_DEST] = targetroomname;
    crmemory[MEMORY_DEST_X] = dest_x;
    crmemory[MEMORY_DEST_Y] = dest_y;
    crmemory[MEMORY_NEXTDEST] = roompath;
    crmemory[MEMORY_HOME] = homeroom;
    crmemory[MEMORY_HOME_X] = spawner.pos.x;
    crmemory[MEMORY_HOME_Y] = spawner.pos.y;
    crmemory[MEMORY_RENEW] = false;
    
    var result = SPAWN_VALIDATED(spawner, partlist, crmemory);
    
    return result;
}

Room.prototype.createSiegeTeam = function (targetroomname, roompath, dest_x = 25, dest_y = 25) {
    var siege_boosts = [BOOST_MOVE, BOOST_TOUGH, BOOST_WORK, BOOST_HEAL];
    for (var i = 0; i < siege_boosts.length; i++) {
        var blab = this.getUsableLabForBooster(siege_boosts[i]);
        if (blab) {
            console.log(siege_boosts[i] + ': AVAILABLE');
        } else {
            console.log(siege_boosts[i] + ': NOT AVAILABLE');
        }
    }
    var free_spawns = this.find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_SPAWN && structure.isAvailable(true)); } });
    if (free_spawns.length < 2) {
        console.log('createSiegeTeam('+this.name+'): <2 free spawners.');
        return false;
    }


    var boosts = this.listBoostsAvailable();
    var tank_design = 'siege';
    var healer_design = 'siegehealer';
    if (boosts.length > 0) {
        console.log('boosts AVAILABLE in ' + this.name + ': ' + boosts);
        tank_design = 'siegeX';
        healer_design = 'siegehealerX';
        this.ensureLabTech();
    } else {
        console.log('NO BOOSTS available in ' + this.name + '. Falling back to unboosted attack builds... ' + JSON.stringify(boosts));
    }


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
    var shared_memory = {};
    shared_memory[MEMORY_DEST] = targetroomname;
    shared_memory[MEMORY_DEST_X] = dest_x;
    shared_memory[MEMORY_DEST_Y] = dest_y;
    shared_memory[MEMORY_NEXTDEST] = roompath;
    shared_memory[MEMORY_HOME] = free_spawns[0].room.name;
    shared_memory[MEMORY_HOME_X] = free_spawns[0].pos.x;
    shared_memory[MEMORY_HOME_Y] = free_spawns[0].pos.y;
    shared_memory[MEMORY_RENEW] = false;
    if (boosts.length > 0) {
        shared_memory[MEMORY_BOOSTSALLOWED] = true;
    }
    var tank_memory = Object.assign({}, shared_memory);
    tank_memory[MEMORY_ROLE] = tank_design;
    var healer_memory = Object.assign({}, shared_memory);
    healer_memory[MEMORY_ROLE] = healer_design;
    
    var thetank = SPAWN_VALIDATED(free_spawns[0], tank_body, tank_memory);
    var thehealer = SPAWN_VALIDATED(free_spawns[1], healer_body, healer_memory);
    
    console.log('tank: ' + thetank);
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
    var old_amount = -1;
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
        if (sell_price < 0.005) {
            //sell_price = 0.005;
            //console.log('MKT: selling ' + mtype + ' in ' + this.name + ': increasing price to configured minimum: ' + sell_price + ' for resource: ' + mtype);
        }
        if (sell_price > 0.1) {
            //sell_price = 0.1;
            //console.log('MKT: selling ' + mtype + ' in ' + this.name + ': reducing price to configured maximum: ' + sell_price + ' for resource: ' + mtype);
        }
    } else {
        if (sell_price < 0.05) {
            //sell_price = 0.05;
            //console.log('MKT: selling ' + mtype + ' in ' + this.name + ': increasing price to configured minimum: ' + sell_price + ' for resource: ' + mtype);
        }
        if (sell_price > 8) {
            //sell_price = 8;
            //console.log('MKT: selling ' + mtype + ' in ' + this.name + ': reducing price to configured maximum: ' + sell_price + ' for resource: ' + mtype);
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
        if (amount_to_sell > 200000) {
            console.log("MARKET: WARNING: room " + this.name + " has over 200k units of " + mtype + " -- going to sell it for 0.1 price!");
            sell_price = 0.1;
        }
		if (amount_to_sell > 10000) {
            amount_to_sell = 10000;
        }
    }
	var terminal_energy = this.terminal.store[RESOURCE_ENERGY];

    if(effective_buy_price > sell_price && buy_order_id != undefined && terminal_energy >= 10000) {
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
		if (old_amount < 10000 && amount_to_sell >= 10000) {
			console.log('MARKET: EXTEND order ' + order_id);
			Game.market.extendOrder(order_id, 10000);
		} else if (old_price == sell_price) {
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

Room.prototype.refreshCreeps = function () {
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
        Game.creeps[crname].disableRenew();
        nrcount++;
    }
    return nrcount;
}
