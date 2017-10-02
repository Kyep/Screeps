module.exports = {
    process: function(spawner, partlist, roletext, sourcetext, targettext, thecost, homesector, target_x, target_y){
        //console.log("SPAWNING: " + roletext + " for (" + sourcetext + ') target: ' + targettext + ' (' + target_x + ',' + target_y + ') with cost: ' + thecost + ' based out of ' + homesector);
        var result = spawner.createCreep(partlist, roletext + Game.time.toString(), {'role': roletext, 'source': sourcetext, 'target': targettext, 'home': homesector, 'target_x': target_x, 'target_y': target_y});
        return result;
    }
};