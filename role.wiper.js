"use strict";

// Super-simple mob that, when sent to a room I own, destroys all owned structures there.
// Used to clear up old rooms I have abandoned and do not want to re-take.

module.exports = {
    run: function(creep){
        if(!creep.isAtDestinationRoom()){
            creep.moveToDestination();
            return;
        }
        var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: function(s){
                if(s.isInvincible()) {
                    return false;
                }
                if (s.structureType == STRUCTURE_WALL) {
                    return false;
                }
                if (s.structureType == STRUCTURE_ROAD) {
                    return false;
                }
                return true;
            }
        });
        if (target) {
            var aresult = creep.attack(target);
            if(aresult == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        } else {
            creep.suicide();
        }
    }
};