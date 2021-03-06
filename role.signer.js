"use strict";

module.exports = {
    run: function(creep){
        if(!creep.isAtDestinationRoom()){
            creep.moveToDestination();
        } else if (creep.updateDestination()) {
            return;
        } else if (creep.avoidEdges()) {
            return;
        } else {
            if (creep.memory[MEMORY_SIGN] == undefined) {
                creep.memory[MEMORY_SIGN] = empire_defaults['sign'];
            }
            if(creep.room.controller) {
                if (creep.room.controller.sign && creep.room.controller.sign.username == overlord && creep.room.controller.sign.text == creep.memory[MEMORY_SIGN] && creep.room.controller.sign.time > (Game.time - 400000)) {
                    ESPIONAGE_ADD_TARGET(creep.room.name);
                    creep.suicide();
                }
                var sresult = creep.signController(creep.room.controller, creep.memory[MEMORY_SIGN]);
                if (sresult == ERR_NOT_IN_RANGE) { 
                    creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#0000ff'}});
                }
                creep.say(sresult);
            }
        }
    }
}