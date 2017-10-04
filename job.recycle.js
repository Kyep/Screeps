module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.room.name != creep.memory.home) {
                creep.moveTo(new RoomPosition(25, 25, creep.memory.home));
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
        } else {
            return -1;
        }
    }
};
