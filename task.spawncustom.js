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
        //console.log("SPAWNING: " + roletext + " for (" + sourcetext + ') target: ' + targettext + ' (' + target_x + ',' + target_y + ') with cost: ' + thecost + ' based out of ' + homesector);
        var result = spawner.createCreep(partlist, crname, 
            {'role': roletext, 'source': sourcetext, 'target': targettext, 'home': homesector, 'target_x': target_x, 'target_y': target_y, 'spawnername': spawner.name, 'renew_allowed': renew_allowed});
        Memory['spawn_count'] += 1;
        return result;
    }
};