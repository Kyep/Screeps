// requirements ONLY
var roleHarvester = require('role.harvester');
var roleLDHarvester = require('role.ldharvester');
var roleUpgrader = require('role.upgrader');
var roleUpgraderstorage = require('role.upgraderstorage');
var roleBuilder = require('role.builder');
var roleAdventurer = require('role.adventurer');
var roleScavenger = require('role.scavenger');
var roleClaimer = require('role.claimer');
var roleReserver = require('role.reserver');
var roleRecycler = require('role.recycler'); 
var roleBuilderstorage = require('role.builderstorage');
var roleTeller = require('role.teller');
var roleRemoteconstructor = require('role.remoteconstructor');

var structureTower = require('structure.tower');

var cleaner = require('task.cleanmemory');
var spawncustom = require('task.spawncustom');

// ---------------------------
// GLOBALS
// ---------------------------

global.UNIT_COST = (body) => _.sum(body, p => BODYPART_COST[p]);
global.CREEP_COST = (body) => _.sum(body, p => BODYPART_COST[p.type])

    global.empire_defaults = {
        'spawner': '59ce24a6b1421365236708e4',
        'storage': '59cfa1fcd8ad39203de0a8aa',
        'room': 'W53S18',
        'sourceid': '59bbc3f82052a716c3ce7289',
        'military_roles' : ['adventurer'],
        'alerts_duration' : 120,
        'alerts_recycle' : 0
    }
    global.empire = {
        'W53S18': {
            'sources': {
                '59bbc3f82052a716c3ce7289': {'sourcename':'home ha', 'x':25, 'y':18,
                    'assigned': {'harvester':4, 'scavenger': 1}
                },
                '59bbc3f82052a716c3ce728b': {'sourcename':'home up', 'x':16, 'y':26,
                    'assigned': {'upgrader': 3}
                }
            }
        },
        'W52S18': {
            'sources': {
                '59bbc4062052a716c3ce7408': {'sourcename':'exp E', 'x':11, 'y':14,
                    'assigned': {'ldharvester': 6, 'reserver': 1}
                },
            }
        },
        'W53S17': {
            'sources': {
                '59bbc3f72052a716c3ce7287': {'sourcename':'exp N', 'x':4, 'y':44,
                    'assigned': {'ldharvester': 6, 'reserver': 1}
                },
            } 
        },
        'W54S18': {
            'sources': {
                '59bbc3e92052a716c3ce70b6': {'sourcename':'exp W close', 'x':42, 'y':6,
                    'assigned': {'ldharvester': 6, 'reserver': 1}
                },
                '59bbc3e92052a716c3ce70b7': {'sourcename':'exp W far', 'x':5, 'y':37,
                    'assigned': {'ldharvester': 6}
                }
            }
        },
        'W54S17': {
            'sources': {
                '59bbc3e82052a716c3ce70b4': {'sourcename':'exp NW', 'x':38, 'y':31,
                    'assigned': {'ldharvester': 6, 'reserver': 1}
                }
            } 
        },
        'W51S18': {
            'sources': {
                '59bbc4182052a716c3ce758c': {'sourcename':'exp EE up', 'x':14, 'y':20,
                    'assigned': {},
                    'starter': 1
                },
                '59bbc4182052a716c3ce758d': {'sourcename':'exp EE ha', 'x':3, 'y':27,
                    'assigned': {},
                    'starter': 1
                }
            }
        }
    }

global.empire_workers = {
	'upgrader': { 'body': [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, CARRY, MOVE], 'body-starter': [WORK, CARRY, MOVE] },
	'harvester': { 'body': [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], 'body-starter': [WORK, CARRY, MOVE] },
	'scavenger': { 'body': [WORK, CARRY, MOVE] },
	'ldharvester': { 'body': [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE] },
	'builderstorage': { 'body': [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE] },
	'upgraderstorage': { 'body': [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE] },
	'adventurer': { 'body': [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK] },
	'claimer': { 'body': [CLAIM, CLAIM, MOVE, MOVE] },
	'reserver' : { 'body': [CLAIM, CLAIM, MOVE, MOVE] }
}


    // SHORTCUTS: 
    //default assign:
    // empire[empire_defaults['room']].sources[empire_defaults['sourceid']].assigned

// ---------------------------
// BEGIN MAIN LOOP (ALL CODE HAS TO GO BELOW THIS LINE!)
// ---------------------------

module.exports.loop = function () {

    //console.log('Account: ' + Game.cpu.limit + ', Cycle: ' + Game.cpu.tickLimit + ', Bucket: ' + Game.cpu.bucket);

    // MAIN STATUS BAR:
    //console.log(Game.time + ': E: ' + Game.spawns.Spawn1.room.energyAvailable + '/' + Game.spawns.Spawn1.room.energyCapacityAvailable + ', V: ' + energy_reserves + '. B: ' + Game.cpu.bucket);
    
    cleaner.process()

    var sectors_under_attack = {};
    if(Memory['sectors_under_attack'] != undefined) {
        sectors_under_attack = Memory['sectors_under_attack'];
    };


    if(Game.time % 5 === 0) {

        // EXPANSION CONTROLLER
        
        var vault = Game.getObjectById(empire_defaults['storage']);
        if(vault) {
           var energy_reserves = vault.store.energy;
           //console.log('Vault: ' + energy_reserves);
           if(energy_reserves > 500000) {
               empire[empire_defaults['room']].sources[empire_defaults['sourceid']].assigned['upgraderstorage'] = 4;
           } else if(energy_reserves > 100000) {
               empire[empire_defaults['room']].sources[empire_defaults['sourceid']].assigned['upgraderstorage'] = 2;
           } else if(energy_reserves > 10000) {
               empire[empire_defaults['room']].sources[empire_defaults['sourceid']].assigned['upgraderstorage'] = 1;
           }
        }
        
        var myusername = 'Phisec';
        var expansiontarget = Game.rooms['W51S18'];
        var expansiontargetname = 'W51S18';
        var expansionsource = '59bbc4182052a716c3ce758c';
        var controllertarget = Game.getObjectById('59bbc4182052a716c3ce758b');
        var gcltarget = 2;
        var spawner_posx = 16;
        var spawner_posy = 24;
        // CASE 1: I have nothing in the room OR I have something but I lack the GCL to claim the room. Instead, send a reserver & guard.
        if (expansiontarget == undefined || Game.gcl.level < gcltarget) {
            empire[expansiontargetname].sources[expansionsource].assigned = {'reserver': 1}; // , 'adventurer': 1
            //console.log("EXPAND: " + expansiontargetname + ": reserver");
        // ERROR CHECK: controller
        } else if (controllertarget == undefined) {
            console.log("EXPAND: CONTROLLER TARGET UNDEFINED");
        // CASE 2: I can claim the room.
        } else if (controllertarget.owner != myusername) {
            console.log("EXPAND: " + expansiontarget + ": CLAIM CONTROLLER ");
            empire[expansiontargetname].sources[expansionsource].assigned = {'claimer': 1};
        // CASE 3: I have already claimed the room.
        } else {
            var has_spawn = 0;
            for (key in Game.spawns) {
                if (Game.spawns[key].room.name == expansiontarget) {
                    has_spawn = 1;
                }
            }
            var controller_level = controllertarget.level;
            if(!has_spawn && controller_level == 0) {
                console.log("EXPAND: " + expansiontarget + ": UPGRADE CONTROLLER TO 1");
                // CASE 4: I own the room, but the controller is level 0
                empire[expansiontargetname].sources[expansionsource].assigned = {'remoteupgrader': 1};
            } else if (!has_spawn && controller_level > 0) {
                console.log("EXPAND: " + expansiontarget + ": CREATE SPAWNER");
                // CASE 5: I own the room, the controller is level 1 (can have spawn) but there is no spawn
                var csites = expansiontarget.find(FIND_CONSTRUCTION_SITES);
                if(csites.length) {
                    // we have a spawn construction site, we just need to wait for it to be built.
                } else {
                    expansiontarget.createConstructionSite(spawner_posx, spawner_posy, STRUCTURE_SPAWN);
                }
                empire[expansiontargetname].sources[expansionsource].assigned = {'remoteupgrader':1, 'remoteconstructor': 1};
            } else if (has_spawn) { 
                console.log("EXPAND: " + expansiontarget + ": SUCCESS");
                empire[expansiontargetname].sources['59bbc4182052a716c3ce758c'].assigned = {'upgrader': 3}; // EE room, upgrader slot
                empire[expansiontargetname].sources['59bbc4182052a716c3ce758d'].assigned = {'harvester': 3};
                // CASE 6: I own the room, and there is a spawn there.
                // SUCCESS?
            } else {
                console.log("EXPAND: " + expansiontarget + ": ERROR UNDEFINED CASE");
                // ERROR CASE.
            }
        }

        // COMBAT CONTROLLER
        var timenow = Game.time;
        for(var rname in Game.rooms) {
            //console.log("Parsing room: " + Game.rooms[rname].name);
            var enemiesList = Game.rooms[rname].find(FIND_HOSTILE_CREEPS);
            var enemiesCost = 0;
            //console.log(JSON.stringify(enemiesList));
            if(enemiesList.length) {
                for(var i = 0; i < enemiesList.length; i++) {
                    enemiesCost += global.CREEP_COST(enemiesList[i].body);
                }
                //console.log("TOTAL ENEMY COST:" + enemiesCost);
                console.log("ALERT: " + Game.rooms[rname].name + ' has ' + enemiesList.length + ' enemies, worth body cost: ' + enemiesCost + '!'); 
                if(sectors_under_attack[Game.rooms[rname].name] == undefined) {
                    console.log("ATTACK: NEW DETECTED: " + Game.rooms[rname].name);
                }
                sectors_under_attack[Game.rooms[rname].name] = {'time':timenow, 'threat':enemiesCost};
            }
        }
        for(var csector in sectors_under_attack) {
            if(empire[csector] == undefined) {
                console.log("ATTACK: cannot do anything about an attack in a non-empire sector: " + csector);
                continue;
            }
            var tgap = timenow - sectors_under_attack[csector]['time'];
            if(tgap >= empire_defaults['alerts_duration']) {
                console.log("ATTACK: OLD ENDS: " + csector + ' at ' + tgap + ' seconds since last detection.');
                delete sectors_under_attack[csector];
                if(empire_defaults['alerts_recycle'] == 1) {
                    for(var name in Game.creeps) {
                        if(Game.creeps[name].memory.target == csector && Game.creeps[name].memory.role == 'adventurer') {
                            Game.creeps[name].memory.role = 'recycler';
                            Game.creeps[name].say('🔄 recycle');
                            //console.log("MOB: " + name + ' IS eligible.');
                        } else { 
                            //console.log("MOB: " + name + ' not eligible.');
                            
                        }
                    }
                }
            } else {
                empire[empire_defaults['room']].sources[empire_defaults['sourceid']].assigned['teller'] = 1;
                for (var skey in empire[csector].sources) {
                    if( empire[csector] == undefined ) {
                        console.log("ATTACK: csector " + csector + " is undefined.");
                    } else if ( empire[csector].sources[skey] == undefined) {
                        console.log("ATTACK: source " + skey + " is undefined. X");
                    } else if (sectors_under_attack[csector]['threat'] > 10000) {
                        empire[csector].sources[skey].assigned['adventurer'] = 5; // >10k, multiple large invaders.
                    } else if(sectors_under_attack[csector]['threat'] > 6000) {
                        empire[csector].sources[skey].assigned['adventurer'] =  4; // 6k-10k, either a lone healer, or a group of bigger invaders.
                    } else if(sectors_under_attack[csector]['threat'] > 2000) {
                        empire[csector].sources[skey].assigned['adventurer'] =  3; // 2000-6000, typical range for a single big invader, or a party of smaller ones.
                    } else if(sectors_under_attack[csector]['threat'] >= 600) {
                        empire[csector].sources[skey].assigned['adventurer'] =  2; // 600-2000, typical range for 1-2 small invaders. send a pair.
                    } else { 
                        empire[csector].sources[skey].assigned['adventurer'] =  1; // sub-600 scout. send one bloke.
                    }
                }
                if (tgap > 0) {
                    console.log("ATTACK: OLD TIMING OUT: " + csector + ' ' + tgap + ' seconds old.');
                } else {
                    console.log("ATTACK: CONTINUES: " + csector + ', age:' + tgap);
                }
            }
        }
        Memory['sectors_under_attack'] = sectors_under_attack;


        // Adjust builders depending on unfinished projects.
        var projectsList = Game.spawns.Spawn1.room.find(FIND_CONSTRUCTION_SITES);
        if(projectsList.length) {
            var targets = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                     return (structure.structureType == STRUCTURE_CONTAINER) && structure.store.energy > 5000;
                }
            });
            if(targets.length > 0) {
                empire[empire_defaults['room']].sources[empire_defaults['sourceid']].assigned['builderstorage'] = 2;
            }
        }

        var sources_actual = [];
        for(var name in Memory.creeps) {

            if(Game.creeps[name].memory.source == undefined) {
                console.log("WARN: " + Game.creeps[name] + " in " + Game.creeps[name].room.name + " has no source defined.");
            }
            if(Game.creeps[name].memory.role) {
                myrole = Game.creeps[name].memory.role;
                if(Game.creeps[name].memory.source) {
                    //console.log("Creep " + name + " has source:" + Game.creeps[name].memory.source);
                    if(sources_actual[Game.creeps[name].memory.source] == undefined) { 
                        //console.log("Creep " + name + " created an sources_actual entry for source:" + Game.creeps[name].memory.source);
                        sources_actual[Game.creeps[name].memory.source] = {id:sources_actual[Game.creeps[name].memory.source]};
                    }
                    if(sources_actual[Game.creeps[name].memory.source][myrole] == undefined) {
                        sources_actual[Game.creeps[name].memory.source][myrole] = 1;
                        //console.log("Creep " + name + " created an sources_actual entry for source:" + Game.creeps[name].memory.source + ' role: ' + myrole);
                    } else {
                        sources_actual[Game.creeps[name].memory.source][myrole] = sources_actual[Game.creeps[name].memory.source][myrole] + 1;
                        //console.log("Creep " + name + " incremented an sources_actual entry for source:" + Game.creeps[name].memory.source + ' role: ' + myrole + ' to ' + sources_actual[Game.creeps[name].memory.source][myrole]);
                        //console.log(sources_actual[Game.creeps[name].memory.source][myrole]);
                    }
                    //console.log('Finished creep.Result: ' + JSON.stringify(sources_actual[Game.creeps[name].memory.source]));
                    //console.log(sources_actual[Game.creeps[name].memory.source]);
                } else {
                    Game.creeps[name].memory.source = '59bbc3f82052a716c3ce728b'; // :((( ******************
                }
            } else {
                console.log("Creep " + name + " has NO ROLE!");
                continue;
            }
        }
        //console.log('Test actual:' + JSON.stringify(sources_actual['59bbc3f82052a716c3ce7289']));
        
        EmpireSpawning: {
            for (var rname in empire) {
                for (var skey in empire[rname].sources) {
                    var s_status = 'Source: |' + empire[rname].sources[skey]['sourcename'] + '|: ';
                    if (sources_actual[skey] == undefined) {
                        sources_actual[skey] = {};
                    }
                    for (var role in empire[rname].sources[skey].assigned) {
                        if (sources_actual[skey][role] == undefined) {
                            sources_actual[skey][role] = 0;
                        }
                        s_status += role + ': ' + sources_actual[skey][role] + '/' + empire[rname].sources[skey].assigned[role] + ' ';
                        if ( sources_actual[skey][role] < empire[rname].sources[skey].assigned[role]) {
                            if(sectors_under_attack[csector] != undefined && !empire_defaults['military_roles'].includes(role)) {
                                //console.log('SPAWN: holding spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + "| until attack is over.");
                                continue;
                            }
                            var spawner = Game.getObjectById(empire_defaults['spawner']);
                            if (empire[rname]['spawner'] != undefined) {
                                spawner = empire[rname]['spawner'];
                            }
                            if(spawner == undefined) {
                                console.log('SPAWNER UNDEFINED:  ' + role + ' for |' + empire[rname].sources[skey]['sourcename'] + "|");
                                continue;
                            } else if(spawner.spawning != null) {
                                console.log('Queued spawn ' + role + ' for |' + empire[rname].sources[skey]['sourcename'] + "|");
                                continue;
                            }                        
                            var partlist = empire_workers[role].body;
                            if (empire[rname].sources[skey]['starter'] != undefined && empire_workers[role]['body-starter'] != undefined) {
                                partlist = empire_workers[role]['body-starter'];
                            }
                            var spawnrole = role;
                            var thecost = global.UNIT_COST(partlist);
                            var target_x = 25;
                            var target_y = 25;
                            if(empire[rname].sources[skey]['x'] != undefined) { target_x = empire[rname].sources[skey]['x']; }
                            if(empire[rname].sources[skey]['y'] != undefined) { target_y = empire[rname].sources[skey]['y']; }
                            console.log("SPAWNING: " + spawner.name + " created " + spawnrole + " for |" + empire[rname].sources[skey]['sourcename'] + '| going to: ' + rname + ' with cost: ' + thecost + ' based out of ' + spawner.room.name);
                            spawncustom.process(spawner, partlist, spawnrole, skey, rname, thecost, spawner.room.name, target_x, target_y);
                            break EmpireSpawning;
                           // process: function(spawner, partlist, roletext, sourcetext, targettext, thecost, homesector, target_x, target_y){
                            //    spawner.createCreep(partlist, roletext + Game.time.toString(), {'role': roletext, 'source': sourcetext, 'target': targettext, 'home': homesector, 'target_x': target_x, 'target_y': target_y});
                            //}
                        }
                    }
                    if(Memory['config.reportworkers'] == 1) {
                        console.log(s_status);
                    }
                    
                }
            }
        }

    
    }
    
    for(var id in Game.structures){
        if(Game.structures[id].structureType == STRUCTURE_TOWER){
            structureTower.run(Game.structures[id])
        }
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'ldharvester') {
            roleLDHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'upgraderstorage') {
            roleUpgraderstorage.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'builderstorage') {
            roleBuilderstorage.run(creep);
        }
        if(creep.memory.role == 'adventurer') {
            roleAdventurer.run(creep);
        }
        if(creep.memory.role == 'scavenger') {
            roleScavenger.run(creep);
        }
        if(creep.memory.role == 'claimer') {
            roleClaimer.run(creep);
        }
        if(creep.memory.role == 'reserver') {
            roleReserver.run(creep);
        }
        if(creep.memory.role == 'recycler') {
            roleRecycler.run(creep);
        }
        if(creep.memory.role == 'teller') {
            roleTeller.run(creep);
        }
        if(creep.memory.role == 'remoteconstructor') {
            roleRemoteconstructor.run(creep);
        }
    }


}
