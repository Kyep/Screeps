"use strict";

var jobReturnresources = require('job.returnresources');
var jobRenew = require('job.renew');
var jobGetstoredenergy = require('job.gfs');

module.exports = {

    run: function(creep, towersonly) {
        if(creep.memory[MEMORY_JOB] != JOB_GFS && creep.memory[MEMORY_JOB] != JOB_RENEW && creep.carry.energy == 0) {
            creep.memory[MEMORY_JOB] = JOB_GFS;
            //creep.announceJob();
        } else if(creep.memory[MEMORY_JOB] == JOB_GFS && creep.carry.energy == creep.carryCapacity) {
            creep.memory[MEMORY_JOB] = JOB_RETURN;
            //creep.announceJob();
        }
        if(creep.memory[MEMORY_JOB] == JOB_GFS) {
            if (jobGetstoredenergy.run(creep) == -1){
                //creep.memory[MEMORY_ROLE] = 'recycler'; // this is super-dangerous, it can create an endless loop when a room without a container spawns a teller :P
            }
	    } else if(creep.memory[MEMORY_JOB] == JOB_RETURN) {
            if (towersonly) {
    	        if (jobReturnresources.run(creep, 0, 0, 0.75, 0, 0) == -1) { // fill towers first.
    	            if (jobReturnresources.run(creep, 1, 1, 0.5, 0, 0) == -1) { // fill other things.
                    //
                    }
                }
            } else {
    	        if (jobReturnresources.run(creep, 1, 1, 0.5, 0, 0) == -1) { // fill most things.
                    //
                }
            }
        } else {
            console.log('WARNING: ' + creep.name + ' has no job! ' + creep.memory[MEMORY_JOB]);
            creep.memory[MEMORY_JOB] = JOB_GFS;
        }
	}
};
