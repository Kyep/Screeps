"use strict";

module.exports =  {
    run: function(creep) {
        var targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
        if(targets.length) {
            var target = creep.pos.findClosestByRange(targets)
            if(creep.build(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_BUILD}});
            }
        } else {
            return -1;
        }
	}
};
