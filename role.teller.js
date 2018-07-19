"use strict";

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
            var gfsresult = jobGetstoredenergy.run(creep);
            if (gfsresult == ERR_NOT_ENOUGH_RESOURCES){
                //creep.memory[MEMORY_ROLE] = 'recycler'; // this is super-dangerous, it can create an endless loop when a room without a container spawns a teller :P
            }
	    } else if(creep.memory[MEMORY_JOB] == JOB_RETURN) {
            if (towersonly) {
                var result = creep.returnToStorage([], [STRUCTURE_STORAGE, STRUCTURE_TERMINAL, STRUCTURE_NUKER], [STRUCTURE_TOWER]);
            } else {
                var result = creep.returnToStorage([], [STRUCTURE_STORAGE, STRUCTURE_TERMINAL, STRUCTURE_NUKER]);
            }
        } else {
            console.log('WARNING: ' + creep.name + ' has no job! ' + creep.memory[MEMORY_JOB]);
            creep.memory[MEMORY_JOB] = JOB_GFS;
        }
	}
};
