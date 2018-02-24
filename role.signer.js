"use strict";

module.exports = {
    run: function(creep){
        if(!creep.isAtDestinationRoom()){
            creep.moveToDestination();
        } else if (creep.updateDestination()) {
            return;
        } else if (creep.pos.x < 1 || creep.pos.x > 48 || creep.pos.y < 1 || creep.pos.y > 48) {
            creep.moveTo(25, 25, creep.room);
            return;
        } else {
            if (creep.memory.sign == undefined) {
                creep.memory.sign = empire_defaults['sign'];
            }
            if(creep.room.controller) {
                if (creep.room.controller.sign && creep.room.controller.sign.username == overlord && creep.room.controller.sign.text == creep.memory.sign) {
                    creep.suicide();
                } else if (creep.signController(creep.room.controller, creep.memory.sign) == ERR_NOT_IN_RANGE) { 
                    creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#0000ff'}});
                }
            }
        }
    }
}