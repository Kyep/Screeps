module.exports = {
    run: function(creep){
        creep.moveTo(new RoomPosition(25, 25, creep.memory.target));
    }
}