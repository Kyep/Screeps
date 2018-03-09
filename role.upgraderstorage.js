"use strict";

var jobUpgrade = require('job.upgrade');
var jobGetstoredenergy = require('job.gfs');
var jobRenew = require('job.renew');

module.exports = {

    run: function(creep) {
        if (creep.carry.energy == 0 && creep.memory[MEMORY_JOB] != JOB_GFS && creep.memory[MEMORY_JOB] != JOB_RENEW) {
            if (creep.ticksToLive > 400 || !creep.getRenewEnabled() ) {
                creep.memory[MEMORY_JOB] = JOB_GFS;
            } else {
                creep.memory[MEMORY_JOB] = JOB_RENEW;
            }
        } else if(creep.memory[MEMORY_JOB] == JOB_GFS && creep.carry.energy == creep.carryCapacity) {
            creep.memory[MEMORY_JOB] = JOB_UPGRADE;
        }
        if(creep.memory[MEMORY_JOB] == JOB_GFS) {
            if (creep.room.name != creep.memory[MEMORY_HOME]) {
                creep.moveTo(creep.getHomePos());
            } else if (jobGetstoredenergy.run(creep) == -1){
                creep.memory[MEMORY_ROLE] = 'recycler';
            }
        } else if(creep.memory[MEMORY_JOB] == JOB_UPGRADE) {
            if(!creep.isAtDestinationRoom()){
                creep.moveToDestination();
            } else {
                jobUpgrade.run(creep);
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_RENEW) {
            if (creep.ticksToLive > 400 || !creep.getRenewEnabled() ) {
                creep.memory[MEMORY_JOB] = JOB_GFS;
            } else if (!creep.getRenewEnabled() || !creep.room.storage || creep.room.storage.store[RESOURCE_ENERGY] < 25000) {
                creep.memory[MEMORY_ROLE] = 'recycler';
            } else {
                jobRenew.run(creep);
            }
        } else {
            console.log('WARNING: ' + creep.name + ' has no job: ' + creep.memory[MEMORY_JOB]);
            creep.memory[MEMORY_JOB] = JOB_GFS;
        }
	}
};
