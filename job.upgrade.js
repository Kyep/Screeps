var jobUpgrade = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.room.name != creep.memory.target) {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.target));
            return 0;
        }
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
           creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#0000ff'}});
        }
	}
};

module.exports = jobUpgrade;