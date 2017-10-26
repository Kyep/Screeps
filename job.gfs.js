"use strict";

module.exports =  {

    run: function(creep) {
        if (creep.room.name != creep.memory[MEMORY_HOME]) {
            creep.moveTo(creep.getHomePos());
            return 0;
        }
        var targets = creep.pos.findInRange(FIND_STRUCTURES, 10, {
                filter: (structure) => {
                     return (structure.structureType == STRUCTURE_LINK) && structure.energy > 0;
                }
        });
        if (targets.length == 0) {
            targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                         return (structure.structureType == STRUCTURE_CONTAINER) && structure.store.energy > 0;
                    }
            });
        }
        var terminal_energy_min = empire_defaults['terminal_energy_min'];
        if (targets.length == 0) {
            targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                     return (structure.structureType == STRUCTURE_STORAGE && structure.store.energy > 0)
                     || (structure.structureType == STRUCTURE_TERMINAL && structure.store.energy > terminal_energy_min);
                }
            });
        }
        if(targets.length > 0) {
            var target = creep.pos.findClosestByRange(targets);
            var amount_to_withdraw = 0;
            if (target.energy == undefined) {
                amount_to_withdraw = Math.min(target.store.energy, creep.carryCapacity - creep.carry.energy);
            } else {
                amount_to_withdraw = Math.min(target.energy, creep.carryCapacity - creep.carry.energy);
            }
            var result = creep.withdraw(target, RESOURCE_ENERGY, amount_to_withdraw);
            
            if(result == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_GFS}});
            } else if (result == OK) {
                creep.adjustEarnings(amount_to_withdraw * -1);
            } else if (result == ERR_BUSY) {
                // creep still being spawned.
            } else {
               console.log(creep.name + ": GFS WITHDRAW ERROR! " + result);
            }
        } else {
            return -1;
        }
        
	}
};
