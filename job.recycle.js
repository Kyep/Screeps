var jobRecycle = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                }
        });
        if(targets.length) {
            if(Game.spawns.Spawn1.recycleCreep(creep) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.spawns.Spawn1, {visualizePathStyle: {stroke: '#ff0000'}});
            }
        } else {
            return -1;
        }
    }
};

module.exports = jobRecycle;