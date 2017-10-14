module.exports = {
    run: function(creep){
        if(creep.memory[MEMORY_DEST] != creep.room.name){
            creep.moveTo(new RoomPosition(25, 25, creep.memory[MEMORY_DEST]), {visualizePathStyle: {stroke: '#ffffff'}})
        } else {
            if (creep.memory['nexttarget'] != undefined) {
                if (creep.memory['nexttarget'].length > 0) {
                    creep.memory['target'] = creep.memory['nexttarget'][0];
                    creep.memory['nexttarget'].shift();
                    console.log('SIGNER: ' + creep.name + ' has reached ' + creep.room.name + ', continuing on to ' + creep.memory[MEMORY_DEST]);
                    return;
                }
            }
            if(creep.room.controller) { 
                if (creep.signController(creep.room.controller, creep.memory.sign) == ERR_NOT_IN_RANGE) { 
                    creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#0000ff'}});
                }
            }
        }
    }
}