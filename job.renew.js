module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.room.name != creep.memory[MEMORY_HOME]) {
            creep.moveTo(creep.getHomePos());
            return 0;
        }
        
        if(creep.memory[MEMORY_RENEW] == undefined) {
            // 
        } else {
            if(creep.memory[MEMORY_RENEW] == 0) {
                creep.memory['role'] = 'recycler';
                return -1;
            }
        }

        var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_SPAWN);
                }
        });
        //creep.room.visual.circle(creep.pos, {fill: 'transparent', radius: 0.5, stroke: COLOR_RENEW});
        creep.say(creep.ticksToLive);
        if(targets.length > 0) {
            var target = creep.pos.findClosestByRange(targets)
            if(target.spawning != null) {
                if(creep.pos.getRangeTo(target) > 3) {
                    creep.moveTo(target);
                }
                return 0;
            }
            var result = target.renewCreep(creep);
            if(result == OK) {
                var creep_cost = CREEP_COST(creep.body);
                var body_size = creep.body.length;
                var renew_cost = Math.ceil(creep_cost/2.5/body_size) * -1;
                creep.adjustEarnings(renew_cost);
            } else if(result == ERR_NOT_IN_RANGE) {
                // this cumbersome thing stops 8 creeps all trying to renew from surrounding the spawn, which, together with the spawn trying to spawn something, can cause complete lockup.
                creep.moveTo(target);
                //creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_RENEW, avoid: [new RoomPosition(target.pos.x - 1, target.pos.y, target.room.name), new RoomPosition(target.pos.x + 1, target.pos.y, target.room.name)]}} );
            } else if (result == ERR_NOT_ENOUGH_ENERGY) {
                if (creep.carry.energy > 0) {
                    var amount_to_deposit = Math.min(target.energyCapacity - target.energy, creep.carry.energy);
                    var result = creep.transfer(target, RESOURCE_ENERGY, amount_to_deposit);
                    if (result == OK) {
                        creep.adjustEarnings(amount_to_deposit);
                    }
                }
                return -1;
            } else if (result == ERR_BUSY) {
                creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_RENEW}});
                return -1;
            } else {

                if (creep.memory[MEMORY_RENEWALS] == undefined) {
                    creep.memory[MEMORY_RENEWALS] = 1;
                } else {
                    creep.memory[MEMORY_RENEWALS]++;
                }
                
            }
            if (result != OK && result != ERR_NOT_IN_RANGE) { console.log('creep ' + creep.name + ' at ' + creep.pos.x + ',' + creep.pos.y + ':' + creep.room.name + ' failed renew: ' + result) }
        } else {
            //console.log('creep ' + creep.name + ' failed renew (no spawn) ')
            return -1;
        }
	}
};
