module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.source == undefined){
            console.log("WARNING: " + creep.name + " has no source!");

        } else {
            var source = creep.pos.findClosestByPath(FIND_SOURCES,{filter: (s) => s.id == creep.memory.source});
            if(source != null){
                var result = creep.harvest(source);
                if (result == ERR_NOT_IN_RANGE || result == ERR_NOT_ENOUGH_RESOURCES) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: COLOR_HARVEST}});
                }
            } else {
                return -1;
            }
        }
	}
};
