var jobHarvest = require('job.harvest');
var jobReturnresources = require('job.returnresources');
var jobBuild = require('job.build');
var jobRepair = require('job.repair');
var jobUpgrade = require('job.upgrade');
var jobRenew = require('job.renew');

module.exports = {
    run: function(creep) {
        //if no energy, then set to not working
        //if(!creep.memory.job) {
        //    creep.memory.job = 'harvest';
        //}
        if (creep.memory.target == undefined && creep.memory.source != undefined) {
            var source = Game.getObjectById(creep.memory.source);
            if(source) {
                console.log("WARN: LDH " + creep.name + " was given auto-generated target of " + source.room.name + " because they lacked one.");
                creep.memory.target = source.room.name;
            } else {
                console.log("WARN: LDH " + creep.name + " has no source with: " + creep.memory.source);
            }
        }
        if (creep.memory.job != 'travel-out' && creep.memory.job != 'travel-back' && creep.memory.job != 'harvest' && creep.memory.job != 'renew' && creep.carry.energy == 0) {
            if(creep.ticksToLive < 400) {
                if(creep.room.name == creep.memory.home) {
                    creep.memory.job = 'renew';
                    creep.say('🔄 renew');
                } else {
                    creep.memory.job = 'travel-back';
                    creep.say('🚧 go home');
                }
            } else {
                creep.memory.job = 'travel-out';
                creep.say('🔄 travel');
            }
        }
        if (creep.memory.job == 'travel-out') {
            if (creep.memory.target in Memory.sectors_under_attack) {
                // hide in base.
                creep.say('🚧 hiding!');
                creep.moveTo(new RoomPosition(7, 25, creep.memory.home))
            } else if (creep.room.name == creep.memory.target) {
	            creep.memory.job = 'harvest';
                creep.say('🔄 harvest');
            } else {
                if(creep.memory.target_x == undefined || creep.memory.target_y == undefined) {
                    creep.memory.target_x = 25;
                    creep.memory.target_y = 25;
                }
                creep.moveTo(new RoomPosition(creep.memory.target_x, creep.memory.target_y, creep.memory.target), {visualizePathStyle: {stroke: '#ffffff'}})
                //var exit = creep.room.findExitTo(creep.memory.target);
                //creep.moveTo(creep.pos.findClosestByRange(exit), {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else if (creep.memory.job == 'harvest') {
            if (creep.memory.target in Memory.sectors_under_attack) {
                creep.memory.job = 'travel-back';
                creep.say('🚧 flee!');
            } else if (creep.carry.energy == creep.carryCapacity) {
                creep.memory.job = 'build';
                creep.say('🚧 build');
            } else {
	            jobHarvest.run(creep);
            }
        } else if(creep.memory.job == 'build') {
            if (jobBuild.run(creep) == -1) {
                if(creep.room.name == creep.memory.home) {
                    creep.memory.job = 'upgrade';
                    creep.say('🚧 upgrade');
                } else {
                    creep.memory.job = 'repair';
                    creep.say('🚧 repair');
                }
            }
	    } else if(creep.memory.job == 'repair') {
            if (jobRepair.run(creep) == -1) {
                creep.memory.job = 'travel-back';
                creep.say('🚧 travel-back');
            }
        } else if(creep.memory.job == 'upgrade') {
            jobUpgrade.run(creep);
        } else if (creep.memory.job == 'travel-back') {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.home))
            if (creep.room.name == creep.memory.home) {
                creep.memory.job = 'athome';
                creep.say('🔄 at home');
            }
	    } else if (creep.memory.job == 'athome') {
	        if (creep.room.name != creep.memory.home) {
                creep.moveTo(new RoomPosition(25, 25, creep.memory.home))
                //var exit = creep.room.findExitTo(creep.memory.home);
                //creep.moveTo(creep.pos.findClosestByRange(exit));
            } else if(creep.ticksToLive < 400) {
                creep.memory.job = 'renew';
                creep.say('🔄 renew');
	        } else if (jobReturnresources.run(creep) == -1) {
                creep.memory.job = 'build';
                creep.say('🔄 build');
            }
        } else if (creep.memory.job == 'renew') {
            if (creep.ticksToLive > 800) {
                if (creep.carry.energy > 0) {
                    creep.memory.job = 'athome';
                } else {
    	            creep.memory.job = 'travel-out';
                    creep.say('🔄 travel-out');
                }
            } else {
                if(jobRenew.run(creep) == -1) {
                    //if (creep.carry.energy > 0) {
                    //    creep.memory.job = 'athome';
                    //} else {
                    //   creep.memory.job = 'travel-out';
                    //}
                }
            }
        } else {

            
        }
    }
};