
Creep.prototype.getBoostsWanted = function() {
    var boosts_desired = [];

    
    // ideal: from W46S17 -> W37S18 (shard1) 
    // SIEGEX: {TOUGH: 10, MOVE: 20, WORK: 20} + SIEGEHEALER {TOUGH: 10, MOVE: 25, HEAL: 15} -- with XZH2O (T3 dismantle boost), XLHO2 (T3 heal boost), and XGHO2 (T3 TOUGH boost)
    
    var move_parts = this.getActiveBodyparts(MOVE);
    var melee_parts = this.getActiveBodyparts(ATTACK);
    var ranged_parts = this.getActiveBodyparts(RANGED_ATTACK);
    var work_parts = this.getActiveBodyparts(WORK);
    var heal_parts = this.getActiveBodyparts(HEAL);
    var tough_parts = this.getActiveBodyparts(TOUGH);

    if (move_parts == 10 && ranged_parts == 40 && Game.shard.name == 'shard1') {
        this.memory[MEMORY_BOOSTSALLOWED] = true;
    }

    if (!this.memory[MEMORY_BOOSTSALLOWED]) {
        return boosts_desired;
    }

    if (move_parts == 10) {
        boosts_desired.push(BOOST_MOVE); // MOVE speed
    }

    if (work_parts) {
        boosts_desired.push(BOOST_WORK);
    }
    
    if (melee_parts) {
        boosts_desired.push(BOOST_MELEE);// have UH2O, no XUH2O
    }

    if (ranged_parts) {
        boosts_desired.push(BOOST_RANGED);// have UH2O, no XUH2O
    }

    if (heal_parts) {
        boosts_desired.push(BOOST_HEAL); // T1: T2: T3:XLHO2
    }
    
    if (tough_parts) {
        boosts_desired.push(BOOST_TOUGH);
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
                this.say(thisboost);
            } else if (bresult == ERR_NOT_ENOUGH_RESOURCES) {
                console.log(this.name + ': tried to get boost ' + thisboost + ' from lab ' + destlab.id + ' but the lab is out of energy.');
                this.memory[MEMORY_BOOSTSMISSING].push(thisboost);
            } else {
                console.log(this.name + ': tried to get boost ' + thisboost + ' from lab ' + destlab.id + ' with result: ' + bresult);
                this.memory[MEMORY_BOOSTSMISSING].push(thisboost);
            }
        } else {
            this.say('!' + thisboost);
            //console.log(this.name + ' in ' + this.room.name + ' tried to get boost ' + thisboost + ' but no lab here has it!');
            if (tickspassed > 300) {
                this.memory[MEMORY_BOOSTSMISSING].push(thisboost);
            }
        }
        return true;
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

Room.prototype.ensureBoostAvailable = function(btype) {
    if (!this.isMine()) {
        if (Game.time % 100 === 0) {
            console.log(this.name + ': Room.prototype.ensureBoostAvailable: not our room...');
        }
        return false;
    }
    var labobj = this.getUsableLabForBooster(btype);
    if (labobj) {
        //console.log(this.name + ': Room.prototype.ensureBoostAvailable: ' + labobj.id);
        return true;
    }
    var already_assigned = this.getLabsForBooster(btype);
    if (!already_assigned.length) {
        var retval = this.assignBoost(btype);
        console.log(this.name + ': Room.prototype.ensureBoostAvailable: boost not assigned, trying to assign: ' + retval);
        return false;
    }
    var amt_in_terminal = 0;
    if (this.terminal && this.terminal.store[btype]) {
        amt_in_terminal = this.terminal.store[btype];
    }
    if (amt_in_terminal < 3000) {
        var trv = this.terminal.acquireMineralAmount(btype, 2000, 6000);
        console.log(this.name + ': Room.prototype.ensureBoostAvailable: attempting to acquire mineral ' + btype + ' result: ' + trv);
    }
    var ltresult = this.ensureLabTech();
    if (ltresult != OK) {
        //console.log(this.name + ': Room.prototype.ensureBoostAvailable: demanding lab tech: ' + ltresult);
    }
    return false;
}

Room.prototype.getUsableLabForBooster = function(btype) {
    var lab_objs = this.getLabsForBooster(btype);
    var usable_labs = [];
    if (lab_objs.length) {
        for (var i = 0; i < lab_objs.length; i++) {
            var thislab = lab_objs[i];
            if (thislab.mineralAmount >= 3000 && thislab.energy >= 1000) {
                return thislab;
            }
        }
        //console.log(this.name + ': getUsableLabForBooster: no lab has enough booster material of our type, despite assignment. Spawning labtech to refill our supply of: ' + btype);
        this.ensureLabTech();
    } else {
        console.log(this.name + ': getUsableLabForBooster: no lab assigned to booster type: ' + btype);
    }
    //console.log(this.name + ': getUsableLabForBooster: no lab with usable booster of type: ' + btype);
    return undefined;
}

Room.prototype.listBoostsAvailable = function() {
    var assigned_labs = Memory[MEMORY_GLOBAL_SCIENCELABS];
    var boosts = [];
    for (var labid in assigned_labs) {
        var labdata = assigned_labs[labid];
        var thislab = Game.getObjectById(labid);
        if (thislab.room.name != this.name) {
            continue;
        }
        if (labdata['purpose'] != 'boost') {
            continue;
        }
        boosts.push(labdata['mineralid']);
    }
    return boosts;
}

Room.prototype.getLabsForBooster = function(btype) {
    if (!btype) {
        return [];
    }
    
    var assigned_labs = Memory[MEMORY_GLOBAL_SCIENCELABS];
    var booster_labs = [];
    for (var labid in assigned_labs) {
        var labdata = assigned_labs[labid];
        var thislab = Game.getObjectById(labid);
        if (!thislab) {
            delete Memory[MEMORY_GLOBAL_SCIENCELABS][labid];
        }
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
        return this.createUnit('labtech', this.name, [], this.name, 25, 25, true);
    }
    return num_techs;
}

Room.prototype.removeBoosts = function() {
    var rlabs = this.find(FIND_MY_STRUCTURES, { filter: function(structure){ if(structure.structureType == STRUCTURE_LAB) { return 1; } else { return 0; } } });
    for (var i = 0; i < rlabs.length; i++) {
        if (Memory[MEMORY_GLOBAL_SCIENCELABS][rlabs[i].id] && Memory[MEMORY_GLOBAL_SCIENCELABS][rlabs[i].id]['purpose'] == 'boost') {
            var labcontents = '(empty)';
            if (rlabs[i].mineralType) {
                labcontents = rlabs[i].mineralType;
            }
            console.log(this.name + ': removing boost for lab: ' + rlabs[i].id + ' contents: ' + labcontents);
            delete Memory[MEMORY_GLOBAL_SCIENCELABS][rlabs[i].id];
        }
    }
    return true;
}

Room.prototype.assignSiegeBoosts = function() {
    this.assignBoost(BOOST_MOVE);
    this.assignBoost(BOOST_WORK);
    this.assignBoost(BOOST_MELEE);
    this.assignBoost(BOOST_HEAL);
    this.assignBoost(BOOST_TOUGH);
}

Room.prototype.ensureSiegeBoosts = function() {
    return this.ensureBoostList([BOOST_MOVE, BOOST_MELEE, BOOST_HEAL, BOOST_TOUGH, BOOST_WORK]);
}

Room.prototype.ensureDefenseBoosts = function() {
    return this.ensureBoostList([BOOST_MOVE, BOOST_MELEE, BOOST_HEAL, BOOST_TOUGH]);
}

Room.prototype.ensureBoostList = function(required_boosts) {
    var retval = true;;
    for (var i = 0; i < required_boosts.length; i++) {
        var result = this.ensureBoostAvailable(required_boosts[i]);
        console.log(required_boosts[i] + ': ' + result);
        if (result === false) {
            retval = false;
        }
    }
    return retval;
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
    if (mincount == undefined || mincount < 2000) {
        var acq = this.terminal.acquireMineralAmount(btype, 3000, 3000);
        if (!acq) {
             console.log(this.name + ': assignBooster: we do not have any of following mineral, anywhere: ' + btype);
             return false;
        }
    }
    Memory[MEMORY_GLOBAL_SCIENCELABS][lab_to_assign.id] = {'mineralid': btype, 'purpose': 'boost', 'action': 'fill'};
    return true;
}
