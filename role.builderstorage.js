"use strict";

var jobReturnresources = require('job.returnresources');
var jobBuild = require('job.build');
var jobRepair = require('job.repair');
var jobRenew = require('job.renew');
var jobGetstoredenergy = require('job.gfs');

module.exports =  {

    run: function(creep) {
        if(creep.memory[MEMORY_JOB] != JOB_GFS && creep.memory[MEMORY_JOB] != JOB_RENEW && creep.carry.energy == 0) {
            var projectsList = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(projectsList.length) {
                if(creep.ticksToLive < 300) {
                    creep.memory[MEMORY_JOB] = JOB_RENEW;
                    creep.announceJob();
                } else {
                    creep.memory[MEMORY_JOB] = JOB_GFS;
                    creep.announceJob();
                }
            } else {
                creep.memory[MEMORY_ROLE] = 'recycler';
            }
        }
        if(creep.memory[MEMORY_JOB] == JOB_GFS && creep.carry.energy == creep.carryCapacity) {
            creep.memory[MEMORY_JOB] = JOB_BUILD;
            creep.announceJob();
        }
        if(creep.memory[MEMORY_JOB] == JOB_GFS) {
            if (jobGetstoredenergy.run(creep) == -1){
                creep.memory[MEMORY_ROLE] = 'recycler';
            }
        } else if(creep.memory[MEMORY_JOB] == JOB_BUILD) {
            if(creep.memory[MEMORY_DEST] != creep.room.name){
                creep.moveToDestination();
            } else if(jobBuild.run(creep) == -1){
                jobReturnresources.run(creep, 1, 1, 0.5, 1, 1);
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_RENEW) {
            if (creep.ticksToLive > 1000) {
	            creep.memory[MEMORY_JOB] = JOB_BUILD;
                creep.announceJob();
            } else {
                if (jobRenew.run(creep) == -1){
                    creep.memory[MEMORY_JOB] = JOB_GFS;
                    creep.announceJob();
                }
            }
        } else {
            //console.log("WARNING: " + creep.name + " has no job: " + creep.memory[MEMORY_JOB]);
            creep.memory[MEMORY_JOB] = JOB_GFS;
        }
	}
};
