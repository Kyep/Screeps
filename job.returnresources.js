module.exports =  {

    /** @param {Creep} creep **/
    run: function(creep, fill_spawner, fill_extensions, tower_factor, fill_containers, fill_storage, ext_priority) {

        var targets = [];
        var target = undefined;
        var using_memory = 0;
        
        if(creep.memory['targetcontainer'] != undefined) {
            using_memory = 1;
            target = Game.getObjectById(creep.memory['targetcontainer']);
            if(!target) {
                creep.memory['targetcontainer'] = undefined;
            } else { 
                if(target.energy != undefined && target.energyCapacity != undefined) {
                    if (target.energy == target.energyCapacity) {
                        creep.memory['targetcontainer'] = undefined;
                        target = undefined;
                    }
                } else if (target.store != undefined && target.storeCapacity != undefined) {
                    if (target.store.energy == target.storeCapacity) {
                        creep.memory['targetcontainer'] = undefined;
                        target = undefined;
                    }
                }
            }
        }
        if(creep.memory['targetcontainer'] != undefined || target == undefined) {
            if(ext_priority) {
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                                (
                                  (((structure.structureType == STRUCTURE_SPAWN && fill_spawner) || ( structure.structureType == STRUCTURE_EXTENSION && fill_extensions)) && structure.energy < structure.energyCapacity)
                                  || (structure.structureType == STRUCTURE_TOWER && structure.energy < (structure.energyCapacity * tower_factor))
                                )
                        );
                    }
                });
            }
            
            if(!targets.length) {
                targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (
                                    (
                                       (((structure.structureType == STRUCTURE_SPAWN && fill_spawner) || ( structure.structureType == STRUCTURE_EXTENSION && fill_extensions)) && structure.energy < structure.energyCapacity)
                                       || (structure.structureType == STRUCTURE_TOWER && structure.energy < (structure.energyCapacity * tower_factor))
                                       || (((structure.structureType == STRUCTURE_CONTAINER && fill_containers) || ( structure.structureType == STRUCTURE_STORAGE && fill_storage)) && structure.store.energy < structure.storeCapacity)
                                    )
                            );
                        }
                });
            }
        }

        if(targets.length > 0 || target != undefined) {
            //if(targets.indexOf(target) > -1) {
                //console.log(creep.name + " using saved target: " + target.id);
            //} else {
                //
            //}
            if (target == undefined) {
                target = creep.pos.findClosestByRange(targets);
                creep.memory['targetcontainer'] = target.id;
                //console.log(JSON.stringify(target));
            }

            var structure_max_storage = 0;
            if (target.energyCapacity != undefined) {
                structure_max_storage = target.energyCapacity;   
            }
            if (target.storeCapacity != undefined) {
                structure_max_storage = target.storeCapacity;
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
            
            //var result = creep.transfer(target, RESOURCE_ENERGY);
            if(result == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_DROPOFF}});
            } else if (result == OK) {
                creep.memory['targetcontainer'] = undefined;
                //console.log(creep.name + ": RR DEPOSIT: " + amount_to_deposit + ' of ' + creep.carry.energy + ' v. ' + structure_max_storage +'/'+ structure_contents + '~' + using_memory);
                
                creep.memory['targetcontainer'] = undefined;
                creep.adjustEarnings(amount_to_deposit);
            }
            if (creep.carry.energy == 0) {
                creep.memory['targetcontainer'] = undefined;
            }



        } else {
            return -1;
        }
	}
};
