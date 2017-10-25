"use strict";

module.exports = {
    run: function(creep){
        if (creep.isAtDestinationRoom()) {
            if (creep.updateDestination()) {
                return;
            }
            creep.redRally();
        } else {
            creep.moveToDestination();
        }
        if(creep.hits < creep.hitsMax) {
            creep.heal(creep);
        }
    }
}