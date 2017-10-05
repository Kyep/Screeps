module.exports =  {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.room.name != creep.memory.home) {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.home));
            return 0;
        }
        var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                     return (structure.structureType == STRUCTURE_CONTAINER) && structure.store.energy > 0;
                }
        });
        if (targets.length == 0) {
            targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                     return (structure.structureType == STRUCTURE_STORAGE) && structure.store.energy > 0;
                }
            });
        }
        if(targets.length > 0) {
            var target = creep.pos.findClosestByRange(targets);
            var amount_to_withdraw = Math.min(target.store.energy, creep.carryCapacity - creep.carry.energy);
            var result = creep.withdraw(target, RESOURCE_ENERGY, amount_to_withdraw);
            
            if(result == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_GFS}});
            } else if (result == OK) {
                //console.log(creep.name + ": GFS WITHDRAW: " + amount_to_withdraw);
                creep.adjustEarnings(amount_to_withdraw * -1);
            } else if (result == ERR_BUSY) {
                // creep still being spawned.
            } else {
               console.log(creep.name + ": GFS WITHDRAW ERROR! " + result);
            }
        } else {
            return -1;
        }
        
	}
};
