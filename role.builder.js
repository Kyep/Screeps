"use strict";

var jobHarvest = require('job.harvest');
var jobBuild = require('job.build');
var jobUpgrade = require('job.upgrade');

module.exports =  {

    run: function(creep) {

        if(creep.memory[MEMORY_JOB] != JOB_HARVEST && creep.carry.energy == 0) {
            creep.memory[MEMORY_JOB] = JOB_HARVEST;
            creep.announceJob();
        } else if(creep.memory[MEMORY_JOB] == JOB_HARVEST && creep.carry.energy == creep.carryCapacity) {
            creep.memory[MEMORY_JOB] = JOB_BUILD;
            creep.announceJob();
	    } else if(creep.memory[MEMORY_JOB] == JOB_HARVEST) {
	        var harvestresult = jobHarvest.run(creep);
	        if (harvestresult == ERR_NOT_ENOUGH_RESOURCES) {
                creep.memory[MEMORY_JOB] = JOB_BUILD;
                creep.announceJob();
	        }
        } else if(creep.memory[MEMORY_JOB] == JOB_BUILD) {
            if (!jobBuild.run(creep)) {
                creep.memory[MEMORY_JOB] = JOB_UPGRADE;
                 creep.announceJob();
            }
        } else if(creep.memory[MEMORY_JOB] == JOB_UPGRADE) {
            jobUpgrade.run(creep);
        } else {
            console.log("WARNING: " + creep.name + " has no job!");
            creep.memory[MEMORY_JOB] = JOB_HARVEST;
        }
	}
};
