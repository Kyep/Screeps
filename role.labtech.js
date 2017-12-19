"use strict";

module.exports = {
    run: function(creep) {

        var myterminal = creep.room.terminal;
        var myjob = creep.memory[MEMORY_JOB];
        var mylab = undefined;
        if (creep.memory['labid'] != undefined) {
            mylab = Game.getObjectById(creep.memory['labid']);
            if (mylab == undefined) {
                creep.memory['labid'] = undefined;
                return;
            }
        }
        var mymineral = creep.memory['mineralid'];
        
        if (myjob == 'fill_lab') {
            if (creep.carry[mymineral] != undefined && creep.carry[mymineral] > 0) {
                if (creep.transfer(mylab, mymineral) == ERR_NOT_IN_RANGE) {
                    creep.moveToRUP(mylab);
                }
            } else if (myterminal.store[mymineral] != undefined && myterminal.store[mymineral] > 0) {
                var amount_to_withdraw = mylab.mineralCapacity - mylab.mineralAmount;
                if (amount_to_withdraw > creep.carryCapacity) {
                    amount_to_withdraw = creep.carryCapacity;
                }
                if (amount_to_withdraw == 0) {
                    creep.say('done!');
                    creep.memory[MEMORY_JOB] = 'idle';
                } else if (creep.withdraw(myterminal, mymineral, amount_to_withdraw) == ERR_NOT_IN_RANGE) {
                    creep.moveToRUP(myterminal);
                }
            } else {
                if (Game.time % 25 === 0) {
                    console.log(creep.name + ': short on ' + mymineral + ' in ' + creep.room.name);
                    creep.say('short ' + mymineral); 
                }
            }
            return;
        } else if (myjob == 'empty_lab') {
            if(_.sum(creep.carry) > 0) {
                var keyslist = Object.keys(creep.carry);
                if (creep.transfer(myterminal, keyslist[1]) == ERR_NOT_IN_RANGE) {
                    creep.moveToRUP(myterminal);
                }
            } else {
                if (mylab.mineralAmount == 0) {
                    creep.say('done!');
                    creep.memory[MEMORY_JOB] = 'idle';
                } else if (creep.withdraw(mylab, mylab.mineralType) == ERR_NOT_IN_RANGE) {
                    creep.moveToRUP(mylab);
                }
            }
            return;
        }

        // we do not have a job, let's find one. Occasionally.
        if (Game.time % 2 !== 0) {
            return;   
        }
        
        var assigned_labs = Memory['assigned_labs'];
        // example: {'mineralid': goal, 'purpose': 'reaction', 'action': 'fill'}
        var rlabs = creep.room.find(FIND_MY_STRUCTURES, { filter: function(structure){ if(structure.structureType == STRUCTURE_LAB) { return 1; } else { return 0; } } });
        for (var key in rlabs) {
            var thislab = rlabs[key];
            var assignment = assigned_labs[thislab.id];
            if (assignment == undefined) {
                if (thislab.mineralAmount > 0) {
                    creep.memory[MEMORY_JOB] = 'empty_lab';
                    creep.memory['labid'] = thislab.id;
                    creep.memory['mineralid'] = thislab.mineralType;
                    return;
                }
                //console.log(creep.name + ' skip (no assignment): ' + thislab.id );
                continue;
            }
            
            var rock = assignment['mineralid'];
            if (assignment['action'] == 'fill') {
                if (thislab.mineralType != undefined && thislab.mineralType != rock && thislab.mineralAmount > 0) {
                    console.log(creep.room.name + ' lab ID ' + thislab.id + ' has mismatched contents. Has: ' + thislab.mineralType + ' Assigned: ' + rock + ' Purpose: ' + assignment['purpose']);
                    creep.memory[MEMORY_JOB] = 'empty_lab';
                    creep.memory['labid'] = thislab.id;
                    creep.memory['mineralid'] = thislab.mineralType;
                    return;
                }
                var amount_needed = thislab.mineralCapacity - thislab.mineralAmount;
                if (amount_needed == 0) {
                    continue;
                }
                creep.memory[MEMORY_JOB] = 'fill_lab';
                creep.memory['labid'] = thislab.id;
                creep.memory['mineralid'] = rock;
                return;

            } else if (assignment['action'] == 'empty') {
                if (thislab.mineralAmount == 0) {
                    continue;
                }
                creep.memory[MEMORY_JOB] = 'empty_lab';
                creep.memory['labid'] = thislab.id;
                creep.memory['mineralid'] = thislab.mineralType;
                return;
            } else if (assignment['action'] == 'ignore') {
                //console.log(creep.name + ' skip (ignore): ' + thislab.id );
            }
        }
        if (Game.time % 50 === 0 ) {
            creep.say('no work!');
        }
        

	}
};