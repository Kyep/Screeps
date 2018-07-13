"use strict";

var jobScavenge = require('job.scavenge');

module.exports =  {

     run: function(creep) {
        if(creep.memory[MEMORY_JOB] != JOB_SCAVENGE && creep.carry.energy == 0) {
            if (!creep.isAtDestinationRoom()) {
                creep.moveToDestination();
                return;
            }
            creep.memory[MEMORY_JOB] = JOB_SCAVENGE;
            return;
        } else if(creep.memory[MEMORY_JOB] == JOB_SCAVENGE && creep.carry.energy == creep.carryCapacity) {
            creep.memory[MEMORY_JOB] = JOB_RETURN;
            creep.memory[MEMORY_CONTAINER] = undefined;
	    }
	    if(creep.memory[MEMORY_JOB] == JOB_SCAVENGE) {
	        if (!jobScavenge.run(creep)) {
	            if (creep.carry.energy > 0) {
                    creep.memory[MEMORY_JOB] = JOB_RETURN;
	            }
	        }
        }
        if(creep.memory[MEMORY_JOB] == JOB_RETURN) {
            var result = creep.returnToStorage();
	        if (result == false) {
                creep.memory[MEMORY_JOB] = JOB_SCAVENGE;
            }
        }

	}
};
