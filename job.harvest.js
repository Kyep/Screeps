var jobHarvest = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.source == undefined){
            console.log("WARNING: " + creep.name + " has no source!");

        } else {
            var source = creep.pos.findClosestByPath(FIND_SOURCES,{filter: (s) => s.id == creep.memory.source});
            if(source != null){
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                return -1;
            }
        }
	}
};

module.exports = jobHarvest;