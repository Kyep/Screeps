var roleRecycle = {
    run: function(creep) {
        if (creep.room.name != creep.memory[MEMORY_HOME]) {
                creep.moveTo(creep.getHomePos());
                return 0;
        }
        var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_SPAWN);
                }
        });
        if(targets.length) {
            var theSpawn = targets[0];
            theSpawn.recycleCreep(creep)
            creep.moveTo(theSpawn, {visualizePathStyle: {stroke: '#ff0000'}});
        }
	}
};

module.exports = roleRecycle;