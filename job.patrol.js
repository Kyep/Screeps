module.exports =  {

    /** @param {Creep} creep **/
    run: function(creep) {

        var melee_parts = creep.getActiveBodyparts(ATTACK);
        var ranged_parts = creep.getActiveBodyparts(RANGED_ATTACK);
        var heal_parts = creep.getActiveBodyparts(HEAL);
        var target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        if (!target) {
            target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);
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
        
        // 1st, where should we move to?
        var desired_distance = 1;
        // if at sim border, always move in. Don't get stuck on sim borders.
        if (creep.pos.x < 1 || creep.pos.x > 48 || creep.pos.y < 1 || creep.pos.y > 48) {
            if (creep.memory.target == undefined) {
                creep.moveTo(25, 25);
            } else {
                creep.moveTo(new RoomPosition(25, 25, creep.memory.target))
            }
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
        } else {
            // otherwise, random movement.
            var directions = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];
            creep.move(_.sample(directions));
        }
        
        // 2nd, should we ATTACK, rangedHeal, or heal?

        if (heal_parts > 0 && creep.hits < creep.hitsMax) {
            creep.heal(creep);
        } else if (target && heal_parts == 0) {
            creep.attack(target);
        } else if (hurtfriendly != undefined && heal_parts > 0) {
            if (rangetohurtfriendly == 1) {
                creep.heal(hurtfriendly);
            } else if (rangetohurtfriendly <= 3) {
                creep.rangedHeal(hurtfriendly);
            }
        }

        // 3rd, should we rangedHeal, rangedAttack, or rangedMassattack?

        if (ranged_parts > 0 || heal_parts > 0) {
            if (ranged_parts > heal_parts) {
                var nearby_enemies = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
                if (nearby_enemies.length >= 2) {
                    creep.rangedMassAttack();
                } else {
                    creep.rangedAttack(target);
                }
            } else if(hurtfriendly) {
                if (rangetohurtfriendly > 1) {
                    creep.rangedHeal(hurtfriendly);
                } else {
                    creep.heal(hurtfriendly);
                }
            }
        }

        
        /*
            if (creep.room.controller != undefined) {
                if (creep.room.controller.owner != undefined) {
                    if (creep.room.controller.owner.username != undefined) {
                        if (creep.room.controller.owner.username != overlord) {
                            var csites = creep.room.find(FIND_CONSTRUCTION_SITES);
                            if (csites.length) {
                                csite = creep.pos.findClosestByPath(csites);
                                creep.moveTo(csite, {visualizePathStyle: {stroke: COLOR_PATROL}});
                                return 0;
                            }
                        }
                    }
                }
            }
            
        */
    }
};
