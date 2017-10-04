var jobHarvest = require('job.harvest');
var jobReturnresources = require('job.returnresources');
var jobBuild = require('job.build');
var jobRepair = require('job.repair');
var jobUpgrade = require('job.upgrade');
var jobRenew = require('job.renew');

module.exports = {
    run: function(creep) {
        if (creep.memory.target == undefined && creep.memory.source != undefined) {
            var source = Game.getObjectById(creep.memory.source);
            if(source) {
                console.log("WARN: LDH " + creep.name + " was given auto-generated target of " + source.room.name + " because they lacked one.");
                creep.memory.target = source.room.name;
            } else {
                console.log("WARN: LDH " + creep.name + " has no source with: " + creep.memory.source);
            }
        }
        if (creep.carry.energy == 0 && creep.memory.job != JOB_TRAVEL_OUT && creep.memory.job != JOB_TRAVEL_BACK && creep.memory.job != JOB_HARVEST && creep.memory.job != JOB_RENEW) {
            if(creep.ticksToLive < 400) {
                if(creep.room.name == creep.memory.home) {
                    creep.memory.job = JOB_RENEW;
                    creep.announceJob();
                } else {
                    creep.memory.job = JOB_TRAVEL_BACK;
                   creep.announceJob();
                }
            } else {
                creep.memory.job = JOB_TRAVEL_OUT;
                   creep.announceJob();
            }
        }
        if (creep.memory.job == JOB_TRAVEL_OUT) {
            if (creep.room.name == creep.memory.target) {
	            creep.memory.job = JOB_HARVEST;
                //creep.announceJob();
            } else if (creep.memory.target in Memory.sectors_under_attack) {
                // hide in base.
                creep.say('🚧 hiding!');
                creep.moveTo(new RoomPosition(25, 25, creep.memory.home))

            } else {
                if(creep.memory.target_x == undefined || creep.memory.target_y == undefined) {
                    creep.memory.target_x = 25;
                    creep.memory.target_y = 25;
                }
                creep.moveTo(new RoomPosition(creep.memory.target_x, creep.memory.target_y, creep.memory.target), {visualizePathStyle: {stroke: '#ffffff'}})
                //var exit = creep.room.findExitTo(creep.memory.target);
                //creep.moveTo(creep.pos.findClosestByRange(exit), {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        if (creep.memory.job == JOB_HARVEST) {
            if (creep.memory.target in Memory.sectors_under_attack && creep.memory.target != creep.memory.home) {
                creep.memory.job = JOB_TRAVEL_BACK;
                creep.announceJob();
            } else if (creep.carry.energy == creep.carryCapacity) { // DO NOT DISABLE THIS OR HARVESTERS WILL GET STUCK AND NEVER RETURN!
                creep.memory.job = JOB_BUILD;
                creep.announceJob();
            } else {
                creep.moveTo(new RoomPosition(creep.memory.target_x, creep.memory.target_y, creep.memory.target), {visualizePathStyle: {stroke: '#ffffff'}})
	            jobHarvest.run(creep);
            }
        }
        if(creep.memory.job == JOB_BUILD) {
            if (jobBuild.run(creep) == -1) {
                if(creep.room.name == creep.memory.home) {
                    creep.memory.job = JOB_RETURN;
                    creep.announceJob();
                } else {
                    //creep.memory.job = JOB_REPAIR;
                    //creep.announceJob();
                    creep.memory.job = JOB_TRAVEL_BACK;
                    creep.announceJob();
                }
            }
	    }
	    if(creep.memory.job == JOB_REPAIR) {
            if (jobRepair.run(creep) == -1) {
                creep.memory.job = JOB_TRAVEL_BACK;
                    creep.announceJob();
            }
        }
        if(creep.memory.job == JOB_UPGRADE) {
            if (creep.room.name == creep.memory.home) {
                jobUpgrade.run(creep);
            } else { 
                creep.memory.job = JOB_TRAVEL_BACK;
                    creep.announceJob();
            }
        }
	    if(creep.memory.job == JOB_RETURN) {
            // function(creep, fill_spawner, fill_extensions, tower_factor, fill_containers, fill_storage) {
            if (jobReturnresources.run(creep, 1, 1, 0.5, 1, 1) == -1) {
                creep.memory.job = JOB_IDLE;
                creep.announceJob();
            }
	    }
        if (creep.memory.job == JOB_TRAVEL_BACK) {
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
            creep.moveTo(new RoomPosition(25, 25, creep.memory.home))
            if (creep.room.name == creep.memory.home) {
                creep.memory.job = JOB_IDLE;
                creep.announceJob();
            }
	    }

        if (creep.memory.job == JOB_IDLE) {
            if (creep.pos.x < 2 || creep.pos.x > 47 || creep.pos.y < 2 || creep.pos.y > 47) {
                creep.moveTo(25, 25, creep.room);
            }
	        if (creep.room.name != creep.memory.home) {
                creep.moveTo(new RoomPosition(25, 25, creep.memory.home))
                //var exit = creep.room.findExitTo(creep.memory.home);
                //creep.moveTo(creep.pos.findClosestByRange(exit));
            } else if(creep.ticksToLive < 400) {
                creep.memory.job = JOB_RENEW;
                creep.announceJob();
            // function(creep, fill_spawner, fill_extensions, tower_factor, fill_containers, fill_storage) {
	        } else if (jobReturnresources.run(creep, 1, 1, 0.3, 1, 1) == -1) {
                creep.memory.job = JOB_BUILD;
                creep.announceJob();
            }
        }
        if (creep.memory.job == JOB_RENEW) {
            if (creep.ticksToLive > 500) {
                if (creep.carry.energy > 0) {
                    creep.memory.job = JOB_RETURN;
                } else {
    	            creep.memory.job = JOB_TRAVEL_OUT;
                    creep.announceJob();
                }
            } else {
                if(jobRenew.run(creep) == -1) {
                    if (creep.carry.energy > 0) { // trying this again, see if it helps avoid them wasting time standing around.
                        creep.memory.job = JOB_RETURN;
                    }// else {
                    //   creep.memory.job = JOB_TRAVEL_OUT;
                    //}
                }
            }
        }
    }
};