var jobScavenge = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var source = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {filter: (s) => s.energy > 0});
        if(source != null){
            if (creep.pickup(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#000000'}});
            }
        } else {
            return -1;
        }
    }
};

module.exports = jobScavenge;