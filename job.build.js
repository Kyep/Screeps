"use strict";

module.exports =  {
    run: function(creep) {
        var targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
        
        if(targets.length) {
            var target = creep.pos.findClosestByRange(targets)
            var rr = creep.build(target);
            //creep.say("rr: " + rr);
            if(rr == ERR_NOT_IN_RANGE) {
                creep.moveToRUP(target);
            } else if (rr == ERR_RCL_NOT_ENOUGH) {
                new RoomVisual(creep.room.name).circle(target.pos, {radius: 0.5, opacity: 0.3, stroke: 'red'});
                target.remove();
                /*
                target = targets[0];
                rr = creep.build(target);
                if(rr == ERR_NOT_IN_RANGE) {
                    creep.moveToRUP(target);
                } else if (rr == OK) {
                    return true;
                }
                return false;
                */
            }
            return true;
        } else {
            return false;
        }
	}
};
