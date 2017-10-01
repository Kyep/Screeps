var jobRenew = require('job.renew');
var jobPatrol = require('job.patrol');
var jobRecycle = require('job.recycle');

module.exports = {
    run: function(creep) {
        if (creep.memory.target == undefined) {
            creep.memory.target = creep.room.name;
        }
        if (creep.memory.home == undefined) {
            creep.memory.home = creep.room.name;
        }

        if (creep.memory.job == 'travel-out') {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.target))
            if (creep.room.name == creep.memory.target) {
	            creep.memory.job = 'patrol';
                creep.say('🔄 patrol');
            }
        } else if (creep.memory.job == 'travel-back') {
            if (creep.room.name == creep.memory.home) {
                creep.memory.job = 'recycle';
                creep.say('🔄 at home');
            } else {
                creep.moveTo(new RoomPosition(25, 25, creep.memory.home))
            }
	    } else if(creep.memory.job == 'recycle') {
	        jobRecycle.run(creep);
        } else if(creep.memory.job == 'patrol') {
            if(creep.ticksToLive < 400 && creep.room.name == creep.memory.home) {
                creep.memory.job = 'renew';
                creep.say('🔄 renew');
            } else if (creep.room.name == creep.memory.target) {
                jobPatrol.run(creep);
            } else {
                target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
                if(target) {
                    jobPatrol.run(creep);
                } else {
    	            creep.memory.job = 'travel-out';
                    creep.say('🔄 travel-out');
                }
            }
        } else if (creep.memory.job == 'renew') {
            if (creep.ticksToLive > 800) {
	            creep.memory.job = 'travel-out';
                creep.say('🔄 travel-out');
            } else {
                if(jobRenew.run(creep) == -1) {
                    creep.memory.job = 'travel-out';
                }
            }
        } else { // check for hostiles in the local room. if none found, travel to destination.
            if (jobPatrol.run(creep) == -1) {
                creep.memory.job = 'travel-out';
            }
        }
    }
};