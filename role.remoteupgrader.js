"use strict";

var jobUpgrade = require('job.upgrade');
var jobRenew = require('job.renew');
var jobGetstoredenergy = require('job.getstoredenergy');

module.exports =  {

    run: function(creep) {
        if(creep.memory[MEMORY_JOB] != JOB_GFS && creep.memory[MEMORY_JOB] != JOB_RENEW && creep.carry.energy == 0) {
            creep.memory[MEMORY_JOB] = JOB_GFS;
        } else if(creep.memory[MEMORY_JOB] == JOB_GFS && creep.carry.energy == creep.carryCapacity) {
            creep.memory[MEMORY_JOB] = JOB_UPGRADE;
        }
        if(creep.memory[MEMORY_JOB] == JOB_GFS) {
            if (jobGetstoredenergy.run(creep) == -1){
                //
            }
        } else if(creep.memory[MEMORY_JOB] == JOB_UPGRADE) {
            jobUpgrade.run(creep);
        } else if (creep.memory[MEMORY_JOB] == JOB_RENEW) {
            if (creep.ticksToLive > 500 || jobRenew.run(creep) == -1) {
                creep.memory[MEMORY_JOB] = JOB_GFS;
            }
        } else {
            console.log('WARNING: ' + creep.name + ' has no job: ' + creep.memory[MEMORY_JOB]);
            creep.memory[MEMORY_JOB] = JOB_GFS;
        }
	}
};
