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
                console.log("TOWER: Evaluating mob of " + ownername + ", a " + hp + "hp " + classification + "-type mob with " + threat + " threat and " + my_score + " priority versus " + primetarget_score)
                //console.log(JSON.stringify(enemiesList[i]));
                if (my_score > primetarget_score) {
                    console.log("TOWER: switched targeting to this mob, as its score " + my_score + " is higher than previous score " + primetarget_score);
                    primetarget = enemiesList[i];
                    primetarget_score = my_score;
                }
            }
            console.log("TOWER: WINNER: " +primetarget_score);
            //console.log(JSON.stringify(primetarget));
            var ret = tower.attack(primetarget);
            if (ret == ERR_INVALID_TARGET) {
                primetarget = tower.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
                //tower.attack(primetarget);
            }
            console.log(ret);
            return 0;
        }
        

        
        var repairTargets = tower.pos.findInRange(FIND_STRUCTURES, 50, {
            filter: function(structure){
                if(structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART){
                    return (structure.hits < 100000)
                }else{
                    return (structure.hits < structure.hitsMax)
                }
            }
        })
        if(repairTargets.length){
            repairTargets.sort(function(a, b){
                return a.hits - b.hits
            })

            tower.repair(repairTargets[0]);
            return 0;
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
