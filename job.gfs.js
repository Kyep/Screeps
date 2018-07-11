"use strict";

module.exports =  {

    run: function(creep) {
        if (creep.room.name != creep.memory[MEMORY_HOME]) {
            creep.moveToRUP(creep.getHomePos());
            return 0;
        }
        var target
        var using_memory = false;
        if(creep.memory[MEMORY_GFS_TARGET]) {
            target = Game.getObjectById(creep.memory[MEMORY_GFS_TARGET]);
            var target_valid = true;
            if (!target) {
                target_valid = false;
            } else if (target.energy && target.energyCapacity && target.energy == target.energyCapacity) {
                target_valid = false;
            } else if (target.store && _.sum(target.store) == target.storeCapacity) {
                target_valid = false;
            }
            if (target_valid) {
                using_memory = true;
            } else {
                target = undefined;
                delete creep.memory[MEMORY_GFS_TARGET];
            }
        }
        if (!target) {
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 10, {
                    filter: (structure) => {
                         return (structure.structureType == STRUCTURE_LINK) && structure.energy > 0;
                    }
            });
            if (targets.length == 0) {
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                         return (structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > creep.carryCapacity)
                         || (structure.structureType == STRUCTURE_TERMINAL && structure.canWithdrawEnergy());
                    }
                });
            }
            if(targets.length > 0) {
                target = creep.pos.findClosestByRange(targets);
            }
        }
        if (target) {
            var amount_to_withdraw = 0;
            if (target.store) {
                amount_to_withdraw = Math.min(target.store[RESOURCE_ENERGY], creep.carryCapacity - creep.carry.energy);
            } else if (target.energy) {
                amount_to_withdraw = Math.min(target.energy, creep.carryCapacity - creep.carry.energy);
            } else {
                console.log(creep.name + ": GFS unable to identify withdraw method when withdrawing " + amount_to_withdraw + " from " + JSON.stringify(target));
                return;
            }
            
            if(amount_to_withdraw == 0) {
                return ERR_NOT_ENOUGH_RESOURCES;
            }

            var result = creep.withdraw(target, RESOURCE_ENERGY, amount_to_withdraw);
            
            /*
            if(using_memory) {
                new RoomVisual(creep.room.name).line(creep.pos.x, creep.pos.y, target.pos.x, target.pos.y, {color: 'blue', lineStyle: 'dashed'});
            } else {
                new RoomVisual(creep.room.name).line(creep.pos.x, creep.pos.y, target.pos.x, target.pos.y, {color: 'blue', lineStyle: undefined});
            }
            */
            
            if(result == ERR_NOT_IN_RANGE) {
                creep.moveToRUP(target);
                creep.memory[MEMORY_GFS_TARGET] = target.id;
            } else if (result == OK) {
                creep.adjustEarnings(amount_to_withdraw * -1);
            } else if (result == ERR_BUSY) {
                // creep still being spawned.
            } else {
               console.log(creep.name + ": GFS WITHDRAW ERROR! " + result + " when withdrawing " + amount_to_withdraw + " from " + target.structureType);
               creep.memory[MEMORY_GFS_TARGET] = target.id;
            }
            return result;
        } else {
            return ERR_NOT_ENOUGH_RESOURCES;
        }
        
	}
};
