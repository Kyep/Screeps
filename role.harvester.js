var jobHarvest = require('job.harvest');
var jobReturnresources = require('job.returnresources');
var jobBuild = require('job.build');
var jobRepair = require('job.repair');
var jobUpgrade = require('job.upgrade');
var jobRenew = require('job.renew');

module.exports = {
    run: function(creep, containermine) {
        if (creep.memory[MEMORY_DEST] == undefined && creep.memory[MEMORY_SOURCE] != undefined) {
            var source = Game.getObjectById(creep.memory[MEMORY_SOURCE]);
            if(source) {
                console.log("WARN: LDH " + creep.name + " was given auto-generated target of " + source.room.name + " because they lacked one.");
                creep.memory[MEMORY_DEST] = source.room.name;
            } else {
                console.log("WARN: LDH " + creep.name + " has no source with: " + creep.memory[MEMORY_SOURCE]);
            }
        }
        if (creep.carry.energy == 0 && creep.memory[MEMORY_JOB] != JOB_TRAVEL_OUT && creep.memory[MEMORY_JOB] != JOB_TRAVEL_BACK && creep.memory[MEMORY_JOB] != JOB_HARVEST && creep.memory[MEMORY_JOB] != JOB_RENEW) {
            if(creep.ticksToLive < 400 && creep.getRenewEnabled()) {
                if(creep.room.name == creep.memory[MEMORY_HOME]) {
                    creep.memory[MEMORY_JOB] = JOB_RENEW;
                    creep.announceJob();
                } else {
                    creep.memory[MEMORY_JOB] = JOB_TRAVEL_BACK;
                   creep.announceJob();
                }
            } else {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
                   creep.announceJob();
            }
        }
        if (creep.memory[MEMORY_JOB] == JOB_TRAVEL_OUT) {
            if (creep.memory[MEMORY_JOURNEYSTART] == undefined ) {
                creep.memory[MEMORY_JOURNEYSTART] = Game.time;
            }
            if (creep.room.name == creep.memory[MEMORY_DEST]) {
	            creep.memory[MEMORY_JOB] = JOB_HARVEST;
                //creep.announceJob();
            } else if (creep.memory[MEMORY_DEST] in Memory.sectors_under_attack || (creep.memory[MEMORY_DEST] != creep.memory[MEMORY_HOME] && creep.memory[MEMORY_HOME] in Memory.sectors_under_attack)) {
                // hide in base.
                /*
                if(creep.ticksToLive < 400) {
                    if(creep.room.name == creep.memory[MEMORY_HOME]) {
                        creep.memory[MEMORY_JOB] = JOB_RENEW;
                        creep.announceJob();
                        return;
                    }
                } */
                // I would rather they not block spawning of combat mobs by renewing.
                // Also, for long attacks, I would rather not pay their energy cost to maintain them.
                var hidex = 25;
                var hidey = 25;
                if (empire[creep.memory[MEMORY_HOME]]['safespot'] != undefined) {
                    if (empire[creep.memory[MEMORY_HOME]]['safespot']['x'] != undefined && empire[creep.memory[MEMORY_HOME]]['safespot']['y'] != undefined) {
                        hidex = empire[creep.memory[MEMORY_HOME]]['safespot']['x'];
                        hidey = empire[creep.memory[MEMORY_HOME]]['safespot']['y'];
                    }
                }
                creep.say('🚧 hiding!');
                creep.moveTo(new RoomPosition(hidex, hidey, creep.memory[MEMORY_HOME]));

            } else {
                if(creep.memory[MEMORY_DEST_X]== undefined || creep.memory[MEMORY_DEST_Y] == undefined) {
                    creep.memory[MEMORY_DEST_X]= 25;
                    creep.memory[MEMORY_DEST_Y] = 25;
                }
                creep.moveTo(new RoomPosition(creep.memory[MEMORY_DEST_X], creep.memory[MEMORY_DEST_Y], creep.memory[MEMORY_DEST]))
                //var exit = creep.room.findExitTo(creep.memory[MEMORY_DEST]);
                //creep.moveTo(creep.pos.findClosestByRange(exit), {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        if (creep.memory[MEMORY_JOB] == JOB_HARVEST) {
            if (creep.memory[MEMORY_DEST] in Memory.sectors_under_attack && creep.memory[MEMORY_DEST] != creep.memory[MEMORY_HOME] && !containermine) {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_BACK;
                creep.announceJob();
            } else if (creep.carry.energy == creep.carryCapacity) { // DO NOT DISABLE THIS OR HARVESTERS WILL GET STUCK AND NEVER RETURN!
                if (containermine) {
                    var nearby_containers = creep.pos.findInRange(FIND_STRUCTURES, 3, { filter: { structureType: STRUCTURE_CONTAINER } } );
                    var full_containers = 0;
                    var thecontainer = undefined;
                    if (nearby_containers.length > 0) {
                        for (i = 0; i < nearby_containers.length; i++) {
                            if(nearby_containers[i].store.energy < nearby_containers[i].storeCapacity) {
                               thecontainer = nearby_containers[i];
                               break;
                            }
                        }
                        //console.log(creep.name, ' nearby container not full');
                        if(thecontainer == undefined) {
                            // we can't store resources anywhere - burn some by repairing the containers a lot.
                            var csites = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 3);
                            if (csites.length) {
                                if(creep.build(csites[0]) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(csites[0], {visualizePathStyle: {stroke: COLOR_BUILD}});
                                }
                            } else {
                                creep.repair(nearby_containers[Math.floor(Math.random() * nearby_containers.length)]);
                                //creep.room.createConstructionSite(creep.pos.x, creep.pos.y, STRUCTURE_CONTAINER);
                            }
                        } else {
                            var result = creep.transfer(thecontainer, RESOURCE_ENERGY)
                            if (result == ERR_NOT_IN_RANGE) {
                                creep.moveTo(thecontainer);
                            } else if (result == OK) {
                                creep.repair(thecontainer);
                            } else if (result == ERR_FULL) {

                            }
                        }
                    } else if (nearby_containers.length == 0) {
                        // check for construction sites and build one if not.
                        var csites = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 3);
                        if (!csites.length) {
                            creep.room.createConstructionSite(creep.pos.x, creep.pos.y, STRUCTURE_CONTAINER);
                        } else {
                            if(creep.build(csites[0]) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(csites[0], {visualizePathStyle: {stroke: COLOR_BUILD}});
                            }
                        }
                    }

                } else {
                    if(creep.room.name == creep.memory[MEMORY_HOME]) {
                        creep.memory[MEMORY_JOB] = JOB_RETURN;
                    } else {
                        creep.memory[MEMORY_CONTAINER] = undefined;
                        creep.memory[MEMORY_JOB] = JOB_BUILD;
                        creep.announceJob();
                    }

                }
            } else {
                creep.moveTo(new RoomPosition(creep.memory[MEMORY_DEST_X], creep.memory[MEMORY_DEST_Y], creep.memory[MEMORY_DEST]))
	            jobHarvest.run(creep);
                
                // TEMPORARY PICK UP DROPPED SHIT CODE
                var source = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {filter: (s) => s.energy > 0});
                if(source != null){
                    if (creep.pickup(source) == ERR_NOT_IN_RANGE) {
                    //creep.moveTo(source, {visualizePathStyle: {stroke: COLOR_SCAVAGE}});
                    }
                }
            }
        }
        if(creep.memory[MEMORY_JOB] == JOB_BUILD) {
            if (jobBuild.run(creep) == -1) {
                if (containermine) {
                    creep.memory[MEMORY_JOB] = JOB_HARVEST;
                    creep.announceJob();                    
                } else if(creep.room.name != creep.memory[MEMORY_HOME]) {
                    creep.memory[MEMORY_JOB] = JOB_TRAVEL_BACK;
                    creep.announceJob();
                } else {
                    if (creep.room.controller) {
                        if (creep.room.controller.level) {
                            if (creep.room.controller.level < 3) {
                                creep.memory[MEMORY_JOB] = JOB_REPAIR;
                                creep.announceJob();
                                return;
                            }
                        }
                    }
                    creep.memory[MEMORY_JOB] = JOB_UPGRADE;
                    creep.announceJob();
                }
            }
	    }
	    if(creep.memory[MEMORY_JOB] == JOB_REPAIR) {
            if (jobRepair.run(creep) == -1) {
                creep.memory[MEMORY_JOB] = JOB_UPGRADE;
                creep.announceJob();
            }
        }
        if(creep.memory[MEMORY_JOB] == JOB_UPGRADE) {
            if (creep.room.name == creep.memory[MEMORY_HOME]) {
                jobUpgrade.run(creep);
            } else { 
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_BACK;
                    creep.announceJob();
            }
        }
	    if(creep.memory[MEMORY_JOB] == JOB_RETURN) {
            // function(creep, fill_spawner, fill_extensions, tower_factor, fill_containers, fill_storage, ext_priority) {
            if (jobReturnresources.run(creep, 1, 1, 0.6, 1, 1, 1) == -1) {
                creep.memory[MEMORY_JOB] = JOB_IDLE;
                creep.announceJob();
            }
	    }
        if (creep.memory[MEMORY_JOB] == JOB_TRAVEL_BACK) {
            if (creep.memory[MEMORY_HOME] in Memory.sectors_under_attack) {
                // don't move towards home while its under attack.
                return;
            }
            if(creep.carry.energy > 0) {
                var targets = creep.room.find(FIND_STRUCTURES, 3, {
                    filter: function(structure){
                        return (structure.hits < structure.hitsMax) && (structure.structureType != STRUCTURE_WALL) && (structure.structureType != STRUCTURE_RAMPART)
                    }
                })
                if(targets.length) {
                    var target = creep.pos.findClosestByRange(targets)
                    //console.log(creep.name + " attempts to repair an object at " + target.pos.x + '/' + target.pos.y);
                    creep.repair(target);
                }
            }
            creep.moveTo(new RoomPosition(25, 25, creep.memory[MEMORY_HOME]))
            if (creep.room.name == creep.memory[MEMORY_HOME]) {
                creep.memory[MEMORY_JOB] = JOB_IDLE;
                creep.announceJob();
            }
	    }

        if (creep.memory[MEMORY_JOB] == JOB_IDLE) {
            if (creep.pos.x < 2 || creep.pos.x > 47 || creep.pos.y < 2 || creep.pos.y > 47) {
                creep.moveTo(25, 25, creep.room);
            }
	        if (creep.room.name != creep.memory[MEMORY_HOME]) {
                creep.moveTo(new RoomPosition(25, 25, creep.memory[MEMORY_HOME]))
                //var exit = creep.room.findExitTo(creep.memory[MEMORY_HOME]);
                //creep.moveTo(creep.pos.findClosestByRange(exit));
            } else if(creep.ticksToLive < 400 && creep.getRenewEnabled()) {
                creep.memory[MEMORY_JOB] = JOB_RENEW;
                creep.announceJob();
            // function(creep, fill_spawner, fill_extensions, tower_factor, fill_containers, fill_storage) {
	        } else if (jobReturnresources.run(creep, 1, 1, 0.3, 1, 1) == -1) {
                creep.memory[MEMORY_JOB] = JOB_BUILD;
                creep.announceJob();
            }
        }
        if (creep.memory[MEMORY_JOB] == JOB_RENEW) {
            if (creep.ticksToLive > 500 || !creep.getRenewEnabled()) {
                if (creep.carry.energy > 0) {
                    creep.memory[MEMORY_JOB] = JOB_RETURN;
                } else {
    	            creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
                    creep.announceJob();
                }
            } else {
                if(jobRenew.run(creep) == -1) {
                    if (creep.carry.energy > 0) { // trying this again, see if it helps avoid them wasting time standing around.
                        creep.memory[MEMORY_JOB] = JOB_RETURN;
                    }// else {
                    //   creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
                    //}
                }
            }
        }
    }
};