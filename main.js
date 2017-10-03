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
global.overlord = 'Phisec';

    global.empire_defaults = {
        'spawner': '59ce24a6b1421365236708e4',
        'storage': '59cfa1fcd8ad39203de0a8aa',
        'room': 'W53S18',
        'sourceid': '59bbc3f82052a716c3ce7289',
        'military_roles' : ['adventurer', 'scout'],
        'alerts_duration' : 60,
        'alerts_recycle' : 1
    }
    global.empire = {
        'W53S18': {
            'spawns_from': 'W53S18',
            'sources': {
                '59bbc3f82052a716c3ce7289': {'sourcename':'1-E', 'x':25, 'y':18,
                    'assigned': {'harvester':1},
                    'expected_income': 90
                },
                '59bbc3f82052a716c3ce728b': {'sourcename':'1-W', 'x':16, 'y':26,
                    'assigned': {'upgrader': 1, 'scavenger': 1},
                    'expected_income': 80
                }
            }
        },
        'W52S18': {
            'sources': {
                '59bbc4062052a716c3ce7408': {'sourcename':'1E', 'x':11, 'y':14,
                    'assigned': {'ldharvester': 2}, //, 'reserver': 1
                    'expected_income': 10
                },
            }
        },
        'W53S17': {
            'sources': {
                '59bbc3f72052a716c3ce7287': {'sourcename':'1N', 'x':4, 'y':44,
                    'assigned': {'ldharvester': 2}, // , 'reserver': 1
                    'expected_income': 10
                },
            } 
        },
        'W54S18': {
            'sources': {
                '59bbc3e92052a716c3ce70b6': {'sourcename':'1W-E', 'x':42, 'y':6,
                    'assigned': {'ldharvester': 3},
                    'expected_income': 10
                },
                '59bbc3e92052a716c3ce70b7': {'sourcename':'1W-W', 'x':5, 'y':37,
                    'assigned': {'ldharvester': 2, 'reserver': 1},
                    'expected_income': 5
                }
            }
        },
        'W54S17': {
            'sources': {
                '59bbc3e82052a716c3ce70b4': {'sourcename':'1NW', 'x':38, 'y':31,
                    'assigned': {'ldharvester': 2}, //, 'reserver': 1
                    'expected_income': 10
                }
            } 
        },
        
        // 2ND BASE
        'W51S18': {
            'spawns_from': 'W51S18',
            'sources': {
                '59bbc4182052a716c3ce758c': {'sourcename':'2', 'x':14, 'y':20,
                    'assigned': {'harvester':2, 'upgrader':1, 'builder': 2},
                    'expected_income': 80
                },
                '59bbc4182052a716c3ce758d': {'sourcename':'2', 'x':3, 'y':27,
                    'assigned': {'harvester':2, 'scavenger':1},
                    'expected_income': 90
                }
            }
        },
        
        // 2ND BASE EXPANSIONS
        'W51S19': {
            'spawns_from': 'W51S18',
            'sources': {
                '59bbc4182052a716c3ce758f': {'sourcename':'2S', 'x':33, 'y':5,
                    'assigned': {'ldharvester':2},
                    'expected_income': 50
                }
            }
        },
        'W51S17': {
            'spawns_from': 'W51S18',
            'sources': {
                '59bbc4182052a716c3ce7589': {'sourcename':'2N-E', 'x':46, 'y':29,
                    'assigned': {'ldharvester':2},
                    'expected_income': 40
                },
                '59bbc4182052a716c3ce7588': {'sourcename':'2N-W', 'x':4, 'y':26,
                    'assigned': {'ldharvester':4},
                    'expected_income': 10
                }
            }
        },
        
        
        // HOSTILE ROOMS
        'W52S16': {
            'spawns_from': 'W51S18',
            'sources': {
                '59bbc4062052a716c3ce7401': {'sourcename': 'Tarh E', 'x':45, 'y':26,
                    'assigned': {},
                    'expected_income': 1
                },
                '59bbc4062052a716c3ce7402': {'sourcename': 'Tarh W', 'x':8, 'y':44,
                    'assigned': {},
                    'expected_income': 1
                }
            }
        }
        
    }

// rule: must have  1 move part for 1 every other part, or 2 every other parts if creep uses roads exclusively
global.empire_workers = {
	'upgrader': { 'version': 1, 'body': [WORK, WORK, CARRY, MOVE] },
	'remoteupgrader': { 'version': 1, 'body': [WORK, CARRY, MOVE] },
	'remoteconstructor': { 'version': 1, 'body': [WORK, CARRY, CARRY, MOVE, MOVE] },
	'harvester': { 'version': 1, 'body': [WORK, CARRY, MOVE] },
	'scavenger': { 'version': 1, 'body': [WORK, CARRY, CARRY, CARRY, MOVE, MOVE], 'noresizing': 1 },
	'ldharvester': { 'version': 1, 'body': [WORK, CARRY, MOVE] },
	'builder': { 'version': 1, 'body': [WORK, CARRY, MOVE] },
	'builderstorage': { 'version': 1, 'body': [WORK, CARRY, MOVE] },
	'upgraderstorage': { 'version': 1, 'body': [WORK, CARRY, MOVE] },
	'adventurer': { 'version': 1, 'body': [TOUGH, MOVE, MOVE, ATTACK] },
	'scout': { 'version': 1, 'body': [MOVE, MOVE, ATTACK], 'noresizing': 1  },
	'archer': { 'version': 1, 'body': [TOUGH, MOVE, RANGED_ATTACK] },
	'claimer': { 'version': 1, 'body': [CLAIM, MOVE], 'noresizing': 1 },
	'reserver' : { 'version': 1, 'body': [CLAIM, MOVE, MOVE], 'noresizing': 1 },
	'teller': { 'version': 1, 'body': [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], 'noresizing': 1 }	
}



                
    // SHORTCUTS: 
    //default assign:
    // empire[empire_defaults['room']].sources[empire_defaults['sourceid']].assigned

// ---------------------------
// BEGIN MAIN LOOP (ALL CODE HAS TO GO BELOW THIS LINE!)
// ---------------------------

module.exports.loop = function () {

    //empire[empire_defaults['room']].sources[empire_defaults['sourceid']].assigned['teller'] = 1;

    //console.log('Account: ' + Game.cpu.limit + ', Cycle: ' + Game.cpu.tickLimit + ', Bucket: ' + Game.cpu.bucket);

    // MAIN STATUS BAR:
    //console.log(Game.time + ': E: ' + Game.spawns.Spawn1.room.energyAvailable + '/' + Game.spawns.Spawn1.room.energyCapacityAvailable + ', V: ' + energy_reserves + '. B: ' + Game.cpu.bucket);
    
    cleaner.process()

    var sectors_under_attack = {};
    if(Memory['sectors_under_attack'] != undefined) {
        sectors_under_attack = Memory['sectors_under_attack'];
    };


    if(Game.time % 2 === 0) {

        // EXPANSION CONTROLLER
        
        var vault = Game.getObjectById(empire_defaults['storage']);
        if(vault) {
           var energy_reserves = vault.store.energy;
           //console.log('Vault: ' + energy_reserves);
           if(energy_reserves > 50000) {
               empire[empire_defaults['room']].sources[empire_defaults['sourceid']].assigned['upgraderstorage'] = 4;
           } else if(energy_reserves > 20000) {
               empire[empire_defaults['room']].sources[empire_defaults['sourceid']].assigned['upgraderstorage'] = 2;
           } else if(energy_reserves > 10000) {
               empire[empire_defaults['room']].sources[empire_defaults['sourceid']].assigned['upgraderstorage'] = 1;
           }
        }
        
        /*
        var myusername = overlord;
        var expansiontarget = Game.rooms['W51S18'];
        var expansiontargetname = 'W51S18';
        var expansionsource = '59bbc4182052a716c3ce758c';
        var controllertarget = Game.getObjectById('59bbc4182052a716c3ce758b');
        var gcltarget = 2;
        var spawner_posx = 16;
        var spawner_posy = 24;
        // CASE 1: I have nothing in the room OR I have something but I lack the GCL to claim the room. Instead, send a reserver & guard.
        if (Game.gcl.level < gcltarget) {
            //empire[expansiontargetname].sources[expansionsource].assigned = {'reserver': 1}; // , 'adventurer': 1
            console.log("EXPAND: " + expansiontargetname + ": reserver");
        // ERROR CHECK: controller
        } else if (controllertarget == undefined) {
            console.log("EXPAND: CONTROLLER TARGET UNDEFINED - CHECK YOU HAVE UNITS THERE.");
            empire[expansiontargetname].sources[expansionsource].assigned = {'claimer': 1, 'builderstorage': 4};
        // CASE 2: I can claim the room.
        } else if (controllertarget.owner['username'] != myusername) {
            console.log("EXPAND: " + expansiontarget + ": TRYING TO CLAIM CONTROLLER ");
            empire[expansiontargetname].sources[expansionsource].assigned = {'claimer': 1, 'builderstorage': 4};
        // CASE 3: I have already claimed the room.
        } else {
            var has_spawn = 0;
            for (key in Game.spawns) {
                if (Game.spawns[key].room.name == expansiontargetname) {
                    has_spawn = 1;
                }
            }
            var controller_level = controllertarget.level;
            //Apparently you don't have to upgrade controllers in rooms you capture before you can place a spawn.
            //
            //if(!has_spawn && controller_level == 0) {
            //    console.log("EXPAND: " + expansiontarget + ": UPGRADE CONTROLLER TO 1");
            //    // CASE 4: I own the room, but the controller is level 0
            //    empire[expansiontargetname].sources[expansionsource].assigned = {'remoteupgrader': 3};
            //} else 
            if (!has_spawn) {
                // CASE 5: I own the room, the controller is level 1 (can have spawn) but there is no spawn
                var csites = expansiontarget.find(FIND_CONSTRUCTION_SITES);
                if(csites.length) {
                    var csite = csites[0];
                    console.log("EXPAND: " + expansiontarget + ": WAIT FOR SPAWNER TO BE BUILT, PROGRESS: " + csite.progress + '/' + csite.progressTotal);
                    // we have a spawn construction site, we just need to wait for it to be built.
                } else {
                    console.log("EXPAND: " + expansiontarget + ": CREATE SPAWNER");
                    expansiontarget.createConstructionSite(spawner_posx, spawner_posy, STRUCTURE_SPAWN);
                }
                empire[expansiontargetname].sources[expansionsource].assigned = {'remoteconstructor': 6};
            } else { 
                console.log("EXPAND: " + expansiontarget + ": SUCCESS");
                empire[expansiontargetname].sources['59bbc4182052a716c3ce758c'].assigned = {'upgrader': 3}; // EE room, upgrader slot
                empire[expansiontargetname].sources['59bbc4182052a716c3ce758d'].assigned = {'harvester': 3};
                // CASE 6: I own the room, and there is a spawn there.
                // SUCCESS?
            } 
        }
        */

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
                    sectors_under_attack[Game.rooms[rname].name] = {}
                    sectors_under_attack[Game.rooms[rname].name]['attackstart'] = timenow;
                }
                sectors_under_attack[Game.rooms[rname].name]['time'] = timenow;
                sectors_under_attack[Game.rooms[rname].name]['threat'] = enemiesCost;
                sectors_under_attack[Game.rooms[rname].name]['enemycount'] = enemiesList.length;
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
                        if(Game.creeps[name].memory.target == csector && (empire_defaults['military_roles'].includes(Game.creeps[name].memory.role))) {
                            Game.creeps[name].memory.role = 'recycler';
                            Game.creeps[name].say('🔄 recycle');
                            //console.log("MOB: " + name + ' IS eligible.');
                        } else { 
                            //console.log("MOB: " + name + ' not eligible.');
                            
                        }
                    }
                }
            } else {
                if( empire[csector] == undefined ) {
                    console.log("ATTACK: csector " + csector + " is undefined.");
                    continue;
                }

                var defenseforce = {'adventurer': 1};
                var room_has_spawn = 0;
                for (var thisspawn in Game.spawns) {
                    if (thisspawn.room == csector) {
                        room_has_spawn = 1;
                    }
                }

                // defcon 1: single invader, invasion lasting less than a minute, not very strong
                if (sectors_under_attack[csector]['threat'] < 2000 && (timenow - sectors_under_attack[csector]['attackstart']) < 60 && sectors_under_attack[csector]['enemycount'] == 1) {
                    defenseforce = {'scout': 2};
                    empire[csector]['defcon'] = 1;

                // defcon 2: big invader, or tougher group, invasion lasting less than 3 minutes, or up to 3 enemies               
                } else if (sectors_under_attack[csector]['threat'] < 6000 && (timenow - sectors_under_attack[csector]['attackstart']) < 180 && sectors_under_attack[csector]['enemycount'] > 1 && sectors_under_attack[csector]['enemycount'] < 4) {
                    defenseforce = {'adventurer': 3};
                    empire[csector]['defcon'] = 2;

                // defcon 3: big invader, or tougher group, invasion lasting less than 3 minutes    
                } else if (sectors_under_attack[csector]['threat'] < 10000 && (timenow - sectors_under_attack[csector]['attackstart']) < 360) {
                    defenseforce = {'teller': 1, 'adventurer': 5};
                    empire[csector]['defcon'] = 3;

                // defcon 4: big invader, or tougher group, invasion lasting less than 3 minutes  
                } else {
                    defenseforce = {'teller': 1, 'adventurer': 9};
                    empire[csector]['defcon'] = 4;
                }

                empire[csector].sources['defcon'] = {'sourcename': csector + '-defcon', 'x':25, 'y':25,
                    'assigned': defenseforce, 'expected_income': 100}


                if (tgap > 0) {
                    console.log("ATTACK: TIMING OUT IN: " + csector + ', age: ' + tgap + ' DEFCON: ' + empire[csector]['defcon']);
                } else {
                    console.log("ATTACK: HOSTILES STILL IN " + csector + '! DEFCON: ' + empire[csector]['defcon']);
                }
            }
        }
        Memory['sectors_under_attack'] = sectors_under_attack;


        // Adjust builders depending on unfinished projects.
        var projectsList = Game.spawns.Spawn1.room.find(FIND_CONSTRUCTION_SITES);
        if(projectsList.length) {
            var targets = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                     return (structure.structureType == STRUCTURE_STORAGE)  && structure.store.energy < structure.storeCapacity
                }
            });
            if(targets.length > 0 && energy_reserves > 20000) {
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
        
        var spawner_mobs = {};
        var spawnerless_mobs = [];
        for (mname in Game.creeps) {
            if (Game.creeps[mname].memory['spawnername'] != undefined) {
                var theirsname = Game.creeps[mname].memory['spawnername'];
                if(spawner_mobs[theirsname] == undefined) {
                    spawner_mobs[theirsname] = [];
                }
                spawner_mobs[theirsname].push(mname);
                //console.log("Adding one to: " + theirsname);
            } else {
                spawnerless_mobs.push(mname);
            }
        }
        //console.log(JSON.stringify(spawner_mobs));

        
        EmpireSpawning: {
            var spawn_queue = {};
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
                            if (empire[rname]['spawns_from'] != undefined) {
                                for (key in Game.spawns) {
                                    if (Game.spawns[key].room.name == empire[rname]['spawns_from']) {
                                        spawner = Game.spawns[key];
                                        //console.log('SPAWNER CUSTOMIZED:  ' + role + ' for |' + empire[rname].sources[skey]['sourcename'] + "| will use custom spawner ID " + key);
                                    }
                                }
                            }
                            if(spawner == undefined) {
                                console.log('SPAWNER UNDEFINED:  ' + role + ' for |' + empire[rname].sources[skey]['sourcename'] + "|");
                                continue;
                            } else if(spawner.spawning != null) {
                                //console.log('Queued spawn ' + role + ' for |' + empire[rname].sources[skey]['sourcename'] + "|");
                                continue;
                            }                
                            if (empire_workers[role] == undefined) {
                                console.log(spawner.name + ': UNDEFINED ROLE: ' + role)
                                continue;
                            }
                            if (spawner.room.energyAvailable < 300) {
                                //console.log('SPAWN: holding spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + "| as THIS UNIT cost " + thecost + ' exceeds MIN ENERGY: ' + spawner.room.energyAvailable);
                                //continue;
                            }
                            var part_template = empire_workers[role]['body'];
                            var partlist = [];
                            var work_units = Math.max(1, Math.floor(spawner.room.energyCapacityAvailable / global.UNIT_COST(part_template)));
                            var renew_allowed = 1;
                            
                            if (spawner_mobs[spawner.name] == undefined ) {
                                work_units = 1;
                                renew_allowed = 0;
                                console.log(spawner.name + ': ALLOWING ONLY ONE WORK UNIT, AS MY MOB LIST IS UNDEFINED. ');
                            } else  {
                                if (spawner_mobs[spawner.name].length < 5) {
                                    work_units = 1;
                                    renew_allowed = 0;
                                    console.log(spawner.name + ': ALLOWING ONLY ONE WORK UNIT, AS MY MOB LIST HAS LESS THAN 5 MOBS. ');
                                }
                            }
                            
                            if (empire_workers[role]['noresizing'] == undefined) {
                                for (k = 0; k < part_template.length; k++) {
                                    for (j = 0; j < work_units; j++) {
                                        partlist.push(part_template[k]);
                                    }
                                }
                            } else {
                                partlist = part_template;
                            }
                            var version = empire_workers[role]['version'];

                            var spawnrole = role;
                            var thecost = global.UNIT_COST(partlist);
                            if (spawner.room.energyCapacityAvailable < thecost) {
                                console.log(spawner.name + ': holding spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + "| as THIS UNIT cost " + thecost + ' for ' + json.stringify(partlist) + ' exceeds MAX STORAGE: ' + 
                                    spawner.room.energyAvailable + ' ~ ' + JSON.stringify(partlist));
                                continue;
                            }
                            if (spawner.room.energyAvailable < thecost) {
                                //console.log('SPAWN: holding spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + "| as we lack the cost " + thecost + ' exceeds storage: ' + spawner.room.energyAvailable + ' ~ ' + JSON.stringify(partlist));
                                continue;
                            }
                            var target_x = 25;
                            var target_y = 25;
                            if(empire[rname].sources[skey]['x'] != undefined) { target_x = empire[rname].sources[skey]['x']; }
                            if(empire[rname].sources[skey]['y'] != undefined) { target_y = empire[rname].sources[skey]['y']; }
                            
                            var expected_income = 0;
                            if(empire[rname].sources[skey]['expected_income'] != undefined) {
                                expected_income = empire[rname].sources[skey]['expected_income'];
                            }
                            if(spawn_queue[spawner.name] != undefined) {
                                if(spawn_queue[spawner.name]['expected_income'] != undefined) {
                                    if (expected_income > spawn_queue[spawner.name]['expected_income']) {
                                        console.log(spawner.name + ': permitting spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + "| because its expected_income " + 
                                            expected_income + ' is > than the ' + spawn_queue[spawner.name]['expected_income'] + ' of ' +
                                            spawn_queue[spawner.name]['spawnrole'] + ' working on |' + empire[spawn_queue[spawner.name]['rname']].sources[spawn_queue[spawner.name]['skey']]['sourcename']  + '|');
                                    } else {
                                        console.log(spawner.name + ': holding spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + "| because its expected_income " + 
                                            expected_income + ' is <= than the ' + spawn_queue[spawner.name]['expected_income'] + ' of ' +
                                            spawn_queue[spawner.name]['spawnrole'] + ' working on |' + empire[spawn_queue[spawner.name]['rname']].sources[spawn_queue[spawner.name]['skey']]['sourcename']  + '|');
                                        continue;
                                    }
                                } else {
                                    console.log(spawner.name + ': permitting spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + "| because its expected_income " + 
                                        expected_income + ' is > than the (undefined) of ' +
                                        spawn_queue[spawner.name]['spawnrole'] + ' working on |' + empire[spawn_queue[spawner.name]['rname']].sources[spawn_queue[spawner.name]['skey']]['sourcename'] + '|');
                                }
                            } else {
                                //console.log(spawner.name + ': permitting spawn queue set as there is nothing in queue.');
                            }
                            console.log("SPAWNING: " + spawner.name + " created " + spawnrole + " for |" + empire[rname].sources[skey]['sourcename'] + 
                            '| going to: ' + rname + ' cost: ' + thecost + '/' + spawner.room.energyAvailable + ' based out of ' + spawner.room.name + ' with renew: ' + renew_allowed);

                            spawn_queue[spawner.name] = {
                                'spawner': spawner.name, 'sname': empire[rname].sources[skey]['sourcename'], 'partlist': partlist, 'spawnrole': spawnrole, 'skey': skey, 'rname': rname, 
                                'thecost': thecost, 'myroomname': spawner.room.name, 'target_x': target_x, 'target_y': target_y, 'version': version, 
                                'expected_income': expected_income, 'renew_allowed': renew_allowed
                            }
                            //console.log(JSON.stringify(spawn_queue));
                            //spawncustom.process(spawner, partlist, spawnrole, skey, rname, thecost, spawner.room.name, target_x, target_y, version);
                        }
                    }
                    if(Memory['config.reportworkers'] == 1) {
                        console.log(s_status);
                    }
                    
                }
            }
            //console.log(JSON.stringify(spawn_queue));
            for(var spawnername in Game.spawns) {
                if (spawn_queue[spawnername] != undefined) {
                    var thespawner = Game.getObjectById(Game.spawns[spawnername].id);
                    //continue;
                    spawncustom.process(
                        thespawner, spawn_queue[spawnername]['sname'], spawn_queue[spawnername]['partlist'], spawn_queue[spawnername]['spawnrole'], 
                        spawn_queue[spawnername]['skey'], spawn_queue[spawnername]['rname'], spawn_queue[spawnername]['thecost'], 
                        spawn_queue[spawnername]['myroomname'], spawn_queue[spawnername]['target_x'], 
                        spawn_queue[spawnername]['target_y'], spawn_queue[spawnername]['version'], spawn_queue[spawnername]['renew_allowed']
                    )
                } else {
                    // spawner ~thespawner~ has a full queue.
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
        } else if(creep.memory.role == 'ldharvester') {
            roleLDHarvester.run(creep);
        } else if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        } else if(creep.memory.role == 'upgraderstorage') {
            roleUpgraderstorage.run(creep);
        } else if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        } else if(creep.memory.role == 'builderstorage') {
            roleBuilderstorage.run(creep);
        } else if(creep.memory.role == 'adventurer' || creep.memory.role == 'scout') {
            roleAdventurer.run(creep);
        } else if(creep.memory.role == 'scavenger') {
            roleScavenger.run(creep);
        } else if(creep.memory.role == 'claimer') {
            roleClaimer.run(creep);
        } else if(creep.memory.role == 'reserver') {
            roleReserver.run(creep);
        } else if(creep.memory.role == 'recycler') {
            roleRecycler.run(creep);
        } else if(creep.memory.role == 'teller') {
            roleTeller.run(creep);
        } else if(creep.memory.role == 'remoteconstructor') {
            roleRemoteconstructor.run(creep);
        } else {
            console.log("ALERT: " + creep.name + " has role " + creep.memory.role + " which I don't know how to handle!")
        }
    }


}
