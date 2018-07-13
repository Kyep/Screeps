"use strict";

var jobRenew = require('job.renew');
var jobBuild = require('job.build');
var jobUpgrade = require('job.upgrade');

module.exports = {
    
    run: function(creep) {

        var myresource = RESOURCE_ENERGY;
        if (creep.memory[MEMORY_JOB] == JOB_TRAVEL_OUT) {
            if(creep.isAtDestinationRoom()) {
                creep.memory[MEMORY_JOB] = JOB_DISMANTLE;
            } else {
                creep.moveToDestination();
            }
            return;
        } else if (creep.memory[MEMORY_JOB] == JOB_DISMANTLE) { 
            if (!creep.isAtDestinationRoom()) {
                creep.moveToDestination();
                return;
            }
	        //creep.avoidEdges();
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
                if (target.store != undefined) {
                    var storekeys = Object.keys(target.store);
                    if(target.store[RESOURCE_ENERGY] == 0 && storekeys.length > 1) {
                        myresource = storekeys[1];
                    }
                    amount_to_withdraw = Math.min(target.store[myresource], creep.carryCapacity - _.sum(creep.carry));
                } else if (target.energy != undefined) {
                    amount_to_withdraw = Math.min(target.energy, creep.carryCapacity - _.sum(creep.carry));
                }

                if (amount_to_withdraw > 0) {
                    new RoomVisual(creep.room.name).line(creep.pos.x, creep.pos.y, target.pos.x, target.pos.y, {color: 'white'});
                } else {
                    new RoomVisual(creep.room.name).line(creep.pos.x, creep.pos.y, target.pos.x, target.pos.y, {color: 'red'});
                }
                
                if (creep.pos.getRangeTo(target) > 1 ) {
                    creep.moveToRUP(target);
                    return;
                }
                if (amount_to_withdraw > 0) {
                    var wresult = creep.withdraw(target, myresource, amount_to_withdraw);
                    if (wresult == OK && (_.sum(creep.store) + amount_to_withdraw) == creep.carryCapacity) {
                        console.log(creep.name + ': looted ' + amount_to_withdraw + ' ' + myresource + ' from ' + target.structureType + ' owned by ' + target.owner.username);
                        creep.memory[MEMORY_JOB] = JOB_RETURN;
                    }
                } else {
                    //creep.say('! ' + _.sum(target.store));
                    creep.dismantle(target);
                }
                return;
            } else {
                creep.say('no target');
                new RoomVisual(creep.room.name).circle(creep.pos, {stroke: 'red'});
                creep.sleepFor(3);
                //creep.memory[MEMORY_ROLE] = 'recycler';
                return;
            }
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
            if(_.sum(creep.carry) == 0) {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
                creep.announceJob();
                return;
            }
            var result = creep.returnToStorage();
            if (!result) {
                if(creep.carry.energy > 0) {
                    creep.memory[MEMORY_JOB] = JOB_UPGRADE;
                }
                creep.announceJob();
            }
        } else if(creep.memory[MEMORY_JOB] == JOB_UPGRADE) {
            jobUpgrade.run(creep);
        } else {
            creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
        }
    }

};