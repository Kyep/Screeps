"use strict";

module.exports = {
    
    run: function(creep) {
        
        var melee_parts = creep.getActiveBodyparts(ATTACK);
        var work_parts = creep.getActiveBodyparts(WORK);
        var frustration = 0;
        if (creep.memory[MEMORY_FRUSTRATION] == undefined) {
            creep.memory[MEMORY_FRUSTRATION] = 0;
        }
        var frustration = creep.memory[MEMORY_FRUSTRATION];

        var myhealer = creep.getHealer();
        if (creep.isAtHomeRoom()) {
            if(!myhealer) {
                var tickspassed = (Game.time - creep.memory[MEMORY_INIT]);
                if (tickspassed < 30) { // give them 30 T to find a healer.
                    creep.say('HLR? ' + tickspassed);
                    //creep.sleepFor(5);
                    return;
                }
            }
        }
        if (myhealer && myhealer.room.name == creep.room.name) {
            var therange = creep.pos.getRangeTo(myhealer);
            if (therange > 2) {
                creep.moveTo(myhealer);
                return;
            }
        }
        
        if(!creep.isAtDestinationRoom()){
            creep.moveToDestination();
            return;
        } else if (creep.updateDestination()) {
            return;
        }
        
        var target = undefined;
        
        if (melee_parts) {
            target = creep.getClosestHostileCreep();
            if (target) {
                var trange = creep.pos.getRangeTo(target);
                if (trange == 1) {
                    creep.attack(target);
                    return;
                } else if (trange <= 3) {
                    if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                    return;
                }
            }
        }
        
        if (work_parts > 0 || melee_parts > 0) {
            var valid_types = [STRUCTURE_SPAWN, STRUCTURE_TOWER];
            if (frustration < 100) {
                target = creep.getClosestHostileStructureInTypes(valid_types);
            } else {
                target = creep.getClosestHostileStructure();
            }
            if (target) {
                new RoomVisual(creep.room.name).line(creep.pos, target.pos, {color: 'red'});
                var atkresult = ERR_NO_BODYPART;
                if (work_parts) {
                    atkresult = creep.dismantle(target);
                } else if (melee_parts) {
                    atkresult = creep.attack(target);
                }
                if (atkresult == ERR_NOT_IN_RANGE) {
                    var movresult = creep.moveTo(target);
                    frustration++;
                    creep.memory[MEMORY_FRUSTRATION] = frustration;
                }
                return;
            } else {
                frustration += 100;
                creep.memory[MEMORY_FRUSTRATION] = frustration;
            }
        }
        
        creep.redRally();
        creep.avoidEdges();
        return;
        
        
    }

};