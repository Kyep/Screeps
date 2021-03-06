"use strict";

var jobRenew = require('job.renew');

module.exports = {
    run: function(creep) {
        if (creep.memory[MEMORY_JOB] == undefined) {
            if (!creep.isAtDestinationRoom()) {
                creep.moveToDestination();
                return;
            }
            creep.memory[MEMORY_JOB] = JOB_EXTRACT;
            return;
        }
        if (creep.ticksToLive < 400 && creep.memory[MEMORY_JOB] != JOB_RENEW) {
            creep.memory[MEMORY_JOB] = JOB_RENEW;
        } else if  (_.sum(creep.carry) == 0 && creep.memory[MEMORY_JOB] == JOB_STOREMINERALS) {
            creep.memory[MEMORY_JOB] = JOB_EXTRACT;
        } else if (_.sum(creep.carry) == creep.carryCapacity && creep.memory[MEMORY_JOB] != JOB_STOREMINERALS) {
            creep.memory[MEMORY_JOB] = JOB_STOREMINERALS;
        }

        if (creep.memory[MEMORY_JOB] == JOB_EXTRACT) {
            var mineral = undefined;
            if (creep.memory.mineralid == undefined) {
                mineral = creep.pos.findClosestByPath(FIND_MINERALS, {filter: (s) => s.mineralAmount > 0});
                if (mineral != undefined) {
                    creep.memory.mineralid = mineral.id;
                } else {
                    return;
                }
            }

            mineral = Game.getObjectById(creep.memory[MEMORY_MINERALID]);
            if (mineral) {
                if (mineral.mineralAmount == 0 && mineral.ticksToRegeneration > 1500) {
                    creep.memory[MEMORY_ROLE] = 'recycler';
                    return;
                }
                if (typeof creep.memory['flagrally'] === 'undefined') {
                    var rallyflags = creep.room.getFlagsByType(FLAG_MININGPOS);
                    if(rallyflags.length) {
                        creep.memory[MEMORY_STAND_X] = rallyflags[0].pos.x;
                        creep.memory[MEMORY_STAND_Y] = rallyflags[0].pos.y;
                        creep.memory['flagrally'] = true;
                    } else {
                        creep.memory['flagrally'] = false;
                    }
                }
                if (creep.memory[MEMORY_STAND_X] !== undefined && creep.memory[MEMORY_STAND_Y] !== undefined) {
                    if(creep.pos.x != creep.memory[MEMORY_STAND_X] || creep.pos.y != creep.memory[MEMORY_STAND_Y]) {
                        creep.moveToRUP(new RoomPosition(creep.memory[MEMORY_STAND_X], creep.memory[MEMORY_STAND_Y], creep.room.name));
                        return;
                    }
                }
    
                var result = creep.harvest(mineral);
                if (result == ERR_NOT_IN_RANGE) {
                    creep.moveToRUP(mineral);
                } else if (result = ERR_TIRED) {
                    // just wait.
                }
            }
            if (_.sum(creep.carry) == creep.carryCapacity) { // DO NOT DISABLE THIS OR HARVESTERS WILL GET STUCK AND NEVER RETURN!
                creep.memory[MEMORY_JOB] = JOB_STOREMINERALS;
                creep.announceJob();
            }
        }
        if (creep.memory[MEMORY_JOB] == JOB_STOREMINERALS) {
            var terminal = creep.room.terminal;
            var result = creep.transfer(terminal, _.last(Object.keys(creep.carry)));
            if (result == ERR_NOT_IN_RANGE) {
                creep.moveToRUP(terminal);
            }
        }
        if (creep.memory[MEMORY_JOB] == JOB_RENEW) {
            mineral = Game.getObjectById(creep.memory[MEMORY_MINERALID]);
            if (mineral == undefined || mineral.mineralAmount == undefined || mineral.mineralAmount == 0) {
                console.log(creep.name + ' IS SELF RECYCLING BECAUSE THERE ARE NO MINERALS LEFT IN: ' + creep.room.name);
                creep.memory[MEMORY_ROLE] = 'recycler';
            }
            if (creep.ticksToLive > 500) {
                if (_.sum(creep.carry) > 0) {
                    creep.memory[MEMORY_JOB] = JOB_STOREMINERALS;
                } else {
    	            creep.memory[MEMORY_JOB] = JOB_EXTRACT;
                }
                creep.announceJob();
            } else {
                if(jobRenew.run(creep) == -1) {
                    if (creep.carry.energy > 0) { // trying this again, see if it helps avoid them wasting time standing around.
                        creep.memory[MEMORY_JOB] = JOB_EXTRACT;
                    }
                }
            }
        }
    }
};