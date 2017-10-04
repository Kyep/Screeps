module.exports =  {

    /** @param {Creep} creep **/
    run: function(creep, fill_spawner, fill_extensions, tower_factor, fill_containers, fill_storage) {

        var targets = [];
        
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
