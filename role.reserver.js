"use strict";

var jobHide = require('job.hide');

module.exports = {
    run: function(creep){
        if (creep.getShouldHide()) {
            jobHide.run(creep);
        } else if(!creep.isAtDestinationRoom()){
            creep.moveToDestination();
        } else {
            if(creep.room.controller) {
                var result = creep.reserveController(creep.room.controller)
                if (result == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, {reusePath: 15});
                } else if (result == ERR_NOT_OWNER) {
                    //creep.attackController(creep.room.controller); // requires FIVE CLAIM PARTS :(((
                }
            }
        }
    }
}