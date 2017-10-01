module.exports = {
    process: function(partlist, roletext, sourcetext, targettext, thecost, homesector, target_x, target_y){
        if(Game.spawns.Spawn1.room.energyAvailable < thecost) {
           //console.log("FAILED SPAWN (NOT ENOUGH ENERGY): " + roletext + " for " + sourcetext + ' with ' + Game.spawns.Spawn1.room.energyAvailable + '/' + thecost + ' energy.');
        } else {
            var human_source_name = sourcetext;
            if (sources_detail[sourcetext] != undefined) {
                if(sources_detail[sourcetext]['sourcename'] != undefined) {
                    human_source_name = sources_detail[sourcetext]['sourcename'];
                }
            }
            console.log("SPAWNING: " + roletext + " for (" + human_source_name + ') target: ' + targettext + ' (' + target_x + ',' + target_y + ') with cost: ' + thecost + ' based out of ' + homesector);
            Game.spawns.Spawn1.createCreep(partlist, roletext + Game.time.toString(), {'role': roletext, 'source': sourcetext, 'target': targettext, 'home': homesector, 'target_x': target_x, 'target_y': target_y});
        }
    }
};