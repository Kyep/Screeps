"use strict";

var jobUpgrade = require('job.upgrade');
var jobGetstoredenergy = require('job.gfs');

module.exports = {

    run: function(creep) {
        if(creep.memory[MEMORY_JOB] != JOB_GFS && creep.carry.energy == 0) {
            creep.memory[MEMORY_JOB] = JOB_GFS;
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
            if (creep.room.name != creep.memory[MEMORY_DEST]) {
                creep.moveTo(new RoomPosition(25, 25, creep.memory[MEMORY_DEST]));
            } else {
                jobUpgrade.run(creep);
            }
        } else {
            console.log('WARNING: ' + creep.name + ' has no job: ' + creep.memory[MEMORY_JOB]);
            creep.memory[MEMORY_JOB] = JOB_GFS;
        }
	}
};
