
Room.prototype.updateMinerals = function() {
    var science_reactions = Memory[MEMORY_GLOBAL_SCIENCEREACTIONS];
    var science_labs = Memory[MEMORY_GLOBAL_SCIENCELABS];

    var needed = [];
    var produces = [];
    
    if (!this.isMine() || !this.inEmpire() || !this.terminal) {
        this.memory[MEMORY_RC_MINS_WANTED] = needed;
        this.memory[MEMORY_RC_MINS_PRODUCED] = produces;
        return;
    }

    var rconf = GET_ROOM_CONFIG(this.name);
    var mineralmined = rconf['mineraltype'];

    if (mineralmined) {
        produces.push(mineralmined);
    }

    for (var i = 0; i < science_reactions.length; i++) {
        var reaction = science_reactions[i];
        var rmname = reaction['roomname'];
        if (rmname != this.name) {
            continue;
        }
        if (reaction['resource_1'] != mineralmined) {
            var r1_amt = 0;
            if (this.terminal.store[reaction['resource_1']]) {
                r1_amt = this.terminal.store[reaction['resource_1']];
            }
            if (true || r1_amt < 10000) {
                needed.push(reaction['resource_1']);
            }
        }
        if (reaction['resource_2'] != mineralmined) {
            var r2_amt = 0;
            if (this.terminal.store[reaction['resource_2']]) {
                r2_amt = this.terminal.store[reaction['resource_2']];
            }
            if (true || r2_amt < 10000) {
                needed.push(reaction['resource_2']);
            }
        }
        produces.push(reaction['goal']);
    }
    var boosts_used = this.listBoostsAvailable();
    needed = needed.concat(boosts_used);
    this.memory[MEMORY_RC_MINS_WANTED] = needed;
    this.memory[MEMORY_RC_MINS_PRODUCED] = produces;
}

global.REALLOCATE_MINERALS = function() {
    var bases = global.LIST_BASES();
    for (var i = 0; i < bases.length; i++) {
        var rname = bases[i];
        Game.rooms[rname].updateMinerals();
        Game.rooms[rname].pushMinerals();
    }
}

global.GET_ROOMS_NEEDING_MINERAL = function(mtype) {
    var bases = global.LIST_BASES();
    var needed_at = [];
    for (var i = 0; i < bases.length; i++) {
        var rname = bases[i];
        if (Game.rooms[rname].memory[MEMORY_RC_MINS_WANTED].includes(mtype)) {
            needed_at.push(rname);
        }
    }
    return needed_at;
}


Room.prototype.pushMinerals = function() {
    if (!this.terminal || !this.terminal.isActive() || !this.terminal.isMine()) {
        return false;
    }
    if (this.terminal.cooldown) {
        return false;
    }
    if (this.terminal.store[RESOURCE_ENERGY] < 10000) {
        return ERR_NOT_ENOUGH_ENERGY;
    }
    var skeys = Object.keys(this.terminal.store);
    var myneeds = this.memory[MEMORY_RC_MINS_WANTED];
    for (var i = 0; i < skeys.length; i++) {
        if (skeys[i] == RESOURCE_ENERGY) {
            continue;
        }
        var reserve_to_maintain = 5000;
        var max_to_transfer = reserve_to_maintain;
        var t_have = this.terminal.store[skeys[i]];

        if (myneeds.includes(skeys[i])) {
            //console.log('resource ' + skeys[i] + ' is part of my needs, and I have ' + t_have + ' of it.');
            if (t_have < reserve_to_maintain) {
                continue;
            }
            if (t_have < (reserve_to_maintain * 2)) {
                max_to_transfer = t_have - reserve_to_maintain;
            }
        }
        if (max_to_transfer > this.terminal.store[skeys[i]]) {
            max_to_transfer = this.terminal.store[skeys[i]];
        }
        if (max_to_transfer > (reserve_to_maintain * 2)) {
            max_to_transfer = reserve_to_maintain;
        }
        if (max_to_transfer == 0) {
            continue;
        }
        var needing_this = GET_ROOMS_NEEDING_MINERAL(skeys[i]);
        //console.log('resource ' + skeys[i] + ' is needed by: ' + JSON.stringify(needing_this));
        for (var j = 0; j < needing_this.length; j++) {
            var free_cap = Game.rooms[needing_this[j]].terminal.getFreeCapacity();
            if(Game.rooms[needing_this[j]] && Game.rooms[needing_this[j]].terminal && free_cap > 0) {
                var amt_have = 0;
                if (Game.rooms[needing_this[j]].terminal.store[skeys[i]]) {
                    amt_have = Game.rooms[needing_this[j]].terminal.store[skeys[i]];
                }
                var amt_needed = reserve_to_maintain - amt_have;
                if (amt_needed > 0) {
                    if (amt_needed > free_cap) {
                        amt_needed = free_cap;
                    }
                    var sresult = this.terminal.send(skeys[i], max_to_transfer, needing_this[j], 'pushminerals');
                    console.log(this.name + ': resource ' + skeys[i] + ' is needed by: ' + needing_this[j] + ' because it only has ' + amt_have + ', sending ' + max_to_transfer + ' of my ' + t_have + ' result: ' + sresult);
                    
                    return true;
                } else {
                    //console.log('resource ' + skeys[i] + ' is NOT needed by: ' + needing_this[j] + ' because it already  has ' + amt_have);
                }
            } else {
                console.log('resource ' + skeys[i] + ' is NOT needed by: ' + needing_this[j] + ' because it has no room or zero free space: ' + free_cap);
            }
        }
    }
    return false;
}
    

Room.prototype.needsLabTech = function() {
    if (!this.isMine()) {
        return false;
    }
    if (!this.terminal) {
        return false;
    }
    if (!this.terminal.isActive() || !this.terminal.isMine()) {
        return false;
    }
    var science_labs = Memory[MEMORY_GLOBAL_SCIENCELABS];
    for (var labid in science_labs) {
        if (science_labs[labid]['roomname'] === undefined) {
            var labobj = Game.structures[labid];
            if (labobj) {
                Memory[MEMORY_GLOBAL_SCIENCELABS][labid]['roomname'] = labobj.room.name;
                console.log(labobj.id + '(' + labobj.room.name + ') lacked roomname in memory, assigned.');
            } else if (science_labs[labid]['purpose'] == 'boost') {
                delete Memory[MEMORY_GLOBAL_SCIENCELABS][labid];
                console.log(labobj.id + ' lab in memory, but does not physically exist. Deleted from memory.');
            }
            continue;
        }
        if (science_labs[labid]['roomname'] != this.name) {
            continue;
        }
        var labobj = Game.structures[labid];
        var labres = labobj.needsLabTech();
        //console.log(labobj.id + ": " + labres);
        if (labres) {
            return true;
        }
    }
    return false;
}

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

Room.prototype.ensureBoostAvailable = function(btype, verbose) {
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
        if (verbose) {
            console.log(this.name + ': Room.prototype.ensureBoostAvailable: boost not assigned, trying to assign: ' + retval);
        }
        return false;
    }
    var amt_in_terminal = 0;
    if (this.terminal && this.terminal.store[btype]) {
        amt_in_terminal = this.terminal.store[btype];
    }
    var desired_amount = 3000;
    if (amt_in_terminal < desired_amount) {
        var gap_amount = desired_amount - amt_in_terminal;
        var trv = this.terminal.acquireMineralAmount(btype, gap_amount, 3000);
        if (verbose) {
            console.log(this.name + ': Room.prototype.ensureBoostAvailable: attempting to acquire mineral ' + btype + ' result: ' + trv);
        }
    }
    var ltresult = this.ensureLabTech();
    if (ltresult != OK) {
        if (verbose) {
            //console.log(this.name + ': Room.prototype.ensureBoostAvailable: demanding lab tech: ' + ltresult);
        }
    }
    return false;
}

Room.prototype.getUsableLabForBooster = function(btype) {
    var lab_objs = this.getLabsForBooster(btype);
    var usable_labs = [];
    if (lab_objs.length) {
        for (var i = 0; i < lab_objs.length; i++) {
            var thislab = lab_objs[i];
            if (thislab.mineralAmount >= 2000 && thislab.energy >= 1000) {
                return thislab;
            }
        }
        //console.log(this.name + ': getUsableLabForBooster: no lab has enough booster material of our type, despite assignment. Spawning labtech to refill our supply of: ' + btype);
        this.ensureLabTech();
    } else {
        //console.log(this.name + ': getUsableLabForBooster: no lab assigned to booster type: ' + btype);
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

Room.prototype.ensureSiegeBoosts = function(verbose) {
    return this.ensureBoostList([BOOST_MOVE, BOOST_MELEE, BOOST_HEAL, BOOST_TOUGH, BOOST_WORK], verbose);
}

Room.prototype.ensureDefenseBoosts = function(verbose) {
    return this.ensureBoostList([BOOST_MOVE, BOOST_MELEE, BOOST_HEAL, BOOST_TOUGH], verbose);
}

Room.prototype.ensureBoostList = function(required_boosts, verbose) {
    var retval = true;;
    for (var i = 0; i < required_boosts.length; i++) {
        var result = this.ensureBoostAvailable(required_boosts[i], verbose);
        if(verbose) {
            console.log(required_boosts[i] + ': ' + result);
        }
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
    if (mincount == undefined) {
        mincount = 0;
    }
    var desired_amount = 3000;
    if (mincount < desired_amount) {
        var gap_amount = desired_amount - mincount;
        var acq = this.terminal.acquireMineralAmount(btype, gap_amount, 3000);
        if (!acq) {
             console.log(this.name + ': assignBooster: we do not have any of following mineral, anywhere: ' + btype);
             return false;
        }
    }
    Memory[MEMORY_GLOBAL_SCIENCELABS][lab_to_assign.id] = {'roomname': this.name, 'mineralid': btype, 'purpose': 'boost', 'action': 'fill'};
    return true;
}
