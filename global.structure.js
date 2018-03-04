
global.RUN_STRUCTURES = function() {
    var structureLink = require('structure.link');
    var rtowers = {};
    for(var id in Game.structures){
        if(Game.structures[id].structureType == STRUCTURE_TOWER){
            var thistower = Game.structures[id];
            var rname = thistower.room.name;
            if (rtowers[rname] == undefined) {
                rtowers[rname] = [];
            }
            rtowers[rname].push(thistower);
        }
        if(Game.structures[id].structureType == STRUCTURE_LINK){
            structureLink.run(Game.structures[id]);
        }
    }

    // TOWER MANAGEMENT
    for(var rname in rtowers) {
        
        var theroom = Game.rooms[rname];
        
        // If hostiles in room, focus fire.        
        var enemiesList = theroom.getHostileCreeps();
        if (enemiesList.length) {
            var highest_threat = -1;
            var best_target = undefined;
            for (var i = 0; i < enemiesList.length; i++) {
                var this_pri = enemiesList[i].getTargetPriority();
                if (this_pri > highest_threat) {
                    highest_threat = this_pri;
                    best_target = enemiesList[i];
                }
            }

            for (var tnum in rtowers[rname]) {
                var thistower = rtowers[rname][tnum];
                thistower.attack(best_target);
            }
            continue;
        }

        // If no hostiles in room, repair.
        var repairMax = theroom.getTowerRepairMax();
        var repairTargets = theroom.find(FIND_STRUCTURES, {
                filter: function(structure){
                    if(structure.structureType == STRUCTURE_RAMPART){
                        return (structure.hits < repairMax)
                    } else {
                        return 0
                    }
                }
        });
        if (!repairTargets.length) {
            repairTargets = theroom.find(FIND_STRUCTURES, {
                filter: function(structure){
                    if(structure.structureType == STRUCTURE_ROAD){
                        return (structure.hits < structure.hitsMax)
                    } else {
                        return 0
                    }
                }
            });
        }
        if (!repairTargets.length) {
            repairTargets = theroom.find(FIND_STRUCTURES, {
                filter: function(structure){
                    if(structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART){
                        return (structure.hits < repairMax)
                    }else{
                        return (structure.hits < (structure.hitsMax - TOWER_POWER_REPAIR))
                    }
                }
            });
        }
        if (!repairTargets.length) {
            continue;
        }
        // move the most damaged thing to the front.
        repairTargets.sort(function(a, b){
            return a.hits - b.hits
        });

        var available_towers = [];
        for (var tnum in rtowers[rname]) {
            var thistower = rtowers[rname][tnum];
            if (thistower.energy >= 50) {
                available_towers.push(thistower);
            }
        }
        //console.log(rname + ' ' + repairTargets.length + ' rts, ' + ' ' + available_towers.length + ' avts');
        if (available_towers.length) {
            if (repairTargets.length >= 3) {
                for (var avtower in available_towers) {
                    var near_rep = available_towers[avtower].pos.findClosestByRange(repairTargets);
                    available_towers[avtower].repair(near_rep);
                }
            } else {
                var thingtorepair = repairTargets[0];
                var chosen_tower = thingtorepair.pos.findClosestByRange(available_towers);
                chosen_tower.repair(thingtorepair);
            }
    
            var healTargets = theroom.find(FIND_MY_CREEPS, {
                filter: function(creep){
                    return (creep.hits < creep.hitsMax)
                }
            })
            if(healTargets.length){
                healTargets.sort(function(a, b){
                    return a.hits - b.hits
                });
                for (var tnum in rtowers[rname]) {
                    var thistower = rtowers[rname][tnum];
                    var target = healTargets[0];
                    thistower.heal(target);
                }
            }
        }
    }
}