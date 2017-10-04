var jobUpgrade = require('job.upgrade');
var jobRenew = require('job.renew');
var jobGetstoredenergy = require('job.gfs');

module.exports = {

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
            if (creep.room.name != creep.memory.home) {
                creep.moveTo(new RoomPosition(25, 25, creep.memory.home));
            } else if (jobGetstoredenergy.run(creep) == -1){
                creep.memory.role = 'recycler';
            }
        } else if(creep.memory.job == JOB_UPGRADE) {
            if (creep.room.name != creep.memory.target) {
                creep.moveTo(new RoomPosition(25, 25, creep.memory.target));
            } else {
                jobUpgrade.run(creep);
            }
        } else if (creep.memory.job == JOB_RENEW) {
            if (creep.ticksToLive > 500 || jobRenew.run(creep) == -1) {
                creep.memory.job = JOB_GFS;
                //creep.say('🔄 getstoredenergy');
            }
        } else {
            console.log("WARNING: " + creep.name + " has no job: " + creep.memory.job);
            creep.memory.job = JOB_GFS;
        }
	}
};
