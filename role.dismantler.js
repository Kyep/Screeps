"use strict";

var jobRenew = require('job.renew');
var jobBuild = require('job.build');
var jobReturnresources = require('job.returnresources');
var jobUpgrade = require('job.upgrade');

module.exports = {
    
    run: function(creep) {

        var myresource = RESOURCE_ENERGY;
        if(!creep.isAtDestinationRoom()){
            creep.moveToDestination();
            return;
        } else if (creep.memory[MEMORY_JOB] == JOB_DISMANTLE) { 
	        var target = creep.getClosestDismantableStructure(true);
            if (_.sum(creep.carry) == creep.carryCapacity || (!target && _.sum(creep.carry) > 0)) {
                if(creep.carry.energy > 0) {
    	            creep.memory[MEMORY_JOB] = JOB_RENEW;
                } else {
                    creep.memory[MEMORY_JOB] = JOB_RETURN;
                }
	            return;
	        }
	        
            if (target) {
                var amount_to_withdraw = 0;
                if (target.structureType == STRUCTURE_TERMINAL) {
                    var storekeys = Object.keys(target.store);
                    if(storekeys.length > 1) {
                        myresource = storekeys[1];
                    }
                    amount_to_withdraw = Math.min(target.store[myresource], creep.carryCapacity - _.sum(creep.carry));
                } else {
                    //new RoomVisual(creep.room.name).circle(target.pos, {stroke: 'red'});
                    return;
                    if (target.energy != undefined && target.energy > 0) {
                        amount_to_withdraw = Math.min(target.energy, creep.carryCapacity - creep.carry.energy);
                    } else if (target.store.energy != undefined && target.store.energy > 0) {
                        amount_to_withdraw = Math.min(target.store.energy, creep.carryCapacity - creep.carry.energy);
                    }
                }
                if (creep.pos.getRangeTo(target) > 1 ) {
                    creep.memory[MEMORY_REUSEPATH] = 2;
                    creep.moveToRUP(target);
                    return;
                }
                if (amount_to_withdraw > 0) {
                    var wresult = creep.withdraw(target, myresource, amount_to_withdraw);
                    if (wresult == OK && (_.sum(creep.store) + amount_to_withdraw) == creep.carryCapacity) {
                        creep.memory[MEMORY_JOB] = JOB_RETURN;
                    }
                } else {
                    //creep.say('! ' + _.sum(target.store));
                    new RoomVisual(creep.room.name).circle(target.pos, {stroke: 'orange'});
                    creep.dismantle(target);
                }
                return;
            }
            //creep.memory[MEMORY_ROLE] = 'recycler';
            creep.say('zzz');
            creep.sleepFor(25);
	    } else if (creep.memory[MEMORY_JOB] == JOB_RENEW) {
            if (creep.ticksToLive > 500 || !creep.getRenewEnabled()) {
                creep.memory[MEMORY_JOB] = JOB_BUILD;
                return;
            }
            if(jobRenew.run(creep) == -1) {
                if (creep.carry.energy > 0) { // trying this again, see if it helps avoid them wasting time standing around.
                    creep.memory[MEMORY_JOB] = JOB_BUILD;
                }
            }
        } else if(_.sum(creep.carry) == 0) {
            creep.memory[MEMORY_JOB] = JOB_DISMANTLE;
        } else if(creep.memory[MEMORY_JOB] == JOB_BUILD) {
            if (!jobBuild.run(creep)) {
                creep.memory[MEMORY_JOB] = JOB_RETURN;
            }
        } else if(creep.memory[MEMORY_JOB] == JOB_RETURN) {
            if (!creep.isAtHomeRoom()) {
                creep.moveToRUP(creep.getHomePos());
                return
            }
            var result = jobReturnresources.run(creep, 1, 1, 0.6, 1, 1, 1);
            //creep.say('rr:' + result);
            if (result == -1) {
                if(creep.carry.energy > 0) {
                    creep.memory[MEMORY_JOB] = JOB_UPGRADE;
                } else {
                    creep.memory[MEMORY_JOB] = JOB_DISMANTLE;
                }
                creep.announceJob();
            }
        } else if(creep.memory[MEMORY_JOB] == JOB_UPGRADE) {
            jobUpgrade.run(creep);
        }
    }

};