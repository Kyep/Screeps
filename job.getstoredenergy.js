var jobGetstoredenergy = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                     return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && structure.store.energy > 0;
                }
        });
        if(targets.length > 0) {
            var target = creep.pos.findClosestByRange(targets);
            if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}});
            }
        } else {
            return -1;
        }
        
	}
};

module.exports = jobGetstoredenergy;