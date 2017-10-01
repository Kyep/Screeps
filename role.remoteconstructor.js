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

        if(creep.memory.job == 'getstoredenergy' && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.job = 'travel-out';
            creep.say('🔄 travel-out');
       } else  if(creep.memory.job == 'getstoredenergy') {
            if (jobGetstoredenergy.run(creep) == -1){
                // do nothing until we get enough
            }
        } else if (creep.memory.job == 'travel-out') {
            if (creep.room.name == creep.memory.target) {
                creep.memory.job = 'build';
                creep.say('🚧 build');
            } else {
                creep.moveTo(new RoomPosition(25, 25, creep.memory.target))
            }
        } else if(creep.memory.job == 'build') {
            if (jobBuild.run(creep) == -1) {
                if(creep.room.name == creep.memory.home) {
                    creep.memory.job = 'upgrade';
                    creep.say('🚧 upgrade');
                } else {
                    creep.memory.job = 'repair';
                    creep.say('🚧 repair');
                }
            }
	    } else if(creep.memory.job == 'repair') {
            if (jobRepair.run(creep) == -1) {
                // stay there.
            }
        } else if (creep.memory.job == 'travel-back') {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.home))
            if (creep.room.name == creep.memory.home) {
                // you are home!
            }
	    } else if(creep.memory.job == 'recycle') {
	        jobRecycle.run(creep);
        } else if (creep.memory.job == 'renew') {
            if (creep.ticksToLive > 800) {
	            creep.memory.job = 'travel-out';
                creep.say('🔄 travel-out');
            } else {
                if(jobRenew.run(creep) == -1) {
                    creep.memory.job = 'travel-out';
                }
            }
        } else {
            creep.memory.job = 'getstoredenergy';
        }
    }
};