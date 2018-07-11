"use strict";

module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var repairtarget
        if (creep.memory[MEMORY_REPAIR_TARGET] != undefined) {
            repairtarget = Game.getObjectById(repairtarget);
            if (!repairtarget || repairtarget.hits == repairtarget.hitsMax) {
                delete creep.memory[MEMORY_REPAIR_TARGET];
                repairtarget = undefined;
            }
        }
        repairtarget = creep.pos.findClosestByRange(creep.room.getRepairable([], 500, false));
        if(repairtarget) {
            creep.memory[MEMORY_REPAIR_TARGET] = repairtarget.id;
            if(creep.repair(repairtarget) == ERR_NOT_IN_RANGE) {
                creep.moveToRUP(repairtarget);
            }
        } else {
            return -1;
        }
	}
};
