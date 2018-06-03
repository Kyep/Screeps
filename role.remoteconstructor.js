"use strict";

var jobRenew = require('job.renew');
var jobReturnresources = require('job.returnresources');
var jobBuild = require('job.build');
var jobRepair = require('job.repair');
var jobRenew = require('job.renew');
var jobGetstoredenergy = require('job.gfs');
var jobHarvest = require('job.harvest');
var jobUpgrade = require('job.upgrade');

module.exports = {
    run: function(creep) {
        // FLOW: undefined -> GFS -> TRAVEL_OUT -> BUILD -> UPGRADE -> DEATH
        //                               ^          V         V
        //                            HARVEST ------<---------<
        if (creep.memory[MEMORY_JOB] == undefined) {
            creep.memory[MEMORY_JOB] = JOB_GFS;
        } else if (creep.memory[MEMORY_JOB] == JOB_GFS) {
            if (creep.carry.energy == creep.carryCapacity) {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
                return;
            }
            var retval = jobGetstoredenergy.run(creep);
            if (retval == -1) {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_TRAVEL_OUT) {
            if(!creep.isAtDestinationRoom()){
                creep.moveToDestination();
                return;
            } else if (creep.updateDestination()) {
                return;
            } else if (creep.carry.energy == 0) {
                creep.memory[MEMORY_JOB] = JOB_HARVEST;
                return;
            } else {
                creep.memory[MEMORY_JOB] = JOB_BUILD;
            }
        } else if(creep.memory[MEMORY_JOB] == JOB_BUILD) {
            if (creep.carry.energy == 0) {
                creep.memory[MEMORY_JOB] = JOB_HARVEST;
                return;
            } else if (!jobBuild.run(creep)) {
                if(creep.room.name == creep.memory[MEMORY_DEST]) {
                    creep.memory[MEMORY_JOB] = JOB_UPGRADE;
                    creep.announceJob();
                }
            }
        } else if(creep.memory[MEMORY_JOB] == JOB_UPGRADE) {
            if (creep.carry.energy == 0) {
                creep.memory[MEMORY_JOB] = JOB_HARVEST;
                return;
            } else if (creep.room.name == creep.memory[MEMORY_HOME]) {
                jobUpgrade.run(creep);
            } else { 
                creep.memory[MEMORY_JOB] = JOB_BUILD;
                creep.announceJob();
            }
        } else if(creep.memory[MEMORY_JOB] == JOB_HARVEST) {
            var retval = jobHarvest.run(creep);
            if (retval == ERR_NOT_ENOUGH_ENERGY) {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
            } else if (creep.carry.energy == creep.carryCapacity) {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
            }
        }
    }
};