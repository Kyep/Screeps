var jobPatrol = {

    /** @param {Creep} creep **/
    run: function(creep) {
        target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        if(!target) {
            //console.log(creep.name + ' searching hostile structures');
            target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);
        }
        if(!target) {
            //console.log(creep.name + ' searching hostile spawns');
            target = creep.pos.findClosestByPath(FIND_HOSTILE_SPAWNS);
        }
        //console.log(creep.getActiveBodyparts(RANGED_ATTACK));
        var melee_parts = creep.getActiveBodyparts(ATTACK);
        var ranged_parts = creep.getActiveBodyparts(RANGED_ATTACK);
        var heal_parts = creep.getActiveBodyparts(HEAL);
        
        if(target) {
            result = OK
            if (ranged_parts > 0 ) { result = creep.rangedAttack(target) }
            if (melee_parts > 0 ) { 
                result = creep.attack(target); 
            } else {
                result = creep.heal(creep);
            }
            if(result == OK){
                // all good
            } else if(result == ERR_NOT_IN_RANGE){
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                if (heal_parts > 0) { 
                    creep.heal(creep);
                }
            } else if(result == ERR_INVALID_TARGET){
                console.log(creep.name + ' targets: ' + target + ' UNATTACKABLE!');
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
            }
        } else {
            if (creep.room.controller.owner.username != overlord) {
                var csites = creep.room.find(FIND_CONSTRUCTION_SITES);
                if (csites.length) {
                    csite = creep.pos.findClosestByPath(csites);
                    creep.moveTo(csite, {visualizePathStyle: {stroke: '#ff0000'}});
                    return 0;
                }
            }
            //console.log(creep.name + ' NO TARGET IN ' + creep.room.name);
            if (creep.pos.x < 3 || creep.pos.x > 46 || creep.pos.y < 3 || creep.pos.y > 46) {
                creep.moveTo(25, 25, creep.room);
            }
            return -1;
        }
    }
};

module.exports = jobPatrol;