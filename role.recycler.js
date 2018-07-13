"use strict";

module.exports = {
    run: function(creep) {
        if (creep.room.name != creep.memory[MEMORY_HOME]) {
                creep.moveTo(creep.getHomePos());
                return 0;
        }
        if (creep.carry.energy > 0) {
            var result = creep.returnToStorage();
            return;
        }
        var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_SPAWN);
                }
        });
        if(targets.length) {
            var theSpawn = targets[0];
            theSpawn.recycleCreep(creep)
            creep.moveToRUP(theSpawn);
        }
	}
};
