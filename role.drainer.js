"use strict";

module.exports = {
    run: function(creep){
        creep.moveTo(new RoomPosition(25, 25, creep.memory[MEMORY_DEST])); // , {ignoreDestructibleStructures: true}
    }
}