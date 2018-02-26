"use strict";

var jobRenew = require('job.renew');
var jobBuild = require('job.build');
var jobReturnresources = require('job.returnresources');
var jobUpgrade = require('job.upgrade');

module.exports = {
    
    run: function(creep) {

        if(!creep.isAtDestinationRoom()){
            creep.moveToDestination();
            return;
        }

	    if (creep.memory[MEMORY_JOB] == JOB_DISMANTLE) { 
            var target = creep.getClosestHostileStructure(true);
	        if (creep.carry.energy == creep.carryCapacity || (!target && creep.carry.energy > 0)) {
	            creep.memory[MEMORY_JOB] = JOB_RENEW;
	            return;
	        }
            if(target) {
                if(creep.dismantle(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
                return;
            }
            creep.sleepFor(20);
	    } else if (creep.memory[MEMORY_JOB] == JOB_RENEW) {
            if (creep.ticksToLive > 500 || !creep.getRenewEnabled()) {
                creep.memory[MEMORY_JOB] = JOB_BUILD;
                return;
            }
            if(jobRenew.run(creep) == -1) {
                if (creep.carry.energy > 0) { // trying this again, see if it helps avoid them wasting time standing around.
                    creep.memory[MEMORY_JOB] = JOB_BUILD;
                }
            }
        } else if(creep.carry.energy == 0) {
            creep.memory[MEMORY_JOB] = JOB_DISMANTLE;
        } else if(creep.memory[MEMORY_JOB] == JOB_BUILD) {
            if (jobBuild.run(creep) == -1) {
                creep.memory[MEMORY_JOB] = JOB_RETURN;
            }
        } else if(creep.memory[MEMORY_JOB] == JOB_RETURN) {
            var result = jobReturnresources.run(creep, 1, 1, 0.6, 1, 1, 1);
            if (result == -1) {
                creep.memory[MEMORY_JOB] = JOB_UPGRADE;
                creep.announceJob();
            }
        } else if(creep.memory[MEMORY_JOB] == JOB_UPGRADE) {
            jobUpgrade.run(creep);
        }
    }

};