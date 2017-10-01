var jobReturnresources = {

    /** @param {Creep} creep **/
    run: function(creep) {

        var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                }
        });

        if(targets.length == 0) {
            targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_TOWER) && structure.energy < (structure.energyCapacity * 0.9) // does this work? *****
                    }
            });
        } 
        if(targets.length == 0) {
            targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER)  && structure.store.energy < structure.storeCapacity;
                    }
            });
        }
        if(targets.length == 0) {
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