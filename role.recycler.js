var jobRecycle = require('job.recycle');

var roleRecycle = {
    run: function(creep) {
        if(creep.memory.home == undefined) {
            creep.memory.home = creep.room.name;
        }
        if(creep.memory.home != creep.room.name){
            creep.moveTo(new RoomPosition(25, 25, creep.memory.home));
        } else {
	        jobRecycle.run(creep);
        }
	}
};

module.exports = roleRecycle;