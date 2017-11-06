"use strict";

module.exports = {
    run: function(creep) {

        var input_labs = {'59daf99e9e788d67402f810e': RESOURCE_ZYNTHIUM_KEANITE, '59db1bdee7ccce1d3faa8bef': RESOURCE_UTRIUM_LEMERGITE}
        var output_lab = '59d7d7888d8fe05f258c5bb4';
        var output_type = RESOURCE_GHODIUM;
        //var input_labs = {'59db1bdee7ccce1d3faa8bef': RESOURCE_HYDROGEN, '59d7d7888d8fe05f258c5bb4': RESOURCE_GHODIUM}
        var reaction_minerals = 3000;
        
        var myterminal = creep.room.terminal;
        
        if (creep.memory.mode == undefined) {
            creep.memory.mode = 'standard';
        }
        if (creep.memory.mode == 'clear') {
            if(_.sum(creep.carry) > 0) {
                var keyslist = Object.keys(creep.carry);
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
        if (creep.memory.mode == 'output') {
            var lab = Game.getObjectById(output_lab);
            if (creep.carry[output_type] > 0) {
                if (creep.transfer(myterminal, output_type) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(myterminal);
                }
                return 0;
            }
            if (lab.mineralAmount > 0) {
                if (creep.withdraw(lab, output_type) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(lab);
                }
                return 0;
            }
            creep.say('bored');
            return 0;
        }
        //return 0;


        for (var labid in input_labs) {
            var lab = Game.getObjectById(labid);
            var rock = input_labs[labid];
            var amount_needed = lab.mineralCapacity - lab.mineralAmount;
            
            if (amount_needed == 0) {
                if (creep.carry[rock] > 0) {
                    if (creep.transfer(myterminal, rock) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(myterminal);
                    }
                    return;
                }
                continue;
            } else if(_.sum(creep.carry) > 0) {
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
                var amount_to_withdraw = amount_needed;
                if (amount_needed > creep.carryCapacity) {
                    amount_needed = creep.carryCapacity;
                }
                if (creep.withdraw(myterminal, rock, amount_needed) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(myterminal);
                }
                return 0;
            }
        }
	}
};