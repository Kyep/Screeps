

StructureTerminal.prototype.acquireNukeFuel = function() {
    return this.acquireMineralAmount(RESOURCE_GHODIUM, 5000, 5000);
}

StructureTerminal.prototype.acquireMineralAmount = function(mineral_type, transfer_amount, leave_amount) {
    for (var rname in Game.rooms) {
        var robj = Game.rooms[rname];
        if (!robj.hasTerminalNetwork()) {
            continue;
        }
        var rterm = robj.terminal;
        if (rterm.store[mineral_type] && rterm.store[mineral_type] > (transfer_amount + leave_amount)) {
            var retval = rterm.send(mineral_type, transfer_amount, this.room.name);
            if (retval == OK) {
                console.log(this.room.name + ': got ' + transfer_amount + ' of ' + mineral_type + ' from ' + rterm.room.name);
                return true;
            }
        }
    }
    //console.log(this.room.name + ': requires ' + transfer_amount + ' of ' + mineral_type + ' but cannot find it anywhere...');
    return false;
}

StructureRoad.prototype.inRoadNetwork = function() {
    var net = this.room.memory[MEMORY_ROAD_NETWORK];
    if (net == undefined) {
        //console.log(this.room + ': has no room road network defined in memory.');
        return false;
    }
    if (net.length == 0) {
        return false;
    }
    for (var i = 0; i < net.length; i++) {
        var thispos = net[i];
        //console.log(JSON.stringify(thispos));
        if (this.pos.x != thispos["x"]) {
            continue;
        }
        if (this.pos.y != thispos["y"]) {
            continue;
        }
        return true;
    }
    
    return false;

}


StructureTower.prototype.getPowerForRange = function(initialpower, dist) {
    var expected_effect = initialpower;
    if (dist > TOWER_OPTIMAL_RANGE) {
        if (dist > TOWER_FALLOFF_RANGE) {
            dist = TOWER_FALLOFF_RANGE;
        }
        expected_effect -= expected_effect * TOWER_FALLOFF * (dist - TOWER_OPTIMAL_RANGE) / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE);
    }
    return Math.floor(expected_effect);
}

StructureSpawn.prototype.getRoleBodyAndProperties = function(roletext, tgtroom, tgtsource) {
    var retval = {};
    if (empire_workers[roletext] == undefined) {
        console.log('getBodyForRole error: ' + roletext + ' has no defined worker entry in empire.');
        return undefined;
    }
    if (empire_workers[roletext]['body'] == undefined) {
        console.log('getBodyForRole error: ' + roletext + ' has no defined body in empire.');
        return undefined;
    }
    /*if (empire_workers[roletext]['aiscript'] == undefined) {
        console.log('getBodyForRole error: ' + roletext + ' has no defined aiscript in empire.');
        return undefined;
    }*/
    var part_template = empire_workers[roletext]['body'];
    retval['aiscript'] = empire_workers[roletext]['aiscript'];
    var partlist = [];
    var energy_cap = this.room.energyCapacityAvailable;
    if (energy_cap > 4500) {
        energy_cap = 4500;
    }
    var build_cost = global.UNIT_COST(part_template);
    if (build_cost == 0) {
        console.log('WARNING: ' + roletext + ' for ' + tgtroom + ' returned zero build cost for: ' + part_template);
    }
    var work_units = Math.max(1, Math.floor(energy_cap / build_cost));
    var max_units = Math.floor(50 / part_template.length);
    if (work_units > max_units) {
        //console.log('Warning: when building body for ' + roletext + ' work_units got to be ' + work_units + ' but we can only support ' + max_units + ' of this template.');
        work_units = max_units;
    }
    //console.log(work_units + ' based on ' + global.UNIT_COST(part_template) + ' in ' + this.room.energyCapacityAvailable);
    var renew_allowed = 1;
    
    if (empire_workers[roletext]['renew_allowed'] != undefined) {
        if (empire_workers[roletext]['renew_allowed'] == 0) {
            renew_allowed = 0;   
        }
    }
    if(roletext == 'reserver') {
        var ticksrem = 0;
        if (Game.rooms[tgtroom] != undefined) {
            if (Game.rooms[tgtroom].controller != undefined) {
                if (Game.rooms[tgtroom].controller.reservation != undefined) {
                    if (Game.rooms[tgtroom].controller.reservation.ticksToEnd != undefined) {
                        ticksrem = Game.rooms[tgtroom].controller.reservation.ticksToEnd;
                    }
                }
            }   
        }
        partlist = CONSTRUCT_RESERVER_BODY(ticksrem, this.room.energyCapacityAvailable);
    } else if(roletext == 'hauler') {
        partlist = CONSTRUCT_HAULER_BODY(tgtroom, tgtsource, this.room.energyCapacityAvailable);
    } else if (empire_workers[roletext]['noresizing'] == undefined) {
        for (var k = 0; k < part_template.length; k++) {
            for (var j = 0; j < work_units; j++) {
                partlist.push(part_template[k]);
            }
        }
    } else {
        partlist = part_template;
    }
    retval['body'] = partlist;
    retval['renew_allowed'] = renew_allowed;
    return retval;
}

StructureSpawn.prototype.isAvailable = function(force) {
    if (force == undefined) {
        force = false;
    }
    if(!this.isActive()) {
        return 0;
    }
    if(this.spawning != undefined) {
        //console.log(this.name + ' not available due to spawning in progress');
        return 0;
    }
    if (!force) {
        var crlist = this.pos.findInRange(FIND_CREEPS, 3);
        var creeps_renewing = 0;
        for (var i = 0; i < crlist.length; i++) {
            if(crlist[i].memory == undefined) {
                continue;
            }
            if (crlist[i].memory[MEMORY_JOB] == undefined) {
                continue;
            }
            if (crlist[i].memory[MEMORY_JOB] != JOB_RENEW) {
                continue;
            }
            if (!crlist[i].getRenewEnabled()) {
                continue;
            }
            if (!crlist[i].getNeeded()) {
                continue;
            }
            creeps_renewing++;
        }
        if (creeps_renewing > 0) {
            return 0;
            //console.log(this.name + ' not available due to creeps renewing');
        }
    }
    return 1;
}

StructureLab.prototype.isUnassigned = function() {
    var assigned_labs = Memory['assigned_labs'];
    if (assigned_labs[this.id] != undefined) {
        return false;
    }
    return true;
}

StructureLab.prototype.isAvailable = function() {
    if (this.mineralAmount > 0) {
        return false;
    }
    var assigned_labs = Memory['assigned_labs'];
    if (assigned_labs[this.id] != undefined) {
        return false;
    }
    return true;
}

StructureNuker.prototype.getReadiness = function(tgtroomname) {
    if (this.owner.username != overlord) {
        return ERR_NOT_OWNER;
    }
    if (tgtroomname) {
         if (Game.map.getRoomLinearDistance(this.room.name, tgtroomname) > NUKE_RANGE) {
            return ERR_NOT_IN_RANGE;
         }
    }
    if (!this.isActive()) {
        return ERR_RCL_NOT_ENOUGH;
    }
    if (this.cooldown > 0) {
        return ERR_TIRED;
    }
    if (this.energy != this.energyCapacity) {
        return ERR_NOT_ENOUGH_RESOURCES;
    }
    if (this.ghodium != this.ghodiumCapacity) {
        return ERR_NOT_ENOUGH_RESOURCES;
    }
    return OK;
}
