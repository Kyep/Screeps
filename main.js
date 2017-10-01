// requirements ONLY
var roleHarvester = require('role.harvester');
var roleLDHarvester = require('role.ldharvester');
var roleUpgrader = require('role.upgrader');
var roleUpgraderstorage = require('role.upgraderstorage');
var roleBuilder = require('role.builder');
var roleAdventurer = require('role.adventurer');
var roleScavenger = require('role.scavenger');
var roleClaimer = require('role.claimer');
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

    global.sources_detail = {};
    global.sources_detail['59bbc3f82052a716c3ce7289'] = {'roomname':'W53S18', 'sourcename':'base NE', 'x':25, 'y':18}; // just ne of spawn, 4 slots, harvester
    global.sources_detail['59bbc3f82052a716c3ce728b'] = {'roomname':'W53S18', 'sourcename':'base SW', 'x':16, 'y':26}; // juts sw of spawn, 4 slots, upgrader-heavy
    global.sources_detail['59bbc4062052a716c3ce7408'] = {'roomname':'W52S18', 'sourcename':'E room', 'x':11, 'y':14}; // E room, 3 slots
    global.sources_detail['59bbc3f72052a716c3ce7287'] = {'roomname':'W53S17', 'sourcename':'N room', 'x':4, 'y':44}; // N room, 1 slot, 
    global.sources_detail['59bbc3e92052a716c3ce70b6'] = {'roomname':'W54S18', 'sourcename':'W room', 'x':42, 'y':6}; // W room, N, 3 slots,
    global.sources_detail['59bbc3e92052a716c3ce70b7'] = {'roomname':'W54S18', 'sourcename':'W room', 'x':5, 'y':37}; // W room, S, 3 slots,
    global.sources_detail['59bbc3e82052a716c3ce70b4'] = {'roomname':'W54S17', 'sourcename':'NW room', 'x':38, 'y':31}; // NW room, 4 slots, swamp

// ---------------------------
// BEGIN MAIN LOOP (ALL CODE HAS TO GO BELOW THIS LINE!)
// ---------------------------

module.exports.loop = function () {

    // MAIN STATUS BAR:
    console.log(Game.time + ': E: ' + Game.spawns.Spawn1.room.energyAvailable + '/' + Game.spawns.Spawn1.room.energyCapacityAvailable + '  B: ' + Game.cpu.bucket);
    
    //console.log('Account: ' + Game.cpu.limit + ', Cycle: ' + Game.cpu.tickLimit + ', Bucket: ' + Game.cpu.bucket);

    var alerts_duration = 60; // 120 ticks after enemies spotted, clear the alert.
    var alerts_recycle = 1; // after alert is over, spawned adventurers recycle themselves.

    var sources_config = {};
    sources_config['59bbc3f82052a716c3ce7289'] = {'harvester':4, 'scavenger': 1}; // just ne of spawn, 4 slots, harvester
    sources_config['59bbc3f82052a716c3ce728b'] = {'upgrader': 3}; // just sw of spawn, upgrader-heavy
    sources_config['59bbc4062052a716c3ce7408'] = {'ldharvester': 6, 'claimer': 1}; // E room, 3 slots     
    sources_config['59bbc3f72052a716c3ce7287'] = {'ldharvester': 2}; // N room, 1 slot, 
    sources_config['59bbc3e92052a716c3ce70b6'] = {'ldharvester': 5, 'claimer': 1}; // W room, 3 slots, north  
    sources_config['59bbc3e92052a716c3ce70b7'] = {'ldharvester': 5}; // W room, 3 slots, south
    sources_config['59bbc3e82052a716c3ce70b4'] = {'ldharvester': 6, 'claimer': 1}; // NW room, 4 slots, swamp
    sources_config['none'] = {};



    var vault = Game.getObjectById('59cfa1fcd8ad39203de0a8aa');
    if(vault) {
       var energy_reserves = vault.store.energy;
       //console.log('Vault: ' + energy_reserves);
       if(energy_reserves > 500000) {
           sources_config['none']['upgraderstorage'] = 4;
       } else if(energy_reserves > 100000) {
           sources_config['none']['upgraderstorage'] = 2;
       } else if(energy_reserves > 10000) {
           sources_config['none']['upgraderstorage'] = 1;
       }
    }
    
    //console.log(JSON.stringify(sources_config));
    
    cleaner.process()

    var sectors_under_attack = {};
    if(Memory['sectors_under_attack'] != undefined) {
        sectors_under_attack = Memory['sectors_under_attack'];
    };


    if(Game.time % 3 === 0 || sectors_under_attack.length) {

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
            var tgap = timenow - sectors_under_attack[csector]['time'];
            if(tgap >= alerts_duration) {
                console.log("ATTACK: OLD ENDS: " + csector + ' at ' + tgap + ' seconds since last detection.');
                delete sectors_under_attack[csector];
                if(alerts_recycle) {
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
                sources_config['59bbc3f82052a716c3ce7289']['teller'] = 1;
                for (var skey in sources_config) {
                    if(sources_detail[skey] != undefined) {
                        if(sources_detail[skey]['roomname'] == csector) {
                            // sample theat values: small invader: 600melee, 720 ranged, 1500 healer. Big invader: 2420/melee, 4110/ranged, 7500/healer.
                            // thus threat < 600 = scout, 600-2000 indicates 1-3 small mobs, 2000-10000 indicates big mobs, and >10,000 is an apocalypse.
                            if(sectors_under_attack[csector]['threat'] > 10000) {
                                sources_config[skey]['adventurer'] = 5; // >10k, multiple large invaders.
                            } else if(sectors_under_attack[csector]['threat'] > 6000) {
                                sources_config[skey]['adventurer'] = 4; // 6k-10k, either a lone healer, or a group of bigger invaders.
                            } else if(sectors_under_attack[csector]['threat'] > 2000) {
                                sources_config[skey]['adventurer'] = 3; // 2000-6000, typical range for a single big invader, or a party of smaller ones.
                            } else if(sectors_under_attack[csector]['threat'] >= 600) {
                                sources_config[skey]['adventurer'] = 2; // 600-2000, typical range for 1-2 small invaders. send a pair.
                            } else { 
                                sources_config[skey]['adventurer'] = 1; // sub-600 scout. send one bloke.
                            }
                            sources_config[skey]['ldharvester'] = 0; // spawn NO LD harvesters for rooms under attack now or recently
                        }
                    }
                }
                if (tgap > 0) {
                    console.log("ATTACK: OLD TIMING OUT: " + csector + ' ' + tgap + ' seconds old.');
                } else {
                    console.log("ATTACK: CONTINUES: " + csector + ', age:' + tgap);
                }
            }
        }
        //console.log('Test config:' + JSON.stringify(sectors_under_attack));
        Memory['sectors_under_attack'] = sectors_under_attack;


        // Adjust builders depending on unfinished projects.
        var projectsList = Game.spawns.Spawn1.room.find(FIND_CONSTRUCTION_SITES);
        if(projectsList.length) {
            var targets = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                     return (structure.structureType == STRUCTURE_CONTAINER) && structure.store.energy > 1000;
                }
            });
            if(targets.length > 0) {
                sources_config['none']['builderstorage'] = 2;
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
                    Game.creeps[name].memory.source = 'none';
                }
            } else {
                console.log("Creep " + name + " has NO ROLE!");
                continue;
            }
        }
        //console.log('Test config:' + JSON.stringify(sources_config['59bbc3f82052a716c3ce7289']));
        //console.log('Test actual:' + JSON.stringify(sources_actual['59bbc3f82052a716c3ce7289']));
        
        //console.log(JSON.stringify(sources_config));
        var spawned_something = 0;
        for (var skey in sources_config) {
            var human_source_name = skey;
            if (sources_detail[skey] != undefined) {
                if(sources_detail[skey]['sourcename'] != undefined) {
                    human_source_name = sources_detail[skey]['sourcename'];
                }
            }
            //console.log('Source: ' + skey);
            var s_status = 'Source: ' + human_source_name + ': ';
            for (var prop in sources_config[skey]) {
                if (sources_actual[skey] == undefined) {
                    sources_actual[skey] = {};
                }
                if (sources_actual[skey][prop] == undefined) {
                    sources_actual[skey][prop] = 0;
                }
                if (sources_actual[skey][prop] > sources_config[skey][prop]) {
                    s_status += prop + ': ' + sources_actual[skey][prop] + '/' + sources_config[skey][prop] + ' ';
                    //console.log('Source: ' + skey + ', Job: ' + prop + ', Has: ' + sources_actual[skey][prop] + ', requires ' + sources_config[skey][prop]);
                } else if (sources_actual[skey][prop] < sources_config[skey][prop]) {
                    s_status += prop + ': ' + sources_actual[skey][prop] + '/' + sources_config[skey][prop] + ' ';

                    //console.log('Source: ' + human_source_name + ', Job: ' + prop + ', Has: ' + sources_actual[skey][prop] + ', requires ' + sources_config[skey][prop] + '. E=' + Game.spawns.Spawn1.room.energyAvailable + '/' + Game.spawns.Spawn1.room.energyCapacityAvailable + ' SS: ' + spawned_something);
                    if(!spawned_something) {
                        var partlist = [WORK, WORK, CARRY, CARRY, MOVE, MOVE]; 
                        if (prop == 'upgrader') {
                            partlist = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, CARRY, MOVE];
                        } else if (prop == 'harvester') {
                            partlist = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
                        } else if (prop == 'scavenger') {
                            partlist = [WORK, CARRY, MOVE];
                        } else if (prop == 'ldharvester') {
                            partlist = [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE];
                        } else if (prop == 'builderstorage') {
                            partlist = [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
                        } else if (prop == 'upgraderstorage') {
                            partlist = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE];
                        } else if (prop == 'adventurer') {
                            partlist = [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK];
                        } else if (prop == 'claimer') {
                            partlist = [CLAIM, CLAIM, MOVE];
                        }
                        var thecost = global.UNIT_COST(partlist);
                        var roomname = 'W53S18';
                        var target_x = 25;
                        var target_y = 25;
                        if(sources_detail[skey] != undefined) {
                            if(sources_detail[skey]['roomname'] != undefined && sources_detail[skey]['x'] != undefined && sources_detail[skey]['y'] != undefined){
                                roomname = sources_detail[skey]['roomname'];
                                target_x = sources_detail[skey]['x'];
                                target_y = sources_detail[skey]['y'];
                            }
                        }
                        spawncustom.process(partlist, prop, skey, roomname, thecost, 'W53S18', target_x, target_y);

                        //    process: function(partlist, roletext, sourcetext, targettext, thecost, homesector, target_x, target_y){
                        spawned_something = 1;
                    }
                    //break;
                } else {
                    s_status += prop + ': ' + sources_actual[skey][prop] + '/' + sources_config[skey][prop] + ' ';
                    //console.log('Source: ' + skey + ', Job: ' + prop + ', Result: ' + sources_actual[skey][prop] + ' == (just right) ' + sources_config[skey][prop]);
                }
            }
            //console.log(s_status);
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
