/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('structure.link');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    run: function(link){
        var memaddr = 'tower' + link.id;
        if (Memory[memaddr] == undefined) {
            // figure out our role.
            var spawners = link.room.find(FIND_STRUCTURES, 10, {
                filter: function(structure){
                    return (structure.structureType == STRUCTURE_SPAWN)
                }
            });
            if (!spawners.length) {
                console.log("LINK: no spawner in: " + link.room.name);
                return 0;
            }
            var thespawn = spawners[0];
            if (link.pos.getRangeTo(thespawn) < 10) {
                Memory[memaddr] = ''; // we are a receive-only link.
                //console("LINK at " + link.room.name + ':' + link.pos.x + ',' + link.pos.y + ' decided it was receive-only');
                return 0;
            }
            var links_in_room = thespawn.pos.findInRange(FIND_STRUCTURES, 10, {
                filter: function(structure){
                    return (structure.structureType == STRUCTURE_LINK) 
                }
            });
            if (links_in_room.length == 0) {
                return 0;
            }
            Memory[memaddr] = links_in_room[0].id;
            //console.log("LINK at " + link.room.name + ':' + link.pos.x + ',' + link.pos.y + ' assigned ' + Memory[memaddr] + ' as its send target.');
            return 0;
        }
        var ourmem = Memory[memaddr];
        if (ourmem == '') {
            // we are a recieve-only link. Do nothing.
            return 0;
        }
        if (link.cooldown > 0) {
            // on cooldown, do nothing.
            return 0;
        }
        if (link.energy == 0) {
            return 0;
        }
        var destlink = Game.getObjectById(ourmem);
        if (destlink == undefined) {
            console.log('LINK: erasing transmit destination, as it does not exist!');
            Memory[memaddr] = undefined;
            return 0;
        }
        var result = link.transferEnergy(destlink);
        //console.log("LINK at " + link.room.name + ':' + link.pos.x + ',' + link.pos.y + ' sent energy to ' + Memory[memaddr] + ' with result: ' + result);
    }
};