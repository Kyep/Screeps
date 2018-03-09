"use strict";

global.EXPANSION_SET = function(rname, lvl) {
    Memory[MEMORY_GLOBAL_EXPANSION] = {'room': rname, 'gcl': lvl}
}

global.EXPANSION_RESET = function() {
    Memory[MEMORY_GLOBAL_EXPANSION] = {}
}

global.EXPANSION_GETROOM = function() {
    var emem = Memory[MEMORY_GLOBAL_EXPANSION];
    if (!emem) {
        return undefined;
    }
    var etarget = emem['room'];
    if (!etarget) {
        return undefined;
    }
    if (!emem['gcl'] || emem['gcl'] > Game.gcl.level) {
        return undefined;
    }
    return etarget;
}

global.EXPANSION_CANEXPAND = function() {
    return etarget;
    var rooms_owned = 0;
    for (var rname in Game.rooms) {
        if (Game.rooms[rname].isMine()) {
            rooms_owned++;
        }
    }
    if (rooms_owned < Game.gcl.level) {
        return true;
    }
    return false;
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
        var rconfig = GET_ROOM_CONFIG(etarget);
        if (!rconfig) {
            console.log (etarget + ': no rconfig - forcing full update!');
            robj.fullUpdate();
            return;
        }
        
        if (!robj.isMine()) {
            console.log (etarget + ': waiting for room to be claimed.');
           return;
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
            EXPANSION_RESET();
            console.log('EXPAND: ' + robj.name + ': CLAIMED SUCCESSFULLY!');
        } else if (csites.length) {
            var csite = csites[0];
            console.log('EXPAND: ' + robj.name + ': WAIT FOR SPAWNER TO BE BUILT, PROGRESS: ' + csite.progress + '/' + csite.progressTotal);
        } else {
            robj.checkStructures();
        }
        return;

}