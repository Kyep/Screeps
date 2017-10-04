var jobReturnresources = require('job.returnresources');
var jobRenew = require('job.renew');
var jobGetstoredenergy = require('job.gfs');

module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.job != JOB_GFS && creep.memory.job != JOB_RENEW && creep.carry.energy == 0) {
            creep.memory.job = JOB_GFS;
            creep.announceJob();
        } else if(creep.memory.job == JOB_GFS && creep.carry.energy == creep.carryCapacity) {
            creep.memory.job = JOB_RETURN;
            creep.announceJob();
        }
        if(creep.memory.job == JOB_GFS) {
            if (jobGetstoredenergy.run(creep) == -1){
                //creep.memory.role = 'recycler'; // this is super-dangerous, it can create an endless loop when a room without a container spawns a teller :P
            }
	    } else if(creep.memory.job == JOB_RETURN) {
            // function(creep, fill_spawner, fill_extensions, tower_factor, fill_containers, fill_storage) {
	        if (jobReturnresources.run(creep, 1, 1, 0.8, 0, 0) == -1) {
                //
            }
        /*
        } else if (creep.memory.job == JOB_RENEW) {
            if (creep.ticksToLive > 1000) {
	            creep.memory.job = 'build';
                creep.announceJob();
            } else {
                if (jobRenew.run(creep) == -1){
                    creep.memory.job = JOB_GFS;
                    creep.announceJob();
                }
            }
        */ // tellers never renew.
        } else {
            console.log("WARNING: " + creep.name + " has no job! " + creep.memory.job);
            creep.memory.job = JOB_GFS;
        }
	}
};
