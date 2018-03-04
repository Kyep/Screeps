
Creep.prototype.getBoostsWanted = function() {
    var boosts_desired = [];
    if (!this.memory[MEMORY_BOOSTSALLOWED]) {
        return boosts_desired;
    }
    
    // ideal: from W46S17 -> W37S18 (shard1) 
    // SIEGEBIG: {TOUGH: 10, MOVE: 20, WORK: 20} + SIEGEHEALER {TOUGH: 10, MOVE: 25, HEAL: 15} -- with XZH2O (T3 dismantle boost), XLHO2 (T3 heal boost), and XGHO2 (T3 TOUGH boost)
    
    var melee_parts = this.getActiveBodyparts(ATTACK);
    var work_parts = this.getActiveBodyparts(WORK);
    var heal_parts = this.getActiveBodyparts(HEAL);
    var tough_parts = this.getActiveBodyparts(TOUGH);

    boosts_desired.push('XZHO2'); // MOVE speed

    if (work_parts) {
        boosts_desired.push('XZH2O');
    }
    if (melee_parts) {
        boosts_desired.push('XUH2O');// have UH2O, no XUH2O
    }
    if (heal_parts) {
        boosts_desired.push('XLHO2'); // T1: T2: T3:XLHO2
    }
    if (tough_parts) {
        boosts_desired.push('XGHO2');
    }

    this.memory[MEMORY_BOOSTSWANTED] = boosts_desired;
    return boosts_desired;
}

Creep.prototype.gettingBoosts = function() {

    var boosts_desired = this.getBoostsWanted();
    
    if (boosts_desired.length == 0) {
        return false;
    }

    var tickspassed = (Game.time - this.memory[MEMORY_INIT]);

    if (this.memory[MEMORY_BOOSTSGOT] == undefined) {
        this.memory[MEMORY_BOOSTSGOT] = [];
    }
    if (this.memory[MEMORY_BOOSTSMISSING] == undefined) {
        this.memory[MEMORY_BOOSTSMISSING] = [];
    }
    var boosts_got = this.memory[MEMORY_BOOSTSGOT];
    var boosts_missing = this.memory[MEMORY_BOOSTSMISSING];
    for (var i = 0; i < boosts_desired.length; i++) {
        var thisboost = boosts_desired[i];
        if (boosts_got.includes(thisboost)) {
            continue;
        }
        var destlab = this.room.getUsableLabForBooster(thisboost);
        if (destlab) {
            var bresult = destlab.boostCreep(this);
            if (bresult == OK) {
                this.memory[MEMORY_BOOSTSGOT].push(thisboost);
                console.log(this.name + ': acquired boost: ' + thisboost);
            } else if (bresult == ERR_NOT_IN_RANGE) {
                this.moveTo(destlab, {visualizePathStyle: {stroke: COLOR_RENEW}});
                return true;
            } else {
                console.log(this.name + ': tried to get boost ' + thisboost + ' from lab ' + destlab.id + ' with result: ' + bresult);
                this.memory[MEMORY_BOOSTSMISSING].push(thisboost);
            }
        } else {
            console.log(this.name + ' in ' + this.room.name + ' tried to get boost ' + thisboost + ' but no lab here has it!');
            if (tickspassed > 100) {
                this.memory[MEMORY_BOOSTSMISSING].push(thisboost);
            }
        }
    }
    return false;
}

Room.prototype.countCreepsWithRole = function(role) {
    var count = 0;
    for (var crname in Game.creeps) {
        if (Game.creeps[crname].memory[MEMORY_DEST] != this.name) {
            continue;
        }
        if (Game.creeps[crname].memory[MEMORY_ROLE] != role) {
            continue;
        }
        count++;
    }
    return count;
}

Room.prototype.getUsableLabForBooster = function(btype) {
    var lab_objs = this.getLabsForBooster(btype);
    var usable_labs = [];
    if (lab_objs.length) {
        for (var i = 0; i < lab_objs.length; i++) {
            var thislab = lab_objs[i];
            if (thislab.mineralAmount > 2000) {
                return thislab;
            }
        }
        console.log(this.name + ': getUsableLabForBooster: no lab has enough booster material of our type, despite assignment. Spawning labtech to refill our supply of: ' + btype);
        this.ensureLabTech();
    }
    console.log(this.name + ': getUsableLabForBooster: no lab with usable booster of type: ' + btype);
    return undefined;
}

Room.prototype.getLabsForBooster = function(btype) {
    if (!btype) {
        return undefined;
    }
    var assigned_labs = Memory['assigned_labs'];
    var booster_labs = [];
    for (var labid in assigned_labs) {
        var labdata = assigned_labs[labid];
        var thislab = Game.getObjectById(labid);
        if (thislab.room.name != this.name) {
            continue;
        }
        if (labdata['mineralid'] != btype || labdata['purpose'] != 'boost') {
            continue;
        }
        booster_labs.push(thislab);
    }
    return booster_labs;
}

Room.prototype.ensureLabTech = function() {
    if (!this.terminal) {
        return false;
    }
    var num_techs = this.countCreepsWithRole('labtech');
    if (!num_techs) {
        this.createUnit('labtech', this.name, [], this.name, 25, 25, true);
    }
    return num_techs;
}

Room.prototype.assignBoost = function(btype) {
    if (!btype) {
        console.log(this.name + ': assignBooster: null booster type');
        return false;
    }
    var already_assigned = this.getLabsForBooster(btype);
    if (already_assigned.length) {
        console.log(this.name + ': assignBooster: already have booster of type: ' + btype + ': ' + JSON.stringify(already_assigned));
        this.ensureLabTech();
        return false;
    }
    var rlabs = this.find(FIND_MY_STRUCTURES, { filter: function(structure){ if(structure.structureType == STRUCTURE_LAB && structure.isAvailable()) { return 1; } else { return 0; } } });
    if (!rlabs.length) {
        console.log(this.name + ': assignBooster: no free labs for assigning booster: ' + btype);
        return false;
    }
    var lab_to_assign = rlabs[0];
    var mincount = this.terminal.store[btype];
    if (mincount == undefined || mincount < 3000) {
        var acq = this.terminal.acquireMineralAmount(btype, 3000, 3000);
        if (!acq) {
             console.log(this.name + ': assignBooster: we do not have any of following mineral, anywhere: ' + btype);
             return false;
        }
    }
    Memory['assigned_labs'][lab_to_assign.id] = {'mineralid': btype, 'purpose': 'boost', 'action': 'fill'};
    return true;
}
