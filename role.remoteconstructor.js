"use strict";

var jobRenew = require('job.renew');
var jobReturnresources = require('job.returnresources');
var jobBuild = require('job.build');
var jobRepair = require('job.repair');
var jobRenew = require('job.renew');
var jobGetstoredenergy = require('job.gfs');
var jobHarvest = require('job.harvest');

module.exports = {
    run: function(creep) {
        if (creep.memory[MEMORY_DEST] == undefined) {
            creep.memory[MEMORY_DEST] = creep.room.name;
        }
        if (creep.memory[MEMORY_HOME] == undefined) {
            creep.memory[MEMORY_HOME] = creep.room.name;
        }

        if(creep.carry.energy == creep.carryCapacity && creep.memory[MEMORY_JOB] != JOB_TRAVEL_OUT && creep.memory[MEMORY_JOB] != JOB_BUILD) {
	        creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
            creep.announceJob();
        } else if(creep.memory[MEMORY_JOB] != JOB_GFS && creep.memory[MEMORY_JOB] != JOB_HARVEST && creep.carry.energy == 0) {
            if (creep.room.name == creep.memory[MEMORY_DEST]) {
                creep.memory[MEMORY_JOB] = JOB_HARVEST
            } else {
                creep.memory[MEMORY_JOB] = JOB_GFS;
            }
       } else  if(creep.memory[MEMORY_JOB] == JOB_GFS) {
            if (jobGetstoredenergy.run(creep) == -1){
                // do nothing until we get enough
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_TRAVEL_OUT) {
            creep.moveToDestination();
            if (creep.isAtDestinationRoom()) {
                creep.memory[MEMORY_JOB] = JOB_BUILD;
                creep.announceJob();
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_HARVEST) {
	       jobHarvest.run(creep);
        } else if(creep.memory[MEMORY_JOB] == JOB_BUILD) {
            if (jobBuild.run(creep) == -1) {
                if(creep.room.name == creep.memory[MEMORY_DEST]) {
                    creep.memory[MEMORY_JOB] = JOB_UPGRADE;
                creep.announceJob();
                }
            }
	    } else if(creep.memory[MEMORY_JOB] == JOB_REPAIR) {
            if (jobRepair.run(creep) == -1) {
                // stay there until you die.
            }
        } else {
            creep.memory[MEMORY_JOB] = JOB_GFS;
        }
    }
};