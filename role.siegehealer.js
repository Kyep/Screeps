module.exports = {
    run: function(creep) {
        if (creep.memory[MEMORY_JOB] == undefined) {
            if (creep.gettingBoosts()) {
                return;
            }
            var mytank = creep.getTank();
            if (mytank) {
                creep.memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
            } else {
                if(!creep.assignTank()) {
                    creep.say('TANK?');
                    creep.sleepFor(2);
                }
            }
            return;            
        }
        var mytank = creep.getTank();
        if (!mytank) {
            if(creep.assignTank()) {
                return;
            }
            if (creep.isAtDestinationRoom()) {
                creep.memory[MEMORY_ROLE] = 'healer';
            } else {
                creep.memory[MEMORY_ROLE] = 'drainer';
            }
            return;
        } else if (mytank.room.name != creep.room.name) {
            creep.moveTo(mytank);
        }/* else if (!creep.avoidEdges()) {
            creep.moveTo(mytank);
        }*/
        creep.moveTo(mytank);
        var delta_tank = mytank.hitsMax - mytank.hits;
        var delta_me = creep.hitsMax - creep.hits;
        if (delta_me > delta_tank) {
            creep.heal(creep);
        } else {
            creep.heal(mytank);
        }
    }
};