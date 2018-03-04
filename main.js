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

    var tick_done = Memory[MEMORY_GLOBAL_TICKCOMPLETED];
    var tick_expected = Game.time - 1;
    if (tick_done != tick_expected) {
        var crashmsg = 'MISSING TICK: possible crash on ' + tick_expected + ' last section: ' + Memory[MEMORY_GLOBAL_CPUSTATS]['lastsection'];
        console.log(crashmsg);
    }

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
        UPDATE_MARKET_ORDERS();
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
    UPDATE_OBSERVERS(observe_energy);
    CPU_SECTION('update-observers');

    ESPIONAGE();
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
            if(Game.rooms[rname].isMine()) {
                if (Game.rooms[rname].terminal && Game.rooms[rname].terminal.isActive()) {
                    var lterm = Game.rooms[rname].terminal;
                    if (lterm.shouldPull()) {
                        lterm.acquireMineralAmount(RESOURCE_ENERGY, 5000, empire_defaults['terminal_energy_min']);
                        break;
                    } else if (lterm.shouldPush()) {
                        
                        //lterm.pushMineralAmount(RESOURCE_ENERGY, 5000, empire_defaults['terminal_energy_min']);
                        break;
                    } 
                }
            }
        }

        for(var rname in Game.rooms) {

            // DEFCON MANAGEMENT
            
            if (!Game.rooms[rname].inEmpire()) {
                continue;
            }
            
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
    Memory[MEMORY_GLOBAL_TICKCOMPLETED] = Game.time;    
}
