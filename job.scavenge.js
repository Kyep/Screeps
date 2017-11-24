"use strict";

module.exports =  {
    run: function(creep) {
        var source = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {filter: (s) => s.energy > 0});
        if(source != null){
            if (creep.pickup(source) == ERR_NOT_IN_RANGE) {
                creep.moveToRUP(source);
            }
        } else {
            return -1;
        }
    }
};
