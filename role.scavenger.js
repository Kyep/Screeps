var jobReturnresources = require('job.returnresources');
var jobRenew = require('job.renew');
var jobGetstoredenergy = require('job.gfs');
var jobBuild = require('job.build');
var jobUpgrade = require('job.upgrade');
var jobRecycle = require('job.recycle');
var jobScavenge = require('job.scavenge');

module.exports =  {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.job != JOB_SCAVENGE && creep.memory.job != JOB_GFS && creep.carry.energy == 0) {
            if (creep.ticksToLive > 800) {
                creep.memory.job = JOB_SCAVENGE;
            } else {
                creep.memory.job = JOB_RENEW;
            }
            //creep.announceJob();
        } else if((creep.memory.job == JOB_SCAVENGE || creep.memory.job == JOB_GFS) && creep.carry.energy == creep.carryCapacity) {
            creep.memory.job = JOB_RETURN;
            creep.memory['targetcontainer'] = undefined;
            creep.announceJob();
	    }
	    if(creep.memory.job == JOB_SCAVENGE) {
	        if (jobScavenge.run(creep) == -1) {
	            if (creep.carry.energy > 0) {
                    creep.memory.job = JOB_RETURN;
                    creep.announceJob();
	            } else {
	                creep.memory.job = JOB_GFS;
                    //creep.announceJob();
	            }
	        } else {
                creep.memory.pickupfrom = JOB_SCAVENGE;
	        }
        }
        if(creep.memory.job == JOB_GFS) {
            if (jobGetstoredenergy.run(creep) == -1){
                creep.memory.job = JOB_SCAVENGE;
            } else {
                creep.memory.pickupfrom = JOB_GFS;
            }
	    } else if(creep.memory.job == JOB_RETURN) {
            // function(creep, fill_spawner, fill_extensions, tower_factor, fill_containers, fill_storage, extensions_priority) {
            if (creep.memory.pickupfrom == undefined) {
                creep.memory.pickupfrom = JOB_GFS;
            }
            var retval = 0;
            if (creep.memory.pickupfrom == JOB_GFS) {
                retval = jobReturnresources.run(creep, 1, 1, 0.9, 0, 0, 1);
            } else {
                retval = jobReturnresources.run(creep, 1, 1, 0.9, 1, 1, 1);
            }
	        if (retval == -1) {
                creep.announceJob();
	            creep.memory.job = JOB_BUILD;  
            }
        } else if(creep.memory.job == JOB_BUILD) {
            if (jobBuild.run(creep) == -1) {
                creep.memory.job = JOB_UPGRADE;
                creep.announceJob();
            }
        } else if(creep.memory.job == JOB_UPGRADE) {
            jobUpgrade.run(creep);
        } else if(creep.memory.job == JOB_RENEW) {
            if (creep.ticksToLive > 800) {
                creep.memory.job = JOB_SCAVENGE;
            }
            var result = jobRenew.run(creep)
            if (result == -1) {
                //creep.memory.job = JOB_TRAVEL_OUT;
            }
        }

	}
};
