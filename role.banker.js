"use strict";


var jobRenew = require('job.renew');

module.exports = {

    run: function(creep) {
        if(!creep.isAtDestinationRoom()){
            creep.moveToDestination();
            return;
        }
        var pullfrom = creep.room.terminal;
        var depositto = creep.room.storage;
        var pullmin = 10000;
        var pushmax = 900000;
        
        var emode = creep.room.getEnergyMode();
        if (emode === 0) {
            creep.sleepFor(25);  
        }
        if (emode === 2) {
            pullfrom = creep.room.storage;
            depositto = creep.room.terminal;
            pullmin = 10000;
            pushmax = 900000;
        }

        if (!pullfrom || !depositto) {
            return;
        }
        
        if(creep.memory[MEMORY_JOB] == JOB_GFS) {
            if (creep.carry.energy > 0) {
                creep.memory[MEMORY_JOB] = JOB_RETURN;
            } else {
                var result = creep.withdraw(pullfrom, RESOURCE_ENERGY, creep.carryCapacity);
                if(result == ERR_NOT_IN_RANGE) {
                    creep.moveToRUP(pullfrom);
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
                var result = creep.transfer(depositto, RESOURCE_ENERGY, creep.carry[RESOURCE_ENERGY]);
                if(result == ERR_NOT_IN_RANGE) {
                    creep.moveToRUP(depositto);
                }
            }
        } else if(creep.memory[MEMORY_JOB] == JOB_RENEW) {
            if(jobRenew.run(creep) == -1 || creep.ticksToLive > 500 ) {
                creep.memory[MEMORY_JOB] = JOB_GFS;
            }
        } else {
            creep.memory[MEMORY_JOB] = JOB_GFS;
        }
	}
};
