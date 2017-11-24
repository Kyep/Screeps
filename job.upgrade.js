"use strict";

module.exports = {

    run: function(creep) {
        // do not check for target room here. It will cause LD harvesters who return and try to upgrade to try to wander back.
        var aresult = creep.upgradeController(creep.room.controller);
        if(aresult == ERR_NOT_IN_RANGE) {
           creep.moveToRUP(creep.room.controller);
        }
        return aresult;
	}
};
