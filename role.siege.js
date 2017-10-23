"use strict";

module.exports = {
    
    run: function(creep) {

        if(creep.room.name != creep.memory[MEMORY_DEST]) {
            creep.moveTo(new RoomPosition(25, 25, creep.memory[MEMORY_DEST]));
            return;
        } else if (creep.pos.x < 1 || creep.pos.x > 48 || creep.pos.y < 1 || creep.pos.y > 48) {
            creep.moveTo(25, 25, creep.room);
            return;
        } else if (creep.memory[MEMORY_NEXTDEST] != undefined) {
            if (creep.memory[MEMORY_NEXTDEST].length > 0) {
                creep.memory[MEMORY_DEST] = creep.memory[MEMORY_NEXTDEST][0];
                creep.memory[MEMORY_NEXTDEST].shift();
                console.log('SIEGE: ' + creep.name + ' has reached ' + creep.room.name + ', continuing on to ' + creep.memory[MEMORY_DEST]);
                return;
            }
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
                creep.moveTo(target);
            } else {
                creep.attack(target);
            }
            new RoomVisual(creep.room.name).line(creep.pos, target.pos, {color: 'red'});
            return;
        }

        var valid_structure_targets = [STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_TERMINAL, STRUCTURE_LAB]; 
        //[STRUCTURE_TOWER, STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_TERMINAL, STRUCTURE_LAB]; // be careful with rampart. STRUCTURE_CONTAINER, STRUCTURE_RAMPART
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
            valid_targets.push(them);
            var theirrange = creep.pos.getRangeTo(them);
            if (theirrange < champ_range) {
                target = them;
                champ_range = theirrange;
            }
            
        }
        if (target) {
            new RoomVisual(creep.room.name).line(creep.pos, target.pos, {color: 'red'});
            if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
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
                    csite = creep.pos.findClosestByPath(csites);
                    creep.moveTo(csite, {visualizePathStyle: {stroke: COLOR_PATROL}});
                    creep.attack(csite);
                    return 0;
                }
            }

            if (Game.time % 20 === 0) {
                console.log('ALERT: SIEGE CREEP ' + creep.name + ' IN ' + creep.room.name + ' HAS NO TARGET! GIVE THEM A JOB!');
            }
        }
        return 0;
            

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
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
            }
        } else {
            if (Game.time % 20 === 0) {
                console.log('ALERT: SIEGE CREEP ' + creep.name + ' IN ' + creep.room.name + ' HAS NO TARGET! GIVE THEM A JOB!');
            }
        }
        
    }

};