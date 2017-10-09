module.exports =  {
    run: function(tower){
        
        var enemiesList = tower.room.find(FIND_HOSTILE_CREEPS);
        if (enemiesList.length) {
            var num_healers = 0;
            var last_healer = undefined;
            var num_attackers = 1;
            var last_attacker = undefined;
            var num_ranged = 1;
            var last_ranged = undefined;
            var primetarget = undefined;
            var primetarget_score = -1;
            for(var i = 0; i < enemiesList.length; i++) {
                var heal_parts = enemiesList[i].getActiveBodyparts(HEAL);
                var attack_parts = enemiesList[i].getActiveBodyparts(ATTACK);
                var ranged_parts = enemiesList[i].getActiveBodyparts(RANGED_ATTACK);
                var total_parts = enemiesList[i].body.length;
                var classification = 'none';
                var classification_parts = 0;
                if (heal_parts > 0) { 
                    num_healers++; 
                    last_healer = enemiesList[i];
                    if (heal_parts > classification_parts) {
                        classification = 'healer';
                    }
                }
                if (attack_parts > 0) {
                    num_attackers++;
                    last_attacker = enemiesList[i];
                    if (attack_parts > classification_parts) {
                        classification = 'attacker';
                    }
                }
                if (ranged_parts > 0) {
                    num_ranged++;
                    last_ranged = enemiesList[i];
                    if (ranged_parts > classification_parts) {
                        classification = 'ranged';
                    }
                }
                var dps = ((attack_parts * ATTACK_POWER) + (ranged_parts * RANGED_ATTACK_POWER));
                var hps = (heal_parts * HEAL_POWER);
                var hp = enemiesList[i].hits;
                var threat = dps + hps;
                var my_score = threat / hp;
                var ownername = 'Unknown';
                if (enemiesList[i].owner != undefined) {
                    if (enemiesList[i].owner.username != undefined) {
                        ownername = enemiesList[i].owner.username;
                    }
                }
                var actual_range = tower.pos.getRangeTo(enemiesList[i]);
                var expected_damage = tower.getPowerForRange(TOWER_POWER_ATTACK, actual_range);

                //console.log("TOWER: " + ownername + " mob, " + hp + "HP, " + classification + " type, " + actual_range + ' range, ' + threat + " threat, " + my_score + " pri, v " + primetarget_score + "CurPri, projected dmg: " + expected_damage);
                //console.log(JSON.stringify(enemiesList[i]));
                if(expected_damage <= hps) {
                    console.log("TOWER: Setting mob score to 0, because they can heal themselves for " + hps + ", which is more than the " + expected_damage + " we can hurt them with at their current position.");
                    my_score = 0;
                }
                if (my_score > primetarget_score) {
                    //console.log("TOWER: switched targeting to this mob, as its score " + my_score + " is higher than previous score " + primetarget_score);
                    primetarget = enemiesList[i];
                    primetarget_score = my_score;
                }
            }
            //console.log("TOWER: WINNER: " +primetarget_score + ' at ' + tower.pos.getRangeTo(primetarget));
            //console.log(JSON.stringify(primetarget));
            tower.room.visual.circle(tower.pos, {fill: 'transparent', radius: TOWER_OPTIMAL_RANGE, stroke: 'green'});
            tower.room.visual.circle(tower.pos, {fill: 'transparent', radius: TOWER_FALLOFF_RANGE, stroke: 'yellow'});
            tower.room.visual.circle(primetarget.pos, {fill: 'transparent', radius: 0.5, stroke: 'red'});
            var ret = tower.attack(primetarget);
            if (ret == ERR_INVALID_TARGET) {
                primetarget = tower.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
                tower.attack(primetarget);
            }
            //console.log(ret);
            return 0;
        }
        

        //console.log(empire_defaults['repairmax_towers']);
        var repairMax = tower.getRepairMax();
        var repairTargets = tower.pos.findInRange(FIND_STRUCTURES, 50, {
            filter: function(structure){
                if(structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART){
                    return (structure.hits < repairMax)
                }else{
                    return (structure.hits < structure.hitsMax)
                }
            }
        });
        if(repairTargets.length){
            //console.log(repairTargets.length);
            //tower.room.visual.circle(tower.pos, {fill: 'transparent', radius: TOWER_FALLOFF_RANGE, stroke: 'green'});
            for(var i = 0; i < repairTargets.length; i++) {
                var our_power = tower.getPowerForRange(TOWER_POWER_REPAIR, tower.pos.getRangeTo(repairTargets[i]));
                var repairable_damage = repairTargets[i].hitsMax - repairTargets[i].hits;
                if(repairable_damage >= (our_power * 2)) { 
                    // Don't repair things that have a hit deficit less than 2x our repair power against them.
                    // This ensures that with a spread of towers... the tower that can repair the thing for the lower price does so.
                    // It also ensures that towers in theory don't over-heal things... they don't waste energy healing for more than they can.
                    // Lastly, it avoids both towers repairing something unless both repairs will actually do something.
                    tower.repair(repairTargets[i]);
                    return 0;
                }
            }
        }
        
        var healTargets = tower.pos.findInRange(FIND_MY_CREEPS, 50, {
            filter: function(creep){
                return (creep.hits < creep.hitsMax)
            }
        })
        if(healTargets.length){
            healTargets.sort(function(a, b){
                return a.hits - b.hits
            });
            tower.heal(healTargets[0]);
        }
    }
}
