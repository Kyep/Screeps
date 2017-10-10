var jobHarvest = require('job.harvest');
var jobHide = require('job.hide');

module.exports = {
    run: function(creep) {
        // ROLE: Container Harvester, designed for harvesting energy from remote areas.
        //       Two variants, c15harvester and c30harvester. Former is for 1500 capacity sources, latter for 3000 capacity sources.
        //       Both have identical AI, the only difference is size. 
        //       
        // FLOW: JOB_TRAVEL_OUT -> JOB_HARVEST -> EXPIRES FROM TTL.
        // If attacked, -> JOB_HIDE, then back to JOB_TRAVEL_OUT.
        if (creep.memory.job == undefined) {
            creep.memory.job = JOB_TRAVEL_OUT;
        }
        if (creep.getShouldHide()) {
            creep.memory.job = JOB_HIDE;
        }
        if (creep.memory.job == JOB_TRAVEL_OUT) {
            if (creep.memory.journeystart == undefined ) {
                creep.memory.journeystart = Game.time;
            }
            if (creep.room.name == creep.memory.target) {
	            creep.memory.job = JOB_HARVEST;
            } else {
                if(creep.memory.target_x == undefined || creep.memory.target_y == undefined) {
                    creep.memory.target_x = 25;
                    creep.memory.target_y = 25;
                }
                creep.moveTo(new RoomPosition(creep.memory.target_x, creep.memory.target_y, creep.memory.target))
            }
        }
        if (creep.memory.job == JOB_HIDE) {
            if (creep.getShouldHide()) {
                jobHide.run(creep);
            } else {
                creep.memory.job = JOB_TRAVEL_OUT;
            }
        }
        if (creep.memory.job == JOB_HARVEST) {
            var target_x = empire[creep.room.name].sources[creep.memory.source]['target_x'];
            var target_y = empire[creep.room.name].sources[creep.memory.source]['target_y'];
            //console.log(creep.name + " " + creep.memory.source + " " + target_x + " " + target_y)
            if (creep.pos.x != target_x || creep.pos.y != target_y) {
                creep.moveTo(target_x, target_y);
                return;
            }
            jobHarvest.run(creep);
            if (creep.carry.energy == 0) {
                return 0;
            }
            if (creep.memory.container != undefined) {
                var thecontainer = Game.getObjectById(creep.memory.container);
                if (thecontainer) {
                    if (thecontainer.hits < thecontainer.hitsMax) {
                        creep.repair(thecontainer);
                    } else {
                        creep.transfer(thecontainer, RESOURCE_ENERGY);
                    }
                } else {
                    creep.memory.container = undefined;
                }
                return 0;
            }
            var nearby_containers = creep.pos.findInRange(FIND_STRUCTURES, 1, { filter: { structureType: STRUCTURE_CONTAINER } } );
            if (nearby_containers.length > 0) {
                creep.memory.container = nearby_containers[0].id;
                return 0;
            }
            // check for construction sites and build one if not.
            var csites = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 1);
            if (!csites.length) {
                creep.room.createConstructionSite(creep.pos.x, creep.pos.y, STRUCTURE_CONTAINER);
                return 0;
            }
            if(creep.build(csites[0]) == ERR_NOT_IN_RANGE) {
                console.log(creep.name + ': out of place from container');
                creep.moveTo(csites[0], {visualizePathStyle: {stroke: COLOR_BUILD}});
            }
        }
    }
};