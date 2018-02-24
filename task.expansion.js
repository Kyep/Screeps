"use strict";

module.exports = {
    process: function(){
        var rooms_to_claim = Memory['rooms_to_claim'];
        if (rooms_to_claim == undefined) {
            Memory['rooms_to_claim'] = {}
            rooms_to_claim = Memory['rooms_to_claim'];
        }
        for(var rname in empire) {
            if(rooms_to_claim[rname] != undefined) {
                // To claim a room, define it like this:
                // Memory['rooms_to_claim'] = {'W55S8': {'controllerid': '59bbc3da2052a716c3ce6e4b', 'gcltarget': 13 }}
                // Memory['rooms_to_claim'] = {'W52S23': {'controllerid': '59bbc4072052a716c3ce7416', 'gcltarget': 10 }}
                var expansiontarget = Game.rooms[rname];
                var controllertarget = Game.getObjectById(rooms_to_claim[rname]['controllerid']);
                var gcltarget = rooms_to_claim[rname]['gcltarget'];
    
    
                // CASE 1: My GCL is too low.
                if (Game.gcl.level < gcltarget) {
                    // don't do anything, reservers are pointless.
                    for(var sid in global.empire[rname].sources) {
                        global.empire[rname].sources[sid].assigned = {}
                    }
                    continue;
                // CASE 2a: I have no vision of the room, I assume I don't own it.
                } else if (controllertarget == undefined) {
                    console.log(rname + ': EXPANSION: CONTROLLER TARGET UNDEFINED - CHECK YOU HAVE UNITS THERE.');
                    //global.empire[rname].sources['CLAIM'] = { 'sourcename':'CLAIM', 'x':25, 'y':25, 'target_x': 25, 'target_y': 25, 'expected_income': 75, 'assigned': { 'remoteconstructor': 1, 'claimer': 1, 'rogue': 1 } } 
                    for(var sid in global.empire[rname].sources) {
                        global.empire[rname].sources[sid].assigned = {'remoteconstructor': 1, 'claimer': 1, 'rogue': 1}
                    }
                    continue;
                // CASE 2b: I don't own the room.
                } else if (controllertarget.owner == undefined || controllertarget.owner['username'] != overlord) {
                    console.log(rname + ': EXPANSION: TRYING TO CLAIM CONTROLLER ');
                    //global.empire[rname].sources['CLAIM'] = { 'sourcename':'CLAIM', 'x':25, 'y':25, 'target_x': 25, 'target_y': 25, 'expected_income': 75, 'assigned': { 'remoteconstructor': 1, 'claimer': 1, 'rogue': 1 } } 
                    for(var sid in global.empire[rname].sources) {
                        global.empire[rname].sources[sid].assigned = {'remoteconstructor': 1, 'claimer': 1, 'rogue': 1}
                    }
                    //console.log(JSON.stringify(global.empire[rname].sources));
                    if (global.empire[rname]['backup_spawn_room'] == undefined) {
                        console.log('warning: ' + rname + ' has undefined backup_spawn_room');
                    }
                    continue;
                // CASE 3: I have already claimed the room.
                }
                  
                var spawner_name = '';
                for (var key in Game.spawns) {
                    if (Game.spawns[key].room.name == rname) {
                        spawner_name = Game.spawns[key].name;
                    }
                }
                var controller_level = controllertarget.level;
                if (spawner_name == '') {
                    // CASE 5: I own the room, the controller is level 1 (can have spawn) but there is no spawn
                    for(var sid in global.empire[rname].sources) {
                        global.empire[rname].sources[sid].assigned = {'remoteconstructor': 2, 'claimer': 1, 'rogue': 1}
                    }
                    var csites = expansiontarget.find(FIND_MY_CONSTRUCTION_SITES);
                    if(csites.length) {
                        var csite = csites[0];
                        console.log('EXPAND: ' + expansiontarget + ': WAIT FOR SPAWNER TO BE BUILT, PROGRESS: ' + csite.progress + '/' + csite.progressTotal);
                    } else {
                        console.log('EXPAND: ' + expansiontarget + ': CREATE SPAWNER');
                        var enemyspawns = expansiontarget.find(FIND_HOSTILE_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN});
                        if(enemyspawns.length > 0) {
                            console.log('***** ' + ' EXPAND: ' + expansiontarget + ': WAIT FOR ENEMY SPAWNS TO DIE: ' + enemyspawns.length );
                            if (Game.rooms[rname] != undefined) {
                                Game.rooms[rname].destroyHostileSpawns();
                            }
                            continue;
                        }
                        Game.rooms[rname].checkStructures();
                    }
                } else { 
                    var claimstring = '***** ' + rname + ' EXPANSION: ROOM HAS BEEN SUCCESSFULLY CLAIMED, AND A SPAWN BUILT! DELETING ROOM FROM ROOMS_TO_CLAIM';
                    console.log(claimstring);
                    Game.notify(claimstring);
                    delete rooms_to_claim[rname];
                    Memory['rooms_to_claim'] = rooms_to_claim;
                }
            }
            if (Game.rooms[rname] == undefined) {
                continue;
            }
            if (!Game.rooms[rname].isMine()) {
                continue;
            }
            var controller_level = Game.rooms[rname].getLevel();
            var rmem = Game.rooms[rname].memory['known_level']; // room has completed all structures up to this level.
            if (rmem == undefined) {
                Game.rooms[rname].memory['known_level'] = 0;
                rmem = Game.rooms[rname].memory['known_level'];
                console.log(rname + ': assigned room level 0 to memory!');
            }
            if (rmem != controller_level) {
                Game.rooms[rname].memory['known_level'] = controller_level;
                Game.rooms[rname].generateFlags();
                Game.rooms[rname].checkStructures();
            }
            if (controller_level == 1) {
                var spawner_name = '';
                for (var key in Game.spawns) {
                    if (Game.spawns[key].room.name == rname) {
                        spawner_name = Game.spawns[key].name;
                    }
                }
                if (spawner_name != '') {
                    // Reassign incoming remoteconstructors as this room's harvesters to kickstart it.
                    for (var crname in Game.creeps) {
                        if (Game.creeps[crname].memory[MEMORY_ROLE] == 'remoteconstructor'  && Game.creeps[crname].memory[MEMORY_DEST] == rname) {
                            Game.creeps[crname].memory[MEMORY_HOME] = rname;
                            Game.creeps[crname].memory[MEMORY_ROLE] = 'harvester';
                            Game.creeps[crname].memory[MEMORY_JOB] = JOB_TRAVEL_OUT;
                            Game.creeps[crname].memory[MEMORY_SPAWNERNAME] = spawner_name;
                        }
                    }
                    Game.rooms[rname].memory['known_level'] = 1;
                }
            }
        }
    }
};