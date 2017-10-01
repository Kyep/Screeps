var jobPatrol = {

    /** @param {Creep} creep **/
    run: function(creep) {
        target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        if(!target) {
            target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);
        }
        if(target) {
            result = creep.attack(target);
            if(result == OK){
                // all good
            } else if(result == ERR_NOT_IN_RANGE){
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
            } 
        } else {
            if (creep.pos.x < 3 || creep.pos.x > 46 || creep.pos.y < 3 || creep.pos.y > 46) {
                creep.moveTo(25, 25, creep.room);
            }
            return -1;
        }
    }
};

module.exports = jobPatrol;