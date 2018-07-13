"use strict";

var jobRenew = require('job.renew');
var jobGetstoredenergy = require('job.gfs');

module.exports = {

    run: function(creep) {
        if (creep.memory[MEMORY_JOB] == JOB_TRAVEL_OUT) {
            if (creep.isAtDestinationRoom()) {
                creep.memory[MEMORY_JOB] = JOB_GFS;
            } else {
                creep.moveToDestination();
            }
        } else if(creep.memory[MEMORY_JOB] == JOB_GFS) {
            if (!creep.isAtDestinationRoom()) {
                creep.moveToDestination();
            } else if (creep.carry.energy == creep.carryCapacity) {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_BACK;
            } else {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE && structure.store.energy > 0)
                        || (structure.structureType == STRUCTURE_TERMINAL && structure.store.energy > 0);
                    }
                });
                
                var target = undefined;
                var amount_to_withdraw = 0;
                
                if (targets && targets.length) {
                    target = creep.pos.findClosestByRange(targets);
                    amount_to_withdraw = Math.min(target.store.energy, creep.carryCapacity - creep.carry.energy);
                } else {
                    targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_EXTENSION && structure.energy > 0)
                            || (structure.structureType == STRUCTURE_TOWER && structure.energy > 0)
                            || (structure.structureType == STRUCTURE_SPAWN && structure.energy > 0);
                        }
                    });
                    if (targets && targets.length) {
                        target = creep.pos.findClosestByRange(targets);
                        amount_to_withdraw = Math.min(target.energy, creep.carryCapacity - creep.carry.energy);
                    } else {
                        return;
                    }
                }
                var result = creep.withdraw(target, RESOURCE_ENERGY, amount_to_withdraw);
                if(result == ERR_NOT_IN_RANGE) {
                    creep.moveToRUP(target);
                }
                
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_TRAVEL_BACK) {
            if (creep.isAtHomeRoom()) {
                creep.memory[MEMORY_JOB] = JOB_RETURN;
            } else {
                creep.moveToHome();
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_RETURN) {
            if (creep.carry.energy == 0) {
                creep.memory[MEMORY_JOB] = JOB_RENEW;
            } else {
                creep.returnToStorage();
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_RENEW) {
            if (creep.ticksToLive > 600 || !creep.getRenewEnabled()) {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
            } else {
                jobRenew.run(creep);
            }
        } else {
            creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
        }
	}
};
