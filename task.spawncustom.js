module.exports = {
    process: function(spawner, sname, partlist, roletext, sourcetext, targettext, thecost, homesector, target_x, target_y, vernum, renew_allowed){
        //console.log("SPAWNING: " + roletext + " for (" + sourcetext + ') target: ' + targettext + ' (' + target_x + ',' + target_y + ') with cost: ' + thecost + ' based out of ' + homesector);
        var result = spawner.createCreep(partlist, sname + '_' + roletext + '_' + Game.time.toString(), 
            {'role': roletext, 'source': sourcetext, 'target': targettext, 'home': homesector, 'target_x': target_x, 'target_y': target_y, 'version': vernum, 'spawnername': spawner.name, 'renew_allowed': renew_allowed});
        return result;
    }
};