module.exports =  {

    /** @param {Creep} creep **/
run: function(creep) {
        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if(targets.length) {
            var target = creep.pos.findClosestByRange(targets)
            if(creep.build(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#0000ff'}});
            }
        } else {
            return -1;
        }
	}
};
