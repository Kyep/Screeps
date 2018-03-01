"use strict";

// requirements ONLY

require('global_functions');
require('global.commands');
require('global.espionage');

require('config.empire');
require('config.units');
require('config.defines');
require('config.flags');

require('prototype.creep');
require('prototype.room');
require('prototype.structures_all');
require('prototype.structure');

require('class.empireroom');
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
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
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
    if(Game.time % 2000 === 0) {
        //global.PRESET_ATTACK_WAVE();
        global.ESPIONAGE_ATTACK_PLANS(true);
        global.ESPIONAGE_REGEN_TARGETS();
        
        global.REPORT_STRUCTURES(false); // auto-builds buildable structures that have appropriate flags
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
        //expansionplanner.process()
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
                    var send_result = source_terminal.send(RESOURCE_ENERGY, 20000, dest_room, 'empty room pulls energy from full');
                    console.log('ENERGYNET: ' + source_room + '(' + source_terminal.store.energy + ') sends energy to (starving) room: ' + dest_room + ', result:' + send_result);
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
        var room_parts = {}
        for(var name in Memory.creeps) {
            Game.creeps[name].memory[MEMORY_NEEDED] = 0;
            if(Game.creeps[name].memory[MEMORY_SPAWNERROOM] != undefined) {
                var pcount = Game.creeps[name].body.length;
                if (room_parts[Game.creeps[name].memory[MEMORY_SPAWNERROOM]] == undefined) {
                    room_parts[Game.creeps[name].memory[MEMORY_SPAWNERROOM]] = 0;
                }
                room_parts[Game.creeps[name].memory[MEMORY_SPAWNERROOM]] += pcount;
            }
            if(Game.creeps[name].memory[MEMORY_SOURCE] == undefined) {
                console.log('WARN: ' + Game.creeps[name] + ' in ' + Game.creeps[name].room.name + ' has no source defined.');
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
                if (spn.memory['role_spawning'] != undefined) {
                    if (spn.spawning == undefined) {
                        spn.memory['role_spawning'] = undefined;
                        spn.memory['dest_spawning'] = undefined;
                    } else if (empire_defaults['military_roles'].includes(spn.memory['role_spawning'])) {
                        spn.room.visual.text(spn.spawning.remainingTime + ': ' + spn.spawning.name, spn.pos.x, spn.pos.y +1.5, {color: 'red', backgroundColor: 'white', font: 0.8});
                    } else if (spn.memory['dest_spawning'] != undefined && spn.memory['dest_spawning'] == spn.room.name) {
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
                    spn.memory['role_spawning'] = spawn_queue[spawnername]['spawnrole'];
                    spn.memory['dest_spawning'] = spawn_queue[spawnername]['rname'];
                } else {
                    console.log(spawn_queue[spawnername]['sname'] + ': ' + spawn_queue[spawnername]['spawnrole'] + ' too expensive (' + spawn_queue[spawnername]['thecost'] + '/' + thespawner.room.energyAvailable + '), saving up.');
                }
                count_waking++;
            }
            //console.log( count_spawning + ' / ' + count_spawning + ' / ' + count_idle);
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
        } else if(creep.memory[MEMORY_ROLE] == 'sharvester' || creep.memory[MEMORY_ROLE] == 'bharvester' || creep.memory[MEMORY_ROLE] == 'fharvester') {
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
