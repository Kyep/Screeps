"use strict";

var jobHarvest = require('job.harvest');
var jobReturnresources = require('job.returnresources');
var jobBuild = require('job.build');
var jobRepair = require('job.repair');
var jobUpgrade = require('job.upgrade');
var jobRenew = require('job.renew');

module.exports = {
    run: function(creep) {
        if (creep.memory[MEMORY_DEST] == undefined && creep.memory[MEMORY_SOURCE] != undefined) {
            var source = Game.getObjectById(creep.memory[MEMORY_SOURCE]);
            if(source) {
                console.log("WARN: LDH " + creep.name + " was given auto-generated target of " + source.room.name + " because they lacked one.");
                creep.memory[MEMORY_DEST] = source.room.name;
            } else {
                console.log("WARN: LDH " + creep.name + " has no source with: " + creep.memory[MEMORY_SOURCE]);
                return;
            }
        }
        if (creep.carry.energy == 0 && creep.memory[MEMORY_JOB] != JOB_TRAVEL_OUT && creep.memory[MEMORY_JOB] != JOB_TRAVEL_BACK && creep.memory[MEMORY_JOB] != JOB_HARVEST && creep.memory[MEMORY_JOB] != JOB_RENEW) {
            if(creep.ticksToLive < 400 && creep.getRenewEnabled()) {
                if(creep.room.name == creep.memory[MEMORY_HOME]) {
                    creep.memory[MEMORY_JOB] = JOB_RENEW;
                    creep.announceJob();
                } else {
                    creep.memory[MEMORY_JOB] = JOB_TRAVEL_BACK;
                   creep.announceJob();
                }
            } else {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
                   creep.announceJob();
            }
        }
        if (creep.memory[MEMORY_JOB] == JOB_TRAVEL_OUT) {
            if (creep.memory[MEMORY_JOURNEYSTART] == undefined ) {
                creep.memory[MEMORY_JOURNEYSTART] = Game.time;
            }
            if (creep.isAtDestinationRoom()) {
	            creep.memory[MEMORY_JOB] = JOB_HARVEST;
                //creep.announceJob();
            } else if (global.ROOM_UNDER_ATTACK(creep.memory[MEMORY_DEST]) || (creep.memory[MEMORY_DEST] != creep.memory[MEMORY_HOME] && global.ROOM_UNDER_ATTACK(creep.memory[MEMORY_HOME]))) {
                // hide in base.
                // I would rather they not block spawning of combat mobs by renewing.
                // Also, for long attacks, I would rather not pay their energy cost to maintain them.
                creep.hideInBase();
            } else {
                creep.moveToDestination();
            }
        }
        if (creep.memory[MEMORY_JOB] == JOB_HARVEST) {
            if (creep.memory[MEMORY_DEST] in Memory.sectors_under_attack && creep.memory[MEMORY_DEST] != creep.memory[MEMORY_HOME]) {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_BACK;
                creep.announceJob();
            } else if (creep.carry.energy == creep.carryCapacity) { // DO NOT DISABLE THIS OR HARVESTERS WILL GET STUCK AND NEVER RETURN!
                if(creep.room.name == creep.memory[MEMORY_HOME]) {
                    creep.memory[MEMORY_JOB] = JOB_RETURN;
                } else {
                    creep.memory[MEMORY_CONTAINER] = undefined;
                    creep.memory[MEMORY_JOB] = JOB_BUILD;
                    creep.announceJob();
                }
            } else {
	            var retval = jobHarvest.run(creep);
                if (retval == ERR_NOT_ENOUGH_RESOURCES) {
                    if (creep.carry.energy > 0) {
                        if(creep.room.name == creep.memory[MEMORY_HOME]) {
                            creep.memory[MEMORY_JOB] = JOB_RETURN;
                        } else {
                            creep.memory[MEMORY_CONTAINER] = undefined;
                            creep.memory[MEMORY_JOB] = JOB_BUILD;
                            creep.announceJob();
                        }
                    }
                }
            }
        }
        if(creep.memory[MEMORY_JOB] == JOB_BUILD) {
            var jobResult = jobBuild.run(creep);
            //creep.say(jobResult);
            if (!jobResult) {
                if (creep.room.name != creep.memory[MEMORY_HOME]) {
                    creep.memory[MEMORY_JOB] = JOB_TRAVEL_BACK;
                    creep.announceJob();
                } else {
                    if (creep.room.controller) {
                        if (creep.room.controller.level) {
                            if (creep.room.controller.level < 3) {
                                creep.memory[MEMORY_JOB] = JOB_REPAIR;
                                creep.announceJob();
                                return;
                            }
                        }
                    }
                    creep.memory[MEMORY_JOB] = JOB_UPGRADE;
                    creep.announceJob();
                }
            }
	    }
	    if(creep.memory[MEMORY_JOB] == JOB_REPAIR) {
            if (jobRepair.run(creep) == -1) {
                creep.memory[MEMORY_JOB] = JOB_UPGRADE;
                creep.announceJob();
            }
        }
        if(creep.memory[MEMORY_JOB] == JOB_UPGRADE) {
            if (creep.room.name == creep.memory[MEMORY_HOME]) {
                if (creep.room.getShouldUpgrade()) {
                    jobUpgrade.run(creep);
                } else {
                    creep.say('GCL FARM');
                    creep.memory[MEMORY_JOB] = JOB_TRAVEL_BACK;
                }
            } else { 
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_BACK;
                creep.announceJob();
                console.log(creep.room.name + ' v ' + creep.memory[MEMORY_HOME]);
            }
        }
	    if(creep.memory[MEMORY_JOB] == JOB_RETURN) {
            var result = jobReturnresources.run(creep, 1, 1, 0.6, 1, 1, 1);
            if (result == -1) {
                creep.memory[MEMORY_JOB] = JOB_IDLE;
                creep.announceJob();
            }
	    }
        if (creep.memory[MEMORY_JOB] == JOB_TRAVEL_BACK) {
            if (creep.memory[MEMORY_HOME] in Memory.sectors_under_attack) {
                // don't move towards home while its under attack.
                return;
            }
            creep.moveToRUP(creep.getHomePos());
            if (creep.room.name == creep.memory[MEMORY_HOME]) {
                creep.memory[MEMORY_JOB] = JOB_IDLE;
                creep.announceJob();
            }
	    }

        if (creep.memory[MEMORY_JOB] == JOB_IDLE) {
            if (creep.pos.x < 2 || creep.pos.x > 47 || creep.pos.y < 2 || creep.pos.y > 47) {
                creep.moveToRUP(new RoomPosition(25, 25, creep.room.name));
            }
	        if (creep.room.name != creep.memory[MEMORY_HOME]) {
                creep.moveToRUP(creep.getHomePos());
            } else if(creep.ticksToLive < 400 && creep.getRenewEnabled()) {
                creep.memory[MEMORY_JOB] = JOB_RENEW;
                creep.announceJob();
	        } else if (jobReturnresources.run(creep, 1, 1, 0.3, 1, 1) == -1) {
                creep.memory[MEMORY_JOB] = JOB_BUILD;
                creep.announceJob();
            }
        }
        if (creep.memory[MEMORY_JOB] == JOB_RENEW) {
            if (creep.ticksToLive > 500 || !creep.getRenewEnabled()) {
                if (creep.carry.energy > 0) {
                    creep.memory[MEMORY_JOB] = JOB_RETURN;
                } else {
    	            creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
                    creep.announceJob();
                }
            } else {
                if(jobRenew.run(creep) == -1) {
                    if (creep.carry.energy > 0) { // trying this again, see if it helps avoid them wasting time standing around.
                        creep.memory[MEMORY_JOB] = JOB_RETURN;
                    }
                }
            }
        }
    }
};