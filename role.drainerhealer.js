module.exports = {
    run: function(creep){
        if (creep.room.name == creep.memory.target) {
            if (creep.hits != creep.maxHits) {
                creep.moveTo(new RoomPosition(25, 25, creep.memory.healroom));
            }
        } else if (creep.room.name == creep.memory.healroom) {
            if (creep.hits == creep.maxHits) {
                creep.moveTo(new RoomPosition(25, 25, creep.memory.target));
            }
        } else {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.target));
        }
        creep.heal(creep);
    }
}