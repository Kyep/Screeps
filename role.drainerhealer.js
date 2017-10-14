module.exports = {
    run: function(creep){
        if (creep.memory[MEMORY_RALLYROOM] == undefined) {
            console.log(creep.name + ": no healroom defined in memory");
            return -1;
        }
        if (creep.memory[MEMORY_DEST] == undefined) {
            console.log(creep.name + ": no target defined in memory");
            return -1;
        }
        if (creep.room.name == creep.memory[MEMORY_DEST]) {
            if (creep.hits != creep.maxHits) {
                creep.moveTo(new RoomPosition(25, 25, creep.memory[MEMORY_RALLYROOM]));
            }
        } else if (creep.room.name == creep.memory[MEMORY_RALLYROOM]) {
            if (creep.hits == creep.maxHits) {
                creep.moveTo(new RoomPosition(25, 25, creep.memory[MEMORY_DEST]));
            }
        } else {
            creep.moveTo(new RoomPosition(25, 25, creep.memory[MEMORY_DEST]));
        }
        creep.heal(creep);
    }
}