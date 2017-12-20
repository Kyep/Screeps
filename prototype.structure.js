
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

StructureSpawn.prototype.recycleObsolete = function() {
    var nrcount = 0;
    for (var crname in Game.creeps) {
        if(Game.creeps[crname].memory[MEMORY_SPAWNERNAME] == undefined) {
            continue;
        }
        if (Game.creeps[crname].memory[MEMORY_SPAWNERNAME] != this.name) {
            continue;
        }
        var unit_cost = global.CREEP_COST(Game.creeps[crname].body);
        var energy_cap = this.room.energyCapacityAvailable;
        if (unit_cost < (energy_cap * 0.75)) {
            nrcount++;
            //console.log(this.name + ': want to recycle ' + crname + ' as their cost ' + unit_cost + ' < 75% of ' + energy_cap);
            Game.creeps[crname].disableRenew();
        }
    }
    console.log(this.name + ': set ' + nrcount + ' probably-obsolete creeps to not renew');
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
    var part_template = empire_workers[roletext]['body'];
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
    
    /*
    if (spawner_mobs[spawner.name] == undefined ) {
        work_units = 1;
        renew_allowed = 0;
        console.log(spawner.name + ': ALLOWING ONLY ONE WORK UNIT, AS MY MOB LIST IS UNDEFINED. ');
    } else  {
        if (spawner_mobs[spawner.name].length < 4) {
            work_units = 1;
            renew_allowed = 0;
            console.log(spawner.name + ': ALLOWING ONLY ONE WORK UNIT, AS MY MOB LIST (' + spawner_mobs[spawner.name].length + ') HAS LESS THAN 4 MOBS. ');
        }
    }
    */
    
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