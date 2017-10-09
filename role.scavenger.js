var jobReturnresources = require('job.returnresources');
var jobScavenge = require('job.scavenge');

module.exports =  {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.job != JOB_SCAVENGE && creep.carry.energy == 0) {
            creep.memory.job = JOB_SCAVENGE;
        } else if(creep.memory.job == JOB_SCAVENGE && creep.carry.energy == creep.carryCapacity) {
            creep.memory.job = JOB_RETURN;
            creep.memory['targetcontainer'] = undefined;
	    }
	    if(creep.memory.job == JOB_SCAVENGE) {
	        if (jobScavenge.run(creep) == -1) {
	            if (creep.carry.energy > 0) {
                    creep.memory.job = JOB_RETURN;
	            }
	        }
        }
        if(creep.memory.job == JOB_RETURN) {
            retval = jobReturnresources.run(creep, 0, 0, 0.8, 1, 1, 0);
	        if (retval == -1) {
                creep.memory.job = JOB_SCAVENGE;
            }
        }

	}
};
