var jobRenew = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var myversion = 0;
        if(creep.memory['version'] != undefined) {
            myversion = creep.memory['version'];
        }
        var currentversion = 0;
        if (empire_workers[creep.memory['role']].version != undefined) {
            currentversion = empire_workers[creep.memory['role']].version;
        }
        if (myversion < currentversion) {
            //creep.memory['role'] = 'recycler';
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
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ff00ff'}});
            } else if (result == ERR_NOT_ENOUGH_ENERGY) {
                creep.transfer(target, RESOURCE_ENERGY)
                return -1;
            } else if (result == ERR_BUSY) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ff00ff'}});
                return -1;
            } else {
                creep.transfer(target, RESOURCE_ENERGY);
            }
            //console.log('creep ' + creep.name + ' at ' + creep.pos.x + ',' + creep.pos.y + ':' + creep.room.name + ' failed renew: ' + result)
        } else {
            //console.log('creep ' + creep.name + ' failed renew (no spawn) ')
            return -1;
        }
	}
};

module.exports = jobRenew;