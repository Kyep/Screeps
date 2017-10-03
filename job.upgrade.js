var jobUpgrade = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // do not check for target room here. It will cause LD harvesters who return and try to upgrade to try to wander back.
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
           creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#0000ff'}});
        }
	}
};

module.exports = jobUpgrade;