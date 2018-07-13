"use strict";

var jobRenew = require('job.renew');
var jobPatrol = require('job.patrol');

module.exports = {
    run: function(creep) {

        if (!creep.isAtDestinationRoom()) {
            creep.moveToDestination();
            return;
        }
        if (!creep.memory[MEMORY_BOOSTSALLOWED]) {
            //creep.say('B');

            if (!creep.room.hasAlert()) {
                creep.say('no foe!');
                creep.sleepFor(3);
                return;            
            }
            var myalert = creep.room.getAlertObject();
            //creep.say(myalert['hostileUsername']);
            if (myalert['hostileUsername'] == 'Invader') {
                jobPatrol.run(creep);
                return;
            }
            creep.memory[MEMORY_BOOSTSALLOWED] = true;
        }
        //creep.say('T');
        
        if (creep.gettingBoosts()) {
            return;
        }
        //creep.say('D');

        jobPatrol.run(creep);
    }
};