"use strict";

module.exports = {

    run: function(creep) {
        if(creep.room.name != creep.memory[MEMORY_HOME]) {
            creep.moveToRUP(creep.getHomePos());
            return 0;
        }
        
        if(creep.memory[MEMORY_RENEW] != undefined) {
            if(creep.memory[MEMORY_RENEW] == 0) {
                creep.memory[MEMORY_ROLE] = 'recycler';
                return -1;
            }
        }
        if(creep.getShouldHide()) {
            return -1;
        }

        creep.say(creep.ticksToLive);

        var target = undefined;
        var using_memory = false;
        if (creep.memory[MEMORY_RENEWALSP]) {
            var spobj = Game.getObjectById(creep.memory[MEMORY_RENEWALSP]);
            if (!spobj || !spobj.isActive() || spobj.spawning != undefined) {
                delete creep.memory[MEMORY_RENEWALSP];
            } else if (creep.memory[MEMORY_RENEWALTICK] && creep.memory[MEMORY_RENEWALTICK] < (Game.time - 100)) {
                delete creep.memory[MEMORY_RENEWALSP];
            } else {
                target = spobj;
                using_memory = true;
            }
        }
        
        if (!target) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN && structure.spawning == undefined && structure.isActive() && structure.ticksToAvailability() == 0);
                    }
            });
            if (targets.length == 0) {
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN && structure.spawning == undefined && structure.isActive());
                    }
                });
            }
            if (targets.length > 0) {
                target = _.sample(targets);
                creep.memory[MEMORY_RENEWALSP] = target.id;
                creep.memory[MEMORY_RENEWALTICK] = Game.time;
            }
        }
        if (target) {
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
                creep.memory[MEMORY_RENEWALTICK] = Game.time;
            } else if(result == ERR_NOT_IN_RANGE) {
                creep.moveToRUP(target);
                if(using_memory) {
                    new RoomVisual(creep.room.name).line(creep.pos.x, creep.pos.y, target.pos.x, target.pos.y, {color: 'green', lineStyle: 'dashed'});
                } else {
                    new RoomVisual(creep.room.name).line(creep.pos.x, creep.pos.y, target.pos.x, target.pos.y, {color: 'green', lineStyle: undefined});
                }
            } else if (result == ERR_NOT_ENOUGH_ENERGY) {
                if (creep.carry.energy > 0) {
                    var amount_to_deposit = Math.min(target.energyCapacity - target.energy, creep.carry.energy);
                    var result = creep.transfer(target, RESOURCE_ENERGY, amount_to_deposit);
                    if (result == OK) {
                        creep.adjustEarnings(amount_to_deposit);
                    }
                }
            } else if (result == ERR_BUSY) {
                creep.moveToRUP(target);
            }
            //if (result != OK && result != ERR_NOT_IN_RANGE) { console.log('creep ' + creep.name + ' at ' + creep.pos.x + ',' + creep.pos.y + ':' + creep.room.name + ' failed renew: ' + result) }
            return result;
        } else {
            //console.log('creep ' + creep.name + ' failed renew (no spawn) ')
            return -1;
        }
	}
};
