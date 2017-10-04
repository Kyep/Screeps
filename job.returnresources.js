module.exports =  {

    /** @param {Creep} creep **/
    run: function(creep, fill_spawner, fill_extensions, tower_factor, fill_containers, fill_storage, ext_priority) {

        var targets = [];
        var target = undefined;
        
        if(creep.memory['targetcontainer'] != undefined) {
            target = Game.getObjectById(creep.memory['targetcontainer']);
            if(!target) {
                creep.memory['targetcontainer'] = undefined;
            } else { 
                if(target.energy != undefined && target.energyCapacity != undefined) {
                    if (target.energy == target.EnergyCapacity) {
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
            }
            var result = creep.transfer(target, RESOURCE_ENERGY);
            if(result == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_DROPOFF}});
            } else if (result != OK) {
                creep.memory['targetcontainer'] = undefined;
            }
            if (creep.carry.energy == 0) {
                creep.memory['targetcontainer'] = undefined;
            }


        } else {
            return -1;
        }
	}
};
