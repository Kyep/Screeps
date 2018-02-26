"use strict";

module.exports = {
    run: function(creep) {
        if (creep == undefined) {
            creep.say('ERROR');
            console.log(creep.name + ": You are calling jobHide.run without a creep as a param.");
            return;
        }
        creep.memory[MEMORY_ATTACKEDAT] = Game.time; 
        if (creep.isAtHomeRoom()) {
            creep.hideInBase();
            return;
        }
        var enemiesList = creep.room.find(FIND_HOSTILE_CREEPS);
        if (!enemiesList.length) {
            // do nothing, we are safe here until we are told to stop hiding.
            if (creep.pos.x < 2 || creep.pos.x > 47 || creep.pos.y < 2 || creep.pos.y > 47) {
                creep.moveToRUP(new RoomPosition(25, 25, creep.room.name));
            }
            creep.say('SAFE?');
            return;
        }
        // We're in danger. 
        // List the exits to this room. Find the ones that are NOT under attack.
        // Identify the closest of those, and go there, then wait for attack to end.
        var exits = Game.map.describeExits(creep.room.name);
        var shortestpath = undefined;
        var shortestpathlength = 999;
        for (var dir in exits) {
            if (global.ROOM_UNDER_ATTACK(exits[dir])) {
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
            return;
        } else {
            creep.say('escape!');
            creep.moveByPath(shortestpath);
            return;
        }
    }
};