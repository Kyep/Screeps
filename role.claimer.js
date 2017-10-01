module.exports = {
    run: function(creep){
        if(creep.memory.target != creep.room.name){
            creep.moveTo(new RoomPosition(25, 25, creep.memory.target), {visualizePathStyle: {stroke: '#ffffff'}})
        }else{
            if(creep.room.controller) {
                if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.memory.expiresAt += 1
                    creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#0000ff'}});
                }
            }
        }
    }
}