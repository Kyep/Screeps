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
                    //creep.moveTo(source, {visualizePathStyle: {stroke: COLOR_HARVEST}});
                    creep.moveTo(source);
                } else if (result == OK) {
                    // DO NOT register earnings here. That doesn't account for harvesters who spend their money on the way back repairing roads.
                    if (creep.memory.journeystart != undefined ) {
                        //console.log("Creep " + creep.name + " working on source " + empire[creep.room.name].sources[creep.memory.source]['sourcename'] + " took " + (Game.time - creep.memory.journeystart) + " ticks to get there and start harvesting.");
                        creep.memory.journeystart = undefined;
                    }
                }
            } else {
                return -1;
            }
        }
	}
};
