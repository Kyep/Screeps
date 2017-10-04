var jobReturnresources = require('job.returnresources');
var jobBuild = require('job.build');
var jobRepair = require('job.repair');
var jobRenew = require('job.renew');
var jobGetstoredenergy = require('job.getstoredenergy');

module.exports =  {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.job != 'getstoredenergy' && creep.memory.job != 'renew' && creep.carry.energy == 0) {
            var projectsList = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(projectsList.length) {
                if(creep.ticksToLive < 300) {
                    creep.memory.job = 'renew';
                    creep.say('🔄 renew');
                } else {
                    creep.memory.job = 'getstoredenergy';
                    creep.say('🔄 getstoredenergy');
                }
            } else {
                //creep.memory.role = 'recycler';
            }
        } else if(creep.memory.job == 'getstoredenergy' && creep.carry.energy == creep.carryCapacity) {
            creep.memory.job = 'build';
            creep.say('🚧 build');
        } else if(creep.memory.job == 'getstoredenergy') {
            if (jobGetstoredenergy.run(creep) == -1){
                //creep.memory.role = 'recycler';
            }
        } else if(creep.memory.job == 'build') {
            if(creep.memory.target != creep.room.name){
                creep.moveTo(new RoomPosition(25, 25, creep.memory.target), {visualizePathStyle: {stroke: '#ffffff'}})
            } else if(jobBuild.run(creep) == -1){
                // function(creep, fill_spawner, fill_extensions, tower_factor, fill_containers, fill_storage) {
	            jobReturnresources.run(creep, 1, 1, 0.5, 1, 1);
            }
        } else if (creep.memory.job == 'renew') {
            if (creep.ticksToLive > 1000) {
	            creep.memory.job = 'build';
                creep.say('🔄 build');
            } else {
                if (jobRenew.run(creep) == -1){
                    creep.memory.job = 'getstoredenergy';
                    creep.say('🔄 getstoredenergy');
                }
            }
        } else {
            console.log("WARNING: " + creep.name + " has no job: " + creep.memory.job);
            creep.memory.job = 'getstoredenergy';
        }
	}
};
