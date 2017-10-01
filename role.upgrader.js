var jobHarvest = require('job.harvest');
var jobReturnresources = require('job.returnresources');
var jobUpgrade = require('job.upgrade');
var jobRepair = require('job.repair');
var jobRenew = require('job.renew');

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.job != 'harvest' && creep.memory.job != 'renew' && creep.carry.energy == 0) {
            if(creep.ticksToLive < 300) {
                creep.memory.job = 'renew';
                creep.say('🔄 renew');
            } else {
                creep.memory.job = 'harvest';
                creep.say('🔄 harvest');
            }
        } else if(creep.memory.job == 'harvest' && creep.carry.energy == creep.carryCapacity) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: function(structure){
                    return (structure.hits < structure.hitsMax) && (structure.structureType != STRUCTURE_WALL) && (structure.structureType != STRUCTURE_RAMPART)
                }
            })
            if(targets.length && 1 == 2) {
                creep.say('⚡ repair');
                creep.memory.job = 'repair';
            } else {
                creep.memory.job = 'upgrade';
                creep.say('⚡ upgrade');
            }
	    } else if(creep.memory.job == 'harvest') {
	        jobHarvest.run(creep);
	    } else if(creep.memory.job == 'repair') {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: function(structure){
                    return (structure.hits < structure.hitsMax) && (structure.structureType != STRUCTURE_WALL) && (structure.structureType != STRUCTURE_RAMPART)
                }
            })
            if(targets.length) {
                jobRepair.run(creep);
            } else {
                creep.memory.job = 'upgrade';
                creep.say('⚡ upgrade');
            }
        } else if(creep.memory.job == 'upgrade') {
            jobUpgrade.run(creep);
        } else if (creep.memory.job == 'renew') {
            if (creep.ticksToLive > 1000) {
	            creep.memory.job = 'harvest';
                creep.say('🔄 harvest');
            } else {
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

module.exports = roleUpgrader;