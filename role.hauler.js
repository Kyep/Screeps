var jobReturnresources = require('job.returnresources');
var jobRenew = require('job.renew');

module.exports = {
    run: function(creep) {
        if (creep.memory.target == undefined && creep.memory.source != undefined) {
            var source = Game.getObjectById(creep.memory.source);
            if(source) {
                console.log("WARN: hauler " + creep.name + " was given auto-generated target of " + source.room.name + " because they lacked one.");
                creep.memory.target = source.room.name;
            } else {
                console.log("WARN: hauler " + creep.name + " has no source with: " + creep.memory.source);
            }
        }

        if (creep.memory.job == JOB_TRAVEL_OUT) {
            if (creep.carry.energy == creep.carryCapacity) {
	            creep.memory.job = JOB_TRAVEL_BACK;
            } else if (creep.memory.target in Memory.sectors_under_attack || creep.memory.home in Memory.sectors_under_attack) {
                creep.moveTo(new RoomPosition(empire[creep.memory.home]['safespot']['x'], empire[creep.memory.home]['safespot']['y'], creep.memory.home));
                creep.say('🚧 hiding!');
            } else if (creep.room.name != creep.memory.target) {
                creep.moveTo(new RoomPosition(creep.memory.target_x, creep.memory.target_y, creep.memory.target))
            } else {
                var target_source = Game.getObjectById(creep.memory.source);
                if (target_source == undefined) {
                    console.log("Warning, souce " + creep.memory.source + " cannot be GOBID.");
                }
                var container_search_range = 3;
                var nearby_containers = target_source.pos.findInRange(FIND_STRUCTURES, container_search_range, { filter: { structureType: STRUCTURE_CONTAINER } } );
                if (nearby_containers.length) {
                    //console.log(creep.name + " in " + creep.room.name + " got target container: " + nearby_containers[0].id);
                    var target_container = nearby_containers[0];
                    if (creep.withdraw(target_container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target_container);
                    }
                } else {
                    //console.log(creep.name + " in " + creep.room.name + " found no container.");
                    creep.room.visual.circle(target_source.pos, {fill: 'transparent', radius: container_search_range, stroke: 'yellow'});
                    if (creep.pos.getRangeTo(target_source) > 2) {
                        creep.moveTo(target_source);
                    }
                }
            }
        } else if (creep.memory.job == JOB_TRAVEL_BACK) {
            if (creep.memory.home in Memory.sectors_under_attack) {
                // do nothing, only han solo can run blockades and live.
            } else if (creep.room.name == creep.memory.home) {
                creep.memory.job = JOB_RETURN;
            } else {
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
                creep.moveTo(new RoomPosition(25,25, creep.memory.home));
            }
        } else if (creep.memory.job == JOB_RETURN) {
            if (jobReturnresources.run(creep, 1, 1, 0.6, 1, 1, 1) == -1) {
                // wait for space to be free.
                creep.say("wait4space");
            }
            if(creep.carry.energy == 0) {
                creep.memory.job = JOB_RENEW;                
            }
        } else if (creep.memory.job == JOB_RENEW) {
            if (creep.ticksToLive > 500) {
                creep.memory.job = JOB_TRAVEL_OUT;
            } else {
                 if(jobRenew.run(creep) == -1) {
                     // we're screwed.
                 }
            }
        } else {
            creep.memory.job = JOB_TRAVEL_OUT;
        }
    }
}