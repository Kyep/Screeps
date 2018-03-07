"use strict";

module.exports =  {

    /** @param {Creep} creep **/
    run: function(creep, fill_spawner, fill_extensions, tower_factor, fill_containers, fill_storage, ext_priority) {

        var targets = [];
        var target = undefined;
        var using_memory = 0;
        
        if (creep.room.energyAvailable < (creep.room.energyCapacityAvailable *0.75)) {
            ext_priority = 1;
        }
        
        if(creep.memory[MEMORY_CONTAINER] != undefined) {
            using_memory = 1;
            target = Game.getObjectById(creep.memory[MEMORY_CONTAINER]);
            if(!target) {
                creep.memory[MEMORY_CONTAINER] = undefined;
            } else if (!target.isActive()) {
                target = undefined;
                creep.memory[MEMORY_CONTAINER] = undefined;
                return;
            } else { 
                if(target.energy != undefined && target.energyCapacity != undefined) {
                    if (target.energy == target.energyCapacity) {
                        creep.memory[MEMORY_CONTAINER] = undefined;
                        target = undefined;
                    }
                } else if (target.store != undefined && target.storeCapacity != undefined) {
                    if (target.store.energy == target.storeCapacity) {
                        creep.memory[MEMORY_CONTAINER] = undefined;
                        target = undefined;
                    }
                }
            }
        }
        if(creep.memory[MEMORY_CONTAINER] != undefined || target == undefined) {
            if(ext_priority) {
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                                (
                                  (((structure.structureType == STRUCTURE_SPAWN && fill_spawner) || ( structure.structureType == STRUCTURE_EXTENSION && fill_extensions)) && structure.energy < structure.energyCapacity)
                                  || (structure.structureType == STRUCTURE_TOWER && structure.energy < (structure.energyCapacity * tower_factor)) && structure.isActive()
                                )
                        );
                    }
                });
            }
            var storage_energy_max = empire_defaults['storage_energy_max'];
            if(!targets.length) {
                targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (
                                    (
                                        (((structure.structureType == STRUCTURE_SPAWN && fill_spawner) || ( structure.structureType == STRUCTURE_EXTENSION && fill_extensions)) && structure.energy < structure.energyCapacity)
                                        || (structure.structureType == STRUCTURE_TOWER && structure.energy < (structure.energyCapacity * tower_factor))
                                        || (structure.structureType == STRUCTURE_NUKER && structure.energy < structure.energyCapacity)
                                    ) && structure.isActive()
                            );
                        }
                });
            }
            if(!targets.length) {
                targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (
                                    (
                                       (structure.structureType == STRUCTURE_TERMINAL && structure.canDepositEnergy())
                                       || (structure.structureType == STRUCTURE_LAB && structure.energy < structure.energyCapacity)
                                    ) && structure.isActive()
                            );
                        }
                });
            }
            if(!targets.length) {
                targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (
                                    (
                                       (((structure.structureType == STRUCTURE_CONTAINER && fill_containers) || ( structure.structureType == STRUCTURE_STORAGE && fill_storage))
                                       && structure.store.energy < structure.storeCapacity 
                                       && structure.store.energy < storage_energy_max)
                                    ) && structure.isActive()
                            );
                        }
                });
            }
        }

        if(targets.length > 0 || target != undefined) {
            if (target == undefined) {
                target = creep.pos.findClosestByRange(targets);
                creep.memory[MEMORY_CONTAINER] = target.id;
            }

            var structure_max_storage = 0;
            if (target.energyCapacity != undefined) {
                structure_max_storage = target.energyCapacity;   
            } else if (target.storeCapacity != undefined) {
                structure_max_storage = target.storeCapacity;
            }
            if (structure_max_storage == 0) {
                creep.memory[MEMORY_CONTAINER] = undefined;
                return;
            }
            var structure_contents = 0;
            if (target.energy != undefined) {
                structure_contents = target.energy;
            }
            if (target.store != undefined) {
                if (target.store.energy != undefined) {
                    structure_contents = target.store.energy;
                }
            }
            var amount_to_deposit = creep.carry.energy;
            if (creep.carry.energy > (structure_max_storage - structure_contents)) {
                amount_to_deposit = Math.min(creep.carry.energy, (structure_max_storage - structure_contents));
            }
            var result = creep.transfer(target, RESOURCE_ENERGY, amount_to_deposit);
            //creep.say(result + '/' + amount_to_deposit);            
            if(result == ERR_NOT_IN_RANGE) {
                creep.moveToRUP(target);
            } else if (result == OK) {
                creep.memory[MEMORY_CONTAINER] = undefined;
                creep.adjustEarnings(amount_to_deposit);
            }
            if (creep.carry.energy == 0) {
                creep.memory[MEMORY_CONTAINER] = undefined;
            }
            
            return result;

        } else {
            creep.say('RR: !D: ' + fill_storage);
            return -1;
        }
	}
};
