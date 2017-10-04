var jobHarvest = require('job.harvest');
var jobBuild = require('job.build');
var jobUpgrade = require('job.upgrade');

module.exports =  {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.job != JOB_HARVEST && creep.carry.energy == 0) {
            creep.memory.job = JOB_HARVEST;
            creep.announceJob();
        } else if(creep.memory.job == JOB_HARVEST && creep.carry.energy == creep.carryCapacity) {
            creep.memory.job = JOB_BUILD;
            creep.announceJob();
	    } else if(creep.memory.job == JOB_HARVEST) {
	        jobHarvest.run(creep);
        } else if(creep.memory.job == JOB_BUILD) {
            if (jobBuild.run(creep) == -1) {
                creep.memory.job = JOB_UPGRADE;
                 creep.announceJob();
            }
        } else if(creep.memory.job == JOB_UPGRADE) {
            jobUpgrade.run(creep);
        } else {
            console.log("WARNING: " + creep.name + " has no job!");
            creep.memory.job = JOB_HARVEST;
        }
	}
};
