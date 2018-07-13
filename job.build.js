"use strict";

module.exports =  {
    run: function(creep) {
        var buildTarget;
        if (creep.memory[MEMORY_BUILD_TARGET] != undefined) {
            buildTarget = Game.getObjectById(creep.memory[MEMORY_BUILD_TARGET]);
            if (!buildTarget) {
                delete creep.memory[MEMORY_BUILD_TARGET];
            }
        }
        if (!buildTarget) {
            var targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
            if (targets.length) {
                buildTarget = creep.pos.findClosestByRange(targets);
                creep.memory[MEMORY_BUILD_TARGET] = buildTarget.id;
            }
        }
        if (!buildTarget) {
            return false;
        }
        var rr = creep.build(buildTarget);
        if(rr == ERR_NOT_IN_RANGE) {
            creep.moveToRUP(buildTarget);
        } else if (rr == ERR_RCL_NOT_ENOUGH) {
            new RoomVisual(creep.room.name).circle(buildTarget.pos, {radius: 0.5, opacity: 0.3, stroke: 'red'});
            buildTarget.remove();
        }
        return true;
	}
};
