/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.labtech');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    run: function(creep) {
        //return 0;
        var input_labs = {'59daf99e9e788d67402f810e': RESOURCE_ZYNTHIUM_KEANITE, '59db1bdee7ccce1d3faa8bef': RESOURCE_UTRIUM_LEMERGITE}
        var reaction_minerals = 2000;

        var output_lab = Game.getObjectById('59d7d7888d8fe05f258c5bb4');
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
        /*
        var first_lab = Game.getObjectById(Object.keys(input_labs)[0]);
        var second_lab = Game.getObjectById(Object.keys(input_labs)[1]);
        var result = output_lab.runReaction(first_lab, second_lab);
        if (result == ERR_NOT_IN_RANGE) {
            creep.moveTo(output_lab);
        } else {
            //console.log("RUN LAB REACTION< RESULT: " + result);
        }
        */
	}
};