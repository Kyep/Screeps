"use strict";

global.EXPANSION_RESET = function() {
    CLEAR_ALL_FLAGS_OF_TYPE(FLAG_EXPAND);
}

global.EXPANSION_GETROOM = function() {
    var bases = LIST_BASES();
    if (bases.length >= Game.gcl.level) {
        return undefined;
    }
    var exp_flags = GET_ALL_FLAGS_OF_TYPE(FLAG_EXPAND);
    if (exp_flags.length == 0) {
        return undefined;
    }
    return exp_flags[0].pos.roomName;
}

global.EXPANSION_PROCESS = function() {

        // 1. add room to config.empire, with primary spawn room (itself) and backup spawn room (where the claimer will come from)
        // 2. run: EXPANSION_SET(roomname, gcl_at_which_to_claim_it);
        // 3. drop a flag (yellow/red) in the target room to mark where the spawn should be.
        // 4.

        var etarget = EXPANSION_GETROOM();
        if (!etarget) {
           //console.log('EXPAND: no target');
            return false;
        }

        var robj = Game.rooms[etarget];
        if (!robj) {
            console.log (etarget + ': cannot proceed with expansion as we have no visibility to target room: ' + etarget);
            return false;
        }
        if (!robj.isMine()) {
           console.log (etarget + ': waiting for room to be claimed. Send a claimer.');
           return false;
        }
        var rconfig = GET_ROOM_CONFIG(etarget);
        if (!rconfig) {
            console.log (etarget + ': waiting for claimer to claim the room and generate room config: ' + etarget);
            return false;
        }

        var myspawns = robj.find(FIND_MY_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_SPAWN); } });
        var csites = robj.find(FIND_MY_CONSTRUCTION_SITES);
        if (myspawns.length) {
            robj.fullUpdate();
            for (var crname in Game.creeps) {
                if (Game.creeps[crname].memory[MEMORY_DEST] == etarget) {
                    if (Game.creeps[crname].memory[MEMORY_ROLE] == 'remoteconstructor') {
                        Game.creeps[crname].memory[MEMORY_ROLE] = 'fharvester';
                    }
                }
            }
            robj.deleteFlagsByType(FLAG_EXPAND);
            console.log('EXPAND: ' + robj.name + ': CLAIMED SUCCESSFULLY!');
        } else if (csites.length) {
            var csite = csites[0];
            //console.log('EXPAND: ' + robj.name + ': WAIT FOR SPAWNER TO BE BUILT, PROGRESS: ' + csite.progress + '/' + csite.progressTotal);
        } else {
            robj.checkStructures();
        }
        return true;

}
