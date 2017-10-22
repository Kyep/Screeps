"use strict";

module.exports =  {
    run: function(creep) {
        var source = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {filter: (s) => s.energy > 0});
        if(source != null){
            if (creep.pickup(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: COLOR_SCAVAGE}});
            }
        } else {
            return -1;
        }
    }
};
