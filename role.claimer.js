"use strict";

module.exports = {
    run: function(creep){
        if(!creep.isAtDestinationRoom()){
            creep.moveToDestination();
            return;
        }
        if (creep.updateDestination()) {
            return;
        }
        if (creep.avoidEdges()) {
            return;
        }
        if (creep.redRally()) {
            return;
        }
            if(creep.room.controller) {
                if (creep.room.controller.owner != undefined) {
                    if (creep.room.controller.owner.username != undefined) {
                        if (creep.room.controller.owner.username != creep.owner.username) {
                            creep.say('Attack!');
                            var result = creep.attackController(creep.room.controller);
                            if (result == ERR_NOT_IN_RANGE) {
                                creep.moveToRUP(creep.room.controller);
                            }
                        } else if (!creep.room.inEmpire()){
                            global.CLAIM_ROOM(creep.room.name, creep.room.name, creep.memory[MEMORY_HOME]);
                            var victims = creep.room.clearHostileStructures();
                            creep.room.fullUpdate();
                            creep.room.checkStructures();
                            if (Memory[MEMORY_GLOBAL_GCL_FARM].indexOf(creep.room.name) == -1) {
                                creep.sleepFor(100);
                            }
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