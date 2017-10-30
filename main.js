"use strict";

// requirements ONLY

require('global_functions');

require('config.empire');
require('config.units');
require('config.defines');

require('prototype.creep');
require('prototype.room');
require('prototype.structure');


var roleHarvester = require('role.harvester');
var roleCHarvester = require('role.charvester');
var roleHauler = require('role.hauler');

var roleExtractor = require('role.extractor');
var roleUpgrader = require('role.upgrader');
var roleUpgraderStorage = require('role.upgraderstorage');
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
var roleDrainer = require('role.drainer');
var roleSigner = require('role.signer');
var roleLabtech = require('role.labtech');

var structureLink = require('structure.link');
var structureLab = require('structure.lab');

var cleaner = require('task.cleanmemory');
var expansionplanner = require('task.expansion');

// ---------------------------
// CONFIG
// ---------------------------




// ---------------------------
// BEGIN MAIN LOOP 
// ---------------------------

module.exports.loop = function () {

    var cpu_setup_use = Game.cpu.getUsed();

    var divisor = 3;
    if (Game.cpu.bucket < 9000) {
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
    var sectors_under_attack = {};
    if(Memory['sectors_under_attack'] != undefined) {
        sectors_under_attack = Memory['sectors_under_attack'];
    };

    cpu_setup_use = Game.cpu.getUsed() - cpu_setup_use;
    if (cpu_reporting) { console.log('CPU cpu_setup_use: ' + cpu_setup_use); }


    if(Game.time % divisor === 0) {

        // EXPANSION CONTROLLER
        var cpu_planner_use = Game.cpu.getUsed();
        expansionplanner.process()
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
            }
            
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
                    // No point spawning upgraders to upgrade a level 8 room.
                    empire[rname].sources['upgrader'] = {'sourcename': empire[rname]['roomname'] + '-U', 'x':25, 'y':25, 'assigned': {}, 'expected_income': 5, 'dynamic': 1}
                    var ugtype = 'upstorclose';
                    if(empire[rname]['farcontroller'] != undefined) {
                        ugtype = 'upstorfar';
                    }
                    var r_multiplier = Math.round(energy_reserves / empire_defaults['room_energy_min']);
                    if (r_multiplier > 5) { 
                        r_multiplier = 5; 
                    }
                    if (r_multiplier > 0) {
                        //console.log(rname + ' ' + r_multiplier + ' ' + ugtype);
                        empire[rname].sources['upgrader'].assigned[ugtype] = r_multiplier;
                    }
                }
            } else if (rname in Memory['sectors_under_attack']) {
                // do nothing
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
                            empire[rname].sources[mysname] = { 'sourcename': mysname, 'x':20, 'y':20, 'assigned': {}, 'expected_income': 90 }
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
                        if (mineralpatch.mineralAmount > 0) {
                            var rhid = empire[rname]['roomname'];
                            var mysname = rhid + '-mining';
                            if(empire[rname].sources[mysname] == undefined) {
                                empire[rname].sources[mysname] = { 'sourcename': mysname, 'x':20, 'y':20, 'assigned': {}, 'expected_income': 50 }
                            }
                            empire[rname].sources[mysname]['assigned'] = {'extractor': 1}
                            //console.log('ASSIGNED EXTRACTOR FOR '+ rname);
                        }
                    }
                }
            }

            // DEFCON MANAGEMENT
            var enemiesList = Game.rooms[rname].find(FIND_HOSTILE_CREEPS);
            var enemiesCost = 0;
            var enemiesRanged = 0;
            var attacker_username = 'Invader';
            //console.log(rname + ':' + enemiesList.length);
            if(enemiesList.length) {
                for(var i = 0; i < enemiesList.length; i++) {
                    enemiesCost += global.CREEP_COST(enemiesList[i].body);
                    if (enemiesList[i].owner != undefined) {
                        if (enemiesList[i].owner.username != undefined) {
                            if (enemiesList[i].owner.username != attacker_username) {
                                attacker_username = enemiesList[i].owner.username;
                            }
                        }
                    }
                    if (attacker_username == 'Invader' && enemiesList[i].classifyMilitaryType() == RANGED_ATTACK && enemiesList[i].getActiveBodyparts(HEAL) == 0 ) {
                        enemiesRanged++;
                    }
                }
                if(allies.includes(attacker_username)) {
                    continue;
                }
                if(empire[rname] == undefined) {
                    //console.log('ATTACK: cannot do anything about enemies in a non-empire sector: ' + rname);
                    continue;
                } else if (empire[rname]['ignoreattacks'] != undefined) {
                    continue;
                }
                if(Game.rooms[rname] != undefined && Game.rooms[rname].controller != undefined && Game.rooms[rname].controller.owner != undefined && Game.rooms[rname].controller.owner.username != overlord) {
                    // This is someone else's base.
                    continue;
                }
                //console.log('ALERT: ' + rname + ' has ' + enemiesList.length + ' enemies, worth body cost: ' + enemiesCost + '!'); 
                if(sectors_under_attack[rname] == undefined) {
                    sectors_under_attack[rname] = {}
                    sectors_under_attack[rname]['attackstart'] = timenow;
                    sectors_under_attack[rname]['mystructures'] = Game.rooms[rname].getMyStructuresCount();
                    sectors_under_attack[rname]['attacker_username'] = attacker_username;
                    


                    var texits = Game.map.describeExits(rname);
                    var exit_arr = []
                    for (var ex in texits) {
                        exit_arr.push(texits[ex]);
                    }
                    for (var tc in Game.creeps) {
                        if(!exit_arr.includes(Game.creeps[tc].room.name)) { // if they aren't next door, skip them.
                            continue;
                        }
                        if(Game.creeps[tc].memory[MEMORY_ROLE] == undefined) {
                            continue;
                        }
                        if (!empire_defaults['military_roles'].includes(Game.creeps[tc].memory[MEMORY_ROLE])) {
                            continue;
                        }
                        var theirEnemies = Game.creeps[tc].room.find(FIND_HOSTILE_CREEPS);
                        if (theirEnemies.length) {
                            continue;
                        }
                        Game.creeps[tc].memory[MEMORY_DEST] = rname;
                        console.log('REASSIGN: sent ' + Game.creeps[tc].name + ' to defend ' + rname);
                        Game.notify('REASSIGN: sent ' + Game.creeps[tc].name + ' to defend ' + rname);
                    }
                    sectors_under_attack[rname]['time'] = timenow;
                    sectors_under_attack[rname]['threat'] = enemiesCost;
                    sectors_under_attack[rname]['enemycount'] = enemiesList.length;
                    sectors_under_attack[rname]['enemiesRanged'] = enemiesRanged;
                    if(sectors_under_attack[rname]['attacker_username'] != 'Invader') {
                        Game.notify('NON-NPC ATTACK! ' + rname + ': ' + JSON.stringify(sectors_under_attack[rname]));
                        console.log('ATTACK: NEW *PLAYER* ATTACK DETECTED: ' + rname + ': ' + JSON.stringify(sectors_under_attack[rname]));
                    } else {
                        console.log('ATTACK: NEW NPC ATTACK DETECTED: ' + rname + ': ' + JSON.stringify(sectors_under_attack[rname]));
                    }
                    sectors_under_attack[rname]['structure_list'] = {};
                    var my_structures = Game.rooms[rname].find(FIND_STRUCTURES);
                    for (var i = 0; i < my_structures.length; i++) {
                        if(sectors_under_attack[rname]['structure_list'][my_structures[i].structureType] == undefined) {
                            sectors_under_attack[rname]['structure_list'][my_structures[i].structureType] = [];
                        }
                        sectors_under_attack[rname]['structure_list'][my_structures[i].structureType].unshift(my_structures[i].pos);
                    }
                }
                sectors_under_attack[rname]['time'] = timenow;
                sectors_under_attack[rname]['threat'] = enemiesCost;
                sectors_under_attack[rname]['enemycount'] = enemiesList.length;
                sectors_under_attack[rname]['enemiesRanged'] = enemiesRanged;
            } else if(sectors_under_attack[rname] != undefined) {
                sectors_under_attack[rname]['threat'] = 0;
                sectors_under_attack[rname]['enemycount'] = 0;
            }
        }
        //console.log(JSON.stringify(energy_network));

        if (energy_network[ENERGY_EMPTY] != undefined) {
            if(energy_network[ENERGY_EMPTY].length > 0) {
                var dest_room = energy_network[ENERGY_EMPTY][0];
                var potential_senders = [];
                if(energy_network[ENERGY_FULL] != undefined && energy_network[ENERGY_FULL].length > 0) {
                    potential_senders = potential_senders.concat(energy_network[ENERGY_FULL]);
                }
                if(energy_network[ENERGY_SPARE] != undefined && energy_network[ENERGY_SPARE].length > 0) {
                    potential_senders = potential_senders.concat(energy_network[ENERGY_SPARE]);
                }
                for (var i = 0; i < potential_senders.length; i++) {
                    var source_room = potential_senders[i];
                    var send_result = Game.rooms[source_room].terminal.send(RESOURCE_ENERGY, 25000, dest_room, 'empty room pulls energy from full');
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
                   var source_room = energy_network[ENERGY_FULL][0];
                   var source_terminal = Game.rooms[source_room].terminal;
                   var terminal_energy_min = empire_defaults['terminal_energy_min'];
                   if (source_terminal.store.energy > terminal_energy_min) {
                       var dest_room = energy_network[ENERGY_SPARE][0];
                       var send_result = Game.rooms[source_room].terminal.send(RESOURCE_ENERGY, 25000, dest_room, 'full room pushes energy to ok');
                       console.log('ENERGYNET: ' + source_room + ' (FULL) pushes energy to (OK) room: ' + dest_room + ', result:' + send_result);
                   }
               }
            }
        }


        cpu_rm_use = Game.cpu.getUsed() - cpu_rm_use;
        if (cpu_reporting) { console.log('CPU cpu_rm_use: ' +cpu_rm_use); }
        
        
        for(var csector in sectors_under_attack) {
            var end_attack_now = 0;
            if( empire[csector] == undefined ) {
                console.log('ATTACK: sectors_under_attack: empire/' + csector + ' is undefined. DELETING ATTACK ALERT IN THAT SECTOR!');
                delete sectors_under_attack[csector];
                continue;
            }
            var tgap = timenow - sectors_under_attack[csector]['time'];
            if(sectors_under_attack[csector]['enemycount'] == 0) {
                console.log('ATTACK: ENDS (ENEMY WIPED OUT): ' + csector + ' in ' + (timenow - sectors_under_attack[csector]['attackstart']) + ' ticks.');
                end_attack_now = 1;
            } else if(tgap >= empire_defaults['alerts_duration']) {
                console.log('ATTACK: OLD ENDS: ' + csector + ' at ' + tgap + ' seconds since last detection.');
                end_attack_now = 1;
            }
            if (end_attack_now) {
                var old_structurelist = sectors_under_attack[Game.rooms[csector].name]['structure_list'];
                for (var stype in old_structurelist) {
                    for (var i = 0; i < old_structurelist[stype].length; i++) {
                        var structure_pos = old_structurelist[stype][i];
                    	var structures_at = Game.rooms[csector].lookForAt(LOOK_STRUCTURES, structure_pos.x, structure_pos.y, structure_pos);
                    	var is_intact = 0;
                    	for (var j = 0; j < structures_at.length; j++) {
                    		if (structures_at[j].structureType == stype) {
                    			is_intact = 1;
                    		}
                    	}
                    	if (is_intact) {
                    	    //console.log(csector +': ' + stype + ' AT: ' +structure_pos.x + ',' + structure_pos.y + ' appears to be intact.');
                    	} else {
                    	    var alert_string = csector +': MISSING ' + stype + ' AT: ' +structure_pos.x + ',' + structure_pos.y + ' after attack from ' + sectors_under_attack[csector]['attacker_username'] + ' - REBUILDING!';
                    	    console.log(alert_string);
                    	    Game.notify(alert_string);
                    		Game.rooms[csector].createConstructionSite(structure_pos.x, structure_pos.y, stype);
                    	}
                    }
                }
                delete sectors_under_attack[csector];
                if(empire_defaults['alerts_recycle'] == 1) {
                    for(var name in Game.creeps) {
                        if(Game.creeps[name].memory[MEMORY_DEST] == csector && (empire_defaults['military_roles'].includes(Game.creeps[name].memory[MEMORY_ROLE]))) {
                            Game.creeps[name].memory[MEMORY_ROLE] = 'recycler';
                            Game.creeps[name].say('🔄 recycle');
                            console.log('RECYCLE: ' + name + ' due to it being part of sector defense forces for a sector that is no longer under attack.');
                        }
                    }
                } else if (empire_defaults['alerts_reassign'] != undefined) {
                    for(var crname in Game.creeps) {
                        if(Game.creeps[crname].memory.target == csector && (empire_defaults['military_roles'].includes(Game.creeps[crname].memory[MEMORY_ROLE]))) {
                            if (Game.creeps[crname].memory[MEMORY_SPAWNERNAME] == undefined) {
                                continue;
                            }
                            var spname = Game.creeps[crname].memory[MEMORY_SPAWNERNAME];
                            if (empire_defaults['alerts_reassign'][spname] != undefined) {
                                Game.creeps[crname].memory[MEMORY_DEST] = empire_defaults['alerts_reassign'][spname];
                                Game.creeps[crname].notifyWhenAttacked(false);
                                console.log('HARASS: sent ' + crname + ' to harass' + empire_defaults['alerts_reassign'][spname]);
                                Game.notify('HARASS: sent ' + crname + ' to harass' + empire_defaults['alerts_reassign'][spname]);
                            }
                        }
                    }
                }
            } else {

                if (empire[csector] == undefined) {
                    console.log('ERROR: attack csector: ' + csector + ' is undefined.');
                    continue;
                }

                if (Game.rooms[csector] != undefined) {
                    var enemiesList = Game.rooms[csector].find(FIND_HOSTILE_CREEPS);
                    var enemiesCost = 0;
                    var attacker_username = 'Invader';
                    if(enemiesList.length) {
                        for(var i = 0; i < enemiesList.length; i++) {
                            var ebody = enemiesList[i].body;
                            
                            enemiesCost += global.CREEP_COST(enemiesList[i].body);
                            if (enemiesList[i].owner != undefined) {
                                if (enemiesList[i].owner.username != undefined) {
                                    if (enemiesList[i].owner.username != attacker_username) {
                                        attacker_username = enemiesList[i].owner.username;
                                    }
                                }
                            }
                        }
                    }
                }

                var baseforce = {};
                var patrolforce = {};
                var room_has_spawn = 0;
                for (var thisspawn in Game.spawns) {
                    if (Game.spawns[thisspawn].room.name == csector) {
                        room_has_spawn = 1;
                    }
                }
                var towercount = 0;
                if (Game.rooms[csector] != undefined) {
                    var towerlist = Game.rooms[csector].find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } } );
                    towercount = towerlist.length;
                }

                if(room_has_spawn) {
                    var newcount = Game.rooms[csector].getMyStructuresCount();
                    var oldcount = sectors_under_attack[Game.rooms[csector].name]['mystructures'];
                    if (newcount < oldcount) {
                        var cc = Game.rooms[csector].controller;
                        var is_in_safemode = 0;
                        if (cc.safeMode != undefined && cc.safeMode > 0) {
                            is_in_safemode = cc.safeMode;
                        }
                        if (is_in_safemode > 0) {
                            
                        } else if (cc.safeModeAvailable) {
                            cc.activateSafeMode();
                            Game.notify('SAFEMODE ACTIVATION DUE TO STRUCTURE LOSS: ' + csector + ': ' + JSON.stringify(sectors_under_attack[Game.rooms[csector].name]));
                            console.log('SAFE MODE ACTIVATED: ATTACK: ' + csector + ' only has ' + newcount + ' structures versus original count of ' + oldcount + '!');
                        } else {
                            Game.notify('CANNOT ACTIVATE SAFEMODE DESPITE STRUCTURE LOSS: ' + csector + ': ' + JSON.stringify(sectors_under_attack[Game.rooms[csector].name]));
                            console.log('SAFE MODE UNAVAILABLE: ATTACK: ' + csector + ' only has ' + newcount + ' structures versus original count of ' + oldcount + '!');
                        }
                    }
                }

                var theirthreat = sectors_under_attack[csector]['threat'];
                if (towercount > 0) {
                    theirthreat -= (400 * towercount);
                    baseforce['teller-towers'] = 1;
                    if (theirthreat > 8000) {
                        baseforce['teller'] = 1;
                    }
                }
            
                if (empire[csector]['spawn_room'] == undefined) {
                    console.log('ATTACK CONFIG WARNING, SECTOR ' + csector + ' HAS NO spawn_room SET ON ITS ROOM!');
                    patrolforce['rogue'] = 1; // the sad default.
                } else if (theirthreat > 0) {
                    //console.log('XAT: Deciding what to spawn for the ' + theirthreat + ' attack on ' + csector);
                    var spawner = GET_SPAWNER_FOR_ROOM(csector);
                    if (spawner == undefined) {
                        console.log('XAT: ' + csector + " has no free spawner");
                        continue;
                    }
                    //console.log('ATK: ' + spawner.name);
                    var enow = spawner.room.energyAvailable;
                    var emax = spawner.room.energyCapacityAvailable;
                    var prepare_for_kiting = 0;
                    if (sectors_under_attack[csector]['enemycount'] == 1 && sectors_under_attack[csector]['enemiesRanged'] == 1) {
                        // there is one guy, he's ranged, and he cannot heal. This is probably a kiting attack.
                        prepare_for_kiting = 1;
                    }
                    for (var i = 0; i < empire_defaults['defense_roles'].length; i++) {
                        var oname = empire_defaults['defense_roles'][i];
                        //console.log('checking cost for' + oname);
                        var obody = empire_workers[oname]['body'];
                        var outfit_cost = global.UNIT_COST(obody);
                        if (outfit_cost > emax) {
                            //console.log('XAT: No point using ' + oname + ' as it exceeds our spawn power ' + emax);
                            // no point using this... we can't possibly afford it.
                            continue;
                        }
                        if(prepare_for_kiting) {
                            if (empire_workers[oname]['antikite'] != undefined) {
                                continue;
                            }
                        }
                        if ((i + 1) != empire_defaults['defense_roles'].length) {
                            if (outfit_cost > (theirthreat * 1.2)) { 
                                //console.log('XAT: No point using ' + oname + ' as it is > 1.2*their_threat ' + theirthreat + ' (i: ' + i +  ', DRL:' + empire_defaults['defense_roles'].length + ')');
                                continue; // overkill...
                            }
                        }
                        if (patrolforce[oname] == undefined) {
                            if (i == empire_defaults['defense_roles'].length && theirthreat > (outfit_cost * 2)) {
                                patrolforce[oname] = 2;
                            } else {
                                patrolforce[oname] = 1;
                            }
                        } else {
                            patrolforce[oname] += 1;
                        }
                        theirthreat -= outfit_cost;
                        //console.log('DEFENSE: Defending ' + csector + ' with ' + patrolforce[oname] + ' ' + oname + ' (cost: ' + outfit_cost + ' ea) against threat of: ' + sectors_under_attack[csector]['threat'] + '. ' + theirthreat + ' threat remaining');
                        if (theirthreat < 0) {
                            break;
                        }
                    }
                } else {
                    console.log('DEFENSE: Decided that  ' + csector + ' can handle the incoming threat of ' + theirthreat + ' without any units being spawned');
                }
                /*
                if (csector == 'W51S14') {
                    patrolforce['scout'] = 1;
                // defcon 1: single invader, invasion lasting less than 3m, not very strong
                } else if (sectors_under_attack[csector]['threat'] < 3000 && (timenow - sectors_under_attack[csector]['attackstart']) < 180 && sectors_under_attack[csector]['enemycount'] == 1) {
                    if (room_has_spawn) {
                        baseforce['teller-towers'] = 1;
                    } else {
                        patrolforce['scout'] = 2;
                    }
                    empire[csector]['defcon'] = 1;
                // defcon 2: big invader, or tougher group, invasion lasting less than 6 minutes, or up to 3 enemies               
                } else if (sectors_under_attack[csector]['threat'] < 6000 && (timenow - sectors_under_attack[csector]['attackstart']) < 360 && sectors_under_attack[csector]['enemycount'] > 1 && sectors_under_attack[csector]['enemycount'] < 4) {
                    if (room_has_spawn) {
                        baseforce['teller-towers'] = 1;
                        //baseforce['teller'] = 1;
                        patrolforce['scout'] = 1;
                    } else {
                        patrolforce['adventurer'] = 2;
                    }
                    empire[csector]['defcon'] = 2;

                // defcon 3: huge invader, or tougher group, over 9 minutes
                } else if (sectors_under_attack[csector]['threat'] < 10000 && (timenow - sectors_under_attack[csector]['attackstart']) < 540) {
                    if (room_has_spawn) {
                        baseforce['teller-towers'] = 1;
                        baseforce['teller'] = 1;
                        patrolforce['guardian'] = 1;
                        patrolforce['rogue'] = 1;
                    } else {
                        patrolforce['rogue'] = 2;
                        patrolforce['guardian'] = 1;
                    }
                    empire[csector]['defcon'] = 3;

                // defcon 4: big invader, or tougher group, invasion lasting > 9 minutes 
                } else {
                    if (room_has_spawn) {
                        baseforce['teller-towers'] = 2;
                        baseforce['teller'] = 2;
                        //patrolforce['wizard'] = 1;
                        patrolforce['guardian'] = 1;
                        patrolforce['rogue'] = 1;
                    } else {
                        patrolforce['guardian'] = 1;
                        patrolforce['rogue'] = 1;
                    }
                    empire[csector]['defcon'] = 4;
                }
                */
                
                empire[csector].sources['BASEFORCE'] = {'sourcename': empire[csector]['roomname'] + '-bforce', 'x':25, 'y':25,
                    'assigned': baseforce, 'expected_income': 95, 'dynamic': 1}
                empire[csector].sources['PATROLFORCE'] = {'sourcename': empire[csector]['roomname'] + '-pforce', 'x':25, 'y':25,
                    'assigned': patrolforce, 'expected_income': 94, 'dynamic': 1}
                if (tgap > 0) {
                    //console.log('ATTACK: TIMING OUT IN: ' + csector + ', age: ' + tgap + ' DEFCON: ' + empire[csector]['defcon']);
                    //console.log('ATTACK: TIMING OUT IN: ' + csector + ', age: ' + tgap);
                } else {
                    //console.log('ATTACK: HOSTILES STILL IN ' + csector + '! 'DEFCON: ' + empire[csector]['defcon']');
                    //console.log('ATTACK: HOSTILES STILL IN ' + csector + '! ');
                }
            }
        }
        Memory['sectors_under_attack'] = sectors_under_attack;


        // SPAWNING MANAGER
        var cpu_spawning_use = Game.cpu.getUsed();
        for (var rname in empire) {
            empire[rname].living = {};
        }
        var spawner_parts = {};
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

        for(var spawner in spawner_parts) {
            if(spawner_parts[spawner] > 400 && Game.time % 50 == 0) {
                console.log('ALERT: spawner ' + spawner + ' in ' + Game.spawns[spawner].room.name + ' is maintaining ' + spawner_parts[spawner] + ' > 400 creep parts. Not sustainable.');
            } else {
                //console.log('ALERT: spawner ' + spawner + ' is maintaining ' + spawner_parts[spawner] + ' parts.');
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
                if (rname in Memory['sectors_under_attack']) {
                    r_status += '(UNDER ATTACK) ';
                }
                r_status += ': ';
                for (var skey in empire[rname].sources) {
                    var s_status = 'Source: |' + empire[rname].sources[skey]['sourcename'] + '|: ';
                    r_status += empire[rname].sources[skey]['sourcename'] + ': ';
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
                            if(sectors_under_attack[csector] != undefined && !empire_defaults['military_roles'].includes(role) && !empire_defaults['priority_roles'].includes(role)) {
                                //console.log('SPAWN: holding spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + '| until attack on ' + csector + ' is over.');
                                continue;
                            }
                            //if (!empire_defaults['military_roles'].includes(role) && !empire_defaults['priority_roles'].includes(role)) {
                            //    console.log('TEMPORARY BLOCK! holding spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + '|');
                            //}

                            //console.log('checking sobj');
                            var spawner = GET_SPAWNER_FOR_ROOM(rname);
                            //console.log('SOBJ: ' + JSON.stringify(spawner));

                            if(spawner == undefined) {
                                //console.log('SKIP: ' + role + ' for ' + rname + ' |' + empire[rname].sources[skey]['sourcename'] + '| as source room has no available spawners.');
                                continue;
                            }/* else if(spawner.spawning != null) {
                                console.log('SPAWNER BUSY:  ' + role + ' for |' + empire[rname].sources[skey]['sourcename'] + '|');
                                continue;
                            }*/              
                            if (empire_workers[role] == undefined) {
                                console.log(spawner.name + ': UNDEFINED ROLE: ' + role)
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
                                console.log(spawner.name + ': holding spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + '| as cost exceeds MIN ENERGY: ' + spawner.room.energyAvailable);
                            }
                            
                            var part_template = empire_workers[role]['body'];
                            var partlist = [];
                            var energy_cap = spawner.room.energyCapacityAvailable;
                            if (energy_cap > 4500) {
                                energy_cap = 4500;
                            }
                            var work_units = Math.max(1, Math.floor(energy_cap / global.UNIT_COST(part_template)));
                            var max_units = Math.floor(50 / part_template.length);
                            if (work_units > max_units) {
                                //console.log('Warning: when building body for ' + role + ' work_units got to be ' + work_units + ' but we can only support ' + max_units + ' of this template.');
                                work_units = max_units;
                            }
                            
                            //console.log(work_units + ' based on ' + global.UNIT_COST(part_template) + ' in ' + spawner.room.energyCapacityAvailable);
                            var renew_allowed = 1;
                            
                            if (spawner_mobs[spawner.name] == undefined ) {
                                work_units = 1;
                                renew_allowed = 0;
                                console.log(spawner.name + ': ALLOWING ONLY ONE WORK UNIT, AS MY MOB LIST IS UNDEFINED. ');
                            } else  {
                                if (spawner_mobs[spawner.name].length < 4) {
                                    work_units = 1;
                                    renew_allowed = 0;
                                    console.log(spawner.name + ': ALLOWING ONLY ONE WORK UNIT, AS MY MOB LIST (' + spawner_mobs[spawner.name].length + ') HAS LESS THAN 4 MOBS. ');
                                }
                            }
                            if (empire_workers[role]['renew_allowed'] != undefined) {
                                if (empire_workers[role]['renew_allowed'] == 0) {
                                    renew_allowed = 0;   
                                }
                            }

                            if(role == 'reserver') {
                                var ticksrem = 0;
                                if (Game.rooms[rname] != undefined) {
                                    if (Game.rooms[rname].controller != undefined) {
                                        if (Game.rooms[rname].controller.reservation != undefined) {
                                            if (Game.rooms[rname].controller.reservation.ticksToEnd != undefined) {
                                                ticksrem = Game.rooms[rname].controller.reservation.ticksToEnd;
                                            }
                                        }
                                    }   
                                }
                                partlist = CONSTRUCT_RESERVER_BODY(ticksrem);
                            } else if(role == 'hauler') {
                                partlist = CONSTRUCT_HAULER_BODY(rname, skey, spawner.room.energyCapacityAvailable);
                            } else if (empire_workers[role]['noresizing'] == undefined) {
                                for (var k = 0; k < part_template.length; k++) {
                                    for (var j = 0; j < work_units; j++) {
                                        partlist.push(part_template[k]);
                                    }
                                }
                            } else {
                                partlist = part_template;
                            }

                            var spawnrole = role;
                            var thecost = global.UNIT_COST(partlist);
                            if (spawner.room.energyCapacityAvailable < thecost) {
                                console.log(spawner.name + ': holding spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + '| as THIS UNIT cost ' + thecost + ' exceeds MAX STORAGE: ' + 
                                    spawner.room.energyAvailable + ' ');
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
                            //console.log('SPAWNING: ' + spawner.name + ' created ' + spawnrole + ' for |' + empire[rname].sources[skey]['sourcename'] + 
                            //'| cost: ' + thecost + '/' + spawner.room.energyAvailable + ' capacity:' + energy_cap + ' based out of ' + spawner.room.name + ' with renew: ' + renew_allowed);

                            spawn_queue[spawner.name] = {
                                'spawner': spawner.name, 'sname': empire[rname].sources[skey]['sourcename'], 'partlist': partlist, 'spawnrole': spawnrole, 'skey': skey, 'rname': rname, 
                                'thecost': thecost, 'myroomname': spawner.room.name, 'target_x': target_x, 'target_y': target_y,  
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
        if(Game.structures[id].structureType == STRUCTURE_LAB){
            structureLab.run(Game.structures[id]);
        }
    }

    // TOWER MANAGEMENT
    for(var rname in rtowers) {
        var theroom = Game.rooms[rname];
        
        // If hostiles in room, focus fire.        
        var enemiesList = theroom.find(FIND_HOSTILE_CREEPS);
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
                thistower.room.visual.circle(thistower.pos, {fill: 'transparent', radius: TOWER_OPTIMAL_RANGE, stroke: 'green'});
                thistower.room.visual.circle(thistower.pos, {fill: 'transparent', radius: TOWER_FALLOFF_RANGE, stroke: 'yellow'});
                thistower.room.visual.line(thistower.pos, best_target.pos, {color: 'red'});
            }
            continue;
        }

        // If no hostiles in room, repair.
        var repairMax = theroom.getTowerRepairMax();
        var repairTargets = theroom.find(FIND_STRUCTURES, {
                filter: function(structure){
                    if(structure.structureType == STRUCTURE_RAMPART){
                        return (structure.hits < repairMax)
                    }else{
                        return 0
                    }
                }
        });
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
            // don't even process this creep, it cannot do anything while it is being spawned, and even attempting to do so just wastes CPU.
        } else if(creep.memory[MEMORY_ROLE] == 'harvester' || creep.memory[MEMORY_ROLE] == 'bharvester') {
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
        for (var pname in creep_cpu_map) {
            var this_total = 0;
            for (var i = 0; i < creep_cpu_map[pname].length; i++){
                this_total += creep_cpu_map[pname][i];
            }
            console.log(pname + ': ' + creep_cpu_map[pname].length + ' creeps taking ' + this_total + ' cpu, avg: ' + this_total / creep_cpu_map[pname].length);
        }
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
