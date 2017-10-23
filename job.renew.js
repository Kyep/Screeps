"use strict";

module.exports = {

    run: function(creep) {
        if(creep.room.name != creep.memory[MEMORY_HOME]) {
            creep.moveTo(creep.getHomePos());
            return 0;
        }
        
        if(creep.memory[MEMORY_RENEW] != undefined) {
            if(creep.memory[MEMORY_RENEW] == 0) {
                creep.memory['role'] = 'recycler';
                return -1;
            }
        }

        creep.say(creep.ticksToLive);

        var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_SPAWN && structure.spawning == undefined);
                }
        });
        if(targets.length > 0) {
            var target = creep.pos.findClosestByRange(targets)
            if(target.spawning != null) {
                if(creep.pos.getRangeTo(target) > 3) {
                    creep.moveTo(target);
                }
                return 0;
            }
            var result = target.renewCreep(creep);
            if(result == OK) {
                var creep_cost = CREEP_COST(creep.body);
                var body_size = creep.body.length;
                var renew_cost = Math.ceil(creep_cost/2.5/body_size) * -1;
                creep.adjustEarnings(renew_cost);
                if (creep.memory[MEMORY_RENEWALS] == undefined) {
                    creep.memory[MEMORY_RENEWALS] = 1;
                } else {
                    creep.memory[MEMORY_RENEWALS]++;
                }
            } else if(result == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            } else if (result == ERR_NOT_ENOUGH_ENERGY) {
                if (creep.carry.energy > 0) {
                    var amount_to_deposit = Math.min(target.energyCapacity - target.energy, creep.carry.energy);
                    var result = creep.transfer(target, RESOURCE_ENERGY, amount_to_deposit);
                    if (result == OK) {
                        creep.adjustEarnings(amount_to_deposit);
                    }
                }
            } else if (result == ERR_BUSY) {
                creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_RENEW}});
            }
            if (result != OK && result != ERR_NOT_IN_RANGE) { console.log('creep ' + creep.name + ' at ' + creep.pos.x + ',' + creep.pos.y + ':' + creep.room.name + ' failed renew: ' + result) }
            return result;
        } else {
            //console.log('creep ' + creep.name + ' failed renew (no spawn) ')
            return -1;
        }
	}
};
