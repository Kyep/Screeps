"use strict";

// requirements ONLY

require('global.cpu');
require('global.config');
require('global_functions');
require('global.commands');
require('global.espionage');
require('global.expansion');
require('global.gclfarm');

require('global.flag');
require('global.creep');
require('global.structure');
require('global.spawning');
require('global.science');

require('config.empire');
require('config.units');
require('config.defines');
require('config.flags');

require('prototype.creep');
require('prototype.creep.rts');
require('prototype.creep.combat');
require('prototype.pos');
require('prototype.room');
require('prototype.room.config');
require('prototype.room.fortify');
require('prototype.room.remote');
require('prototype.room.defense');
require('prototype.room.boosts');
//require('prototype.room.safearea');
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

    if (typeof Memory[MEMORY_GLOBAL_CPUSTATS] === 'undefined') {
        Memory[MEMORY_GLOBAL_CPUSTATS] = {}
        Memory[MEMORY_GLOBAL_CPUSTATS]['lastsection'] = 'none';
    }
    var tick_done = Memory[MEMORY_GLOBAL_TICKCOMPLETED];
    var tick_expected = Game.time - 1;
    if (tick_done != tick_expected && Game.shard.name == 'shard1') {
        var crashmsg = 'MISSING TICK: possible crash during tick ' + tick_expected + ',  after section: ' + Memory[MEMORY_GLOBAL_CPUSTATS]['lastsection'];
        console.log(crashmsg);
        /*
        if (Memory[MEMORY_GLOBAL_CPUSTATS]['lastsection'] != 'finished') {
            Game.notify(crashmsg);
        }
        */
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

    if(Game.rooms['W53S2']) {
        if(Game.time % 320 === 0) {
            //Game.rooms['W53S2'].createUnit('ninja','W50S0');
        } else if(Game.time % 160 === 0) {
            //Game.rooms['W53S2'].createUnit('wizard','W50S0');
        }
    }

    var cpu_heavytick = false;


        if(Game.time % 1990 === 0) {
            //global.PRESET_ATTACK_WAVE();
            global.ESPIONAGE_ATTACK_PLANS();
            CPU_SECTION('espionage-plans', true);
        }

        if(Game.time % 1901 === 0) {
            global.ESPIONAGE_REGEN_TARGETS();
            cpu_heavytick = true;
            CPU_SECTION('espionage-regen', true);
        }

        if(Game.time % 500 === 0) {
            UPDATE_MARKET_ORDERS();
            CPU_SECTION('market-order-update', true);
            global.REPORT_STRUCTURES(false, false); // auto-builds buildable structures that have appropriate flags
            CPU_SECTION('report-structures', true);
        }

        if(Game.time % 2000 === 0) {
            RECREATE_ROAD_NETWORKS();
            CPU_SECTION('recreate-road-networks', true);
        }

        if(Game.time % 100 === 0) {
            UPDATE_FORTHP();
            CPU_SECTION('update-forthp', true);
        }

        if(Game.time % 300 === 0) {
            CHECK_FOR_OVERBURDENED_SPAWNERS();
            CPU_SECTION('rooms-partsalert', true);
        }

        if(Game.time % 25 === 0) {
            GCLFARM_PROCESS();
        }

        if(Game.time % 500 === 0) {
            HEAP_TEST();
            RUN_SIEGEPLANS();
        }
        
        if(Game.time % 5000 === 0) {
            SHOW_INCOMING_NUKES();
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

        if (!cpu_heavytick) {
            ESPIONAGE();
            CPU_SECTION('espionage-main');
        }

        SCIENCE_PROCESS();
        CPU_SECTION('science', true);


    RUN_CREEPS();
    CPU_SECTION('creep-life');

    if(Game.shard.name =='shard0') {
        return;
    }

    RUN_STRUCTURES();
    CPU_SECTION('structure-life');

    // ----------------------------------------------------------------------------------
    // SECTION: SECTION: Global actions which are done every X ticks, but X varies according to our current CPU bucket.

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


    if(Game.time % divisor === 0) {

        // EXPANSION CONTROLLER -- TODO MUST REWRITE THIS
        EXPANSION_PROCESS();
        CPU_SECTION('expansionplanner', true);

        // ROOM MANAGER
        for (var rname in Game.rooms) {
            if (Game.rooms[rname].isMine() && Game.rooms[rname].inEmpire()) {
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
                if (Game.rooms[rname].isFortified() || Game.rooms[rname].priorityRebuild() || Game.rooms[rname].priorityDefend()) {
                    if (BOOST_ENABLED_SHARDS.includes(Game.shard.name)) {
                        //Game.rooms[rname].ensureDefenseBoosts();
                    }
                    if (Game.rooms[rname].terminal && Game.rooms[rname].terminal.isActive() && Game.rooms[rname].storage && Game.rooms[rname].storage.isActive() && Game.rooms[rname].storage.store[RESOURCE_ENERGY] < 250000) {
                        var min_surplus = 10000;
                        if (Game.rooms[rname].priorityRebuild() || Game.rooms[rname].priorityDefend()) {
                            min_surplus = 100000;
                        }
                        if (Game.rooms[rname].terminal.getEnergyAboveMinimum() < min_surplus) {
                            var rr = Game.rooms[rname].terminal.acquireSpareEnergy();
                            //console.log('Fortified room ' + rname + ' tried to acquire energy: ' + rr);
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


        HANDLE_SPAWNING();
        CPU_SECTION('creep-spawning', true);

    }

    CPU_SECTION_FINAL();
    Memory[MEMORY_GLOBAL_TICKCOMPLETED] = Game.time;
}
