
/* 
global.CONVERT_BODY_TO_HPT = function(tbody2) {
    var tbody = [{"type":"heal","hits":0,"boost":"LO"},{"type":"heal","hits":0,"boost":"LO"},{"type":"heal","hits":0,"boost":"LO"},{"type":"heal","hits":0,"boost":"LO"},
    {"type":"move","hits":0},{"type":"move","hits":0},{"type":"move","hits":0},{"type":"move","hits":0},{"type":"move","hits":0},{"type":"move","hits":0},
    {"type":"move","hits":0},{"type":"move","hits":0},{"type":"move","hits":0},{"type":"move","hits":0},{"type":"move","hits":0},{"type":"move","hits":0},
    {"type":"move","hits":0},{"type":"move","hits":0},{"type":"move","hits":0},{"type":"move","hits":0},{"type":"move","hits":0},{"type":"move","hits":0},
    {"type":"move","hits":0},{"type":"heal","hits":0,"boost":"LO"},{"type":"heal","hits":0,"boost":"LO"},{"type":"heal","hits":0,"boost":"LO"},
    {"type":"heal","hits":0,"boost":"LO"},{"type":"heal","hits":0,"boost":"LO"},{"type":"heal","hits":0,"boost":"LO"},{"type":"heal","hits":0,"boost":"LO"},
    {"type":"heal","hits":0,"boost":"LO"},{"type":"heal","hits":0,"boost":"LO"},{"type":"heal","hits":0,"boost":"LO"},{"type":"heal","hits":0,"boost":"LO"},
    {"type":"heal","hits":0,"boost":"LO"},{"type":"heal","hits":0,"boost":"LO"},{"type":"heal","hits":0,"boost":"LO"},{"type":"heal","hits":0,"boost":"LO"},
    {"type":"heal","hits":0,"boost":"LO"},{"type":"heal","hits":0,"boost":"LO"},{"type":"heal","hits":0,"boost":"LO"},{"type":"heal","hits":0,"boost":"LO"},
    {"type":"heal","hits":0,"boost":"LO"},{"type":"heal","hits":0,"boost":"LO"},{"type":"heal","hits":0,"boost":"LO"},{"type":"heal","hits":0,"boost":"LO"},
    {"type":"heal","hits":36,"boost":"LO"},{"type":"heal","hits":100,"boost":"LO"},{"type":"move","hits":100}];
    
    var hpt = 0;
    console.log(tbody.length);
    for (var p = 0; p < tbody.length; p++) {
        var thispartobj = tbody[p];
        console.log(JSON.stringify(thispartobj));
        if (thispartobj['type'] != 'heal') {
            continue;
        }
        var thishps = HEAL_POWER;
        var boost_mineral = thispartobj['boost'];
        if (boost_mineral) {
            thishps *= multiplier = BOOSTS['heal'][boost_mineral]['heal'];
        }
        hpt += thishps;
    }
    return hpt;
}

Creep.prototype.getHPT = function() {
    return CONVERT_BODY_TO_HPT(this.body);
}

*/

global.RUN_STRUCTURES = function() {
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
            Game.structures[id].runLink();
        }
    }

    // TOWER MANAGEMENT, room-by-room basis
    for(var rname in rtowers) {
        
        var theroom = Game.rooms[rname];
        
        // If hostiles in room, focus fire.        
        var enemiesList = theroom.getHostileCreeps();
        if (enemiesList.length) {
            //console.log(JSON.stringify(enemiesList[0].body));
            var highest_threat = -1;
            var best_target = undefined;
            for (var i = 0; i < enemiesList.length; i++) {
                if (enemiesList[i].isOnEdge()) {
                    // Never fire on enemies flickering in/out of the room - it makes tower draining too easy.
                    continue;
                }
                var this_pri = enemiesList[i].getTargetPriority();
                if (this_pri > highest_threat) {
                    highest_threat = this_pri;
                    best_target = enemiesList[i];
                }
            }
            if (best_target) {
                for (var tnum in rtowers[rname]) {
                    var thistower = rtowers[rname][tnum];
                    thistower.attack(best_target);
                }
            }
            continue; // stops towers attempting to repair anything or heal anyone while there are enemies present.
        }

        // If no hostiles in room, repair.
        var repairTargets = theroom.getRepairable([STRUCTURE_WALL, STRUCTURE_RAMPART], TOWER_POWER_REPAIR);
        if (!repairTargets.length) {
            repairTargets = theroom.getRepairable([], TOWER_POWER_REPAIR);
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

