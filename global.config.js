global.GET_ALL_GLOBAL_CONFIG = function() {
    if (typeof Memory[MEMORY_GLOBAL_GCONFIG] == 'undefined') {
        Memory[MEMORY_GLOBAL_GCONFIG] = {};
    }
    var gconf = Memory[MEMORY_GLOBAL_GCONFIG];
    if (!gconf) {
        console.log('GET_ALL_GLOBAL_CONFIG: no such memory key: MEMORY_GLOBAL_GCONFIG');
        return false;
    }
    return gconf;
}

global.SET_GLOBAL_CONFIG_KEY = function(key, value, subvalue) {
    if (!key) {
        console.log('SET_GLOBAL_CONFIG_KEY: no key provided');
        return false;
    }
    if (value == undefined) {
        console.log('SET_GLOBAL_CONFIG_KEY: no value provided');
        return false;
    }
    if (subvalue) {
        if (!Memory[MEMORY_GLOBAL_GCONFIG][key]) {
            Memory[MEMORY_GLOBAL_GCONFIG][key] = {};
        }
        Memory[MEMORY_GLOBAL_GCONFIG][key][value] = subvalue;
        return true;
    }
    Memory[MEMORY_GLOBAL_GCONFIG][key] = value;
    return true;
}