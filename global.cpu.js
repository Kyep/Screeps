// Config keys:
// SET_GLOBAL_CONFIG_KEY('save_cpu_creeps', true);  SET_GLOBAL_CONFIG_KEY('report_cpu_creeps', true);
// SET_GLOBAL_CONFIG_KEY('save_cpu_creeps', false); SET_GLOBAL_CONFIG_KEY('report_cpu_creeps', false);  

// Commands

global.RESET_CPU_USAGE_HISTORY = function() {
    Memory[MEMORY_GLOBAL_CPUSTATS] = { 'data': [] }
}

global.REPORT_CPU_USAGE_HISTORY = function() {
    var history = Memory[MEMORY_GLOBAL_CPUSTATS];
    if (history == undefined || history['data'] == undefined) {
        console.log('REPORT_CPU_USAGE_HISTORY: called without history in memory.');
        return false;
    }
    var hdata = history['data'];
    var sample = {}
    for (var i = 0; i < hdata.length; i++) {
        var thist = hdata[i];
        if (typeof thist != 'object') {
            continue;
        }
        for (var tkey in thist) {
            if (sample[tkey] == undefined) {
                sample[tkey] = 0;
            }
            //console.log(JSON.stringify(thist[tkey]));
            sample[tkey] += thist[tkey];
        }
    }
    
    for (var key in sample) {
        var avg = ROUND_NUMBER_TO_PLACES(sample[key] / hdata.length, 2);
        console.log(key +': ' + avg);
    }
    console.log('CPU reporting based on a history of ' + hdata.length + ' ticks.');
}

// Functions


global.CPU_GET_DIVISOR = function() {
    // We run some code every X ticks.
    // This sets that X, based on the amount of CPU in our bucket.
    var divisor = 3;
    if (Game.cpu.bucket < 8000) {
        divisor = 5;
        if (Game.cpu.bucket < 1000) {
            console.log('Account: ' + Game.cpu.limit + ', Cycle: ' + Game.cpu.tickLimit + ', Bucket: ' + Game.cpu.bucket);
            divisor = 30;
        }
    }
    return divisor;
}

global.UPDATE_CPU_USAGE_HISTORY = function(thistick) {
    // Called every tick by main.js
    // Stores data in Memory[MEMORY_GLOBAL_CPU]
    // 
    // Memory[MEMORY_GLOBAL_CPU] = {
    //  'num_avg' = average 
    //  'avg_data' = {'type': 'avg'... }
    //  'data' 
    // }
    if (thistick == undefined) {
        console.log('UPDATE_CPU_USAGE_HISTORY: called without thistick defined as an object.');
        return false;
    }

    
    var history = Memory[MEMORY_GLOBAL_CPUSTATS];
    if (history == undefined) {
        history = {}
    }
    if (history['data'] == undefined) {
        history['data'] = []
    }
    if (history['data'].length >= 100) {
        history['data'].pop(); // deletes last item
    }
    history['data'].unshift(thistick);
    
    
    Memory[MEMORY_GLOBAL_CPUSTATS] = history;
    return true;

}

global.CPU_SECTION = function(cputype, rare, override_value) {
    // Called for named sections of main.js to profile cpu usage. e.g: CPU_SECTION('requirefiles');
    // (rare) flag is for things that do not run every tick.
    
    if (cputype == undefined) {
        console.log('CPU_SECTION: called without cputype.');
        return false;
    }
    var used_sofar = Game.cpu.getUsed();
    var last_value = 0;
    if (cpu_thistick['total']) {
        last_value = cpu_thistick['total'];
    }
    if (rare) {
        cpu_thistick['rare'] = true;
    }
    if (override_value) {
        cpu_thistick[cputype] = override_value;
    } else {
        cpu_thistick[cputype] = ROUND_NUMBER_TO_PLACES(used_sofar - last_value, 2);
    }
    Memory[MEMORY_GLOBAL_CPUSTATS]['lastsection'] = cputype;
    cpu_thistick['total'] = ROUND_NUMBER_TO_PLACES(used_sofar, 2);
    return true;
}

global.CPU_SECTION_FINAL = function() {
    if(cpu_thistick == undefined) {
        console.log('CPU_SECTION: called without cpu_thistick defined as a global var.');
        return false;
    }
    Memory[MEMORY_GLOBAL_CPUSTATS]['lastsection'] = 'finished';
    delete cpu_thistick['rare']
    return UPDATE_CPU_USAGE_HISTORY(cpu_thistick);
}