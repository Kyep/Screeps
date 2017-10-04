var jobRenew = require('job.renew');
var jobPatrol = require('job.patrol');

module.exports = {
    run: function(creep) {
        if (creep.memory.target == undefined) {
            creep.memory.target = creep.room.name;
        }
        if (creep.memory.home == undefined) {
            creep.memory.home = creep.room.name;
        }
        if (creep.memory.job == undefined) {
            creep.memory.job = JOB_TRAVEL_OUT;
        }
        
        if (creep.memory.job == JOB_TRAVEL_OUT) {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.target), {visualizePathStyle: {stroke: '#ff0000'}})
            if (creep.room.name == creep.memory.target) {
	            creep.memory.job = JOB_PATROL;
                creep.announceJob();
            }
        } else if (creep.memory.job == JOB_TRAVEL_BACK) {
            if (creep.room.name == creep.memory.home) {
	            creep.memory.job = JOB_PATROL;
                creep.announceJob();
            } else {
                creep.moveTo(new RoomPosition(25, 25, creep.memory.home), {visualizePathStyle: {stroke: '#ff0000'}})
            }
	    } else if(creep.memory.job == JOB_PATROL) {
            if(creep.ticksToLive < 400 && creep.room.name == creep.memory.home) {
                creep.memory.job = JOB_RENEW;
                creep.announceJob();
            } else if (creep.room.name == creep.memory.target) {
                //creep.moveTo(new RoomPosition(25, 25, creep.memory.home), {visualizePathStyle: {stroke: '#ff0000'}})
                jobPatrol.run(creep);
            } else {
                target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
                if(target) {
                    jobPatrol.run(creep);
                } else {
    	            creep.memory.job = JOB_TRAVEL_OUT;
                    creep.announceJob();
                }
            }
        } else if (creep.memory.job == JOB_RENEW) {
            if (creep.ticksToLive > 800) {
	            creep.memory.job = JOB_TRAVEL_OUT;
                creep.announceJob();
            } else {
                if(jobRenew.run(creep) == -1) {
                    creep.memory.job = JOB_TRAVEL_OUT;
                }
            }
        } else { // check for hostiles in the local room. if none found, travel to destination.
            if (jobPatrol.run(creep) == -1) {
                creep.memory.job = JOB_TRAVEL_OUT;
            }
        }
    }
};