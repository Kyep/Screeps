"use strict";

module.exports = {
    run: function(creep) {
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
                    creep.moveTo(mysilo);
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
                creep.moveTo(myterminal);
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
                creep.moveTo(mystorage);
            }
            return;
        }
        creep.say('bored!');

	}
};