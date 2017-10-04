var jobUpgrade = require('job.upgrade');
var jobRenew = require('job.renew');
var jobGetstoredenergy = require('job.getstoredenergy');

var roleUpgraderstorage = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.job != 'getstoredenergy' && creep.memory.job != 'renew' && creep.carry.energy == 0) {
            creep.memory.job = 'getstoredenergy';
            //creep.say('🔄 getstoredenergy');
        } else if(creep.memory.job == 'getstoredenergy' && creep.carry.energy == creep.carryCapacity) {
            creep.memory.job = 'upgrade';
            //creep.say('🚧 upgrade!');
        }
        if(creep.memory.job == 'getstoredenergy') {
            if (creep.room.name != creep.memory.home) {
                creep.moveTo(new RoomPosition(25, 25, creep.memory.home));
            } else if (jobGetstoredenergy.run(creep) == -1){
                creep.memory.role = 'recycler';
            }
        } else if(creep.memory.job == 'upgrade') {
            if (creep.room.name != creep.memory.target) {
                creep.moveTo(new RoomPosition(25, 25, creep.memory.target));
            } else {
                jobUpgrade.run(creep);
            }
        } else if (creep.memory.job == 'renew') {
            if (creep.ticksToLive > 500 || jobRenew.run(creep) == -1) {
                creep.memory.job = 'getstoredenergy';
                //creep.say('🔄 getstoredenergy');
            }
        } else {
            console.log("WARNING: " + creep.name + " has no job: " + creep.memory.job);
            creep.memory.job = 'getstoredenergy';
        }
	}
};

module.exports = roleUpgraderstorage;