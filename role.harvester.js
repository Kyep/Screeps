var jobHarvest = require('job.harvest');
var jobReturnresources = require('job.returnresources');
var jobBuild = require('job.build');
var jobRepair = require('job.repair');
var jobUpgrade = require('job.upgrade');
var jobRenew = require('job.renew');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.job != 'harvest' && creep.memory.job != 'renew' && creep.carry.energy == 0) {
            if(creep.ticksToLive < 200) {
                creep.memory.job = 'renew';
                creep.say('🔄 renew');
            } else {
                creep.memory.job = 'harvest';
                creep.say('🔄 harvest');
            }
        } else if(creep.memory.job == 'harvest' && creep.carry.energy == creep.carryCapacity) {
            creep.memory.job = 'return';
            creep.say('🔄 return');
	    } else if(creep.memory.job == 'harvest') {
            if(creep.memory.target != creep.room.name){
                creep.moveTo(new RoomPosition(25, 25, creep.memory.target), {visualizePathStyle: {stroke: '#ffffff'}})
            } else {
	            jobHarvest.run(creep);
            }
	    } else if(creep.memory.job == 'return') {
            // function(creep, fill_spawner, fill_extensions, tower_factor, fill_containers, fill_storage) {
            if (jobReturnresources.run(creep, 1, 1, 0.5, 1, 1) == -1) {
                creep.memory.job = 'repair';
                creep.say('🔄 repair');
            }
	    } else if(creep.memory.job == 'repair') {
            if (jobRepair.run(creep) == -1) {
                creep.memory.job = 'build';
                creep.say('🚧 build');
            }
        } else if(creep.memory.job == 'build') {
            if (jobBuild.run(creep) == -1) {
                creep.memory.job = 'upgrade';
                creep.say('🚧 upgrade');
            }
        } else if(creep.memory.job == 'upgrade') {
            jobUpgrade.run(creep);
        } else if (creep.memory.job == 'renew') {
            if (creep.ticksToLive > 300) {
                //console.log("X Creep" + creep.name + " is trying to renew.");
	            creep.memory.job = 'harvest';
                creep.say('🔄 harvest');
            } else {
                //console.log("Creep" + creep.name + " is trying to renew.");
                if(jobRenew.run(creep) == -1) {
                    creep.memory.job = 'harvest';
                }
            }
        } else {
            console.log("WARNING: " + creep.name + " has no job!");
            creep.memory.job = 'harvest';
        }
	}
};

module.exports = roleHarvester;