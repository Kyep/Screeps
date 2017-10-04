var jobHarvest = require('job.harvest');
var jobBuild = require('job.build');
var jobUpgrade = require('job.upgrade');

module.exports =  {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.job != 'harvest' && creep.carry.energy == 0) {
            creep.memory.job = 'harvest';
            creep.say('🔄 harvest');
        } else if(creep.memory.job == 'harvest' && creep.carry.energy == creep.carryCapacity) {
            creep.memory.job = 'build';
            creep.say('🚧 build');
	    } else if(creep.memory.job == 'harvest') {
	        jobHarvest.run(creep);
        } else if(creep.memory.job == 'build') {
            if (jobBuild.run(creep) == -1) {
                creep.memory.job = 'upgrade';
                creep.say('🚧 upgrade');
            }
        } else if(creep.memory.job == 'upgrade') {
            jobUpgrade.run(creep);
        } else {
            console.log("WARNING: " + creep.name + " has no job!");
            creep.memory.job = 'harvest';
        }
	}
};
