"use strict";

module.exports = {
    
    run: function(creep) {
        
        // Flow:
        // undefined (setup phase) -> JOB_TRAVEL_OUT -> death
        
        var melee_parts = creep.getActiveBodyparts(ATTACK);
        var work_parts = creep.getActiveBodyparts(WORK);
        var ranged_parts = creep.getActiveBodyparts(RANGED_ATTACK);

        var frustration = 0;
        if (creep.memory[MEMORY_FRUSTRATION] == undefined) {
            creep.memory[MEMORY_FRUSTRATION] = 0;
        }
        var frustration = creep.memory[MEMORY_FRUSTRATION];

        var myhealer = creep.getHealer();

        if (creep.memory[MEMORY_JOB] == undefined) {

            if (creep.gettingBoosts()) {
                return;
            }

            if (!creep.memory[MEMORY_FRUSTRATION]) {
                creep.memory[MEMORY_FRUSTRATION] = 1;
            }
            creep.memory[MEMORY_FRUSTRATION]++;

            if(!myhealer) {
                if (creep.memory[MEMORY_FRUSTRATION] < 200) {
                    creep.say('hlr? ' + creep.memory[MEMORY_FRUSTRATION]);
                    return;
                } else {
                    Game.notify(creep.name + ' gave up on trying to find a healer.');
                }
            }
            creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
            creep.memory[MEMORY_FRUSTRATION] = 0;
        }

        if (myhealer && myhealer.room.name == creep.room.name) {
            var therange = creep.pos.getRangeTo(myhealer);
            if (therange >= 2 && Game.time % 25 == 0) {
                return;
            } else if (therange > 2) {
                creep.moveTo(myhealer);
                //myhealer.memory[MEMORY_ROLE] = 'siegehealer';
                //myhealer.memory[MEMORY_TANK] =  creep.name;
                return;
            }
        }
        
        if(!creep.isAtDestinationRoom()){
            creep.moveToDestination();
            return;
        } else if (creep.updateDestination()) {
            return;
        } else if (creep.redRally()) {
            return; // Siege creeps rallying to a flag won't do anything else!
        }
        /*
        var live_enemy_towers = creep.room.getLiveHostileTowers();
        if (live_enemy_towers.length) {
            creep.say('dodge:' + live_enemy_towers.length);
            creep.avoidEdges();
            return;
        }
        */
        
        var target = undefined;


        if (creep.memory[MEMORY_TARGETID] && Game.time % 3 != 0) {
            target = Game.getObjectById(creep.memory[MEMORY_TARGETID]);
            if (!target) {
                creep.memory[MEMORY_TARGETID] = undefined;
                target = undefined;
            }
        }

        /*
        if (melee_parts && !work_parts) {
            creep.avoidEdges();
            target = creep.getClosestHostileCreep();
            if (target) {
                var trange = creep.pos.getRangeTo(target);
                if (trange == 1) {
                    creep.attack(target);
                    return;
                } else if (trange <= 3) {
                    if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_PATROL}});
                    }
                    return;
                }
            }
        }
        */
        
        /*
        */
        
        
        if (ranged_parts) {
            creep.avoidEdges();
            if (!target) {
                target = creep.getClosestHostileStructure();
            }
            if (!target) {
                target = creep.getClosestHostileCreep();
            }
            if (target) {
                creep.memory[MEMORY_TARGETID] = target.id;
                var trange = creep.pos.getRangeTo(target);
                if (trange <= 3) {
                    creep.rangedAttack(target);
                } else {
                    creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_PATROL}});
                }
                return;
            } else {
                target = creep.getClosestHostileConstructionSite();
                if (target) {
                    creep.moveToRUP(target);
                    return;
                }
                creep.say('victory!');
                
                return;
            }
        }


        if (work_parts > 0 || melee_parts > 0) {
            if (!target) {
                var sflags = creep.room.getFlagsByType(FLAG_SIEGETARGET);
                if (sflags.length) {
                    var flag = sflags[0];
                    var objects_here = creep.room.lookAt(flag.pos);
                    var found_any_target = false;
                    for (var k = 0; k < objects_here.length; k++) {
                        var this_obj = objects_here[k]["structure"];
                        if (this_obj && this_obj.hits) {
                            target = this_obj;
                            creep.memory[MEMORY_FRUSTRATION] = 0;
                            found_any_target = true;
                            break;
                        }
                    }
                    if (!found_any_target) {
                        flag.remove();
                    }
                } else {
                    var valid_types = [STRUCTURE_TOWER];
                    //var valid_types = [];
                    //var valid_types2 = [STRUCTURE_SPAWN, STRUCTURE_TOWER];
                    var valid_types2 = [STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_EXTENSION];
                    //var valid_types2 = [STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_STORAGE, STRUCTURE_EXTENSION, STRUCTURE_LINK, STRUCTURE_LAB];
                    var valid_types3 = [STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_STORAGE, STRUCTURE_EXTENSION, STRUCTURE_LINK, STRUCTURE_LAB, STRUCTURE_TERMINAL, STRUCTURE_LINK, STRUCTURE_NUKER, STRUCTURE_OBSERVER, STRUCTURE_EXTRACTOR, STRUCTURE_RAMPART];
                    if (frustration < 100) {
                        target = creep.getClosestHostileStructureInTypes(valid_types);
                    } else if (frustration < 250) {
                        target = creep.getClosestHostileStructureInTypes(valid_types2);
                    } else {
                        target = creep.getClosestHostileStructure();
                        if (!target && melee_parts) {
                            target = creep.getClosestHostileCreep();
                        }
                        if (!target && !IS_ALLY(creep.room.getOwner())) {
                            var targets = creep.room.find(FIND_STRUCTURES, {
                                filter: (structure) => {
                                    return (structure.structureType == STRUCTURE_CONTAINER);
                                }
                            });  
                            if (!targets.length) {
                                targets = creep.room.find(FIND_STRUCTURES, {
                                    filter: (structure) => {
                                        return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_ROAD);
                                    }
                                });
                            }
                            if (targets.length) {
                                target = creep.pos.findClosestByRange(targets);
                            }
                        }
                    }
                }
            }
            if (target) {
                creep.memory[MEMORY_TARGETID] = target.id;
                var atkresult = ERR_NO_BODYPART;
                if (work_parts && !(target instanceof Creep)) {
                    atkresult = creep.dismantle(target);
                } else if (melee_parts) {
                    atkresult = creep.attack(target);
                }
                if (atkresult == ERR_NOT_IN_RANGE) {
                    var movresult = creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_PATROL}});
                    frustration++;
                    creep.memory[MEMORY_FRUSTRATION] = frustration;
                }
                return;
            } else if (frustration < 1000) {
                frustration += 100;
                creep.memory[MEMORY_FRUSTRATION] = frustration;
                creep.sleepFor(1);
            } else {
                target = creep.getClosestHostileConstructionSite();
                if (target) {
                    creep.moveToRUP(target);
                    return;
                } else {
                    creep.sleepFor(3);
                }
            }
        }
        
        creep.avoidEdges();
        return;
        
        
    }

};