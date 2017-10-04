var jobReturnresources = require('job.returnresources');
var jobRenew = require('job.renew');
var jobGetstoredenergy = require('job.getstoredenergy');
var jobBuild = require('job.build');
var jobUpgrade = require('job.upgrade');
var jobRecycle = require('job.recycle');
var jobScavenge = require('job.scavenge');

module.exports =  {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.job == 'recycle') {
            jobRecycle.run(creep);
        } else if(creep.memory.job != 'scavenge' && creep.memory.job != 'getstoredenergy' && creep.carry.energy == 0) {
            creep.memory.job = 'scavenge';
            creep.say('🔄 scavenge');
        } else if((creep.memory.job == 'scavenge' || creep.memory.job == 'getstoredenergy') && creep.carry.energy == creep.carryCapacity) {
            creep.memory.job = 'return';
            creep.say('🔄 return');
	    }
	    if(creep.memory.job == 'scavenge') {
	        if (jobScavenge.run(creep) == -1) {
	            if (creep.carry.energy > 0) {
                    creep.memory.job = 'return';
                    creep.say('🔄 return');
	            } else {
	                creep.memory.job = 'getstoredenergy';
                    //creep.say('🔄 pickup');
	            }
	        } else {
                creep.memory.pickupfrom = 'scavage'
	        }
        }
        if(creep.memory.job == 'getstoredenergy') {
            if (jobGetstoredenergy.run(creep) == -1){
                creep.memory.job = 'scavenge';
            } else {
                creep.memory.pickupfrom = 'getstoredenergy';
            }
	    } else if(creep.memory.job == 'return') {
            // function(creep, fill_spawner, fill_extensions, tower_factor, fill_containers, fill_storage) {
            if (creep.memory.pickupfrom == undefined) {
                creep.memory.pickupfrom = 'getstoredenergy';
            }
            var retval = 0;
            if (creep.memory.pickupfrom == 'getstoredenergy') {
                retval = jobReturnresources.run(creep, 1, 1, 0.9, 0, 0);
            } else {
                retval = jobReturnresources.run(creep, 1, 1, 0.9, 1, 1);
            }
	        if (retval == -1) {
                creep.say('🚧 build');
	            creep.memory.job = 'build';  
            }
        } else if(creep.memory.job == 'build') {
            if (jobBuild.run(creep) == -1) {
                creep.memory.job = 'upgrade';
                creep.say('🚧 upgrade');
            }
        } else if(creep.memory.job == 'upgrade') {
            jobUpgrade.run(creep);
        }

	}
};
