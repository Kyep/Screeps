"use strict";

module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var repairMax = creep.getRepairMax();
        var repairTargets = creep.room.find(FIND_STRUCTURES, {
            filter: function(structure){
                if(structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART){
                    return (structure.hits < repairMax)
                }else{
                    return (structure.hits < structure.hitsMax)
                }
            }
        });
        var repairtarget = creep.pos.findClosestByRange(repairTargets)
        if(repairtarget) {
            if(creep.repair(repairtarget) == ERR_NOT_IN_RANGE) {
                creep.moveTo(repairtarget, {visualizePathStyle: {stroke: COLOR_REPAIR}});
            }
        } else {
            return -1;
        }
	}
};
