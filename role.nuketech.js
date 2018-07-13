"use strict";

module.exports = {
    run: function(creep) {
        
        if (creep.memory[MEMORY_JOB] && creep.memory[MEMORY_JOB] == JOB_RETURN) {
            if (_.sum(creep.carry) > 0) {
                creep.returnToStorage();
            } else {
                delete creep.memory[MEMORY_JOB];
            }
            return;
        }
        
        var silos = creep.room.find(FIND_STRUCTURES, { filter: (structure) => { return ((structure.structureType == STRUCTURE_NUKER));}});
        if (silos.length == 0) {
            creep.say('no silo!');
            return;
        }
        var mysilo = silos[0];
        var resources_needed = [RESOURCE_ENERGY, RESOURCE_GHODIUM];
        for(var i = 0; i < resources_needed.length; i++) {
            if(creep.carry[resources_needed[i]] > 0) {
                var tr = creep.transfer(mysilo, resources_needed[i]);
                if (tr == ERR_NOT_IN_RANGE) {
                    creep.moveToRUP(mysilo);
                } else if (tr == ERR_FULL) {
                    creep.memory[MEMORY_JOB] = JOB_RETURN;
                }
                return;
            }
        }
        var myterminal = creep.room.terminal;
        var mystorage = creep.room.storage;
        var energy_required = mysilo.energyCapacity - mysilo.energy;
        var ghodium_required = mysilo.ghodiumCapacity - mysilo.ghodium;
        if (ghodium_required > 0) {
            var withdraw_amount = ghodium_required;
            if (withdraw_amount > creep.carryCapacity) {
                withdraw_amount = creep.carryCapacity;
            }
            if(myterminal.store[RESOURCE_GHODIUM] < withdraw_amount) {
                creep.say('G short!');
                return;
            }
            var wr = creep.withdraw(myterminal, RESOURCE_GHODIUM);
            if (wr == ERR_NOT_IN_RANGE) {
                creep.moveToRUP(myterminal);
            }
            return;
        } else if (energy_required > 0) {
            var withdraw_amount = energy_required;
            if (withdraw_amount > creep.carryCapacity) {
                withdraw_amount = creep.carryCapacity;
            }
            if(mystorage.store[RESOURCE_ENERGY] < withdraw_amount) {
                creep.say('E short!');
                return;
            }
            var wr = creep.withdraw(mystorage, RESOURCE_ENERGY);
            if (wr == ERR_NOT_IN_RANGE) {
                creep.moveToRUP(mystorage);
            }
            return;
        }
        creep.say('bored!');
        creep.sleepFor(20);

	}
};