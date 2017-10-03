var jobReturnresources = {

    /** @param {Creep} creep **/
    run: function(creep, fill_spawner, fill_extensions, tower_factor, fill_containers, fill_storage) {

        var targets = [];
        
        if (fill_spawner && fill_extensions) {
            targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                    }
            });
        } else if (fill_spawner) {
            targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                    }
            });
        } else if (fill_extensions) {
            targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION) && structure.energy < structure.energyCapacity;
                    }
            });
        }

        if(targets.length == 0 && tower_factor > 0) {
            targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_TOWER) && structure.energy < (structure.energyCapacity * tower_factor) // does this work? *****
                    }
            });
        } 
        if(targets.length == 0 && fill_containers) {
            targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER)  && structure.store.energy < structure.storeCapacity;
                    }
            });
        }
        if(targets.length == 0 && fill_storage) {
            targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE)  && structure.store.energy < structure.storeCapacity;
                    }
            });
        }
        if(targets.length > 0) {
            var target = creep.pos.findClosestByRange(targets)
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}});
            }
        } else {
            return -1;
        }
	}
};

module.exports = jobReturnresources;