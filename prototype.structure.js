
StructureTower.prototype.getPowerForRange = function(initialpower, dist) {
    var expected_effect = initialpower;
    if (dist > TOWER_OPTIMAL_RANGE) {
        if (dist > TOWER_FALLOFF_RANGE) {
            dist = TOWER_FALLOFF_RANGE;
        }
        expected_effect -= expected_effect * TOWER_FALLOFF * (dist - TOWER_OPTIMAL_RANGE) / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE);
    }
    return Math.floor(expected_effect);
}


StructureSpawn.prototype.recycleObsolete = function() {
    var nrcount = 0;
    for (var crname in Game.creeps) {
        if(Game.creeps[crname].memory[MEMORY_SPAWNERNAME] == undefined) {
            continue;
        }
        if (Game.creeps[crname].memory[MEMORY_SPAWNERNAME] != this.name) {
            continue;
        }
        var unit_cost = global.CREEP_COST(Game.creeps[crname].body);
        var energy_cap = this.room.energyCapacityAvailable;
        if (unit_cost < (energy_cap * 0.75)) {
            nrcount++;
            //console.log(this.name + ': want to recycle ' + crname + ' as their cost ' + unit_cost + ' < 75% of ' + energy_cap);
            Game.creeps[crname].disableRenew();
        }
    }
    console.log(this.name + ': set ' + nrcount + ' probably-obsolete creeps to not renew');
}
