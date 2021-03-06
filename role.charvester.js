"use strict";

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
        if(Game.time % 15 === 0) {
            if (creep.getShouldHide()) {
                creep.memory[MEMORY_JOB] = JOB_HIDE;
            }
        }
        if (creep.memory[MEMORY_JOB] == JOB_TRAVEL_OUT) {
            if (creep.memory[MEMORY_JOURNEYSTART] == undefined ) {
                creep.memory[MEMORY_JOURNEYSTART] = Game.time;
            }
            if (creep.isAtDestination()) {
	            creep.memory[MEMORY_JOB] = JOB_HARVEST;
            } else {
                creep.moveToDestination();
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_HIDE) {
            if (creep.getShouldHide()) {
                jobHide.run(creep);
            } else {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
            }
        } else if (creep.memory[MEMORY_JOB] == JOB_HARVEST) {

            /*if (!creep.isAtDestination()) {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
                creep.avoidEdges();
                return;
            }*/
            var harvestresult = jobHarvest.run(creep);
            if (harvestresult == ERR_NOT_ENOUGH_ENERGY) {
                var source = Game.getObjectById(creep.memory[MEMORY_SOURCE]);
                if (source) {
                    creep.sleepFor(source.ticksToRegeneration);
                }
            }
            if (creep.carry.energy == 0) {
                return 0;
            }
            if (creep.memory[MEMORY_CONTAINER] != undefined) {
                var thecontainer = Game.getObjectById(creep.memory[MEMORY_CONTAINER]);
                if (thecontainer) {
                    if (thecontainer.hits < thecontainer.hitsMax) {
                        creep.repair(thecontainer);
                    } else {
                        creep.transfer(thecontainer, RESOURCE_ENERGY);
                    }
                    if (harvestresult == ERR_NOT_ENOUGH_ENERGY) {
                        creep.sleepFor(25);   
                    }
                } else {
                    delete creep.memory[MEMORY_CONTAINER];
                }
                return 0;
            }
            //console.log(creep.name + ' scan');
            var nearby_containers = creep.pos.findInRange(FIND_STRUCTURES, 1, { filter: { structureType: STRUCTURE_CONTAINER } } );
            if (nearby_containers.length > 0) {
                creep.memory[MEMORY_CONTAINER] = nearby_containers[0].id;
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
                creep.moveToRUP(csites[0]);
            }
        } else {
            creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
        }
    }
};