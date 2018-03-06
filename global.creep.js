
global.RUN_CREEPS = function() {
    
    var config_save_cpu_creeps = GLOBALCONFIG['save_cpu_creeps']
    var config_report_cpu_creeps = GLOBALCONFIG['report_cpu_creeps'];
    
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
    var roleHarvester = require('role.harvester');
    var roleCHarvester = require('role.charvester');
    var roleHauler = require('role.hauler');
    var roleBanker = require('role.banker');

    var total_creep_cpu_use = 0;
    var creep_cpu_map = {}
    
    if (config_save_cpu_creeps) {
        CPU_SECTION('creep-presave');
    }
    
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];

        var cpu_base = 0;
        if (config_save_cpu_creeps || config_report_cpu_creeps) {
            cpu_base = Game.cpu.getUsed();
        }

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
        } else if(creep.memory[MEMORY_ROLE] == 'upstorclose' || creep.memory[MEMORY_ROLE] == 'upstorfar' || creep.memory[MEMORY_ROLE] == 'upstor8') {
            roleUpgraderStorage.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'grower') {
            roleGrower.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'builder') {
            roleBuilder.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'builderstorage') {
            roleBuilderStorage.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'teller' || creep.memory[MEMORY_ROLE] == 'teller-mini') {
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
        } else if(creep.memory[MEMORY_ROLE] == 'banker') {
            roleBanker.run(creep);
        } else {
            console.log('ALERT: ' + creep.name + ' in room' + creep.room.name + ' has role ' + creep.memory[MEMORY_ROLE] + ' which I do not know how to handle: ' + JSON.stringify(creep.memory));
            //creep.suicide();
        }
        
        if (config_save_cpu_creeps || config_report_cpu_creeps) {
            var creep_cpu = Game.cpu.getUsed() - cpu_base;
            if(creep_cpu_map[creep.memory[MEMORY_ROLE]] == undefined) {
                creep_cpu_map[creep.memory[MEMORY_ROLE]] = [];
            }
            creep_cpu_map[creep.memory[MEMORY_ROLE]].unshift(creep_cpu);
        }
        
    }
    if (config_report_cpu_creeps || config_save_cpu_creeps) {
        var highest_cpu_class = '';
        var highest_cpu_usage = 0;
        var all_total = 0;
        for (var pname in creep_cpu_map) {
            var this_total = 0;
            for (var i = 0; i < creep_cpu_map[pname].length; i++){
                this_total += creep_cpu_map[pname][i];
            }
            all_total += this_total;
            var cl_total = ROUND_NUMBER_TO_PLACES(this_total, 2);
            var cl_avg = ROUND_NUMBER_TO_PLACES(this_total / creep_cpu_map[pname].length, 2);
            if (config_report_cpu_creeps) {
                console.log(pname + ': ' + creep_cpu_map[pname].length + ' creeps taking ' + cl_total + ' cpu, avg: ' + cl_avg);
            }
            if (this_total > highest_cpu_usage) {
                highest_cpu_usage = this_total;
                highest_cpu_class = pname;
            }
            if (config_save_cpu_creeps) {
                CPU_SECTION('creep-type-' + pname, true, cl_total);
            }
        }
        if (config_report_cpu_creeps) {
            console.log('Best class to optimize: ' + highest_cpu_class + ' with ' + ROUND_NUMBER_TO_PLACES(highest_cpu_usage, 2));
            console.log('Total creep CPU usage: ' + all_total);
        }
    }
    
}