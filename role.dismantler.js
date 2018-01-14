"use strict";

module.exports = {
    
    run: function(creep) {

        if(!creep.isAtDestinationRoom()){
            creep.moveToDestination();
            return;
        } else if (creep.updateDestination()) {
            return;
        }

        var target = creep.getClosestHostileStructure();
        if(target) {
            if(creep.dismantle(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
        
    }

};