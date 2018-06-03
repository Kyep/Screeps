"use strict";

var jobReturnresources = require('job.returnresources');
var jobBuild = require('job.build');
var jobRenew = require('job.renew');
var jobHide = require('job.hide');
var jobUpgrade = require('job.upgrade');
var jobGetstoredenergy = require('job.gfs');

module.exports = {
    run: function(creep) {
        // ROLE: Hauls energy from charvester containers back to base. 
        //       
        // FLOW: JOB_TRAVEL_OUT -> JOB_TRAVEL_BACK -> JOB_USELINK -> JOB_RETURN -> JOB_RENEW -> JOB_TRAVEL_OUT.
        // If attacked, -> JOB_HIDE, then back to JOB_TRAVEL_OUT.
        if (creep.memory[MEMORY_JOB] == undefined) {
            creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
            creep.memory[MEMORY_STEPS_ACTUAL] = 0;
        }
        if(Game.time % 5 === 0) {
            if (creep.getShouldHide()) {
                creep.memory[MEMORY_JOB] = JOB_HIDE;
            }
        }
        if (creep.memory[MEMORY_JOB] == JOB_HIDE) {
            if (creep.getShouldHide()) {
                if (creep.room.name == creep.memory[MEMORY_HOME]) {
                    if (creep.carry.energy == 0) {
                    	jobGetstoredenergy.run(creep);
                    } else {
                    	jobReturnresources.run(creep, 1, 1, 0.5, 0, 0);
                    }
                    creep.say('EFU');
                    return;
                }
                jobHide.run(creep);
            } else if (creep.room.name == creep.memory[MEMORY_DEST]) {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
            } else {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_BACK;
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_TRAVEL_OUT) {
            // If we are not at the destination room, go there.
            var actual_steps = creep.memory[MEMORY_STEPS_ACTUAL];
            if(actual_steps == undefined) {
                actual_steps = 0;
            }
            actual_steps++;
            creep.memory[MEMORY_STEPS_ACTUAL] = actual_steps;
            if (!creep.isAtDestinationRoom()) {
                creep.moveToDestination();
                return 0;
            }
            var origins = creep.room.getFlagsByType(FLAG_ROADORIGIN);
            if (!origins.length) {
                //creep.room.createFlagByType(FLAG_ROADORIGIN, creep.pos.x, creep.pos.y);
                console.log(creep.name+ ': created flag in ' + creep.room.name);
            }
            // If we are there, but >=75% full, go back.
            if (creep.carry.energy > (creep.carryCapacity * 0.75)) {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_BACK;
                //console.log(creep.name + ' -> ' + creep.memory[MEMORY_DEST] + ': expected: ' + creep.memory[MEMORY_STEPS_EXPECTED] + ' but actual: ' + creep.memory[MEMORY_STEPS_ACTUAL]);
                
                return 0;
            }
            // If we are there, but don't have our container memorized, look to memorize it.
            if (creep.memory[MEMORY_H_CONTAINER] == undefined) {
                var target_source = Game.getObjectById(creep.memory[MEMORY_SOURCE]);
                if (target_source == undefined) {
                    console.log(creep.name + ": Warning, souce " + creep.memory[MEMORY_SOURCE] + " cannot be GOBID." + creep.room.name);
                    return 0;
                }
                var container_search_range = 1;
                var nearby_containers = target_source.pos.findInRange(FIND_STRUCTURES, container_search_range, { filter: { structureType: STRUCTURE_CONTAINER } } ); // Expensive, but only once per 20 ticks if there is no container (already rare)
                var thecontainer = undefined;
                if (nearby_containers.length == 0) {
                    // If there is no container built within 1 tile of our target source, sleep for 20T, then check again.
                    creep.sleepFor(20);
                    creep.say('zzz 20');
                    creep.avoidEdges();
                    return 0;
                }
                // Otherwise, store that container in memory as our container.
                thecontainer = nearby_containers[0];
                creep.memory[MEMORY_H_CONTAINER] = thecontainer.id;
                
                // And finally, issue a warning if there are multiple containers at a source.
                if (nearby_containers.length > 1) {
                    console.log(creep.name + ": warning: multiple containers detected in " + creep.room.name);
                }
                return 0;
            }

            // If we get this far, we are in the right destination room, and we have a container to pick up from.
            // First, check if our memory is still valid. (container might have been destroyed)
            var thecontainer = Game.getObjectById(creep.memory[MEMORY_H_CONTAINER]);
            if (thecontainer == undefined) {
                creep.memory[MEMORY_H_CONTAINER] = undefined;
                return 0;
            }

            // Next, try to withdraw from the container.
            // If we are too far away, move closer.
            var withdraw_result = creep.withdraw(thecontainer, RESOURCE_ENERGY);
            if (withdraw_result == ERR_NOT_IN_RANGE) {
                creep.moveToRUP(thecontainer);
                return 0;
            } else if (withdraw_result == OK) {
                return 0;
            }
            if (creep.carry.energy == creep.carryCapacity) {
                return 0;
            }
            
            // We haven't been able to withdraw from the container. So, look for energy on the floor.
            var drops = creep.getDropsInDist(1);
            if(drops.length){
                creep.say('drops!');
                if (drops[0].resourceType == RESOURCE_ENERGY) {
                    var p_result = creep.pickup(drops[0]);
                    if (p_result == OK) {
                        return 0;
                    }
                }
            }

            // If we get this far, we have a container that we should be able to withdraw from, but we cannot. And there is nothing on the floor, either. Sleep for 10t and try again.
            //console.log(creep.name + ': sleeping due to no nearby resources');
            creep.sleepFor(10);
            creep.say('zzz 10');
            return 0;

        } else if (creep.memory[MEMORY_JOB] == JOB_TRAVEL_BACK) {
            
            // If we are home, get away from the room edge, then check for links.
            if (creep.room.name == creep.memory[MEMORY_HOME]) {
                if (creep.pos.x < 2 || creep.pos.x > 47 || creep.pos.y < 2 || creep.pos.y > 47) {
                    // Continue in a little bit, get off the edge before changing state.
                } else {
                    creep.memory[MEMORY_JOB] = JOB_USELINK;
                }
                creep.moveToRUP(creep.getHomePos());
                return 0;
            }

            // While en route, look for roads to repair - if we can.
            if(creep.carry.energy > 0) {
                if (creep.memory[MEMORY_HAULERSLEEP] != undefined && creep.memory[MEMORY_HAULERSLEEP] > 0) {
                    creep.memory[MEMORY_HAULERSLEEP]--;
                } else {
    
                    var nearby = creep.getStructuresInDist(2);
                    //console.log(creep.name + ': nearby: ' + nearby.length);
                    var repaired_something = false;
                    if (nearby.length) {
                        var r
                        for (var i = 0; i < nearby.length; i++) {
                            var thetarget = nearby[i];
                            //console.log(creep.name + ': nearby: ' + JSON.stringify(thetarget.structure));
                            if (thetarget.structure.structureType != STRUCTURE_ROAD) {
                                //console.log(creep.name + ' skip non-road');
                                continue;
                            }
                            if (thetarget.structure.hits == thetarget.structure.hitsMax) {
                                //console.log(creep.name + ' skip full-health');
                                continue;
                            }
                            var irn = thetarget.structure.inRoadNetwork();
                            if (irn) {
                                //new RoomVisual(creep.room.name).line(creep.pos, thetarget.structure.pos, {color: 'green'});
                            } else {
                                //new RoomVisual(creep.room.name).line(creep.pos, thetarget.structure.pos, {color: 'red'});
                                continue;
                            }
                            var retval = creep.repair(thetarget.structure);
                            repaired_something = true;
                            //console.log(creep.name + ' repairing ROAD: ' + retval);
                            break;
                        }
                    }
                    if (!repaired_something) {
                        if(creep.memory[MEMORY_HAULERSLEEP] == undefined) {
                            creep.memory[MEMORY_HAULERSLEEP] = 0;
                        }
                        creep.memory[MEMORY_HAULERSLEEP]++;
                    }
                }
            }
            creep.moveToRUP(creep.getHomePos());

        } else if (creep.memory[MEMORY_JOB] == JOB_USELINK) {
            var nearby_structures = creep.getStructuresInDist(5);
            if(nearby_structures.length) {
                for (var i = 0; i < nearby_structures.length; i++) {
                    var thetarget = nearby_structures[i];
                    if (thetarget.structureType != STRUCTURE_LINK) {
                        continue;
                    }
                    if (thetarget.energy == thetarget.energyCapacity) {
                        continue;
                    }
                    if (!thetarget.isActive()) {
                        continue;
                    }
                    var result = creep.transfer(thetarget, RESOURCE_ENERGY);
                    if (result == ERR_NOT_IN_RANGE) {
                        creep.moveToRUP(thetarget);
                        return 0;
                    }
                    break;
                }
            }
            creep.memory[MEMORY_JOB] = JOB_RETURN;

        } else if (creep.memory[MEMORY_JOB] == JOB_RETURN) {
            if (creep.room.name != creep.memory[MEMORY_HOME]) {
                creep.say('ret->H');
                var newpos = creep.getHomePos();
                creep.moveToRUP(newpos);
               return 0;
            }
            if (creep.room.storage == undefined || !creep.room.storage.isActive()) {
                var try_return = jobReturnresources.run(creep, 1, 1, 1, 1, 1, 0);
                if (try_return == -1) { // if it is not possible to return resources, upgrade instead.
                    creep.memory[MEMORY_JOB] = JOB_BUILD;
                    return;
                }
            } else if (jobReturnresources.run(creep, 1, 1, 0.5, 1, 1, 1) == -1) {
                // Sleep for a few seconds, then try again.
                creep.say('zzz 5');
                creep.sleepFor(5);
            }
            if(creep.carry.energy == 0) {
                creep.memory[MEMORY_JOB] = JOB_RENEW;                
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_BUILD) {
            if(creep.carry.energy == 0) {
                creep.memory[MEMORY_JOB] = JOB_RENEW;
                return;
            }
            if (!jobBuild.run(creep)) {
                creep.memory[MEMORY_JOB] = JOB_UPGRADE;
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_RENEW) {
            if (creep.ticksToLive > 500 || !creep.getRenewEnabled()) {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
                creep.memory[MEMORY_STEPS_ACTUAL] = 0;
            } else {
                jobRenew.run(creep);
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_UPGRADE) {
            if(creep.carry.energy == 0) {
                creep.memory[MEMORY_JOB] = JOB_RENEW;
                return;
            }
            var result = jobUpgrade.run(creep);
            if (result != ERR_NOT_IN_RANGE && result != OK) {
                creep.say('U:'+result);
            }
        } else {
            creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
            creep.memory[MEMORY_STEPS_ACTUAL] = 0;
        }
    }
}