"use strict";

var jobReturnresources = require('job.returnresources');
var jobRenew = require('job.renew');
var jobHide = require('job.hide');

module.exports = {
    run: function(creep) {
        // ROLE: Hauls energy from charvester containers back to base. 
        //       
        // FLOW: JOB_TRAVEL_OUT -> JOB_TRAVEL_BACK -> JOB_USELINK -> JOB_RETURN -> JOB_RENEW -> JOB_TRAVEL_OUT.
        // If attacked, -> JOB_HIDE, then back to JOB_TRAVEL_OUT.
        if (creep.memory[MEMORY_JOB] == undefined) {
            creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
        }
        if (creep.getShouldHide()) {
            creep.memory[MEMORY_JOB] = JOB_HIDE;
        }
        if (creep.memory[MEMORY_JOB] == JOB_HIDE) {
            if (creep.getShouldHide()) {
                jobHide.run(creep);
            } else if (creep.room.name == creep.memory[MEMORY_DEST]) {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
            } else {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_BACK;
            }
        }
        if (creep.memory[MEMORY_JOB] == JOB_TRAVEL_OUT) {
            if (creep.carry.energy == creep.carryCapacity) {
	            creep.memory[MEMORY_JOB] = JOB_TRAVEL_BACK;
	            return 0;
            } else if (!creep.isAtDestinationRoom()) {
                creep.moveToDestination();
                return 0
            }
            if (creep.memory[MEMORY_H_CONTAINER] != undefined) {
                var thecontainer = Game.getObjectById(creep.memory[MEMORY_H_CONTAINER]);
                if (thecontainer != undefined) {
                    var crange = creep.pos.getRangeTo(thecontainer);
                    if (thecontainer.store.energy > 0) {
                        if (creep.withdraw(thecontainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(thecontainer);
                        } else {

                        }
                    } else {
                        if (creep.pos.getRangeTo(thecontainer) > 2) {
                            creep.moveTo(thecontainer);
                        }
                    }

                    if(crange < 2) {
                        var energypile = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1, {filter: (s) => s.energy > 0});
                        if(energypile.length){
                            creep.say('pile!');
                            creep.pickup(energypile[0]);
                        }
                    }
                } else {
                    creep.memory[MEMORY_H_CONTAINER] = undefined;
                }
                return 0;
            }
            var target_source = Game.getObjectById(creep.memory[MEMORY_SOURCE]);
            if (target_source == undefined) {
                console.log(creep.name + ": Warning, souce " + creep.memory[MEMORY_SOURCE] + " cannot be GOBID." + creep.room.name);
                return 0;
            }
            var container_search_range = 1;
            var nearby_containers = target_source.pos.findInRange(FIND_STRUCTURES, container_search_range, { filter: { structureType: STRUCTURE_CONTAINER } } );
            var thecontainer = undefined;
            if (nearby_containers.length == 0) {
                // wait for a container to be constructed;
                return 0;
            }
            thecontainer = nearby_containers[0];
            if (nearby_containers.length > 1) {
                console.log(creep.name + ": warning: multiple containers detected.");
            }
            creep.memory[MEMORY_H_CONTAINER] = thecontainer.id;
        } else if (creep.memory[MEMORY_JOB] == JOB_TRAVEL_BACK) {
            if (creep.room.name == creep.memory[MEMORY_HOME]) {
                if (creep.pos.x < 2 || creep.pos.x > 47 || creep.pos.y < 2 || creep.pos.y > 47) {
                    // Continue in a little bit, get off the edge before changing state.
                } else {
                    creep.memory[MEMORY_JOB] = JOB_USELINK;
                }

                
                creep.moveTo(creep.getHomePos(), {reusePath: 10});
                return 0;
            }
            if(creep.carry.energy > 0) {
                var targets = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                    filter: function(structure){
                        return (structure.hits < structure.hitsMax) && (structure.structureType != STRUCTURE_WALL) && (structure.structureType != STRUCTURE_RAMPART)
                    }
                })
                if(targets.length) {
                    var target = creep.pos.findClosestByRange(targets)
                    creep.repair(target);
                }
            }
            creep.moveTo(creep.getHomePos());
        } else if (creep.memory[MEMORY_JOB] == JOB_USELINK) {
            if(empire[creep.memory[MEMORY_DEST]] == undefined) {
                return 0;
            }
            if (empire[creep.memory[MEMORY_DEST]].sources[creep.memory[MEMORY_SOURCE]] == undefined) {
                creep.memory[MEMORY_JOB] = JOB_RETURN; 
                console.log(creep.name + 'undefined source: ' + creep.memory[MEMORY_DEST] + ' / ' + creep.memory[MEMORY_SOURCE]);
                return 0;
            }
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 10, {
                filter: function(structure){
                    return (structure.structureType == STRUCTURE_LINK) && (structure.energy < structure.energyCapacity && structure.cooldown == 0)
                }
            });
            if (!targets.length) {
                creep.memory[MEMORY_JOB] = JOB_RETURN; 
                //console.log(creep.name + ' reports no link to use');
                return 0;
            }
            var target = targets[0];
            var result = creep.transfer(target, RESOURCE_ENERGY);
            if (result == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
                return 0;
            }
            //console.log(creep.name + " at " + creep.room.name + ':' + creep.pos.x + ',' + creep.pos.y + ' deposited energy into link' + target.id);
            creep.memory[MEMORY_JOB] = JOB_RETURN;

        } else if (creep.memory[MEMORY_JOB] == JOB_RETURN) {
            if (creep.room.name != creep.memory[MEMORY_HOME]) {
                creep.say('ret->H');
                var newpos = creep.getHomePos();
               creep.moveTo(newpos)
                //console.log(creep.name + ': WARNING: got stuck in JOB_RETURN outside its HOME: ' + creep.room.name + 
                //'at ' + creep.pos.x + ',' + creep.pos.y + ' v ' + creep.memory[MEMORY_HOME] + ' carrying: ' + creep.carry.energy + ' of ' + creep.carryCapacity + ' moving to: ' + JSON.stringify(newpos));
               return 0;
            }
            //creep.say('pos OK');
            if (creep.room.storage == undefined) {
                /*if (creep.room.name != creep.memory[MEMORY_HOME]) {
                    creep.memory.job = JOB_TRAVEL_BACK;
                    console.log(creep.name + ': WARNING: got stuck in JOB_RETURN outside its HOME: ' + creep.room.name + 
                    'at ' + creep.pos.x + ',' + creep.pos.y + ' v ' + creep.memory[MEMORY_HOME] + ' carrying: ' + creep.carry.energy + ' of ' + creep.carryCapacity);
                } else*/ 
                if (jobReturnresources.run(creep, 1, 1, 1, 1, 1, 0) == -1) { // if room has no storage unit, return to extensions.
                    //console.log(creep.name + ' stuck');
                    // wait.
                }
            } else if (jobReturnresources.run(creep, 1, 1, 0.5, 1, 1, 0) == -1) {
                // wait for space to be free.
                creep.say("wait4space");
            }
            if(creep.carry.energy == 0) {
                //creep.say("Empty");
                creep.memory[MEMORY_JOB] = JOB_RENEW;                
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_RENEW) {
            if (creep.ticksToLive > 500 || !creep.getRenewEnabled()) {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
            } else {
                jobRenew.run(creep);
            }
        } else {
            creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
        }
    }
}