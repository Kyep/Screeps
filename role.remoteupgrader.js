var jobUpgrade = require('job.upgrade');
var jobRenew = require('job.renew');
var jobGetstoredenergy = require('job.getstoredenergy');

module.exports =  {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.job != JOB_GFS && creep.memory.job != JOB_RENEW && creep.carry.energy == 0) {
            creep.memory.job = JOB_GFS;
            //creep.announceJob();
        } else if(creep.memory.job == JOB_GFS && creep.carry.energy == creep.carryCapacity) {
            creep.memory.job = JOB_UPGRADE;
            //creep.announceJob();
        }
        if(creep.memory.job == JOB_GFS) {
            if (jobGetstoredenergy.run(creep) == -1){
                //creep.memory.role = 'recycler';
            }
        } else if(creep.memory.job == JOB_UPGRADE) {
            jobUpgrade.run(creep);
        } else if (creep.memory.job == JOB_RENEW) {
            if (creep.ticksToLive > 500 || jobRenew.run(creep) == -1) {
                creep.memory.job = JOB_GFS;
                //creep.announceJob();
            }
        } else {
            console.log("WARNING: " + creep.name + " has no job: " + creep.memory.job);
            creep.memory.job = JOB_GFS;
        }
	}
};
