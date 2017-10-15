module.exports = {
    process: function(spawner, sname, partlist, roletext, sourcetext, targettext, thecost, homesector, target_x, target_y, renew_allowed){
        if (Memory['spawn_count'] == undefined) {
            Memory['spawn_count'] = 0;
        }
        if (Memory['spawn_count'] > 999) {
            Memory['spawn_count'] = 0;
        }
        var crname = sname + '_' + roletext + '_' + Memory['spawn_count'];
        if (Game.creeps[crname] != undefined) {
            console.log("SPAWN: failed to create: " + crname + " as that name is already taken.");
            Memory['spawn_count'] += 1;
            return -1;
        }
        var crmemory = {};
        crmemory[MEMORY_ROLE] = roletext;
        crmemory[MEMORY_SOURCE] = sourcetext;
        crmemory[MEMORY_DEST] = targettext;
        crmemory[MEMORY_HOME] = homesector;
        crmemory[MEMORY_HOME_X] = spawner.pos.x;
        crmemory[MEMORY_HOME_Y] = spawner.pos.y;
        crmemory[MEMORY_DEST_X] = target_x;
        crmemory[MEMORY_DEST_Y] = target_y;
        crmemory[MEMORY_SPAWNERNAME] = spawner.name;
        crmemory[MEMORY_RENEW] = renew_allowed;
        //console.log("SPAWNING: " + roletext + " for (" + sourcetext + ') target: ' + targettext + ' (' + target_x + ',' + target_y + ') with cost: ' + thecost + ' based out of ' + homesector);
        //var result = spawner.createCreep(partlist, crname, 
        //    {'role': roletext, 'source': sourcetext, 'target': targettext, 'home': homesector, 'target_x': target_x, 'target_y': target_y, 'spawnername': spawner.name, 'renew_allowed': renew_allowed});
        var result = spawner.createCreep(partlist, crname, crmemory);
        console.log(spawner.name + ': ' + result);
        Memory['spawn_count'] += 1;
        return result;
    }
};