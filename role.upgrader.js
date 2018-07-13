"use strict";

var jobHarvest = require('job.harvest');
var jobUpgrade = require('job.upgrade');
var jobRepair = require('job.repair');
var jobRenew = require('job.renew');

module.exports =  {

    run: function(creep) {

        if(creep.memory[MEMORY_JOB] != JOB_HARVEST && creep.memory[MEMORY_JOB] != JOB_RENEW && creep.carry.energy == 0) {
            if(creep.ticksToLive < 300) {
                creep.memory[MEMORY_JOB] = JOB_RENEW;
                creep.announceJob();
            } else {
                creep.memory[MEMORY_JOB] = JOB_HARVEST;
                creep.announceJob();
            }
        } else if(creep.memory[MEMORY_JOB] == JOB_HARVEST && creep.carry.energy == creep.carryCapacity) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: function(structure){
                    return (structure.hits < structure.hitsMax) && (structure.structureType != STRUCTURE_WALL) && (structure.structureType != STRUCTURE_RAMPART)
                }
            })
            if(targets.length && 1 == 2) {
                creep.memory[MEMORY_JOB] = JOB_REPAIR;
                creep.announceJob();
            } else {
                creep.memory[MEMORY_JOB] = JOB_UPGRADE;
                creep.announceJob();
            }
	    } else if(creep.memory[MEMORY_JOB] == JOB_HARVEST) {
	        jobHarvest.run(creep);
	    } else if(creep.memory[MEMORY_JOB] == JOB_RETURN) {
            var result = creep.returnToStorage();
            if (!result) {
                creep.memory[MEMORY_JOB] = JOB_REPAIR;
                creep.announceJob();
            }
	    } else if(creep.memory[MEMORY_JOB] == JOB_REPAIR) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: function(structure){
                    return (structure.hits < structure.hitsMax) && (structure.structureType != STRUCTURE_WALL) && (structure.structureType != STRUCTURE_RAMPART)
                }
            })
            if(targets.length) {
                jobRepair.run(creep);
            } else {
                creep.memory[MEMORY_JOB] = JOB_UPGRADE;
                creep.announceJob();
            }
        } else if(creep.memory[MEMORY_JOB] == JOB_UPGRADE) {
            jobUpgrade.run(creep);
        } else if (creep.memory[MEMORY_JOB] == JOB_RENEW) {
            if (creep.ticksToLive > 1000) {
	            creep.memory[MEMORY_JOB] = JOB_HARVEST;
                creep.announceJob();
            } else {
                if(jobRenew.run(creep) == -1) {
                    creep.memory[MEMORY_JOB] = JOB_HARVEST;
                }
            }
        } else {
            console.log('WARNING: ' + creep.name + ' has no job!');
            creep.memory[MEMORY_JOB] = JOB_HARVEST;
        }
	}
};
