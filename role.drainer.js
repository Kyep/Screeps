"use strict";

module.exports = {
    run: function(creep){
        var heal_parts = creep.getActiveBodyparts(HEAL);
        if(creep.hits < creep.hitsMax) {
            
            if (heal_parts > 0) {
                creep.heal(creep);
                creep.say('heal');
                return 0;
            }
        }
        if (creep.isAtDestinationRoom()) {
            if (creep.updateDestination()) {
                return;
                creep.notifyWhenAttacked(false);
            }
            creep.redRally();
            if (heal_parts > 0) {
                var hurtfriendly = creep.pos.findClosestByPath(_.filter(creep.room.find(FIND_MY_CREEPS), function(creep){ return (creep.hits < creep.hitsMax) }));
                if (hurtfriendly) {
                    var frange = creep.pos.getRangeTo(hurtfriendly);
                    if (frange == 1) {
                        creep.say('h melee');
                        creep.heal(hurtfriendly);
                    } else if (frange < 4) {
                        creep.say('h range');
                        creep.rangedHeal(hurtfriendly);
                    }
                }
            }
        } else {
            creep.moveToDestination();
        }

    }
}