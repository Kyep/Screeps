"use strict";

var jobRenew = require('job.renew');
var jobPatrol = require('job.patrol');

module.exports = {
    run: function(creep) {

        if (!creep.isAtDestinationRoom()) {
            creep.moveToDestination();
            return;
        }

        /*
        if (!ROOM_UNDER_ATTACK(creep.room.name)) {
            creep.say('no foe!');
            creep.sleepFor(3);
            return;
        }
        */

        if (!creep.memory[MEMORY_BOOSTSALLOWED]) {
            creep.memory[MEMORY_BOOSTSALLOWED] = true;
        }

        if (creep.gettingBoosts()) {
            return;
        }
        
        jobPatrol.run(creep);
        creep.say('patrol...');
    }
};