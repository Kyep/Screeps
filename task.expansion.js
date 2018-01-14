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
                // Memory['rooms_to_claim'] = {'W57S14': {'controllerid': '59bbc3bb2052a716c3ce6a2f', 'gcltarget': 9 }}
                // Memory['rooms_to_claim'] = {'W52S23': {'controllerid': '59bbc4072052a716c3ce7416', 'gcltarget': 10 }}
                var expansiontarget = Game.rooms[rname];
                var controllertarget = Game.getObjectById(rooms_to_claim[rname]['controllerid']);
                var gcltarget = rooms_to_claim[rname]['gcltarget'];
    
    
                // CASE 1: My GCL is too low.
                if (Game.gcl.level < gcltarget) {
                    // don't do anything, reservers are pointless.
                    for(var sid in empire[rname].sources) {
                        empire[rname].sources[sid].assigned = {}
                    }
                    continue;
                // CASE 2a: I have no vision of the room, I assume I don't own it.
                } else if (controllertarget == undefined) {
                    console.log(rname + ': EXPANSION: CONTROLLER TARGET UNDEFINED - CHECK YOU HAVE UNITS THERE.');
                    for(var sid in empire[rname].sources) {
                        empire[rname].sources[sid].assigned = {'remoteconstructor': 1, 'claimer': 1, 'rogue': 1}
                    }
                    continue;
                // CASE 2b: I don't own the room.
                } else if (controllertarget.owner == undefined || controllertarget.owner['username'] != overlord) {
                    console.log(rname + ': EXPANSION: TRYING TO CLAIM CONTROLLER ');
                    for(var sid in empire[rname].sources) {
                        empire[rname].sources[sid].assigned = {'remoteconstructor': 1, 'claimer': 2, 'rogue': 1}
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
                    for(var sid in empire[rname].sources) {
                        empire[rname].sources[sid].assigned = {'remoteconstructor': 2}
                    }
                    var csites = expansiontarget.find(FIND_MY_CONSTRUCTION_SITES);
                    if(csites.length) {
                        var csite = csites[0];
                        console.log('EXPAND: ' + expansiontarget + ': WAIT FOR SPAWNER TO BE BUILT, PROGRESS: ' + csite.progress + '/' + csite.progressTotal);
                    } else {
                        console.log('EXPAND: ' + expansiontarget + ': CREATE SPAWNER');
                        var enemyspawns = expansiontarget.find(FIND_HOSTILE_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN});
                        if(enemyspawns.length) {
                            console.log('***** ' + ' EXPAND: ' + expansiontarget + ': WAIT FOR ENEMY SPAWNS TO DIE');
                            continue;
                        }
                        var spawnerflags = expansiontarget.find(FIND_FLAGS, { filter: function(flag){ if(flag.color == COLOR_YELLOW && flag.secondaryColor == COLOR_RED) { return 1; } else { return 0; } } });
                        if(spawnerflags.length) {
                            for(var i = 0; i < spawnerflags.length; i++) {
                                expansiontarget.createConstructionSite(spawnerflags[i].pos.x, spawnerflags[i].pos.y, STRUCTURE_SPAWN);
                                spawnerflags[i].remove();
                            }
                            continue;
                        } else {
                            console.log('***** ' + ' EXPAND: ' + expansiontarget + ': ERROR: NO YELLOW/RED SPAWNER POSITION FLAG!');
                        }
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
            if (Game.rooms[rname].controller == undefined) {
                continue;
            }
            if (Game.rooms[rname].controller.owner == undefined) {
                continue;
            }
            if (Game.rooms[rname].controller.owner['username'] != overlord) {
                continue;
            }
            var controller_level = Game.rooms[rname].controller.level;
            var csites = Game.rooms[rname].find(FIND_MY_CONSTRUCTION_SITES);
            /*
            var repairTargets = Game.rooms[rname].find(FIND_STRUCTURES, {
                    filter: function(structure){
                        if(structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART){
                            return (structure.hits < 1000)
                        }else{
                            return (structure.hits < (structure.hitsMax - TOWER_POWER_REPAIR))
                        }
                    }
            });
            if(repairTargets.length) {
                console.log(rname + ': ' + repairTargets.length + ' repairable structures');
                //continue;
            }
            */
            var rmem = Game.rooms[rname].memory['known_level']; // room has completed all structures up to this level.
            if (rmem == undefined) {
                Game.rooms[rname].memory['known_level'] = 0;
                rmem = Game.rooms[rname].memory['known_level'];
                console.log(rname + ': assigned room level 0 to memory!');
            }
            if (rmem == controller_level) {
                continue;
            }
            if(csites.length) {
                continue;
            }
            if (rmem == 0) {
                if (controller_level >= 1) {
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
            } else if (rmem == 1) {
                if (controller_level >= 2) {
                    // +5 extensions, ramparts (not built here), walls
                    var extflags = Game.rooms[rname].find(FIND_FLAGS, { filter: function(flag){ if(flag.color == COLOR_YELLOW && flag.secondaryColor == COLOR_YELLOW) { return 1; } else { return 0; } } });
                    for(var i = 0; i < extflags.length; i++) {
                        Game.rooms[rname].createConstructionSite(extflags[i].pos.x, extflags[i].pos.y, STRUCTURE_EXTENSION);
                        extflags[i].remove();
                    }
                    var wallflags = Game.rooms[rname].find(FIND_FLAGS, { filter: function(flag){ if(flag.color == COLOR_ORANGE && flag.secondaryColor == COLOR_GREY) { return 1; } else { return 0; } } });
                    for(var i = 0; i < wallflags.length; i++) {
                        Game.rooms[rname].createConstructionSite(wallflags[i].pos.x, wallflags[i].pos.y, STRUCTURE_WALL);
                        wallflags[i].remove();
                    }
                    Game.notify(rname +': deployed level ' + (rmem+1) + ' extensions and walls.');
                    Game.rooms[rname].memory['known_level'] = 2;
                    Game.rooms[rname].recycleObsolete();
                }
            } else if (rmem == 2) {
                if (controller_level >= 3) {
                     // +5 extensions, +1 tower, then (from L2) ramparts
                    var extflags = Game.rooms[rname].find(FIND_FLAGS, { filter: function(flag){ if(flag.color == COLOR_YELLOW && flag.secondaryColor == COLOR_BLUE) { return 1; } else { return 0; } } });
                    if(extflags.length) {
                        for(var i = 0; i < extflags.length; i++) {
                            Game.rooms[rname].createConstructionSite(extflags[i].pos.x, extflags[i].pos.y, STRUCTURE_EXTENSION);
                            extflags[i].remove();
                        }
                        Game.notify(rname +': deployed level ' + (rmem+1) + ' extensions.');
                        continue;
                    }
                    var towerflags = Game.rooms[rname].find(FIND_FLAGS, { filter: function(flag){ if(flag.color == COLOR_ORANGE && flag.secondaryColor == COLOR_ORANGE) { return 1; } else { return 0; } } });
                    if(towerflags.length) {
                        for(var i = 0; i < towerflags.length; i++) {
                            Game.rooms[rname].createConstructionSite(towerflags[i].pos.x, towerflags[i].pos.y, STRUCTURE_TOWER);
                            towerflags[i].remove();
                        }
                        Game.notify(rname +': deployed level ' + (rmem+1) + ' tower.');
                        continue;
                    }
                    var rampartflags = Game.rooms[rname].find(FIND_FLAGS, { filter: function(flag){ if(flag.color == COLOR_ORANGE && flag.secondaryColor == COLOR_GREEN) { return 1; } else { return 0; } } });
                    if(rampartflags.length) {
                        for(var i = 0; i < rampartflags.length; i++) {
                            Game.rooms[rname].createConstructionSite(rampartflags[i].pos.x, rampartflags[i].pos.y, STRUCTURE_RAMPART);
                            rampartflags[i].remove();
                        }
                        Game.notify(rname +': deployed level ' + (rmem+1) + ' ramparts.');
                        continue;
                    }

                    var roadflags = Game.rooms[rname].find(FIND_FLAGS, { filter: function(flag){ if(flag.color == COLOR_ORANGE && flag.secondaryColor == COLOR_WHITE) { return 1; } else { return 0; } } });
                    if(roadflags.length) {
                        var max_per_pass = roadflags.length;
                        if (max_per_pass > 10) {
                            max_per_pass = 10;
                        }
                        for(var i = 0; i < max_per_pass; i++) {
                            roadflags[i].remove(); // do this first, in case we place a flag on a road... 
                            Game.rooms[rname].createConstructionSite(roadflags[i].pos.x, roadflags[i].pos.y, STRUCTURE_ROAD);
                        }
                        Game.notify(rname +': deployed level ' + (rmem+1) + ' roads.');
                        continue;
                    }
                    var wallflags = Game.rooms[rname].find(FIND_FLAGS, { filter: function(flag){ if(flag.color == COLOR_ORANGE && flag.secondaryColor == COLOR_GREY) { return 1; } else { return 0; } } });
                    if(wallflags.length) {
                        var wallflags_size = wallflags.length;
                        if (wallflags_size > 10) {
                            wallflags_size = 10;
                        }
                        var count = 0;
                        for(var i = 0; i < wallflags_size; i++) {
                            wallflags[i].remove();
                            Game.rooms[rname].createConstructionSite(wallflags[i].pos.x, wallflags[i].pos.y, STRUCTURE_WALL);
                            count++;
                        }
                        console.log(rname +': deployed ' + count + ' level ' + (rmem+1) + ' walls.');
                        continue;
                    }
                    Game.rooms[rname].memory['known_level'] = 3;
                    Game.rooms[rname].recycleObsolete();
                }
            } else if (rmem == 3) {
                if (controller_level >= 4) {
                    // +10 extensions, +1 storage
                    var extflags = Game.rooms[rname].find(FIND_FLAGS, { filter: function(flag){ if(flag.color == COLOR_YELLOW && flag.secondaryColor == COLOR_GREEN) { return 1; } else { return 0; } } });
                    if(extflags.length) {
                        for(var i = 0; i < extflags.length; i++) {
                            Game.rooms[rname].createConstructionSite(extflags[i].pos.x, extflags[i].pos.y, STRUCTURE_EXTENSION);
                            extflags[i].remove();
                        }
                        Game.notify(rname +': deployed level ' + (rmem+1) + ' extensions.');
                        continue;
                    }
                    var storageflags = Game.rooms[rname].find(FIND_FLAGS, { filter: function(flag){ if(flag.color == COLOR_PURPLE && flag.secondaryColor == COLOR_YELLOW) { return 1; } else { return 0; } } });
                    if(storageflags.length) {
                        for(var i = 0; i < storageflags.length; i++) {
                            Game.rooms[rname].createConstructionSite(storageflags[i].pos.x, storageflags[i].pos.y, STRUCTURE_STORAGE);
                            storageflags[i].remove();
                        }
                        Game.notify(rname +': deployed level ' + (rmem+1) + ' storage.');
                        continue;
                    }
                    Game.rooms[rname].memory['known_level'] = 4;
                    Game.rooms[rname].recycleObsolete();
                }
            } else if (rmem == 4) {
                if (controller_level >= 5) {
                    // +10 extensions, +2 links, +1 tower
                    var extflags = Game.rooms[rname].find(FIND_FLAGS, { filter: function(flag){ if(flag.color == COLOR_YELLOW && flag.secondaryColor == COLOR_WHITE) { return 1; } else { return 0; } } });
                    if(extflags.length) {
                        for(var i = 0; i < extflags.length; i++) {
                            Game.rooms[rname].createConstructionSite(extflags[i].pos.x, extflags[i].pos.y, STRUCTURE_EXTENSION);
                            extflags[i].remove();
                        }
                        Game.notify(rname +': deployed level ' + (rmem+1) + ' extensions.');
                        continue;
                    }
                    var towerflags = Game.rooms[rname].find(FIND_FLAGS, { filter: function(flag){ if(flag.color == COLOR_ORANGE && flag.secondaryColor == COLOR_WHITE) { return 1; } else { return 0; } } });
                    if(towerflags.length) {
                        for(var i = 0; i < towerflags.length; i++) {
                            Game.rooms[rname].createConstructionSite(towerflags[i].pos.x, towerflags[i].pos.y, STRUCTURE_TOWER);
                            towerflags[i].remove();
                        }
                        Game.notify(rname +': deployed level ' + (rmem+1) + ' tower.');
                        continue;
                    }
                    var linkflags = Game.rooms[rname].find(FIND_FLAGS, { filter: function(flag){ if(flag.color == COLOR_PURPLE && flag.secondaryColor == COLOR_WHITE) { return 1; } else { return 0; } } });
                    if(linkflags.length) {
                        for(var i = 0; i < linkflags.length; i++) {
                            Game.rooms[rname].createConstructionSite(linkflags[i].pos.x, linkflags[i].pos.y, STRUCTURE_LINK);
                            linkflags[i].remove();
                        }
                        Game.notify(rname +': deployed level ' + (rmem+1) + ' links.');
                        continue;
                    }
                    Game.rooms[rname].memory['known_level'] = 5;
                    Game.rooms[rname].recycleObsolete();
                }
            } else if (rmem == 5) {
                if (controller_level >= 6) {
                    // +10 extensions, +2 links, +1 tower
                    var linkflags = Game.rooms[rname].find(FIND_FLAGS, { filter: function(flag){ if(flag.color == COLOR_PURPLE && flag.secondaryColor == COLOR_GREY) { return 1; } else { return 0; } } });
                    if(linkflags.length) {
                        for(var i = 0; i < linkflags.length; i++) {
                            Game.rooms[rname].createConstructionSite(linkflags[i].pos.x, linkflags[i].pos.y, STRUCTURE_LINK);
                            linkflags[i].remove();
                        }
                        Game.notify(rname +': deployed level ' + (rmem+1) + ' links.');
                        continue;
                    }
                    var extflags = Game.rooms[rname].find(FIND_FLAGS, { filter: function(flag){ if(flag.color == COLOR_YELLOW && flag.secondaryColor == COLOR_GREY) { return 1; } else { return 0; } } });
                    if(extflags.length) {
                        for(var i = 0; i < extflags.length; i++) {
                            Game.rooms[rname].createConstructionSite(extflags[i].pos.x, extflags[i].pos.y, STRUCTURE_EXTENSION);
                            extflags[i].remove();
                        }
                        Game.notify(rname +': deployed level ' + (rmem+1) + ' extensions.');
                        continue;
                    }
                    var terminalflags = Game.rooms[rname].find(FIND_FLAGS, { filter: function(flag){ if(flag.color == COLOR_PURPLE && flag.secondaryColor == COLOR_BLUE) { return 1; } else { return 0; } } });
                    if(terminalflags.length) {
                        for(var i = 0; i < terminalflags.length; i++) {
                            Game.rooms[rname].createConstructionSite(terminalflags[i].pos.x, terminalflags[i].pos.y, STRUCTURE_TERMINAL);
                            terminalflags[i].remove();
                        }
                        Game.notify(rname +': deployed level ' + (rmem+1) + ' terminal.');
                        continue;
                    }
                    var extractorflags = Game.rooms[rname].find(FIND_FLAGS, { filter: function(flag){ if(flag.color == COLOR_PURPLE && flag.secondaryColor == COLOR_CYAN) { return 1; } else { return 0; } } });
                    if(extractorflags.length) {
                        for(var i = 0; i < extractorflags.length; i++) {
                            Game.rooms[rname].createConstructionSite(extractorflags[i].pos.x, extractorflags[i].pos.y, STRUCTURE_EXTRACTOR);
                            extractorflags[i].remove();
                        }
                        Game.notify(rname +': deployed level ' + (rmem+1) + ' extractor.');
                        continue;
                    }
                    Game.rooms[rname].memory['known_level'] = 6;
                    Game.rooms[rname].recycleObsolete();
                }
            } else if (rmem == 6) {
                if (controller_level >= 7) {
                    Game.rooms[rname].memory['known_level'] = 7;
                    Game.rooms[rname].recycleObsolete();
                }
            } else if (rmem == 7) {
                if (controller_level >= 8) {
                    Game.rooms[rname].memory['known_level'] = 8;
                    Game.rooms[rname].recycleObsolete();
                }
            } else if (rmem == 8) {
                if (controller_level < 8) {
                    Game.rooms[rname].memory['known_level'] = controller_level;
                }
            }
        }
    }
};