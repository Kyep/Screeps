"use strict";

module.exports = {
    run: function(creep){
        if(!creep.isAtDestinationRoom()){
            creep.moveToDestination();
            return;
        } else if (creep.updateDestination()) {
            return;
        } else {
            if(creep.room.controller) {
                if (creep.room.controller.owner != undefined) {
                    if (creep.room.controller.owner.username != undefined) {
                        if (creep.room.controller.owner.username != creep.owner.username) {
                            creep.say('Attack!');
                            var result = creep.attackController(creep.room.controller);
                            if (result == ERR_NOT_IN_RANGE) {
                                creep.moveToRUP(creep.room.controller);
                            }
                        } else {
                            var victims = creep.room.clearHostileStructures();
                            creep.room.fullUpdate();
                            creep.room.checkStructures();
                            creep.suicide();
                        }
                    }            
                } else {
                    var result = creep.claimController(creep.room.controller)
                    if (result == ERR_NOT_IN_RANGE) {
                        creep.moveToRUP(creep.room.controller);
                    } else if (result == OK) {
                        //
                    }
                }
            }
        }
    }
}