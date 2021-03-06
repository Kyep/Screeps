"use strict";

var jobBuild = require('job.build');
var jobRepair = require('job.repair');
var jobRenew = require('job.renew');
var jobGetstoredenergy = require('job.gfs');

module.exports =  {

    run: function(creep) {
        if(creep.memory[MEMORY_JOB] != JOB_GFS && creep.memory[MEMORY_JOB] != JOB_RENEW && creep.carry.energy == 0) {
            if(creep.ticksToLive < 200 && creep.getRenewEnabled() ) {
                creep.memory[MEMORY_JOB] = JOB_RENEW;
                creep.announceJob();
            } else {
                creep.memory[MEMORY_JOB] = JOB_GFS;
                creep.announceJob();
            }
        }

        if(creep.memory[MEMORY_JOB] == JOB_GFS) {
            if (creep.carry.energy == creep.carryCapacity) {
                creep.memory[MEMORY_JOB] = JOB_BUILD;
                creep.announceJob();
            } else if (jobGetstoredenergy.run(creep) == ERR_NOT_ENOUGH_RESOURCES){
                creep.say('NO E!');
                /*
                var allsources = creep.room.find(FIND_SOURCES);
                var chosen_source = _.sample(allsources);
                if (chosen_source) {
                    creep.memory[MEMORY_SOURCE] = chosen_source.id;
                    creep.memory[MEMORY_ROLE] = 'remoteconstructor';
                    creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
                }
                */
            }
        } 
        if (creep.memory[MEMORY_JOB] == JOB_BUILD) {
            if(creep.memory[MEMORY_DEST] != creep.room.name){
                creep.moveToDestination();
            } else if (!jobBuild.run(creep)){
                creep.memory[MEMORY_JOB] = JOB_REPAIR;
                creep.announceJob();
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_REPAIR) {
            if (jobRepair.run(creep) == -1) {
                creep.memory[MEMORY_JOB] = JOB_RENEW;
                creep.announceJob();
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_RENEW) {
            if (creep.ticksToLive > 200) {
	            creep.memory[MEMORY_JOB] = JOB_BUILD;
                creep.announceJob();
            } else if (!creep.getRenewEnabled()) {
                if (creep.carry.energy == 0) {
                    creep.suicide();
                } else {
                    creep.disableRenew();
                    //console.log(creep.name + ': disabled renew as ended up in job_renew with energy');
    	            creep.memory[MEMORY_JOB] = JOB_BUILD;
                    creep.announceJob();
                }
            } else {
                if (jobRenew.run(creep) == -1){
                    creep.memory[MEMORY_JOB] = JOB_GFS;
                    creep.announceJob();
                }
            }
        } else {
            //console.log("WARNING: " + creep.name + " has no job: " + creep.memory[MEMORY_JOB]);
            creep.memory[MEMORY_JOB] = JOB_GFS;
        }
	}
};
