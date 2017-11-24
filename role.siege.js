"use strict";

module.exports = {
    
    run: function(creep) {
        if(!creep.isAtDestinationRoom()){
            creep.moveToDestination();
            return;
        } else if (creep.updateDestination()) {
            return;
        }

        var enemy_creeps = creep.room.find(FIND_HOSTILE_CREEPS); 
        for(var i = 0; i < enemy_creeps.length; i++) {
            var them = enemy_creeps[i];
            if (creep.pos.getRangeTo(them) > 3) {
                continue;
            }
            if (them.getActiveBodyparts(ATTACK) == 0 && them.getActiveBodyparts(RANGED_ATTACK) == 0 && them.getActiveBodyparts(HEAL) == 0) {
                continue;
            }
            target = them;
            if(creep.pos.getRangeTo(target) > 1){
                creep.moveToRUP(target);
            } else {
                creep.attack(target);
            }
            new RoomVisual(creep.room.name).line(creep.pos, target.pos, {color: 'red'});
            return;
        }


        //var redflags = creep.pos.findClosestByPath(FIND_FLAGS, {filter: (f) => f.color == COLOR_RED && f.secondaryColor == COLOR_ORANGE});
        // the above does not work the below does, find out why.
        var redflags = creep.pos.findInRange(FIND_FLAGS, 25, { filter: function(flag){ if(flag.color == COLOR_RED && flag.secondaryColor == COLOR_ORANGE) { return 1; } else { return 0; } } });
        if(redflags.length) {
            var theflag = redflags[0];
            var structures_at = creep.room.lookForAt(LOOK_STRUCTURES, theflag.pos.x, theflag.pos.y, theflag.pos);
        	if(structures_at.length == 0) {
        	    theflag.remove();
        	} else {
        	    var target_structure = structures_at[0];
                if(creep.attack(target_structure) == ERR_NOT_IN_RANGE) {
                    creep.moveToRUP(target_structure);
                }
                return 0;
        	}
        }

        var valid_structure_targets = [STRUCTURE_TOWER, STRUCTURE_SPAWN, STRUCTURE_LINK, STRUCTURE_STORAGE, STRUCTURE_TERMINAL, STRUCTURE_EXTENSION];  // , STRUCTURE_STORAGE, STRUCTURE_TERMINAL, STRUCTURE_LAB, STRUCTURE_RAMPART, 
        //var valid_structure_targets = [STRUCTURE_TOWER, STRUCTURE_SPAWN, STRUCTURE_TERMINAL, STRUCTURE_LAB];  // , STRUCTURE_STORAGE, STRUCTURE_TERMINAL, STRUCTURE_LAB, STRUCTURE_RAMPART, 
        //var valid_structure_targets = [STRUCTURE_TOWER, STRUCTURE_RAMPART, STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_TERMINAL, STRUCTURE_LAB, STRUCTURE_LINK, STRUCTURE_EXTRACTOR];  // , STRUCTURE_STORAGE, STRUCTURE_TERMINAL, STRUCTURE_LAB, STRUCTURE_RAMPART, 
        
        var enemy_structures = creep.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType != STRUCTURE_CONTROLLER}); 
        var valid_targets = [];
        var target = undefined;
        var champ_range = 99999999999999;
        for(var i = 0; i < enemy_structures.length; i++) {
            var them = enemy_structures[i];
            if(!valid_structure_targets.includes(them.structureType)) {
                continue;
            }
            if (them == creep.room.controller) { // yes, this needed.
                continue;
            }
            if (them.owner.username == creep.owner.username) {
                continue;
            }
            valid_targets.push(them);
            var theirrange = creep.pos.getRangeTo(them);
            if (theirrange < champ_range) {
                target = them;
                champ_range = theirrange;
            }
            
        }
        if(!target) {
            target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {filter: (s) => s.structureType != STRUCTURE_CONTROLLER});
        }
        if (target) {
            new RoomVisual(creep.room.name).line(creep.pos, target.pos, {color: 'red'});
            if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveToRUP(target);
            }
        } else {
            var destroy_csites = 1;
            if (creep.room.controller != undefined) {
                if (creep.room.controller.owner != undefined) {
                    if (creep.room.controller.owner.username == creep.owner.username) {
                        destroy_csites = 0;
                    }
                }
            }
            if (destroy_csites) {
                var csites = creep.room.find(FIND_HOSTILE_CONSTRUCTION_SITES);
                if (csites.length) {
                    var csite = creep.pos.findClosestByPath(csites);
                    creep.moveToRUP(csite);
                    creep.attack(csite);
                    return 0;
                }
            }

            if (Game.time % 200 === 0) {
                console.log('ALERT: SIEGE CREEP ' + creep.name + ' IN ' + creep.room.name + ' HAS NO TARGET! GIVE THEM A JOB!');
            }
        }
        creep.redRally();
        /*
        for(var i = 0; i < enemy_structures.length; i++) {
            var them = enemy_structures[i];
            if(!priority_structures.includes(them.structureType)) {
                continue;
            }
            var thepath = creep.pos.findPathTo(creep.pos, them.pos, {maxRooms: 1});
            if (thepath.length) {
                if(target) {
                    var myindex = priority_structures.indexOf(them.structureType);
                    var oldindex = priority_structures.indexOf(target.structureType);
                    if (myindex <= oldindex && them.hits <= target.hits) {
                        console.log('SIEGE: ' + creep.name + ' updates target to ' + them.id + ' because its index ' + myindex + ' and hits ' + them.hits + ' are <= the previous index ' + oldindex + ' and hits ' + target.hits); 
                        target = them;
                    } else {
                        console.log('SIEGE: ' + creep.name + ' IGNORES target to ' + them.id + ' because its index ' + myindex + ' and hits ' + them.hits + ' are <= the previous index ' + oldindex + ' and hits ' + target.hits); 
                    }
                } else {
                    target = them;
                }
            }
        }
        if(!target) {
            target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);
        }
        if(!target) {
            target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        }
        if(target) {
            if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveToRUP(target);
            }
        } else {
            creep.redRally();
            if (Game.time % 20 === 0) {
                console.log('ALERT: SIEGE CREEP ' + creep.name + ' IN ' + creep.room.name + ' HAS NO TARGET! GIVE THEM A JOB!');
            }
        }
        */
    }

};