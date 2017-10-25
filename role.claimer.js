"use strict";

module.exports = {
    run: function(creep){
        if(!creep.isAtDestinationRoom()){
            creep.moveToDestination();
        } else {
            if(creep.room.controller) {
                if (creep.room.controller.owner != undefined) {
                    if (creep.room.controller.owner.username != undefined) {
                        if (creep.room.controller.owner.username != creep.owner.username) {
                            var result = creep.attackController(creep.room.controller);
                            if (result == ERR_NOT_IN_RANGE) {
                                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#0000ff'}});
                            }
                        }
                    }            
                } else {
                    result = creep.claimController(creep.room.controller)
                    if (result == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#0000ff'}});
                    } else if (result == ERR_NOT_OWNER) {
                        //creep.attackController(creep.room.controller); // requires FIVE claim parts to work.
                    } else if (result == OK) {
                        creep.suicide();
                    }
                }
            }
        }
    }
}