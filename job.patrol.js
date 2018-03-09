"use strict";

module.exports =  {

    run: function(creep) {

        var melee_parts = creep.getActiveBodyparts(ATTACK);
        var ranged_parts = creep.getActiveBodyparts(RANGED_ATTACK);
        var heal_parts = creep.getActiveBodyparts(HEAL);
        var target = creep.getClosestHostileCreep();

        if (!target) {
            target = creep.getClosestHostileStructure();
        }
        var rangetotarget = 0;
        if (target) {
            rangetotarget = creep.pos.getRangeTo(target);
        }
        var hurtfriendly = creep.pos.findClosestByPath(_.filter(creep.room.find(FIND_MY_CREEPS), function(creep){ return (creep.hits < creep.hitsMax) }));
        var rangetohurtfriendly = 0;
        if (hurtfriendly) {
            rangetohurtfriendly = creep.pos.getRangeTo(hurtfriendly);
        }

        var follow_target = undefined;
        if (creep.memory['follow'] != undefined) {
            if (Game.creeps[creep.memory['follow']] != undefined) {
                follow_target = Game.creeps[creep.memory['follow']];
            }
        }
        
        // 1st, where should we move to?
        var desired_distance = 1;
        // if at sim border, always move in. Don't get stuck on sim borders.

        if (follow_target != undefined && follow_target != creep) {
            creep.say('follow');
            creep.moveTo(follow_target);
        } else if (creep.avoidEdges()) {
            
        // if we are a dedicated healer, keep the wounded in range. 
        } else if (heal_parts > (ranged_parts + melee_parts) && hurtfriendly != undefined && rangetohurtfriendly > 1) {
            creep.moveTo(hurtfriendly);
        // if we have a target, try to keep correct range.
        } else if (target) {
            var desired_range = 1; // melee
            if ((heal_parts + ranged_parts) > melee_parts) { 
                desired_range = 2;
            }
            if (rangetotarget > desired_range) {
                creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_PATROL}});
            // if we are kiting, move away.
            } else if (rangetotarget < desired_range) {
                var theirdirection = creep.pos.getDirectionTo(target);
                var directions = [];
                if (theirdirection == TOP) { directions = [BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT]; }
                if (theirdirection == TOP_RIGHT) { directions = [BOTTOM, BOTTOM_LEFT, LEFT]; }
                if (theirdirection == RIGHT) { directions = [BOTTOM_LEFT, LEFT, TOP_LEFT]; }
                if (theirdirection == BOTTOM_RIGHT) { directions = [LEFT, TOP_LEFT, TOP]; }
                if (theirdirection == BOTTOM) { directions = [TOP_LEFT, TOP, TOP_RIGHT]; }
                if (theirdirection == BOTTOM_LEFT) { directions = [TOP, TOP_RIGHT, RIGHT]; }
                if (theirdirection == TOP) { directions = [BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT]; }
                if (theirdirection == TOP_LEFT) { directions = [RIGHT, BOTTOM_RIGHT, BOTTOM]; }
                creep.move(_.sample(directions)); // always run away such that no matter how they move, they can't end up next to us - unless our move fails because the path is blocked.
            }
        } else if (heal_parts > 0 && hurtfriendly != undefined && rangetohurtfriendly > 1) {
            creep.moveTo(hurtfriendly);
        } else if (creep.hits < creep.hitsMax) {
            // stay still. If there are healers present, they will heal you.
//        } else if (heal_parts == 0 || hurtfriendly == undefined) {
        } else {
            // otherwise, if we are not a healer trying to heal someone, move randomly.-
            //var directions = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];
            //creep.move(_.sample(directions));
            creep.redRally();
        }
        
        // 2nd, should we ATTACK, rangedHeal, or heal?

        var healPower = heal_parts * HEAL_POWER;
        var attackPower = melee_parts * ATTACK_POWER;
        var rangedAttackPower = ranged_parts * RANGED_ATTACK_POWER;
        if (attackPower >= healPower) {
            if (target && rangetotarget == 1) {
                creep.attack(target);
            } else if (creep.hits < creep.hitsMax && heal_parts > 0) {
                creep.heal(creep);
            } else if (hurtfriendly != undefined && heal_parts > 0) {
                if (rangetohurtfriendly == 1) {
                    creep.heal(hurtfriendly);
                } else if (rangetohurtfriendly <= 3) {
                    creep.rangedHeal(hurtfriendly);
                }
            }
        } else {
            if (creep.hits < creep.hitsMax) {
                creep.heal(creep);
            } else if (hurtfriendly != undefined && heal_parts > 0) {
                if (rangetohurtfriendly == 1) {
                    creep.heal(hurtfriendly);
                } else if (rangetohurtfriendly <= 3 && heal_parts > ranged_parts) {
                    creep.rangedHeal(hurtfriendly);
                }
            } else if (target && rangetotarget == 1) {
                creep.attack(target);
            }
        }

        // 3rd, should we rangedAttack, or rangedMassattack? Contrary to docks, rangedheal on yourself blocks ATTACK, so we can't do that here.

        if (rangedAttackPower > healPower || hurtfriendly == undefined || rangetohurtfriendly > 3) {
            var nearby_enemies = creep.getHostileCreepsInRange(3);
            if (nearby_enemies.length >= 2) {
                creep.rangedMassAttack();
            } else {
                creep.rangedAttack(target);
            }
        }
    }
};
