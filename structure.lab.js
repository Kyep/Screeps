/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('structure.lab');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    run: function(lab){
        //return 0;
        var lab_config = {'59d7d7888d8fe05f258c5bb4': ['59daf99e9e788d67402f810e', '59db1bdee7ccce1d3faa8bef'] }
        //var lab_config = {'59daf99e9e788d67402f810e': ['59db1bdee7ccce1d3faa8bef', '59d7d7888d8fe05f258c5bb4'] }
        if (lab.cooldown > 0) {
            return 0;
        }
        if (lab_config[lab.id] == undefined) {
            // we are not an export lab, return.
            return 0;
        }
        var lab_a = Game.getObjectById(lab_config[lab.id][0]);
        var lab_b = Game.getObjectById(lab_config[lab.id][1]);
        if (lab_a == undefined || lab_b == undefined) {
            console.log("Lab error. A/B undefined!");
            return -1;
        }
        var result = lab.runReaction(lab_a, lab_b);
        
    }
};