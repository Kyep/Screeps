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
                //creep.say("HIDE");
                jobHide.run(creep);
            } else if (creep.carry.energy > (creep.carryCapacity /2)) {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_BACK;
            } else {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
            }
        }
        if (creep.memory[MEMORY_JOB] == JOB_TRAVEL_OUT) {
            if (creep.carry.energy == creep.carryCapacity) {
	            creep.memory[MEMORY_JOB] = JOB_TRAVEL_BACK;
	            return 0;
            } else if (creep.room.name != creep.memory[MEMORY_DEST]) {
                creep.moveTo(new RoomPosition(creep.memory[MEMORY_DEST_X], creep.memory[MEMORY_DEST_Y], creep.memory[MEMORY_DEST]), {reusePath: 10})
                return 0;
            }
            if (creep.memory[MEMORY_CONTAINER]) {
                var thecontainer = Game.getObjectById(creep.memory[MEMORY_CONTAINER]);
                if (thecontainer) {
                    if (thecontainer.store.energy > 0) {
                        if (creep.withdraw(thecontainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(thecontainer);
                        }
                    } else {
                        /*
                        var energypile = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 10, {filter: (s) => s.energy > 0});
                        if(energypile != null){
                            if (creep.pickup(energypile) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(energypile, {visualizePathStyle: {stroke: COLOR_SCAVAGE}});
                            }
                        }
                        */
                    }
                } else {
                    creep.memory[MEMORY_CONTAINER] = undefined;
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
            creep.memory[MEMORY_CONTAINER] = thecontainer.id;
        } else if (creep.memory[MEMORY_JOB] == JOB_TRAVEL_BACK) {
            if (creep.room.name == creep.memory[MEMORY_HOME]) {
                creep.memory[MEMORY_JOB] = JOB_USELINK;
                creep.moveTo(new RoomPosition(25,25, creep.memory[MEMORY_HOME]), {reusePath: 10});
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
            creep.moveTo(new RoomPosition(25,25, creep.memory[MEMORY_HOME]));
        } else if (creep.memory[MEMORY_JOB] == JOB_USELINK) {
            if (empire[creep.memory[MEMORY_DEST]].sources[creep.memory[MEMORY_SOURCE]] == undefined) {
                creep.memory[MEMORY_JOB] = JOB_RETURN; 
                console.log(creep.name + 'undefined source: ' + creep.memory[MEMORY_DEST] + ' / ' + creep.memory[MEMORY_SOURCE]);
                return 0;
            }
            var targets = creep.pos.findInRange(FIND_STRUCTURES, 10, {
                filter: function(structure){
                    return (structure.structureType == STRUCTURE_LINK) && (structure.energy < structure.energyCapacity)
                }
            });
            if (!targets.length) {
                creep.memory[MEMORY_JOB] = JOB_RETURN; 
                //console.log(creep.name + 'x ud 2');
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
            if (creep.room.storage == undefined) {
                if (jobReturnresources.run(creep, 1, 1, 1, 1, 1, 0) == -1) { // if room has no storage unit, return to extensions.
                    // wait.
                }
            } else if (jobReturnresources.run(creep, 1, 1, 0.5, 1, 1, 0) == -1) {
                // wait for space to be free.
                creep.say("wait4space");
            }
            if(creep.carry.energy == 0) {
                creep.memory[MEMORY_JOB] = JOB_RENEW;                
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_RENEW) {
            if (creep.ticksToLive > 500 || !creep.getRenewEnabled()) {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
            } else {
                 if(jobRenew.run(creep) == -1) {
                     // we're screwed.
                 }
            }
        } else {
            creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
        }
    }
}