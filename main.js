"use strict";

// requirements ONLY

require('global_functions');
require('global.commands');
require('global.espionage');

require('config.empire');
require('config.units');
require('config.defines');

require('prototype.creep');
require('prototype.room');
require('prototype.structure');

require('lib.loanuserlist');

var roleHarvester = require('role.harvester');
var roleCHarvester = require('role.charvester');
var roleHauler = require('role.hauler');

var roleExtractor = require('role.extractor');
var roleUpgrader = require('role.upgrader');
var roleUpgraderStorage = require('role.upgraderstorage');
var roleGrower = require('role.grower');
var roleBuilder = require('role.builder');
var roleAdventurer = require('role.adventurer');
var roleScavenger = require('role.scavenger');
var roleClaimer = require('role.claimer');
var roleReserver = require('role.reserver');
var roleRecycler = require('role.recycler'); 
var roleBuilderStorage = require('role.builderstorage');
var roleTeller = require('role.teller');
var roleRemoteconstructor = require('role.remoteconstructor');
var roleSiege = require('role.siege');
var roleSiegeHealer = require('role.siegehealer');
var roleDrainer = require('role.drainer');
var roleSigner = require('role.signer');
var roleLabtech = require('role.labtech');
var roleNuketech = require('role.nuketech');
var roleDismantler = require('role.dismantler');

var structureLink = require('structure.link');

var cleaner = require('task.cleanmemory');
var expansionplanner = require('task.expansion');
var taskscience = require('task.science');

// ---------------------------
// BEGIN MAIN LOOP 
// ---------------------------

module.exports.loop = function () {

    var cpu_setup_use = Game.cpu.getUsed();

    var divisor = 3;
    if (Game.cpu.bucket < 1000) {
        console.log('Account: ' + Game.cpu.limit + ', Cycle: ' + Game.cpu.tickLimit + ', Bucket: ' + Game.cpu.bucket);
        divisor = 5;
        if (Game.cpu.bucket < 8000) {
            divisor = 10;
        }
    }
    cleaner.process()
    for(var cr in Game.creeps) {
        Game.creeps[cr].setupMemory();
    }
    global.populateLOANlist();

    cpu_setup_use = Game.cpu.getUsed() - cpu_setup_use;
    if (cpu_reporting) { console.log('CPU cpu_setup_use: ' + cpu_setup_use); }

    var lastFour = Game.time % 10000;
    var observe_energy = 0;
    if (lastFour == 9999) {
        observe_energy = 1;
    }

    global.UPDATE_OBSERVERS(observe_energy);

    if(Game.time % 250 === 0) {
        global.CREATE_GROWERS();
        //global.SHARE_SPARE_ENERGY(); 
    }
    if(Game.time % 2500 === 0) {
        //global.PRESET_ATTACK_WAVE();
        global.ESPIONAGE_ATTACK_PLANS(true);
        global.ESPIONAGE_RESET_TARGETS();
    }

    global.ESPIONAGE();

    if(Game.time % 500 === 0) {
        var saved_energy_network = Memory['energy_network'];
        var sene = saved_energy_network[ENERGY_EMPTY];
        var allow_e_sale = false;
        if (sene != undefined && sene.length == 0) {
            allow_e_sale = true;
        }
        global.UPDATE_MARKET_ORDERS(allow_e_sale);
    }

    if(Game.time % 2500 === 0) {
        RECREATE_ROAD_NETWORKS();
    }

    if(Game.time % divisor === 0) {

        // EXPANSION CONTROLLER
        var cpu_planner_use = Game.cpu.getUsed();
        expansionplanner.process()
        taskscience.process()
        cpu_planner_use = Game.cpu.getUsed() - cpu_planner_use;
        if (cpu_reporting) { console.log('CPU cpu_planner_use: ' +cpu_planner_use); }


        var cpu_rm_use = Game.cpu.getUsed();
        // ROOM MANAGER
        var timenow = Game.time;
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

                // Adjust builders depending on unfinished projects.
                var projectsList = Game.rooms[rname].find(FIND_MY_CONSTRUCTION_SITES);
                if(projectsList.length > 0) {
                    if(energy_reserves > empire_defaults['room_energy_min']) {
                        empire[rname].sources['builder'] = {'sourcename': empire[rname]['roomname'] + '-B', 'x':25, 'y':25, 'assigned': {}, 'expected_income': 10, 'dynamic': 1}
                        empire[rname].sources['builder'].assigned['builderstorage'] = 2;
                    }
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
                } else if (Game.rooms[rname] != undefined && Game.rooms[rname].controller != undefined && Game.rooms[rname].controller.level != 8) {
                    empire[rname].sources['upgrader'] = {'sourcename': empire[rname]['roomname'] + '-U', 'x':25, 'y':25, 'assigned': {}, 'expected_income': 75, 'dynamic': 1}
                    var ugtype = 'upstorclose';
                    if(empire[rname]['farcontroller'] != undefined) {
                        ugtype = 'upstorfar';
                    }
                    var r_multiplier = 8; // by default, assume we have other terminals feeding us.
                    if (Game.rooms[rname].terminal == undefined || !Game.rooms[rname].terminal.isActive()) {
                        // Assume no remote boosts.
                        r_multiplier = Math.round(energy_reserves / empire_defaults['room_energy_min']);
                        if (r_multiplier > 8) { 
                            r_multiplier = 8; 
                        }
                    }
                    //console.log(rname + ': ' + r_multiplier);
                    if (r_multiplier > 0) {
                        //console.log(rname + ' ' + r_multiplier + ' ' + ugtype);
                        empire[rname].sources['upgrader'].assigned[ugtype] = r_multiplier;
                    }
                }
            } else if (Game.rooms[rname].hasAlert()) {
                // do nothing
            } else if (Game.rooms[rname].controller != undefined && Game.rooms[rname].controller.level != undefined && Game.rooms[rname].controller.level >= 1) {
                // Do not send RCs to base rooms. They use builderstorages instead.
            } else {
                var projectsList = Game.rooms[rname].find(FIND_MY_CONSTRUCTION_SITES);
                var construction_hp = 0;
                for(var i = 0; i < projectsList.length; i++) {
                    construction_hp += (projectsList[i].progressTotal - projectsList[i].progress);
                }
                var rctype = 'minirc';
                if (construction_hp > 5000) {
                    rctype = 'remoteconstructor';
                }
                if(projectsList.length > 0) {
                    if (empire[rname] != undefined) {
                        for(var sname in empire[rname].sources) {
                            if (empire[rname].sources[sname]['dynamic'] != undefined) {
                                continue;
                            }
                            if (empire[rname].sources[sname]['spaces'] != undefined && empire[rname].sources[sname]['spaces'] == 1) {
                                // If source can't handle another miner, do not assign one.
                                //empire[rname].sources[sname].assigned = {};
                                //empire[rname].sources[sname].assigned[rctype] = 1;
                                continue;
                            }
                            empire[rname].sources[sname].assigned[rctype] = 1;
                        }
                    }
                }
            }
            
            // ENERGY AVAILABILITY MANAGEMENT
            if(Game.rooms[rname].energyCapacityAvailable > 0) {
                if (Game.rooms[rname].memory == undefined) {
                    Game.rooms[rname].memory = {};
                }
                if (Game.rooms[rname]['storage'] != undefined) {
                    var rmem = Game.rooms[rname].memory;
                    var max_history = empire_defaults['room_history_ticks'];
                    if (rmem['energyhistory'] == undefined) {
                        rmem['energyhistory'] = [];
                    }
                    if (rmem['energyhistory'].length >= max_history) {
                        rmem['energyhistory'].pop();
                    }
                    rmem['energyhistory'].unshift(Game.rooms[rname].energyAvailable);
                    var e_hist_total = 0;
                    for (var i = 0; i < rmem['energyhistory'].length; i++) {
                        e_hist_total += rmem['energyhistory'][i];
                    }
                    var e_hist_avg = Math.round(e_hist_total / rmem['energyhistory'].length);
                    var e_hist_avg_pc = Math.round(e_hist_avg / Game.rooms[rname].energyCapacityAvailable * 100);
                    if (e_hist_avg_pc < empire_defaults['room_minimum_energy_pc']) {
                        var rhid = empire[rname]['roomname'];
                        var mysname = rhid + '-T';
                        if(empire[rname].sources[mysname] == undefined) {
                            empire[rname].sources[mysname] = { 'sourcename': mysname, 'x':20, 'y':20, 'assigned': {}, 'expected_income': 100 }
                        }
                        if (e_hist_avg_pc < empire_defaults['room_crit_energy_pc']) {
                            empire[rname].sources[mysname].assigned['teller'] = 2;
                            //console.log(rname + ' requires 2x teller: ' + e_hist_avg_pc + ' < ' + empire_defaults['room_minimum_energy_pc']);
                        } else {
                            empire[rname].sources[mysname].assigned['teller'] = 1;
                            //console.log(rname + ' requires a teller: ' + e_hist_avg_pc + ' < ' + empire_defaults['room_minimum_energy_pc']);
                        }
                        
                    } else { 
                        //console.log(rname + ' no requires a teller: ' + e_hist_avg_pc + ' > ' + empire_defaults['room_minimum_energy_pc']);
                    }
                    Game.rooms[rname].memory = rmem;
                }
            }
            
            // SCAVENGER MANAGEMENT
            if(Game.rooms[rname].energyCapacityAvailable > 0) {
                var dropped_resources = Game.rooms[rname].find(FIND_DROPPED_RESOURCES, {filter: (s) => s.energy > 0});
                if (dropped_resources.length > 0) {
                    var energy_on_ground = 0;
                    for (var i = 0; i < dropped_resources.length; i++) {
                        energy_on_ground += dropped_resources[i].energy;
                    }
                    if (energy_on_ground > (1.5 * UNIT_COST(empire_workers['scavenger']['body']))) {
                        var rhid = empire[rname]['roomname'];
                        var mysname = rhid + '-scavenger';
                        if(empire[rname].sources[mysname] == undefined) {
                            empire[rname].sources[mysname] = { 'sourcename': mysname, 'x':20, 'y':20, 'assigned': {}, 'expected_income': 90, 'dynamic': 1 }
                        }
                    empire[rname].sources[mysname].assigned['scavenger'] = 1;
                    }
                }
            }
            
            // MINERAL MANAGEMENT
            if(empire[rname] != undefined) {
                if (empire[rname]['mineralid'] != undefined) {
                    var mineralpatch = Game.getObjectById(empire[rname]['mineralid'])
                    if (mineralpatch) {
                        var mlvl = Game.rooms[rname].getLevel();
                        var term = Game.rooms[rname].terminal;
                        if (mlvl >= 6 && term) {
                            var got_minerals = Game.rooms[rname].terminal.store[empire[rname]['mineraltype']];
                            if (got_minerals >= empire_defaults['mineralcap']) {
                                //console.log(rname + ' is capped on minerals with ' + got_minerals + ' > ' + empire_defaults['mineralcap']);
                            } else if (mineralpatch.mineralAmount > 0) {
                                var rhid = empire[rname]['roomname'];
                                var mysname = rhid + '-mining';
                                if(empire[rname].sources[mysname] == undefined) {
                                    empire[rname].sources[mysname] = { 'sourcename': mysname, 'x':20, 'y':20, 'assigned': {}, 'expected_income': 50 }
                                }
                                empire[rname].sources[mysname]['assigned'] = {'extractor': 1}
                            }
                        }
                    }
                }
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
        global.HANDLE_ALL_ROOM_ALERTS();
        
        Memory['energy_network'] = energy_network;
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
                    var send_result = source_terminal.send(RESOURCE_ENERGY, 25000, dest_room, 'empty room pulls energy from full');
                    console.log('ENERGYNET: ' + source_room + ' sends energy to (starving) room: ' + dest_room + ', result:' + send_result);
                    if (send_result == OK) {
                        break;
                    }
                }
            }
        }
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


        cpu_rm_use = Game.cpu.getUsed() - cpu_rm_use;
        if (cpu_reporting) { console.log('CPU cpu_rm_use: ' +cpu_rm_use); }
        
        // SPAWNING MANAGER
        var cpu_spawning_use = Game.cpu.getUsed();
        for (var rname in empire) {
            empire[rname].living = {};
        }
        var spawner_parts = {};
        var room_parts = {}
        for(var name in Memory.creeps) {
            Game.creeps[name].memory[MEMORY_NEEDED] = 0;
            if(Game.creeps[name].memory.spawner == undefined) {
                var pcount = Game.creeps[name].body.length;
                if (Game.creeps[name].memory[MEMORY_SPAWNERNAME] == undefined) {
                    console.log(name + ' has undefined spawner.');
                    continue;
                }
                if (spawner_parts[Game.creeps[name].memory[MEMORY_SPAWNERNAME]] == undefined) {
                    spawner_parts[Game.creeps[name].memory[MEMORY_SPAWNERNAME]] = pcount;
                }  else {
                    spawner_parts[Game.creeps[name].memory[MEMORY_SPAWNERNAME]] += pcount;
                }
                if (Game.creeps[name].memory[MEMORY_SPAWNERROOM] != undefined) {
                    if (room_parts[Game.creeps[name].memory[MEMORY_SPAWNERROOM]] == undefined) {
                        room_parts[Game.creeps[name].memory[MEMORY_SPAWNERROOM]] = pcount;
                    }  else {
                        room_parts[Game.creeps[name].memory[MEMORY_SPAWNERROOM]] += pcount;
                    }
                }
            }
            if(Game.creeps[name].memory.source == undefined) {
                console.log('WARN: ' + Game.creeps[name] + ' in ' + Game.creeps[name].room.name + ' has no source defined.');
            }
            if(Game.creeps[name].memory[MEMORY_ROLE]) {
                var myrole = Game.creeps[name].memory[MEMORY_ROLE];
                if(Game.creeps[name].memory.source != undefined) {
                    var mysource = Game.creeps[name].memory.source;
                    var myroom = Game.creeps[name].memory.target;
                    if(empire[myroom] == undefined) {
                        //console.log('WARN: ' + Game.creeps[name] + ' in ' + Game.creeps[name].room.name + ' has a room defined as target that has no empire definition.');
                        continue;
                    }
                    if(empire[myroom].living == undefined) {
                        empire[myroom].living = {};
                    }
                    if(empire[myroom].living[mysource] == undefined) {
                        empire[myroom].living[mysource] = {};
                    }
                    if(empire[myroom].living[mysource][myrole] == undefined) {
                        empire[myroom].living[mysource][myrole] = 1;
                    } else {
                        empire[myroom].living[mysource][myrole] += 1;
                    }
                    //console.log(name + ': Source ' + myroom + '/' + mysource +'/'+ myrole + ' set to ' + empire[myroom].living[mysource][myrole]);
                    var desired = 0;
                    if(Game.creeps[name].memory.target != undefined && Game.creeps[name].memory.source != undefined && Game.creeps[name].memory[MEMORY_ROLE] != undefined) {
                        if (empire[Game.creeps[name].memory.target] != undefined) {
                            if (empire[Game.creeps[name].memory.target].sources[Game.creeps[name].memory.source] != undefined) {
                                if (empire[Game.creeps[name].memory.target].sources[Game.creeps[name].memory.source].assigned[Game.creeps[name].memory[MEMORY_ROLE]] != undefined) {
                                    desired = empire[Game.creeps[name].memory.target].sources[Game.creeps[name].memory.source].assigned[Game.creeps[name].memory[MEMORY_ROLE]];
                                    if (empire[myroom].living[mysource][myrole] <= desired) {
                                        Game.creeps[name].memory[MEMORY_NEEDED] = 1;
                                    } 
                                }
                            }
                        }
                    }
                } else {
                    console.log('Creep ' + name + ' has NO SOURCE! THIS IS BAD, FIX IT!');
                }
            } else {
                console.log('Creep ' + name + ' has NO ROLE!');
                continue;
            }
        }

        if (Game.time % 100 == 0) {
            for(var rmname in room_parts) {
                var rmspawns = Game.rooms[rmname].find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } } );
                var num_spawns = rmspawns.length;
                if(room_parts[rmname] > (400 * num_spawns)) {
                    console.log('ALERT: room ' + rmname + ' is maintaining ' + room_parts[rmname] + ' with ' + num_spawns + ' spawner(s).');
                }
            }
        }

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
            var spawn_queue = {};
            if(Memory['config.reportworkers'] == undefined) {
                Memory['config.reportworkers'] = 0;
            }
            for (var rname in empire) {
                var r_status = rname 
                r_status += ': ';
                for (var skey in empire[rname].sources) {
                    var s_dynamic = false;
                    var s_status = 'Source: |' + empire[rname].sources[skey]['sourcename'] + '|: ';
                    var f_d = empire[rname].sources[skey]['dynamic'];
                    var replace_assign_ml = false;
                    var use_dismantle = false;
                    var spawns_from = empire[rname]['spawn_room'];
                    
                    if (f_d != undefined && f_d == 1) {
                        s_dynamic = true;
                    } else {
                        if (spawns_from) {
                            var robj = Game.rooms[spawns_from];
                            if (robj) {
                                var rlvl = robj.getLevel();
                                if (rlvl > 0 && rlvl < 4) {
                                    replace_assign_ml = true;
                                }
                            }
                        }
                    }
                    if(rname == spawns_from && Game.rooms[rname]) {
                        var eslist = Game.rooms[rname].getHostileStructures();
                        if (eslist.length) {
                            use_dismantle = 1;
                        }
                    }
                    
                    
                    s_status = 'Source: |' + empire[rname].sources[skey]['sourcename'] + '|: ';
                    if (replace_assign_ml) {
                        var newtype = empire_defaults['MSL_4_replacement']
                        empire[rname].sources[skey].assigned = {}
                        empire[rname].sources[skey].assigned[newtype] = 2;
                        r_status += '<font color="yellow">' + empire[rname].sources[skey]['sourcename'] + '</font>: ';
                    } else {
                        r_status += empire[rname].sources[skey]['sourcename'] + ': ';
                    }
                    if (use_dismantle) {
                        empire[rname].sources[skey].assigned['dismantler'] = 2;
                    }

                    if (empire[rname].living == undefined) {
                        empire[rname].living = {};
                    }
                    if (empire[rname].living[skey] == undefined) {
                        empire[rname].living[skey] = {};
                    }


                    for (var role in empire[rname].sources[skey].assigned) {
                        
                        if (empire[rname].living[skey][role] == undefined) {
                            empire[rname].living[skey][role] = 0;
                        }
                        var living_text = empire[rname].living[skey][role];
                        if (empire[rname].living[skey][role] < empire[rname].sources[skey].assigned[role]) {
                            living_text = '<font color="red">' + living_text + '</font>';
                        }
                        s_status += role + ': ' + living_text + '/' + empire[rname].sources[skey].assigned[role] + ' ';
                        r_status += role + ': ' + living_text + '/' + empire[rname].sources[skey].assigned[role] + ' ';
                        if (empire[rname].living[skey][role] < empire[rname].sources[skey].assigned[role]) {
                            if(global.ROOM_UNDER_ATTACK(rname) && !empire_defaults['military_roles'].includes(role) && !empire_defaults['priority_roles'].includes(role)) {
                                //console.log('SPAWN: holding spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + '| until attack on ' + rname + ' is over.');
                                continue;
                            }
                            //if (!empire_defaults['military_roles'].includes(role) && !empire_defaults['priority_roles'].includes(role)) {
                            //    console.log('TEMPORARY BLOCK! holding spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + '|');
                            //}

                            var gsapfr = GET_SPAWNER_AND_PSTATUS_FOR_ROOM(rname);
                            var spawner = gsapfr[0];
                            var using_primary = gsapfr[1];
                            if (spawner == undefined) {
                                //console.log('SPAWN: holding spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + ' because spawner is undefined.');
                                continue;
                            }
                            var home_room = spawner.room.name;
                            var renew_allowed = 1;
                            if (!using_primary && empire[rname]['spawn_room'] != undefined) {
                                home_room = empire[rname]['spawn_room'];
                                renew_allowed = 0;
                            }
                            //console.log('SOBJ: ' + JSON.stringify(spawner));

                            if(spawner == undefined) {
                                //console.log('SKIP: ' + role + ' for ' + rname + ' |' + empire[rname].sources[skey]['sourcename'] + '| as source room has no available spawners.');
                                continue;
                            }/* else if(spawner.spawning != null) {
                                console.log('SPAWNER BUSY:  ' + role + ' for |' + empire[rname].sources[skey]['sourcename'] + '|');
                                continue;
                            }*/              
                            if (empire_workers[role] == undefined) {
                                console.log(spawner.name + ': UNDEFINED ROLE: ' + role);
                                continue;
                            }

                            var expected_income = 0;
                            if(empire[rname].sources[skey]['expected_income'] != undefined) {
                                expected_income = empire[rname].sources[skey]['expected_income'];
                            }
                            if(spawn_queue[spawner.name] != undefined) {
                                if(spawn_queue[spawner.name]['expected_income'] != undefined) {
                                    if (expected_income > spawn_queue[spawner.name]['expected_income']) {
                                        /*console.log(spawner.name + ': permitting spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + '| because its expected_income ' + 
                                            expected_income + ' is > than the ' + spawn_queue[spawner.name]['expected_income'] + ' of ' +
                                            spawn_queue[spawner.name]['spawnrole'] + ' working on |' + empire[spawn_queue[spawner.name]['rname']].sources[spawn_queue[spawner.name]['skey']]['sourcename']  + '|');
                                        */
                                    } else {
                                        /*console.log(spawner.name + ': holding spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + '| because its expected_income ' + 
                                            expected_income + ' is <= than the ' + spawn_queue[spawner.name]['expected_income'] + ' of ' +
                                            spawn_queue[spawner.name]['spawnrole'] + ' working on |' + empire[spawn_queue[spawner.name]['rname']].sources[spawn_queue[spawner.name]['skey']]['sourcename']  + '|');
                                        */
                                        continue;
                                    }
                                } else {
                                    /*console.log(spawner.name + ': permitting spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + '| because its expected_income ' + 
                                        expected_income + ' is > than the (undefined) of ' +
                                        spawn_queue[spawner.name]['spawnrole'] + ' working on |' + empire[spawn_queue[spawner.name]['rname']].sources[spawn_queue[spawner.name]['skey']]['sourcename'] + '|');
                                    */
                                }
                            } else {
                                //console.log(spawner.name + ': permitting spawn queue set as there is nothing in queue.');
                            }

                            
                            if (spawner.room.energyAvailable < 300) {
                                //console.log(spawner.name + ': holding spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + '| as cost exceeds MIN ENERGY: ' + spawner.room.energyAvailable);
                            }
                            
                            var rbap = spawner.getRoleBodyAndProperties(role, rname, skey);
                            var partlist = rbap['body'];
                            if(rbap['renew_allowed'] == 0) {
                                renew_allowed = 0;
                            }


                            var spawnrole = role;
                            var thecost = global.UNIT_COST(partlist);
                            if (spawner.room.energyCapacityAvailable < thecost) {
                                //console.log(spawner.name + ': holding spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + '| as THIS UNIT cost ' + thecost + ' exceeds MAX STORAGE: ' + spawner.room.energyAvailable + ' ');
                                continue;
                            }
                            
                            if (spawner.room.energyAvailable < thecost) {
                                //console.log(spawner.name + ': holding spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + '| as we lack the cost ' + thecost + ' exceeds storage: ' + spawner.room.energyAvailable);
                                continue;
                            }
                            
                            var target_x = 25;
                            var target_y = 25;
                            if(empire[rname].sources[skey]['x'] != undefined) { target_x = empire[rname].sources[skey]['x']; }
                            if(empire[rname].sources[skey]['y'] != undefined) { target_y = empire[rname].sources[skey]['y']; }
                            if(empire[rname].sources[skey]['target_x'] != undefined) { target_x = empire[rname].sources[skey]['target_x']; }
                            if(empire[rname].sources[skey]['target_y'] != undefined) { target_y = empire[rname].sources[skey]['target_y']; }

                            if(!using_primary) {
                                //console.log('SECONDARY SPAWNING: ' + spawner.name + ' in ' + spawner.room.name + ' created ' + spawnrole + ' for |' + empire[rname].sources[skey]['sourcename'] + 
                                //'| cost: ' + thecost + '/' + spawner.room.energyAvailable + ' capacity:' + spawner.room.energyCapacityAvailable + ' based out of ' + home_room+ ' with renew: ' + renew_allowed);
                            }

                            spawn_queue[spawner.name] = {
                                'spawner': spawner.name, 'sname': empire[rname].sources[skey]['sourcename'], 'partlist': partlist, 'spawnrole': spawnrole, 'skey': skey, 'rname': rname, 
                                'thecost': thecost, 'myroomname': home_room, 'target_x': target_x, 'target_y': target_y,  
                                'expected_income': expected_income, 'renew_allowed': renew_allowed, 'nextdest': []
                            }
                            //console.log(JSON.stringify(spawn_queue));
                        }
                    }
                    /*if (Memory['config.reportworkers'] > 0) {
                        console.log(s_status);
                    }*/
                    
                }
                if (Memory['config.reportworkers'] > 0) {
                    console.log(r_status);
                }
                
            }
            if (Memory['config.reportworkers'] > 0) {
                Memory['config.reportworkers'] -= 1;
            }
            //console.log(JSON.stringify(spawn_queue));
            for(var spawnername in Game.spawns) {
                if (Game.spawns[spawnername].memory['role_spawning'] != undefined) {
                    if (Game.spawns[spawnername].spawning == undefined) {
                        Game.spawns[spawnername].memory['role_spawning'] = undefined;
                        Game.spawns[spawnername].memory['dest_spawning'] = undefined;
                    } else if (empire_defaults['military_roles'].includes(Game.spawns[spawnername].memory['role_spawning'])) {
                        Game.spawns[spawnername].room.visual.text(Game.spawns[spawnername].spawning.remainingTime + ': ' + Game.spawns[spawnername].spawning.name, Game.spawns[spawnername].pos.x, Game.spawns[spawnername].pos.y +1.5, {color: 'red', backgroundColor: 'white', font: 0.8});
                    } else if (Game.spawns[spawnername].memory['dest_spawning'] != undefined && Game.spawns[spawnername].memory['dest_spawning'] == Game.spawns[spawnername].room.name) {
                        Game.spawns[spawnername].room.visual.text(Game.spawns[spawnername].spawning.remainingTime + ': ' + Game.spawns[spawnername].spawning.name, Game.spawns[spawnername].pos.x, Game.spawns[spawnername].pos.y +1.5, {color: 'green', backgroundColor: 'white', font: 0.8});
                    } else {
                        Game.spawns[spawnername].room.visual.text(Game.spawns[spawnername].spawning.remainingTime + ': ' + Game.spawns[spawnername].spawning.name, Game.spawns[spawnername].pos.x, Game.spawns[spawnername].pos.y +1.5, {color: 'blue', backgroundColor: 'white', font: 0.8});
                    }
                } else if (spawn_queue[spawnername] != undefined) {
                    var thespawner = Game.spawns[spawnername];
                    //continue;
                    if (thespawner.room.energyAvailable >= spawn_queue[spawnername]['thecost']) {
                        SPAWNCUSTOM(
                            thespawner, spawn_queue[spawnername]['sname'], spawn_queue[spawnername]['partlist'], spawn_queue[spawnername]['spawnrole'], 
                            spawn_queue[spawnername]['skey'], spawn_queue[spawnername]['rname'], spawn_queue[spawnername]['thecost'], 
                            spawn_queue[spawnername]['myroomname'], spawn_queue[spawnername]['target_x'], 
                            spawn_queue[spawnername]['target_y'], spawn_queue[spawnername]['renew_allowed'], spawn_queue[spawnername]['nextdest']
                        );
                        thespawner.memory['role_spawning'] = spawn_queue[spawnername]['spawnrole'];
                        thespawner.memory['dest_spawning'] = spawn_queue[spawnername]['rname'];
                    } else {
                        console.log(spawn_queue[spawnername]['sname'] + ': ' + spawn_queue[spawnername]['spawnrole'] + ' too expensive (' + spawn_queue[spawnername]['thecost'] + '/' + thespawner.room.energyAvailable + '), saving up.');
                    }
                } else {
                    // spawner ~thespawner~ has a full queue.
                }
            }
        }
        cpu_spawning_use = Game.cpu.getUsed() - cpu_spawning_use;
        if (cpu_reporting) { console.log('CPU cpu_spawning_use: ' + cpu_spawning_use); }
    
    }
    
    // STRUCTURE MANAGEMENT, TOWER SETUP
    var rtowers = {};
    for(var id in Game.structures){
        if(Game.structures[id].structureType == STRUCTURE_TOWER){
            var thistower = Game.structures[id];
            var rname = thistower.room.name;
            if (rtowers[rname] == undefined) {
                rtowers[rname] = [];
            }
            rtowers[rname].push(thistower);
        }
        if(Game.structures[id].structureType == STRUCTURE_LINK){
            structureLink.run(Game.structures[id]);
        }
    }

    // TOWER MANAGEMENT
    for(var rname in rtowers) {
        
        var theroom = Game.rooms[rname];
        
        // If hostiles in room, focus fire.        
        var enemiesList = theroom.getHostileCreeps();
        if (enemiesList.length) {
            var highest_threat = -1;
            var best_target = undefined;
            for (var i = 0; i < enemiesList.length; i++) {
                var this_pri = enemiesList[i].getTargetPriority();
                if (this_pri > highest_threat) {
                    highest_threat = this_pri;
                    best_target = enemiesList[i];
                }
            }

            for (var tnum in rtowers[rname]) {
                var thistower = rtowers[rname][tnum];
                thistower.attack(best_target);
                //thistower.room.visual.circle(thistower.pos, {fill: 'transparent', radius: TOWER_OPTIMAL_RANGE, stroke: 'green'});
                //thistower.room.visual.circle(thistower.pos, {fill: 'transparent', radius: TOWER_FALLOFF_RANGE, stroke: 'yellow'});
                //thistower.room.visual.line(thistower.pos, best_target.pos, {color: 'red'});
            }
            continue;
        }

        // If no hostiles in room, repair.
        var repairMax = theroom.getTowerRepairMax();
        var repairTargets = theroom.find(FIND_STRUCTURES, {
                filter: function(structure){
                    if(structure.structureType == STRUCTURE_RAMPART){
                        return (structure.hits < repairMax)
                    } else {
                        return 0
                    }
                }
        });
        if (!repairTargets.length) {
            repairTargets = theroom.find(FIND_STRUCTURES, {
                filter: function(structure){
                    if(structure.structureType == STRUCTURE_ROAD){
                        return (structure.hits < structure.hitsMax)
                    } else {
                        return 0
                    }
                }
            });
        }
        if (!repairTargets.length) {
            repairTargets = theroom.find(FIND_STRUCTURES, {
                filter: function(structure){
                    if(structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART){
                        return (structure.hits < repairMax)
                    }else{
                        return (structure.hits < (structure.hitsMax - TOWER_POWER_REPAIR))
                    }
                }
            });
        }
        if (!repairTargets.length) {
            continue;
        }
        // move the most damaged thing to the front.
        repairTargets.sort(function(a, b){
            return a.hits - b.hits
        });

        var available_towers = [];
        for (var tnum in rtowers[rname]) {
            var thistower = rtowers[rname][tnum];
            if (thistower.energy >= 50) {
                available_towers.push(thistower);
            }
        }
        //console.log(rname + ' ' + repairTargets.length + ' rts, ' + ' ' + available_towers.length + ' avts');
        if (available_towers.length) {
            if (repairTargets.length >= 3) {
                for (var avtower in available_towers) {
                    var near_rep = available_towers[avtower].pos.findClosestByRange(repairTargets);
                    available_towers[avtower].repair(near_rep);
                }
            } else {
                var thingtorepair = repairTargets[0];
                var chosen_tower = thingtorepair.pos.findClosestByRange(available_towers);
                chosen_tower.repair(thingtorepair);
            }
    
            var healTargets = theroom.find(FIND_MY_CREEPS, {
                filter: function(creep){
                    return (creep.hits < creep.hitsMax)
                }
            })
            if(healTargets.length){
                healTargets.sort(function(a, b){
                    return a.hits - b.hits
                });
                for (var tnum in rtowers[rname]) {
                    var thistower = rtowers[rname][tnum];
                    var target = healTargets[0];
                    thistower.heal(target);
                }
            }
        }
    }

    var cpu_creep_use = Game.cpu.getUsed();

    var creep_cpu_map = {}

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];

        var creep_cpu = Game.cpu.getUsed();

        if (creep.spawning) {
            // creeps cannot do anything while they're being spawned.
        } else if (!creep.hasSetDefaults()) {
            creep.setDefaults();
        } else if (creep.memory[MEMORY_SLEEPFOR] != undefined && creep.memory[MEMORY_SLEEPFOR] > 0) {
            creep.memory[MEMORY_SLEEPFOR]--;
        } else if(creep.memory[MEMORY_ROLE] == 'harvester' || creep.memory[MEMORY_ROLE] == 'bharvester' || creep.memory[MEMORY_ROLE] == 'fharvester') {
            roleHarvester.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'c15harvester' || creep.memory[MEMORY_ROLE] == 'c30harvester') {
            roleCHarvester.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'hauler') {
            roleHauler.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'extractor') {
            roleExtractor.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'upclose' || creep.memory[MEMORY_ROLE] == 'upfar' || creep.memory[MEMORY_ROLE] == 'up8') {
            roleUpgrader.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'upstorclose' || creep.memory[MEMORY_ROLE] == 'upstorfar') {
            roleUpgraderStorage.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'grower') {
            roleGrower.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'builder') {
            roleBuilder.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'builderstorage') {
            roleBuilderStorage.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'teller') {
            roleTeller.run(creep, 0);
        } else if(creep.memory[MEMORY_ROLE] == 'teller-towers') {
            roleTeller.run(creep, 1);
        } else if(creep.memory[MEMORY_ROLE] == 'drainer' || creep.memory[MEMORY_ROLE] == 'drainerbig') {
            roleDrainer.run(creep, 1);
        } else if(creep.memory[MEMORY_ROLE] == 'siege' || creep.memory[MEMORY_ROLE] == 'siegefar' || creep.memory[MEMORY_ROLE] == 'siegemini' || creep.memory[MEMORY_ROLE] == 'siegebig') {
            roleSiege.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'siegehealer') {
            roleSiegeHealer.run(creep);
        } else if (empire_defaults['military_roles'].includes(creep.memory[MEMORY_ROLE])) {
            roleAdventurer.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'scavenger' || creep.memory[MEMORY_ROLE] == 'bigscavenger') {
            roleScavenger.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'claimer' || creep.memory[MEMORY_ROLE] == 'bclaimer') {
            roleClaimer.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'reserver' || creep.memory[MEMORY_ROLE] == 'sreserver') {
            roleReserver.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'recycler') {
            roleRecycler.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'signer') {
            roleSigner.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'remoteconstructor' || creep.memory[MEMORY_ROLE] == 'minirc') {
            roleRemoteconstructor.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'labtech') {
            roleLabtech.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'nuketech') {
            roleNuketech.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'dismantler') {
            roleDismantler.run(creep);
        } else {
            console.log('ALERT: ' + creep.name + ' in room' + creep.room.name + ' has role ' + creep.memory[MEMORY_ROLE] + ' which I do not know how to handle!')
            //creep.suicide();
        }
        
        creep_cpu = Game.cpu.getUsed() - creep_cpu;
        
        if(creep_cpu_map[creep.memory[MEMORY_ROLE]] == undefined) {
            creep_cpu_map[creep.memory[MEMORY_ROLE]] = [];
        }
        creep_cpu_map[creep.memory[MEMORY_ROLE]].unshift(creep_cpu);
        
    }
    if (cpu_reporting) {
        var highest_cpu_class = '';
        var highest_cpu_usage = 0;
        for (var pname in creep_cpu_map) {
            var this_total = 0;
            for (var i = 0; i < creep_cpu_map[pname].length; i++){
                this_total += creep_cpu_map[pname][i];
            }
            console.log(pname + ': ' + creep_cpu_map[pname].length + ' creeps taking ' + this_total + ' cpu, avg: ' + this_total / creep_cpu_map[pname].length);
            if (this_total > highest_cpu_usage) {
                highest_cpu_usage = this_total;
                highest_cpu_class = pname;
            }
        }
        console.log('Best class to optimize: ' + highest_cpu_class + ' with ' + highest_cpu_usage);
    }
    
    cpu_creep_use = Game.cpu.getUsed() - cpu_creep_use;
    if (cpu_reporting) { console.log('CPU cpu_creep_use: ' + cpu_creep_use); }

    var total_cpu_used_this_tick = Math.round(Game.cpu.getUsed());
    var cpu_history_max = 100;
    if (Memory['cpu_history'] == undefined) {
        Memory['cpu_history'] = [];
    }
    if (Memory['cpu_history'].length >= cpu_history_max) {
        Memory['cpu_history'].pop();
    }
    Memory['cpu_history'].unshift(total_cpu_used_this_tick);
    var total_cpu_alltime = 0;
    for (var i = 0; i < Memory['cpu_history'].length; i++) {
        total_cpu_alltime += Memory['cpu_history'][i];
    }
    var avg_cpu = Math.round(total_cpu_alltime / Memory['cpu_history'].length);

    if (cpu_reporting) { console.log('CPU final: ' + total_cpu_used_this_tick + ', avg/tick: ' + avg_cpu); }

    
}
