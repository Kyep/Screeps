"use strict";

module.exports = {
    run: function(creep) {

        var myterminal = creep.room.terminal;
        var myjob = creep.memory[MEMORY_JOB];
        var mylab = undefined;
        if (creep.memory[MEMORY_LABID] != undefined) {
            mylab = Game.getObjectById(creep.memory[MEMORY_LABID]);
            if (mylab == undefined) {
                creep.memory[MEMORY_LABID] = undefined;
                return;
            }
        }
        var mymineral = creep.memory[MEMORY_MINERALID];
        
        if (myjob == 'fill_lab') {
            /*
            if (mymineral && _.sum(creep.carry) != creep.carry[mymineral]) {
                creep.memory[MEMORY_JOB] = 'empty_lab';
                return;
            }
            */
            var amount_to_withdraw = mylab.mineralCapacity - mylab.mineralAmount;
            if (amount_to_withdraw == 0) {
                creep.say('done!');
                creep.memory[MEMORY_JOB] = 'idle';
                creep.memory[MEMORY_LABID] = undefined;
                creep.memory[MEMORY_MINERALID] = undefined;
                return;
            }
            if (creep.carry[mymineral] != undefined && creep.carry[mymineral] > 0) {
                if (creep.transfer(mylab, mymineral) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(mylab, {visualizePathStyle: {stroke: COLOR_DROPOFF}});
                }
            } else if (myterminal.store[mymineral] != undefined && myterminal.store[mymineral] > 0) {
                
                if (amount_to_withdraw > creep.carryCapacity) {
                    amount_to_withdraw = creep.carryCapacity;
                }
                //creep.say(amount_to_withdraw);

                var res_withdraw = creep.withdraw(myterminal, mymineral, amount_to_withdraw);
                if (res_withdraw == ERR_NOT_IN_RANGE) {
                    creep.moveToRUP(myterminal);
                } else if (res_withdraw == ERR_NOT_ENOUGH_RESOURCES) {
                    if (myterminal.acquireMineralAmount(mymineral, 3000, 6000)) {
                        creep.say('ACQUIRED!');
                    } else {
                        console.log(creep.name + ' in ' + creep.room.name + ' is attempting to acquire ' + mymineral + ' to fill a lab, but those resources are not in the terminal network!');
                        creep.sleepFor(5);
                    }

                }
            } else {
                creep.memory[MEMORY_JOB] = 'idle';
                creep.memory[MEMORY_LABID] = undefined;
                creep.memory[MEMORY_MINERALID] = undefined;
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
                    creep.memory[MEMORY_LABID] = undefined;
                    creep.memory[MEMORY_MINERALID] = undefined;
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
        if (creep.ticksToLive && creep.ticksToLive < 50) {
            creep.suicide();
        }
        
        var assigned_labs = Memory[MEMORY_GLOBAL_SCIENCELABS];
        // example: {'mineralid': goal, 'purpose': 'reaction', 'action': 'fill'}
        var rlabs = creep.room.find(FIND_MY_STRUCTURES, { filter: function(structure){ if(structure.structureType == STRUCTURE_LAB) { return 1; } else { return 0; } } });
        for (var key in rlabs) {
            var thislab = rlabs[key];
            var assignment = assigned_labs[thislab.id];
            if (assignment == undefined) {
                if (thislab.mineralAmount > 0) {
                    creep.memory[MEMORY_JOB] = 'empty_lab';
                    creep.memory[MEMORY_LABID] = thislab.id;
                    creep.memory[MEMORY_MINERALID] = thislab.mineralType;
                    return;
                }
                //console.log(creep.name + ' skip (no assignment): ' + thislab.id );
                continue;
            }
            /*
            if(assignment['purpose'] != 'boost') {
                continue;
            }
            */
            var rock = assignment[MEMORY_MINERALID];
            if (assignment['action'] == 'fill') {
                if (thislab.mineralType != undefined && thislab.mineralType != rock && thislab.mineralAmount > 0) {
                    console.log(creep.room.name + ' lab ID ' + thislab.id + ' has mismatched contents. Has: ' + thislab.mineralType + ' Assigned: ' + rock + ' Purpose: ' + assignment['purpose']);
                    creep.memory[MEMORY_JOB] = 'empty_lab';
                    creep.memory[MEMORY_LABID] = thislab.id;
                    creep.memory[MEMORY_MINERALID] = thislab.mineralType;
                    return;
                }
                var amount_needed = thislab.mineralCapacity - thislab.mineralAmount;
                if (amount_needed == 0) {
                    continue;
                }
                if (creep.room.terminal.store[rock] == undefined || creep.room.terminal.store[rock] < 3000) {
                    if (Game.time % 5 === 0) {
                        if (creep.room.terminal.acquireMineralAmount(rock, 3000, 6000)) {
                            console.log(creep.name + ': short on ' + rock + ' in ' + creep.room.name + ' for assignment! Pulled in extra from another room!');
                            return;
                        } else {
                            //console.log(creep.name + ': short on ' + rock + ' in ' + creep.room.name + ' no others found anywhere!');
                        }
                        creep.say('short ' + rock); 
                    }
                    continue;
                }
                creep.memory[MEMORY_JOB] = 'fill_lab';
                creep.memory[MEMORY_LABID] = thislab.id;
                creep.memory[MEMORY_MINERALID] = rock;
                return;

            } else if (assignment['action'] == 'empty') {
                if (thislab.mineralAmount == 0) {
                    continue;
                }
                creep.memory[MEMORY_JOB] = 'empty_lab';
                creep.memory[MEMORY_LABID] = thislab.id;
                creep.memory[MEMORY_MINERALID] = thislab.mineralType;
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