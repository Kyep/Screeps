var structureTower = {
    run: function(tower){
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
            return 1;
        }

        var repairTargets = tower.pos.findInRange(FIND_STRUCTURES, 50, {
            filter: function(structure){
                if(structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART){
                    return (structure.hits < 25000)
                }else{
                    return (structure.hits < structure.hitsMax)
                }
            }
        })
        if(repairTargets.length){
            repairTargets.sort(function(a, b){
                return a.hits - b.hits
            })

            tower.repair(repairTargets[0])
        }
    }
}

module.exports = structureTower;