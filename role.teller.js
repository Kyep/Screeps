var jobReturnresources = require('job.returnresources');
var jobRenew = require('job.renew');
var jobGetstoredenergy = require('job.getstoredenergy');

var roleBuilderstorage = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.job != 'getstoredenergy' && creep.memory.job != 'renew' && creep.carry.energy == 0) {
            creep.memory.job = 'getstoredenergy';
            creep.say('🔄 getstoredenergy');
        } else if(creep.memory.job == 'getstoredenergy' && creep.carry.energy == creep.carryCapacity) {
            creep.memory.job = 'return';
            creep.say('🚧 return');
        } else if(creep.memory.job == 'getstoredenergy') {
            if (jobGetstoredenergy.run(creep) == -1){
                creep.memory.role = 'recycler';
            }
	    } else if(creep.memory.job == 'return') {
            // function(creep, fill_spawner, fill_extensions, tower_factor, fill_containers, fill_storage) {
	        if (jobReturnresources.run(creep, 1, 1, 0.7, 1, 1) == -1) {
                //
            }
        } else if (creep.memory.job == 'renew') {
            if (creep.ticksToLive > 1000) {
	            creep.memory.job = 'build';
                creep.say('🔄 build');
            } else {
                if (jobRenew.run(creep) == -1){
                    creep.memory.job = 'getstoredenergy';
                    creep.say('🔄 getstoredenergy');
                }
            }
        } else {
            console.log("WARNING: " + creep.name + " has no job! " + creep.memory.job);
            creep.memory.job = 'getstoredenergy';
        }
	}
};

module.exports = roleBuilderstorage;