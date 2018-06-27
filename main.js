"use strict";

// requirements ONLY

require('global.cpu');
require('global.config');
require('global_functions');
require('global.commands');
require('global.espionage');
require('global.expansion');
require('global.gclfarm');

require('global.creep');
require('global.structure');
require('global.spawning');
require('global.science');

require('config.empire');
require('config.units');
require('config.defines');
require('config.flags');

require('prototype.creep');
require('prototype.pos');
require('prototype.room');
require('prototype.room.config');
require('prototype.room.remote');
require('prototype.room.defense');
require('prototype.room.boosts');
require('prototype.structures_all');
require('prototype.structure');
require('prototype.source');
require('prototype.flag');

require('lib.loanuserlist');


// ---------------------------
// BEGIN MAIN LOOP 
// ---------------------------

module.exports.loop = function () {
    
    // ----------------------------------------------------------------------------------
    // SECTION: CPU tracking (must come first)
    
    global.GLOBALCONFIG = global.GET_ALL_GLOBAL_CONFIG();

    var tick_done = Memory[MEMORY_GLOBAL_TICKCOMPLETED];
    var tick_expected = Game.time - 1;
    if (tick_done != tick_expected) {
        var crashmsg = 'MISSING TICK: possible crash during tick ' + tick_expected + ',  after section: ' + Memory[MEMORY_GLOBAL_CPUSTATS]['lastsection'];
        console.log(crashmsg);
        if ( Memory[MEMORY_GLOBAL_CPUSTATS]['lastsection'] != 'finished') {
            Game.notify(crashmsg);
        }
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
    //global.LOANlist = [];

    CPU_SECTION('setup');
    


    // ----------------------------------------------------------------------------------
    // SECTION: Global actions that are done once per set number of ticks, regardless of current CPU bucket

    if(Game.time % 1900 === 0) {
        //global.PRESET_ATTACK_WAVE();
        //global.ESPIONAGE_ATTACK_PLANS(true, true);
        //CPU_SECTION('espionage-attackplans', true);
        global.ESPIONAGE_REGEN_TARGETS();
        CPU_SECTION('espionage-regen', true);
    }

    if(Game.time % 500 === 0) {
        UPDATE_MARKET_ORDERS();
        CPU_SECTION('market-order-update', true);
        global.REPORT_STRUCTURES(false); // auto-builds buildable structures that have appropriate flags
        CPU_SECTION('report-structures', true);
    }

    if(Game.time % 2000 === 0) {
        RECREATE_ROAD_NETWORKS();
        CPU_SECTION('recreate-road-networks', true);
    }

    if(Game.time % 2 === 0) {
        SCIENCE_PROCESS();
        CPU_SECTION('science', true);
    }

    if(Game.time % 300 === 0) {
        
        CHECK_FOR_OVERBURDENED_SPAWNERS();
        CPU_SECTION('rooms-partsalert', true);
    }

    if(Game.time % 25 === 0) {
        GCLFARM_PROCESS();
    }

    if(Game.time % 100 === 0) {
        HEAP_TEST();
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
        EXPANSION_PROCESS();
        CPU_SECTION('expansionplanner', true);


        // ROOM MANAGER

        
        for (var rname in Game.rooms) {
            if (Game.rooms[rname].isMine()) {
                var known_level = Game.rooms[rname].memory[MEMORY_RLVL];
                var rlvl = Game.rooms[rname].getLevel();
                if (known_level == undefined || known_level != rlvl) {
                        Game.rooms[rname].memory[MEMORY_RLVL] = rlvl;
                        Game.rooms[rname].recycleObsolete();
                        Game.rooms[rname].generateFlags();
                        Game.rooms[rname].checkStructures();
                        console.log(rname + ': updated room level.');
                }
                if (rlvl == 6 || rlvl == 7) {
                    //console.log(rname + ' x1');
                    if (Game.rooms[rname].terminal && Game.rooms[rname].terminal.isActive() && Game.rooms[rname].storage && Game.rooms[rname].storage.isActive() && Game.rooms[rname].storage.store[RESOURCE_ENERGY] < 250000) {
                        //console.log(rname + ' x2');
                        var lterm = Game.rooms[rname].terminal;
                        if (lterm.canDepositEnergy()) {
                            //console.log(rname + ' x3');

                            lterm.acquireSpareEnergy();
                            break;
                        }
                    }
                }
            }
        }
        CPU_SECTION('terminal-transfer', true);
        

        for(var rname in Game.rooms) {
            if(Game.rooms[rname].inEmpire()) {
                Game.rooms[rname].updateConfig();
            }
        }
        CPU_SECTION('assignment-updates', true);
        
        
        // DEFCON MANAGEMENT
        for(var rname in Game.rooms) {
            if (!Game.rooms[rname].inEmpire()) {
                continue;
            }
            
            var enemy_details = Game.rooms[rname].detailEnemies();
            var nuke_details = Game.rooms[rname].detailNukes();
            var has_alert = Game.rooms[rname].hasAlert();
            var should_have_alert = Game.rooms[rname].shouldHaveAlert(enemy_details, nuke_details);
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
        CPU_SECTION('defcon-update', true);

        HANDLE_ALL_ROOM_ALERTS();
        CPU_SECTION('defcon-process', true);
        
        HANDLE_SPAWNING();
        CPU_SECTION('creep-spawning', true);
    
    }
    
    CPU_SECTION_FINAL();
    Memory[MEMORY_GLOBAL_TICKCOMPLETED] = Game.time;    
}
