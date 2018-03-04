"use strict";

// requirements ONLY

require('global.cpu');
require('global.config');
require('global_functions');
require('global.commands');
require('global.espionage');
require('global.creep');
require('global.structure');

require('config.empire');
require('config.units');
require('config.defines');
require('config.flags');

require('prototype.creep');
require('prototype.room');
require('prototype.room.boosts');
require('prototype.structures_all');
require('prototype.structure');
require('prototype.source');

require('class.empireroom');
require('lib.loanuserlist');

var expansionplanner = require('task.expansion');
var taskscience = require('task.science');

// ---------------------------
// BEGIN MAIN LOOP 
// ---------------------------

module.exports.loop = function () {
    
    // ----------------------------------------------------------------------------------
    // SECTION: CPU tracking (must come first)
    global.cpu_thistick = {}
    CPU_SECTION('requirefiles');
    
    // ----------------------------------------------------------------------------------
    // SECTION: setup (has to come second)
    var divisor = CPU_GET_DIVISOR();
    
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    for(var cr in Game.creeps) {
        Game.creeps[cr].setupMemory();
    }
    global.populateLOANlist();

    CPU_SECTION('setup');
    

    // ----------------------------------------------------------------------------------
    // SECTION: Global actions that are done once per set number of ticks, regardless of current CPU bucket

    if(Game.time % 250 === 0) {
        global.CREATE_GROWERS();
        CPU_SECTION('growers', true);
        //global.SHARE_SPARE_ENERGY(); 
    }
    if(Game.time % 2000 === 0) {
        //global.PRESET_ATTACK_WAVE();
        global.ESPIONAGE_ATTACK_PLANS(true);
        CPU_SECTION('espionage-attackplans', true);
        global.ESPIONAGE_REGEN_TARGETS();
        CPU_SECTION('espionage-regen', true);
        global.REPORT_STRUCTURES(false); // auto-builds buildable structures that have appropriate flags
        CPU_SECTION('report-structures', true);
    }

    if(Game.time % 500 === 0) {
        var saved_energy_network = Memory[MEMORY_GLOBAL_ENERGYNET];
        var sene = saved_energy_network[ENERGY_EMPTY];
        var allow_e_sale = false;
        if (sene != undefined && sene.length == 0) {
            allow_e_sale = true;
        }
        global.UPDATE_MARKET_ORDERS(allow_e_sale);
        CPU_SECTION('market-order-update', true);
    }

    if(Game.time % 2500 === 0) {
        RECREATE_ROAD_NETWORKS();
        CPU_SECTION('recreate-road-networks', true);
    }

    if(Game.time % 5 === 0) {
        taskscience.process();
        CPU_SECTION('science', true);
    }

    if(Game.time % 250 === 0) {
        CHECK_FOR_OVERBURDENED_SPAWNERS();
        CPU_SECTION('rooms-partsalert', true);
    }


    // ----------------------------------------------------------------------------------
    // SECTION: Global actions that are done every tick
    
    var lastFour = Game.time % 10000;
    var observe_energy = 0;
    if (lastFour == 9999) {
        observe_energy = 1;
    }
    global.UPDATE_OBSERVERS(observe_energy);
    CPU_SECTION('update-observers');

    global.ESPIONAGE();
    CPU_SECTION('espionage-main');

    RUN_CREEPS();
    CPU_SECTION('creep-life');
    
    RUN_STRUCTURES();
    CPU_SECTION('structure-life');
    
    // ----------------------------------------------------------------------------------
    // SECTION: SECTION: Global actions which are done every X ticks, but X varies according to our current CPU bucket. 

    if(Game.time % divisor === 0) {

        // EXPANSION CONTROLLER -- TODO MUST REWRITE THIS
        //expansionplanner.process()
        //CPU_SECTION('expansionplanner', true);


        // ROOM MANAGER
        var energy_network = { }

        for(var rname in Game.rooms) {
            // ENERGY MANAGEMENT - PER ROOM
            var energy_reserves = Game.rooms[rname].getStoredEnergy();
            var energy_class = Game.rooms[rname].classifyStoredEnergy(energy_reserves);
            if (empire[rname] != undefined) {
                empire[rname]['energy_reserves'] = energy_reserves;
                empire[rname]['energy_class'] = energy_class;
            }
            if(Game.rooms[rname].hasTerminalNetwork()) {
                if (energy_network[energy_class] == undefined) {
                    energy_network[energy_class] = [];
                }
                energy_network[energy_class].push(rname);
            }/* else if (Game.rooms[rname].isMine()) {
                console.log(rname +': ' + energy_reserves + ' => ' + energy_class + ' | ' + Game.rooms[rname].getLevel());
            }*/
            
            if(energy_class != ENERGY_EMPTY) {
                // In case we know of an enemy room with storage.
                if(empire[rname] == undefined) {
                    continue;
                }


                if(Game.rooms[rname].controller == undefined) {
                    //console.log(rname + 'undef');
                    continue;
                } else if(Game.rooms[rname].controller.level == undefined) {
                    //console.log(rname + ' L undef');
                    continue;
                } else if(Game.rooms[rname].controller.level < 3) {
                    //console.log(rname + ' L <3');
                    continue;
                } else if(Game.rooms[rname].controller.owner == undefined) {
                    //console.log(rname + 'owner undef');
                    continue;
                } else if(Game.rooms[rname].controller.owner.username != overlord) {
                    //console.log(rname + 'owner <3 ' + Game.rooms[rname].controller.owner.username);
                    continue;
                }
            } else if (Game.rooms[rname].hasAlert()) {
                // do nothing
            } else if (Game.rooms[rname].controller != undefined && Game.rooms[rname].controller.level != undefined && Game.rooms[rname].controller.level >= 1) {
                // Do not send RCs to base rooms. They use builderstorages instead.
            }
            
            // DEFCON MANAGEMENT
            
            var enemy_details = Game.rooms[rname].detailEnemies();
            var nuke_details = Game.rooms[rname].detailNukes();
            var has_alert = Game.rooms[rname].hasAlert();
            var should_have_alert = Game.rooms[rname].shouldHaveAlert(enemy_details, nuke_details);
            if (enemy_details['hostileCount'] > 0) {
                //console.log(rname + ': ' + has_alert + ', ' + should_have_alert + JSON.stringify(enemy_details) + ', ' + JSON.stringify(nuke_details));
            }        
            if (has_alert) {
                if (should_have_alert) {
                    Game.rooms[rname].updateAlert(enemy_details, nuke_details);
                } else {
                    Game.rooms[rname].deleteAlert();
                }
            } else if (should_have_alert) {
                Game.rooms[rname].createAlert();
                Game.rooms[rname].updateAlert(enemy_details, nuke_details);
            }
        }
        CPU_SECTION('rooms-general', true);

        global.HANDLE_ALL_ROOM_ALERTS();
        CPU_SECTION('rooms-alerts', true);
        
        Memory[MEMORY_GLOBAL_ENERGYNET] = energy_network;
        if (energy_network[ENERGY_EMPTY] != undefined) {
            if(energy_network[ENERGY_EMPTY].length > 0) {
                var dest_room = energy_network[ENERGY_EMPTY][0];
                var potential_senders = [];
                if(energy_network[ENERGY_FULL] != undefined && energy_network[ENERGY_FULL].length > 0) {
                    potential_senders = potential_senders.concat(energy_network[ENERGY_FULL]);
                } else if(energy_network[ENERGY_SPARE] != undefined && energy_network[ENERGY_SPARE].length > 0) {
                    potential_senders = potential_senders.concat(energy_network[ENERGY_SPARE]);
                }
                for (var i = 0; i < potential_senders.length; i++) {
                    var source_room = potential_senders[i];
                    var source_terminal = Game.rooms[source_room].terminal;
                    if (source_terminal.store.energy < 25000) {
                        continue;
                    }
                    var send_result = source_terminal.send(RESOURCE_ENERGY, 20000, dest_room, 'empty room pulls energy from full');
                    console.log('ENERGYNET: ' + source_room + '(' + source_terminal.store.energy + ') sends energy to (starving) room: ' + dest_room + ', result:' + send_result);
                    if (send_result == OK) {
                        break;
                    }
                }
            }
        }
        CPU_SECTION('energynet-setup', true);
        
        if (energy_network[ENERGY_FULL] != undefined) {
            if(energy_network[ENERGY_FULL].length > 0) {
                if(energy_network[ENERGY_SPARE] != undefined && energy_network[ENERGY_SPARE].length > 0) {
                    var source_room = _.sample(energy_network[ENERGY_FULL]);
                    var source_terminal = Game.rooms[source_room].terminal;
                    var terminal_energy_min = empire_defaults['terminal_energy_min'];
                    if (source_terminal.store.energy > terminal_energy_min) {
                        var dest_room = _.sample(energy_network[ENERGY_SPARE]);
                        if (Game.rooms[dest_room]) {
                            var dest_new_energy = Game.rooms[dest_room].terminal.store.energy;
                            var space_in_dest = Game.rooms[dest_room].terminal.storeCapacity - _.sum(Game.rooms[dest_room].terminal.store);
                            if (space_in_dest > 25000) {
                                var send_result = Game.rooms[source_room].terminal.send(RESOURCE_ENERGY, 25000, dest_room, 'full room pushes energy to ok');
                                var text_message = 'ENERGYNET: ' + source_room + ' (FULL) pushes 25k energy to (OK) room: ' + dest_room + ', result:' + send_result + ', new total in dest: ' + dest_new_energy;
                                console.log(text_message);
                                //Game.notify(text_message);
                            }
                       }
                   } else {
                       //console.log('ENERGYNET: ' + source_room + ' (FULL) lacks enough energy in terminal to push.');
                   }
               }
            }
        }

        CPU_SECTION('energynet-pushpull', true);



        EmpireSpawning: {
            var spawner_mobs = {};
            var spawnerless_mobs = [];
            for (var mname in Game.creeps) {
                if (Game.creeps[mname].memory[MEMORY_SPAWNERNAME] != undefined) {
                    var theirsname = Game.creeps[mname].memory[MEMORY_SPAWNERNAME];
                    if(spawner_mobs[theirsname] == undefined) {
                        spawner_mobs[theirsname] = [];
                    }
                    spawner_mobs[theirsname].push(mname);
                } else {
                    spawnerless_mobs.push(mname);
                }
            }


            var spawn_queue = GET_SPAWN_QUEUE(Memory['config.reportworkers']);
            //console.log(JSON.stringify(spawn_queue));
            //console.log(typeof(spawn_queue));
            //console.log(JSON.stringify(Game.spawns));
            var count_spawning = 0;
            var count_waking = 0;
            var count_idle = 0;
            
            for(var spawnername in Game.spawns) {
                var spn = Game.spawns[spawnername];
                //console.log('eval ' + spawnername +': ' + JSON.stringify(spn));
                if (spn.memory[MEMORY_SPAWNINGROLE] != undefined) {
                    if (spn.spawning == undefined) {
                        spn.memory[MEMORY_SPAWNINGROLE] = undefined;
                        spn.memory[MEMORY_SPAWNINGDEST] = undefined;
                    } else if (empire_defaults['military_roles'].includes(spn.memory[MEMORY_SPAWNINGROLE])) {
                        spn.room.visual.text(spn.spawning.remainingTime + ': ' + spn.spawning.name, spn.pos.x, spn.pos.y +1.5, {color: 'red', backgroundColor: 'white', font: 0.8});
                    } else if (spn.memory[MEMORY_SPAWNINGDEST] != undefined && spn.memory[MEMORY_SPAWNINGDEST] == spn.room.name) {
                        spn.room.visual.text(spn.spawning.remainingTime + ': ' + spn.spawning.name, spn.pos.x, spn.pos.y +1.5, {color: 'green', backgroundColor: 'white', font: 0.8});
                    } else {
                        spn.room.visual.text(spn.spawning.remainingTime + ': ' + spn.spawning.name, spn.pos.x, spn.pos.y +1.5, {color: 'blue', backgroundColor: 'white', font: 0.8});
                    }
                    count_spawning++;
                } else {
                    count_idle++;
                }
            }
            for (var spawnername in spawn_queue) {
                var sobj = spawn_queue[spawnername];
                var spn = Game.spawns[spawnername];
                if (spn == undefined) {
                    console.log(spawnername + ' not defined in game spawns');
                    console.log(JSON.stringify(sobj));
                } else if (spn.room.energyAvailable >= spawn_queue[spawnername]['thecost']) {
                    var crmemory = {};
                    crmemory[MEMORY_ROLE] = spawn_queue[spawnername]['spawnrole'];
                    crmemory[MEMORY_AISCRIPT] = spawn_queue[spawnername]['aiscript'];
                    crmemory[MEMORY_SOURCE] = spawn_queue[spawnername]['skey'];
                    crmemory[MEMORY_DEST] = spawn_queue[spawnername]['rname'];
                    crmemory[MEMORY_DEST_X] = spawn_queue[spawnername]['dest_x'];
                    crmemory[MEMORY_DEST_Y] = spawn_queue[spawnername]['dest_y'];
                    crmemory[MEMORY_NEXTDEST] = spawn_queue[spawnername]['nextdest'];
                    crmemory[MEMORY_HOME] = spawn_queue[spawnername]['myroomname'];
                    crmemory[MEMORY_HOME_X] = spn.pos.x;
                    crmemory[MEMORY_HOME_Y] = spn.pos.y;
                    crmemory[MEMORY_RENEW] = spawn_queue[spawnername]['renew_allowed'];
                    SPAWN_VALIDATED(spn, spawn_queue[spawnername]['sname'], spawn_queue[spawnername]['partlist'], crmemory);
                } else {
                    console.log(spawn_queue[spawnername]['sname'] + ': ' + spawn_queue[spawnername]['spawnrole'] + ' too expensive (' + spawn_queue[spawnername]['thecost'] + '/' + thespawner.room.energyAvailable + '), saving up.');
                }
                count_waking++;
            }
            //console.log( count_spawning + ' / ' + count_spawning + ' / ' + count_idle);
        }
        
        CPU_SECTION('creep-spawning', true);
    
    }
    
    

    CPU_SECTION_FINAL();
    
}
