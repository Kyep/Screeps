"use strict";

var jobRenew = require('job.renew');
var jobGetstoredenergy = require('job.gfs');

module.exports = {

    run: function(creep) {
        if(creep.memory[MEMORY_JOB] == undefined) {
            var rconf = GET_ROOM_CONFIG(creep.memory[MEMORY_DEST]);
            if (rconf['backup_spawn_room']) {
                creep.memory[MEMORY_HOME] = rconf['backup_spawn_room'];
                creep.memory[MEMORY_JOB] = JOB_GFS;
            } else {
                console.log(creep.memory[MEMORY_DEST] + ': LACKS BSR FOR GROWER!!!!');
            }
        } else if(creep.memory[MEMORY_JOB] == JOB_GFS) {
            if (creep.carry.energy == creep.carryCapacity) {
                creep.memory[MEMORY_JOB] = JOB_RENEW;
            } else if(creep.isAtHomeRoom()) {
                jobGetstoredenergy.run(creep);
            } else {
                creep.moveToHome();
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_RENEW) {
            if (creep.ticksToLive > 600 || !creep.getRenewEnabled()) {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
            } else {
                jobRenew.run(creep);
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_TRAVEL_OUT) {
            if (!creep.isAtDestinationRoom()) {
                creep.moveToDestination();
            } else {
                creep.memory[MEMORY_JOB] = JOB_RETURN;
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_RETURN) {
            if (!creep.isAtDestinationRoom()) {
                creep.moveToDestination();
            } else if (creep.carry.energy == 0) {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_BACK;
            } else {
                creep.returnToStorage([], [], [STRUCTURE_STORAGE]);
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_TRAVEL_BACK) {
            if (creep.isAtHomeRoom()) {
                creep.memory[MEMORY_JOB] = JOB_GFS;
            } else {
                creep.moveToHome();
            }
        }
	}
};
