
 
global.CONVERT_BODY_TO_HPT = function(tbody) {

    var hpt = 0;
    for (var p = 0; p < tbody.length; p++) {
        var thispartobj = tbody[p];
        //console.log(JSON.stringify(thispartobj));
        if (thispartobj['type'] != 'heal') {
            continue;
        }
        if (thispartobj['hits'] == 0) {
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
        
        if(ROOM_UNDER_ATTACK(rname)) {

            var towers_enabled = true;

            var myalert = theroom.getAlertObject();
            /*
            if (myalert['hostileUsername'] == 'Invader') {
                towers_enabled = false;
            }
            */

            var tower_tgt = theroom.memory[MEMORY_TOWER_TARGET];
            var tower_frustration = theroom.memory[MEMORY_TOWER_FRUSTRATION];

            var best_target;
            var using_memory = false;
            
            if (towers_enabled) {
                if (tower_tgt != undefined && tower_frustration != undefined) {
                    best_target = Game.getObjectById(tower_tgt);
                    if (best_target && tower_frustration && tower_frustration < 3) {
                        theroom.memory[MEMORY_TOWER_FRUSTRATION]++;
                        using_memory = true;
                    } else {
                        if (tower_tgt) {
                            delete theroom.memory[MEMORY_TOWER_TARGET];
                        }
                        if (tower_frustration) {
                            delete theroom.memory[MEMORY_TOWER_FRUSTRATION];
                        }
                    }
                }
                if (!best_target && !enemies.includes(myalert['hostileUsername'])) {
    
                    best_target = theroom.getBestTowerTarget(rtowers[rname]);
                    if (best_target) {
                        theroom.memory[MEMORY_TOWER_TARGET] = best_target.id;
                        theroom.memory[MEMORY_TOWER_FRUSTRATION] = 1;
                    }
                }
                
                if (best_target) {
                    if (using_memory) {
                        new RoomVisual(theroom.name).circle(best_target.pos, {radius: 0.6, opacity: 0.6, stroke: 'red', lineStyle: 'dashed'});
                    } else {
                        new RoomVisual(theroom.name).circle(best_target.pos, {radius: 0.7, opacity: 0.6, stroke: 'red', lineStyle: undefined});
                    }
                    for (var tnum in rtowers[rname]) {
                        var thistower = rtowers[rname][tnum];
                        thistower.attack(best_target);
                    }
                }
            }
            theroom.setRamparts(false);
            continue; // stops towers attempting to repair anything or heal anyone while there are enemies present.
        } else if (Game.time % 250 === 0) {
            theroom.setRamparts(true);
        }
        
        // If no hostiles in room, repair.
        var totalHPToRepair = theroom.getRepairableHP();
        var repairTargets = [];
        if (totalHPToRepair > 100000) {
            repairTargets = theroom.getRepairable([], TOWER_POWER_REPAIR, true);
        } else {
            repairTargets = theroom.getRepairable([STRUCTURE_WALL, STRUCTURE_RAMPART], TOWER_POWER_REPAIR, true);
            if (!repairTargets.length) {
                repairTargets = theroom.getRepairable([STRUCTURE_WALL], TOWER_POWER_REPAIR, true);
            }
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

