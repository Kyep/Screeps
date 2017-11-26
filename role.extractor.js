"use strict";

var jobRenew = require('job.renew');

module.exports = {
    run: function(creep) {
        if (creep.memory[MEMORY_JOB] == undefined) {
            creep.memory[MEMORY_JOB] = JOB_EXTRACT;
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

            mineral = Game.getObjectById(creep.memory.mineralid);
            if (mineral) {
                
                var result = creep.harvest(mineral);
                if (result == ERR_NOT_IN_RANGE) {
                    creep.moveToRUP(mineral);
                } else if (result = ERR_TIRED) {
                    if (mineral.mineralAmount == 0 && mineral.ticksToRegeneration > 20) {
                        creep.sleepFor(20);
                    }
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
            mineral = Game.getObjectById(creep.memory.mineralid);
            if (mineral) {
                if (mineral.mineralAmount == 0) {
                    console.log(creep.name + ' IS SELF RECYCLING BECAUSE THERE ARE NO MINERALS LEFT IN: ' + creep.room.name);
                    creep.memory[MEMORY_ROLE] = 'recycler';
                }   
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