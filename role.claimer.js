"use strict";

module.exports = {
    run: function(creep){
        if(creep.memory[MEMORY_DEST] != creep.room.name){
            creep.moveTo(new RoomPosition(25, 25, creep.memory[MEMORY_DEST]), {visualizePathStyle: {stroke: '#ffffff'}})
        }else{
            if(creep.room.controller) {
                if (creep.room.controller.owner != undefined) {
                    if (creep.room.controller.owner.username != undefined) {
                        if (creep.room.controller.owner.username != creep.owner.username) {
                            result = creep.attackController(creep.room.controller);
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
                        //creep.attackController(creep.room.controller); // requires FIVE CLAIM PARTS :(((
                    }
                }
            }
        }
    }
}