/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('job.hide');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    run: function(creep) {
        if (creep == undefined) {
            creep.say('ERROR');
            console.log(creep.name + ": You are calling jobHide.run without a creep as a param.");
            return 0;
        }
        if (creep.room.name == creep.memory[MEMORY_HOME]) {
            // inside base, we identify the base safespot and hide there.
            var hidex = 25;
            var hidey = 25;
            if (empire[creep.memory[MEMORY_HOME]]['safespot'] != undefined) {
                if (empire[creep.memory[MEMORY_HOME]]['safespot']['x'] != undefined && empire[creep.memory[MEMORY_HOME]]['safespot']['y'] != undefined) {
                    hidex = empire[creep.memory[MEMORY_HOME]]['safespot']['x'];
                    hidey = empire[creep.memory[MEMORY_HOME]]['safespot']['y'];
                }
            }
            creep.say('🚧 safespot!');
            creep.moveTo(new RoomPosition(hidex, hidey, creep.memory[MEMORY_HOME]), {visualizePathStyle: {stroke: COLOR_HARVEST}});
            return 0;
        }
        var enemiesList = creep.room.find(FIND_HOSTILE_CREEPS);
        if (!enemiesList.length) {
            // do nothing, we are safe here until we are told to stop hiding.
            if (creep.pos.x < 2 || creep.pos.x > 47 || creep.pos.y < 2 || creep.pos.y > 47) {
                creep.moveTo(25, 25);
            }
            creep.say('SAFE?');
            return 0;
        }
        if (creep.memory[MEMORY_ATTACKEDIN] == undefined) {
            
        }
        // We're in danger. 
        // List the exits to this room. Find the ones that are NOT under attack.
        // Identify the closest of those, and go there.
        var exits = Game.map.describeExits(creep.room.name);
        var shortestpath = undefined;
        var shortestpathlength = 999;
        for (var dir in exits) {
            if (exits[dir] in Memory['sectors_under_attack']) {
                continue;
            }
            var thispath = creep.pos.findPathTo(new RoomPosition(25, 25, exits[dir]));
            if (thispath.length < shortestpathlength) {
                shortestpath = thispath;
                shortestpathlength = thispath.length;
            }
        }
        if (shortestpath == undefined) {
            creep.say('no esc!');
        } else {
            creep.say('escape!');
            creep.moveByPath(shortestpath);
        }
    }
};