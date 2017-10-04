var jobRenew = require('job.renew');
var jobRecycle = require('job.recycle');
var jobReturnresources = require('job.returnresources');
var jobBuild = require('job.build');
var jobRepair = require('job.repair');
var jobRenew = require('job.renew');
var jobGetstoredenergy = require('job.getstoredenergy');

module.exports = {
    run: function(creep) {
        if (creep.memory.target == undefined) {
            creep.memory.target = creep.room.name;
        }
        if (creep.memory.home == undefined) {
            creep.memory.home = creep.room.name;
        }

        if(creep.memory.job == JOB_GFS && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.job = JOB_RENEW;
            creep.announceJob();
        } else if(creep.memory.job != JOB_GFS && creep.memory.job != JOB_RENEW && creep.carry.energy == 0) {
            creep.memory.job = JOB_GFS;
       } else  if(creep.memory.job == JOB_GFS) {
            if (jobGetstoredenergy.run(creep) == -1){
                // do nothing until we get enough
            }
        } else if (creep.memory.job == JOB_TRAVEL_OUT) {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.target))
            if (creep.room.name == creep.memory.target) {
                creep.memory.job = JOB_BUILD;
                creep.announceJob();
            }
        } else if(creep.memory.job == JOB_BUILD) {
            if (jobBuild.run(creep) == -1) {
                if(creep.room.name == creep.memory.home) {
                    creep.memory.job = JOB_UPGRADE;
                creep.announceJob();
                } else {
                    //creep.memory.job = JOB_REPAIR;
                    //creep.announceJob();
                }
            }
	    } else if(creep.memory.job == JOB_REPAIR) {
            if (jobRepair.run(creep) == -1) {
                // stay there until you die.
            }
	    } else if (creep.memory.job == JOB_RENEW) {
            if (creep.ticksToLive > 800) {
                if (creep.carry.energy == creep.carryCapacity) {
    	            creep.memory.job = JOB_TRAVEL_OUT;
                    creep.announceJob();
                } else {
                    creep.memory.job = JOB_GFS;
                }
            } else {
                if(jobRenew.run(creep) == -1) {
                    creep.memory.job = JOB_TRAVEL_OUT;
                }
            }
        } else {
            creep.memory.job = JOB_GFS;
        }
    }
};