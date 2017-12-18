module.exports = {
    run: function(creep) {
        var mytank = creep.getTank();
        if (!mytank) {
            if(!creep.assignTank()) {
                creep.say('zzz');
                creep.sleepFor(3);
            }
            return;
        }
        if (mytank.room.name != creep.room.name) {
            creep.moveTo(mytank);
        } else if (!creep.avoidEdges()) {
            creep.moveTo(mytank);
        }
        var delta_tank = mytank.hitsMax - mytank.hits;
        var delta_me = creep.hitsMax - creep.hits;
        if (delta_me > delta_tank) {
            creep.heal(creep);
        } else {
            creep.heal(mytank);
        }
    }
};