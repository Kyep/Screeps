"use strict";

module.exports = {
    run: function(creep){
        if(!creep.isAtDestinationRoom()){
            creep.moveToDestination();
        } else {
            if(creep.room.controller) {
                var result = creep.reserveController(creep.room.controller)
                if (result == ERR_NOT_IN_RANGE) {
                    creep.memory.expiresAt += 1
                    creep.moveTo(creep.room.controller);
                } else if (result == ERR_NOT_OWNER) {
                    //creep.attackController(creep.room.controller); // requires FIVE CLAIM PARTS :(((
                }
            }
        }
    }
}