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
        if(target) {
            result = creep.attack(target);
            if(result == OK){
                // all good
            } else if(result == ERR_NOT_IN_RANGE){
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
            } else if(result == ERR_INVALID_TARGET){
                console.log(creep.name + ' targets: ' + target + ' UNATTACKABLE!');
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
            }
        } else {
            //console.log(creep.name + ' NO TARGET IN ' + creep.room.name);
            if (creep.pos.x < 3 || creep.pos.x > 46 || creep.pos.y < 3 || creep.pos.y > 46) {
                creep.moveTo(25, 25, creep.room);
            }
            return -1;
        }
    }
};

module.exports = jobPatrol;