module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory['renew_allowed'] == undefined) {
            //creep.memory['role'] = 'recycler';
        } else {
            if(creep.memory['renew_allowed'] == 0) {
               creep.memory['role'] = 'recycler';
            }
        }

        var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_SPAWN);
                }
        });
        if(targets.length > 0) {
            var target = creep.pos.findClosestByRange(targets)
            var result = target.renewCreep(creep);
            if(result == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_RENEW}});
            } else if (result == ERR_NOT_ENOUGH_ENERGY) {
                creep.transfer(target, RESOURCE_ENERGY)
                return -1;
            } else if (result == ERR_BUSY) {
                creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_RENEW}});
                return -1;
            } else {
                creep.transfer(target, RESOURCE_ENERGY);
                if (creep.memory['renewals'] == undefined) {
                    creep.memory['renewals'] = 1;
                } else {
                    creep.memory['renewals']++;
                }
            }
            //console.log('creep ' + creep.name + ' at ' + creep.pos.x + ',' + creep.pos.y + ':' + creep.room.name + ' failed renew: ' + result)
        } else {
            //console.log('creep ' + creep.name + ' failed renew (no spawn) ')
            return -1;
        }
	}
};
