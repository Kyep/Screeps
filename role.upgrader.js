var jobHarvest = require('job.harvest');
var jobReturnresources = require('job.returnresources');
var jobUpgrade = require('job.upgrade');
var jobRepair = require('job.repair');
var jobRenew = require('job.renew');

module.exports =  {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.job != JOB_HARVEST && creep.memory.job != JOB_RENEW && creep.carry.energy == 0) {
            if(creep.ticksToLive < 300) {
                creep.memory.job = JOB_RENEW;
                creep.announceJob();
            } else {
                creep.memory.job = JOB_HARVEST;
                creep.announceJob();
            }
        } else if(creep.memory.job == JOB_HARVEST && creep.carry.energy == creep.carryCapacity) {
            var asectors = Memory['sectors_under_attack'];
            if (asectors.length > 0) {
                creep.memory['targetcontainer'] = undefined;
                creep.memory.job = JOB_RETURN;
                creep.announceJob();
                return;
            }
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: function(structure){
                    return (structure.hits < structure.hitsMax) && (structure.structureType != STRUCTURE_WALL) && (structure.structureType != STRUCTURE_RAMPART)
                }
            })
            if(targets.length && 1 == 2) {
                creep.memory.job = JOB_REPAIR;
                creep.announceJob();
            } else {
                creep.memory.job = JOB_UPGRADE;
                creep.announceJob();
            }
	    } else if(creep.memory.job == JOB_HARVEST) {
	        jobHarvest.run(creep);
	    } else if(creep.memory.job == JOB_RETURN) {
            // function(creep, fill_spawner, fill_extensions, tower_factor, fill_containers, fill_storage) {
            if (jobReturnresources.run(creep, 1, 1, 0.75, 1, 1) == -1) {
                creep.memory.job = JOB_REPAIR;
                creep.announceJob();
            }
	    } else if(creep.memory.job == JOB_REPAIR) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: function(structure){
                    return (structure.hits < structure.hitsMax) && (structure.structureType != STRUCTURE_WALL) && (structure.structureType != STRUCTURE_RAMPART)
                }
            })
            if(targets.length) {
                jobRepair.run(creep);
            } else {
                creep.memory.job = JOB_UPGRADE;
                creep.announceJob();
            }
        } else if(creep.memory.job == JOB_UPGRADE) {
            jobUpgrade.run(creep);
        } else if (creep.memory.job == JOB_RENEW) {
            if (creep.ticksToLive > 1000) {
	            creep.memory.job = JOB_HARVEST;
                creep.announceJob();
            } else {
                if(jobRenew.run(creep) == -1) {
                    creep.memory.job = JOB_HARVEST;
                }
            }
        } else {
            console.log("WARNING: " + creep.name + " has no job!");
            creep.memory.job = JOB_HARVEST;
        }
	}
};
