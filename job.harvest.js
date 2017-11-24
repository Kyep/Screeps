"use strict";

module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory[MEMORY_SOURCE] == undefined){
            console.log("WARNING: " + creep.name + " has no source!");
            return -1;
        }
        var source = Game.getObjectById(creep.memory[MEMORY_SOURCE]);
        if(source == null){
            return -1;
        }
        var result = creep.harvest(source);
        if (result == ERR_NOT_IN_RANGE || result == ERR_NOT_ENOUGH_RESOURCES) {
            creep.moveToRUP(source);
        } else if (result == OK) {
            // DO NOT adjustEarnings here. That doesn't account for harvesters who spend their money on the way back repairing roads.
            if (creep.memory[MEMORY_JOURNEYSTART] != undefined ) {
                creep.memory[MEMORY_JOURNEYSTART] = undefined;
            }
        }
        return result;
	}
};
