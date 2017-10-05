module.exports =  {

    /** @param {Creep} creep **/
    run: function(creep) {


        var melee_parts = creep.getActiveBodyparts(ATTACK);
        var ranged_parts = creep.getActiveBodyparts(RANGED_ATTACK);
        var heal_parts = creep.getActiveBodyparts(HEAL);

        //console.log(melee_parts + ' / ' + ranged_parts + heal_parts);

        // define our nearest target, hurt friendly, and friendly
        var target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        var rangetotarget = 0;
        if (!target) {
            //console.log(creep.name + ' searching hostile structures');
            target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);
        }
        if (target) {
            rangetotarget = creep.pos.getRangeTo(target);
        }
        var hurtfriendly = creep.pos.findClosestByPath(_.filter(creep.room.find(FIND_MY_CREEPS), function(creep){ return (creep.hits < creep.hitsMax) }));
        var rangetohurtfriendly = 0;
        if (hurtfriendly) {
            rangetohurtfriendly = creep.pos.getRangeTo(hurtfriendly);
        }
        var friendly = creep.pos.findClosestByPath(creep.room.find(FIND_MY_CREEPS));
        
        var desired_distance = 1;
        
        // 1st, where should we move to?
        
        // if at sim border, always move in.
        if (creep.pos.x < 1 || creep.pos.x > 48 || creep.pos.y < 1 || creep.pos.y > 48) {
            creep.moveTo(25, 25, creep.room);
        // if we are a dedicated healer, keep the wounded in range.
        } else if (heal_parts > ranged_parts && rangetohurtfriendly > 1) {
            creep.moveTo(hurtfriendly);
        // if we have a target, try to keep correct range.
        } else if (target) {
            var desired_range = 1; // melee
            if (ranged_parts > 0) { 
                desired_range = 2;
            }
            // if on the sim edge, move in.
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
                //directions.remove(theirdirection); // this is not perfect, it merely gives a 5/8ths chance (on corner) or 3/5ths (on cardinal) chance to move away, but its better than nothing.
                creep.move(_.sample(directions)); // this is better, always run away in a direction that they won't end up next to us.
            }
            // otherwise, we can stay put.
        // otherwise, move randomly
        } else {
            // random movement code here, plea
            var directions = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];
            creep.move(_.sample(directions));
        }
        
        // 2nd, should we ATTACK, rangedHeal, or heal?

        if (target) {
            if (rangetotarget > 1 || heal_parts > melee_parts) {
                // choices: rangedheal, heal - we only check for heal here as rangedheal is below and we don't want to block other things.
                if(hurtfriendly) {
                    if (rangetohurtfriendly == 1) {
                        creep.heal(hurtfriendly);
                    }
                }
            } else {
                creep.attack(target);
            }
        } else {
            // without a target, none of the options but HEAL make sense. 
            if (heal_parts > 0) {
                if (creep.hits < creep.hitsMax) {
                    creep.heal(creep);
                } else if (hurtfriendly) {
                    if (rangetohurtfriendly == 1) {
                        creep.heal(hurtfriendly);
                    }
                }
            }
        }

        // 3rd, should we rangedHeal, rangedAttack, or rangedMassattack?

        if (ranged_parts == 0 && heal_parts == 0) {
            // nothing you can do, melee fighter
        } else if (target) {
            if (ranged_parts > heal_parts) {
                var enemiesList = creep.room.find(FIND_HOSTILE_CREEPS);
                var nearby_enemies = 0;
                for(var i = 0; i < enemiesList.length; i++) {
                    var erange = creep.pos.getRangeTo(enemiesList[i]);
                    //console.log('zero' + erange);
                    if (erange <= 3) {
                        nearby_enemies++;
                        //console.log('plus one');
                    }
                }
                if (nearby_enemies >= 2) {
                    creep.rangedMassAttack();
                } else {
                    creep.rangedAttack(target);
                }
            } else {
                // choices: rangedheal, heal
                if(hurtfriendly) {
                    if (rangetohurtfriendly > 1) {
                        creep.rangedHeal(hurtfriendly);
                    } else {
                        creep.heal(hurtfriendly);
                    }
                }
            }
        } else {
            // without a target, none of the options but HEAL make sense. 
            if (heal_parts > 0) {
                if (creep.hits < creep.hitsMax) {
                    creep.heal(creep);
                } else if (hurtfriendly) {
                    if (rangetohurtfriendly <= 3) {
                        creep.rangedHeal(hurtfriendly);
                    }
                }
            }
        }

        
        /*
        if(!target) {
            //console.log(creep.name + ' searching hostile structures');
            target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);
        }
        if(!target) {
            //console.log(creep.name + ' searching hostile spawns');
            target = creep.pos.findClosestByPath(FIND_HOSTILE_SPAWNS);
        }
        //console.log(creep.getActiveBodyparts(RANGED_ATTACK));


        if(target) {
            result = OK
            if (ranged_parts > 0 ) { result = creep.rangedAttack(target) }
            if (melee_parts > 0 ) { 
                result = creep.attack(target); 
            } else if (heal_parts > 0 && creep.hits < creep.hitsMax){
                result = creep.heal(creep);
            }
            if(result == OK){
                // all good
            } else if(result == ERR_NOT_IN_RANGE){
                creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_PATROL}});
                if (heal_parts > 0) { 
                    creep.heal(creep);
                }
            } else if(result == ERR_INVALID_TARGET){
                console.log(creep.name + ' targets: ' + target + ' UNATTACKABLE!');
                creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_PATROL}});
            }
        } else {
            
            if (creep.room.controller) {
                if (creep.room.controller.owner) {
                    if (creep.room.controller.owner.username) {
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
            
            //console.log(creep.name + ' NO TARGET IN ' + creep.room.name);
            if (creep.pos.x < 3 || creep.pos.x > 46 || creep.pos.y < 3 || creep.pos.y > 46) {
                creep.moveTo(25, 25, creep.room);
            }
            return -1;
        }
        */
    }
};
