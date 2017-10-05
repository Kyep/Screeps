module.exports = {
    
    run: function(creep) {
        //return;
        //if(creep.room.name == 'W53S20') { return }
        
        if(creep.room.name != creep.memory['target']) {
            
            creep.moveTo(new RoomPosition(25, 25, creep.memory.target), {visualizePathStyle: {stroke: '#ff0000'}})
            return;
        } else if (creep.memory['nexttarget'] != undefined) {
            if (creep.memory['nexttarget'].length > 0) {
                creep.memory['target'] = creep.memory['nexttarget'][0];
                creep.memory['nexttarget'].shift();
                console.log("SIEGE: " + creep.name + " has reached " + creep.room.name + ", continuing on to " + creep.memory.target);
                return;
            }
        }

        var enemy_creeps = creep.room.find(FIND_HOSTILE_CREEPS); 
        var enemy_structures = creep.room.find(FIND_STRUCTURES); // HOSTILE_
        var priority_structures = [STRUCTURE_TOWER, STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_RAMPART];
        var target = undefined;

        for(var i = 0; i < enemy_creeps.length; i++) {
            var them = enemy_creeps[i];
            if (creep.pos.getRangeTo(them) > 3) {
                continue;
            }
            if (them.getActiveBodyparts(ATTACK) == 0 && them.getActiveBodyparts(RANGED_ATTACK) == 0) {
                continue;
            }
            var thepath = creep.pos.findPathTo(creep.pos, them.pos, {maxRooms: 1});
            if (thepath.length) {
                target = them;
                if(creep.pos.getRangeTo(target) > 1){
                    creep.moveTo(target);
                } else {
                    creep.attack(target);
                }
                return;
            }
        }

        for(var i = 0; i < enemy_structures.length; i++) {
            var them = enemy_structures[i];
            if(!priority_structures.includes(them.structureType)) {
                //console.log
                continue;
            }
            var thepath = creep.pos.findPathTo(creep.pos, them.pos, {maxRooms: 1});
            if (thepath.length) {
                if(target) {
                    var myindex = priority_structures.indexOf(them.structureType);
                    var oldindex = priority_structures.indexOf(target.structureType);
                    if (myindex <= oldindex && them.hits <= target.hits) {
                        target = them;
                        console.log("SIEGE: " + creep.name + " updates target to " + target.id + " because its index " + myindex + " and hits " + target.hits + " are <= the previous index " + last_structure_index + " and hits " + last_structure_hits); 
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
            //console.log("SIEGE: " + creep.name + " TARGETTING: " + target.id);
            var dir = creep.pos.getDirectionTo(target);
            //console.log(JSON.stringify(target));
            if(creep.pos.getRangeTo(target) > 1){
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                //creep.move(dir);
            } else {
                creep.attack(target);
            }
        } else {
            console.log("ALERT: SIEGE CREEP " + creep.name + " IN " + creep.room.name + " HAS NO TARGET! REASSIGN THEM!");
        }
        
    }

};