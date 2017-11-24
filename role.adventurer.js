"use strict";

var jobRenew = require('job.renew');
var jobPatrol = require('job.patrol');

module.exports = {
    run: function(creep) {
        if (creep.memory[MEMORY_DEST] == undefined) {
            creep.memory[MEMORY_DEST] = creep.room.name;
        }
        if (creep.memory[MEMORY_HOME] == undefined) {
            creep.memory[MEMORY_HOME] = creep.room.name;
        }
        if (creep.memory[MEMORY_JOB] == undefined) {
            creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
        }
        
        if (creep.memory[MEMORY_JOB] == JOB_TRAVEL_OUT) {
            creep.moveToDestination();
            var checktargets = 1;
            if (creep.room.controller) {
                if (creep.room.controller.safeMode) {
                    if (creep.room.controller.safeMode > 0) {
                        checktargets = 0;
                    }
                }
            }
            if (checktargets) {
                var target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
                if(target) {
                    creep.memory[MEMORY_JOB] = JOB_PATROL;
                    return;
                }
            }
            if (creep.room.name == creep.memory[MEMORY_DEST]) {
                if (creep.updateDestination()) {
                    return;
                }
	            creep.memory[MEMORY_JOB] = JOB_PATROL;
                creep.announceJob();
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_TRAVEL_BACK) {
            if (creep.room.name == creep.memory[MEMORY_HOME]) {
	            creep.memory[MEMORY_JOB] = JOB_PATROL;
                creep.announceJob();
            } else {
                creep.moveToRUP(creep.getHomePos());
            }
	    } else if(creep.memory[MEMORY_JOB] == JOB_PATROL) {
            if(creep.ticksToLive < 400 && creep.room.name == creep.memory[MEMORY_HOME]) {
                creep.memory[MEMORY_JOB] = JOB_RENEW;
                creep.announceJob();
            } else if (creep.room.name == creep.memory[MEMORY_DEST]) {
                jobPatrol.run(creep);
            } else {
                target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
                if(target) {
                    jobPatrol.run(creep);
                } else {
    	            creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
                    creep.announceJob();
                }
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_RENEW) {
            if (creep.ticksToLive > 800) {
	            creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
                creep.announceJob();
            } else {
                if(jobRenew.run(creep) == -1) {
                    creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
                }
            }
        } else { // check for hostiles in the local room. If none found, travel to destination.
            if (jobPatrol.run(creep) == -1) {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
            }
        }
    }
};