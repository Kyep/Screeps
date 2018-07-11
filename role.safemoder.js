/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.safemoder');
 * mod.thing == 'a thing'; // true
 */

module.exports = {

     run: function(creep) {
         
        if(!creep.isAtDestinationRoom()){
            creep.moveToDestination();
        }
        if (creep.carry[RESOURCE_GHODIUM] && creep.carry[RESOURCE_GHODIUM] >= 1000) {
            if (creep.generateSafeMode(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
            return true;
        }
        if (creep.room.terminal && creep.room.terminal.store[RESOURCE_GHODIUM] && creep.room.terminal.store[RESOURCE_GHODIUM] >= 1000) {
            if (creep.withdraw(creep.room.terminal, RESOURCE_GHODIUM, 1000) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.terminal);
            }
            return true;
        }
        creep.say('no G?');
        creep.sleepFor(50);
        return false;
     
     
    }

};