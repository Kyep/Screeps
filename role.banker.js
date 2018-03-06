"use strict";


var jobRenew = require('job.renew');

module.exports = {

    run: function(creep) {
        if(!creep.isAtDestinationRoom()){
            creep.moveToDestination();
            return;
        } else if(creep.memory[MEMORY_JOB] == JOB_GFS) {
            if (creep.carry.energy > 0) {
                creep.memory[MEMORY_JOB] = JOB_RETURN;
            } else {
                var result = creep.withdraw(creep.room.terminal, RESOURCE_ENERGY, creep.carryCapacity);
                if(result == ERR_NOT_IN_RANGE) {
                    creep.moveToRUP(creep.room.terminal);
                }
            }
        } else if(creep.memory[MEMORY_JOB] == JOB_RETURN) {
            if (creep.carry.energy == 0) {
                if (creep.ticksToLive > 200 ) {
                    creep.memory[MEMORY_JOB] = JOB_GFS;
                } else {
                    creep.memory[MEMORY_JOB] = JOB_RENEW;
                }
            } else {
                var result = creep.transfer(creep.room.storage, RESOURCE_ENERGY, creep.carry[RESOURCE_ENERGY]);
                if(result == ERR_NOT_IN_RANGE) {
                    creep.moveToRUP(creep.room.storage);
                }
            }
        } else if(creep.memory[MEMORY_JOB] == JOB_RENEW) {
            if (!creep.getRenewEnabled() || !creep.room.storage || !creep.room.terminal || creep.room.storage.store[RESOURCE_ENERGY] > 900000 || creep.room.terminal.store[RESOURCE_ENERGY] < 10000) {
                if (creep.ticksToLive > 100 ) {
                    creep.memory[MEMORY_JOB] = JOB_GFS;
                }
                creep.say('dying off');
            } else {
                if(jobRenew.run(creep) == -1 || creep.ticksToLive > 500 ) {
                    creep.memory[MEMORY_JOB] = JOB_GFS;
                }
            }
        } else {
            creep.memory[MEMORY_JOB] = JOB_GFS;
        }
	}
};
