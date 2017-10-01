var jobRenew = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_SPAWN);
                }
        });
        if(targets.length > 0) {
            var target = creep.pos.findClosestByRange(targets)
            var result = target.renewCreep(creep);
            if(result == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ff00ff'}});
            } else if (result == ERR_NOT_ENOUGH_ENERGY) {
                return -1;
            } else if (result == ERR_BUSY) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ff00ff'}});
                return -1;
            } else {
                creep.transfer(target, RESOURCE_ENERGY);
            }
        } else {
            return -1;
        }
	}
};

module.exports = jobRenew;