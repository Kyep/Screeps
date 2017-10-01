var jobReturnresources = require('job.returnresources');
var jobRecycle = require('job.recycle');
var jobScavenge = require('job.scavenge');

var roleScavenger = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.job == 'recycle') {
            jobRecycle.run(creep);
        } else if(creep.memory.job != 'scavenge' && creep.carry.energy == 0) {
            creep.memory.job = 'scavenge';
            creep.say('🔄 scavenge');
        } else if(creep.memory.job == 'scavenge' && creep.carry.energy == creep.carryCapacity) {
            creep.memory.job = 'return';
            creep.say('🔄 return');
	    }
	    if(creep.memory.job == 'scavenge') {
	        
	        jobScavenge.run(creep);
	    } else if(creep.memory.job == 'return') {
            var source = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {filter: (s) => s.energy > 0});
            if(source != null){
                jobReturnresources.run(creep);
            } else {
                creep.memory.job = 'return';
                creep.say('🔄 return');
            }
        } else {
            console.log("WARNING: " + creep.name + " has no job!");
            creep.memory.job = 'scavenge';
        }

	}
};

module.exports = roleScavenger;