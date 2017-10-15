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
            creep.moveTo(new RoomPosition(25, 25, creep.memory[MEMORY_DEST]), {visualizePathStyle: {stroke: '#ff0000'}})
            var checktargets = 1;
            if (creep.room.controller) {
                if (creep.room.controller.safeMode) {
                    if (creep.room.controller.safeMode > 0) {
                        checktargets = 0;
                    }
                }
            }
            if (checktargets) {
                target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
                if(target) {
                    creep.memory[MEMORY_JOB] = JOB_PATROL;
                    return;
                }
            }
            if (creep.room.name == creep.memory[MEMORY_DEST]) {
                if (creep.memory[MEMORY_NEXTDEST] != undefined) {
                   if (creep.memory[MEMORY_NEXTDEST].length > 0) {
                    creep.memory[MEMORY_DEST] = creep.memory[MEMORY_NEXTDEST][0];
                    creep.memory[MEMORY_NEXTDEST].shift();
                    console.log("ADVR: " + creep.name + " has reached " + creep.room.name + ", continuing on to " + creep.memory[MEMORY_DEST]);
                    return;
                    }
                }
	            creep.memory[MEMORY_JOB] = JOB_PATROL;
                creep.announceJob();
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_TRAVEL_BACK) {
            if (creep.room.name == creep.memory[MEMORY_HOME]) {
	            creep.memory[MEMORY_JOB] = JOB_PATROL;
                creep.announceJob();
            } else {
                creep.moveTo(creep.getHomePos(), {visualizePathStyle: {stroke: '#ff0000'}})
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
        } else { // check for hostiles in the local room. if none found, travel to destination.
            if (jobPatrol.run(creep) == -1) {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
            }
        }
    }
};