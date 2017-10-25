"use strict";

module.exports = {
    run: function(creep) {
        if (creep.memory.mode == undefined) {
            creep.memory.mode = 'standard';
        }
        if (creep.memory.mode == 'clear') {
            if(_.sum(creep.carry) > 0) {
                var keyslist = Object.keys(creep.carry);
                var myterminal = creep.room.terminal;
                //console.log("T: " + keyslist[1]);
                if (creep.transfer(myterminal, keyslist[1]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(myterminal);
                }
                return 0;
            }
            var thelab = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: function(structure){ if(structure.structureType == STRUCTURE_LAB && structure.mineralAmount > 0) { return 1; } else { return 0; } } });
            if (thelab == null || thelab == undefined) {
                return;
            }
            if (thelab.mineralAmount == 0) {
                return;
            }
            if (creep.withdraw(thelab, thelab.mineralType) == ERR_NOT_IN_RANGE) {
                creep.moveTo(thelab);
            }
            return 0;

        }
        //return 0;
        var input_labs = {'59daf99e9e788d67402f810e': RESOURCE_ZYNTHIUM_KEANITE, '59db1bdee7ccce1d3faa8bef': RESOURCE_UTRIUM_LEMERGITE}
        //var input_labs = {'59db1bdee7ccce1d3faa8bef': RESOURCE_HYDROGEN, '59d7d7888d8fe05f258c5bb4': RESOURCE_GHODIUM}
        var reaction_minerals = 750;

        var myterminal = creep.room.terminal;
        for (var labid in input_labs) {
            var lab = Game.getObjectById(labid);
            var rock = input_labs[labid];
            if(_.sum(creep.carry) > 0) {
                if (creep.carry[rock] == undefined) {
                    continue;
                }
                //console.log("CL " + rock + " | " + JSON.stringify(creep.carry));
                if (creep.carry[rock] > 0) {
                    if (creep.transfer(lab, rock) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(lab);
                    }
                }
                return 0;
            } else if (myterminal.store[rock] > 0) {
                if (creep.withdraw(myterminal, rock) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(myterminal);
                }
                return 0;
            }
        }
	}
};