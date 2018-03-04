"use strict";

var jobReturnresources = require('job.returnresources');
var jobRenew = require('job.renew');
var jobGetstoredenergy = require('job.gfs');

module.exports = {

    run: function(creep) {
        if(creep.memory[MEMORY_JOB] == undefined) {
            creep.memory[MEMORY_JOB] = JOB_GFS;
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
                if (creep.isAtDestinationRoom() && creep.room.getLevel() > 5) {
                    creep.disableRenew();
                }
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_BACK;
            } else {
                jobReturnresources.run(creep, 1, 1, 0.5, 1, 1);
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_TRAVEL_BACK) {
            if (creep.isAtHomeRoom()) {
                var reserves = creep.room.storage.store[RESOURCE_ENERGY];
                if (!reserves || reserves < 50000) {
                    creep.disableRenew();
                    //creep.memory[MEMORY_ROLE] = 'recycler';
                    console.log(creep.name + ' has run out of energy to transfer from ' + creep.memory[MEMORY_HOME] + ' to ' + creep.memory[MEMORY_DEST]);
                }
                creep.memory[MEMORY_JOB] = JOB_GFS;
            } else {
                creep.moveToHome();
            }
        }
	}
};
