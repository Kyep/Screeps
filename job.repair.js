"use strict";

module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var repairtarget = creep.pos.findClosestByRange(creep.room.getRepairable([], 0));
        if(repairtarget) {
            if(creep.repair(repairtarget) == ERR_NOT_IN_RANGE) {
                creep.moveToRUP(repairtarget);
            }
        } else {
            return -1;
        }
	}
};
