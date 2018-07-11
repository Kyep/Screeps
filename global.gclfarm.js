"use strict";

global.GCLFARM_LIST = function() {
    // Example: GCLFARM_SET();
    console.log(JSON.stringify(Memory[MEMORY_GLOBAL_GCL_FARM]));
}

global.GCLFARM_SET = function(farmlist) {
    Memory[MEMORY_GLOBAL_GCL_FARM] = farmlist;
}

global.GCLFARM_RESET = function() {
    Memory[MEMORY_GLOBAL_GCL_FARM] = []
}

global.GCLFARM_PROCESS = function() {

        for (var rname in Game.rooms) {
            if (Memory[MEMORY_GLOBAL_GCL_FARM].indexOf(rname) == -1) {
                continue;
            }
            var robj = Game.rooms[rname];
            if (robj.getLevel() != 8) {
                continue;
            }
            console.log("GCLFARM CANDIDATE: " + rname);
            var num_ups = robj.countCreepsWithRole('upstorclose');
            console.log("GCLFARM CANDIDATE: " + rname + " has " + num_ups + " / 6 upstorclose!");
            if (num_ups < 6) {
                robj.createUnit('upstorclose');
                continue;   
            }
            var num_claimers = robj.countCreepsWithRole('claimer');
            console.log("GCLFARM CANDIDATE: " + rname + " has " + num_claimers + " / 1 claimers!");
            if (num_claimers < 1) {
                robj.createUnit('claimer');
                continue;
            }

            var ctrl = robj.controller;
            ctrl.unclaim();
            robj.suicideRemoteCreeps();
        }
}