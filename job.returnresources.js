"use strict";

module.exports =  {

    /** @param {Creep} creep **/
    run: function(creep, fill_spawner, fill_extensions, tower_factor, fill_containers, fill_storage, ext_priority) {

        var targets = [];
        var target = undefined;

        if (creep.room.energyAvailable < (creep.room.energyCapacityAvailable *0.75)) {
            ext_priority = 1;
        }

        var myresource = RESOURCE_ENERGY;
        var storekeys = Object.keys(creep.carry);
        for (var i = 0; i < storekeys.length; i++) {
            if (storekeys[i] != RESOURCE_ENERGY) {
                myresource = storekeys[i];
                break;
            }
        }

        var did_scan = true;
        if(creep.memory[MEMORY_CONTAINER] != undefined) {
            target = Game.getObjectById(creep.memory[MEMORY_CONTAINER]);
            if(!target) {
                delete creep.memory[MEMORY_CONTAINER];
                return;
            } else if (!target.isActive()) {
                target = undefined;
                delete creep.memory[MEMORY_CONTAINER];
                return;
            } else { 
                if(target.energy != undefined && target.energyCapacity != undefined) {
                    if (target.energy == target.energyCapacity) {
                        delete creep.memory[MEMORY_CONTAINER];
                        target = undefined;
                    }
                } else if (target.store != undefined && target.storeCapacity != undefined) {
                    if (target.store.energy == target.storeCapacity) {
                        delete creep.memory[MEMORY_CONTAINER];
                        target = undefined;
                    }
                }
            }
            did_scan = false;
        }
        
        if (!target) {
            //console.log(creep.name + ' target acq');
            if (myresource == RESOURCE_ENERGY) {

                if (creep.room.memory[MEMORY_NOREMOTE] && !targets.length) {
                    targets = creep.room.find(FIND_MY_STRUCTURES, {
                            filter: (structure) => {
                                return (
                                        structure.isMine() && structure.isActive() && (
                                           (structure.structureType == STRUCTURE_LAB && structure.energy < structure.energyCapacity)
                                        ) 
                                );
                            }
                    });
                } else if(ext_priority) {
                    targets = creep.room.find(FIND_MY_STRUCTURES, {
                        filter: (structure) => {
                            return (
                                    structure.isMine() && structure.isActive() && (
                                      (((structure.structureType == STRUCTURE_SPAWN && fill_spawner) || ( structure.structureType == STRUCTURE_EXTENSION && fill_extensions)) && structure.energy < structure.energyCapacity)
                                      || (structure.structureType == STRUCTURE_TOWER && structure.energy < (structure.energyCapacity * tower_factor)) 
                                    )
                            );
                        }
                    });
                }
                
                if(!targets.length) {
                    targets = creep.room.find(FIND_MY_STRUCTURES, {
                            filter: (structure) => {
                                return (
                                        structure.isMine() && structure.isActive() && (
                                            (((structure.structureType == STRUCTURE_SPAWN && fill_spawner) || ( structure.structureType == STRUCTURE_EXTENSION && fill_extensions)) && structure.energy < structure.energyCapacity)
                                            || (structure.structureType == STRUCTURE_TOWER && structure.energy < (structure.energyCapacity * tower_factor))
                                        ) 
                                );
                            }
                    });
                }
                if(!targets.length) {
                    targets = creep.room.find(FIND_MY_STRUCTURES, {
                            filter: (structure) => {
                                return (
                                        structure.isMine() && structure.isActive() && (
                                           (structure.structureType == STRUCTURE_LAB && structure.energy < structure.energyCapacity)
                                           || (structure.structureType == STRUCTURE_NUKER && structure.energy < structure.energyCapacity)
                                        ) 
                                );
                            }
                    });
                }
                if (!targets.length) {
                    var allow_term = true;
                    if (creep.room.storage && creep.room.storage.isActive()) {
                        if (creep.room.storage[RESOURCE_ENERGY] < 50000) {
                            if (creep.room.terminal && creep.room.terminal.store[RESOURCE_ENERGY] >= 10000) {
                                allow_term = false;
                            }
                        }
                        if (fill_storage && _.sum(creep.room.storage.store) < creep.room.storage.storeCapacity) {
                            targets.push(creep.room.storage);
                        }
                        if (creep.room.terminal && creep.room.terminal.isActive() && creep.room.terminal.canDepositEnergy() && allow_term) {
                            targets.push(creep.room.terminal);
                            //creep.say(fill_storage + allow_term + '/' + _.sum(creep.room.storage.store) + '/' + creep.room.storage.storeCapacity);
                        }
                    }
                }
                if(!targets.length) {
                    targets = creep.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (
                                        structure.isMine() && structure.isActive() && (
                                           (((structure.structureType == STRUCTURE_CONTAINER && fill_containers) )
                                           && structure.store.energy < structure.storeCapacity)
                                        ) 
                                );
                            }
                    });
                }
            
            } else {
                if (creep.room.terminal && creep.room.terminal.isActive() && creep.room.terminal.isMine() && creep.room.terminal.canDepositEnergy()) {
                    targets.push(creep.room.terminal);
                }
                if (creep.room.storage && creep.room.storage.isActive() && creep.room.storage.isMine()) {
                    targets.push(creep.room.storage);
                }
            }
        }

        if(targets.length > 0 || target != undefined) {
            if (target == undefined) {
                target = creep.pos.findClosestByPath(targets);
            }
            if (target == undefined) {
                creep.sleepFor(10);
                return;
            }
            creep.memory[MEMORY_CONTAINER] = target.id;
            
            
            var linecolor = 'yellow';
            var linestyle = undefined;
            if (myresource != RESOURCE_ENERGY) {
                linecolor = 'white';
            }
            if (!did_scan) {
                linestyle = 'dashed';
            }
            new RoomVisual(creep.room.name).line(creep.pos.x, creep.pos.y, target.pos.x, target.pos.y, {color: linecolor, lineStyle: linestyle});
            

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
                structure_contents = _.sum(target.store);
            }
            var amount_to_deposit = creep.carry[myresource];
            if (_.sum(creep.carry) > (structure_max_storage - structure_contents)) {
                amount_to_deposit = Math.min(creep.carry[myresource], (structure_max_storage - structure_contents));
            }
            var result = creep.transfer(target, myresource, amount_to_deposit);
            //creep.say(result + '/' + amount_to_deposit);            
            if(result == ERR_NOT_IN_RANGE) {
                creep.moveToRUP(target);
            } else if (result == OK) {
                creep.memory[MEMORY_CONTAINER] = undefined;
                creep.adjustEarnings(amount_to_deposit);
            }
            if (_.sum(creep.carry) == 0) {
                creep.memory[MEMORY_CONTAINER] = undefined;
            }
            
            return result;

        } else {
            creep.say('RR: !D: ' + fill_storage);
            return -1;
        }
	}
};
