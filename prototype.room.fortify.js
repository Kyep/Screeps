global.REMOVE_MILLS = function(xnum) {
    return Math.round(xnum / 10000) / 100;
}

global.REPORT_SAFEMODES = function() {
    for (var rname in Game.rooms) {
        if(!Game.rooms[rname].isMine()) {
            continue;
        }
        
        console.log(rname + ': ' + Game.rooms[rname].controller.safeModeAvailable);
    }
}

global.REPORT_FORTHP = function(verbose) {
    UPDATE_FORTHP();
    for (var rname in Game.rooms) {
        if(!Game.rooms[rname].isMine()) {
            continue;
        }
        var fortstatus = '';
        if(Game.rooms[rname].isFortified()) {
            fortstatus = '(FORTIFIED)';
        }        
        var wcount = Game.rooms[rname].countFortifications();
        var wcolor = 'purple';
        if (wcount < 5 || wcount > 80) {
            wcolor = 'red';
        } else if (wcount < 20) {
            wcolor = 'green';
        } else if (wcount < 40) {
            wcolor = 'yellow';
        } else {
            wcolor = 'orange';
        }
        var wtext = "<font color='" + wcolor + "'>" + wcount + "</font>";
        var mill_walls = REMOVE_MILLS(Game.rooms[rname].getLowestFortHP());
        var mill_repairmax = REMOVE_MILLS(Game.rooms[rname].getFortRepairMax());
        var mill_target = REMOVE_MILLS(Game.rooms[rname].getFortTarget());
        console.log(rname + '(' + Game.rooms[rname].getLevel() + '): ' + mill_walls + ' / ' + mill_repairmax + ' -> ' + mill_target + ' ' + wtext + ' ' + fortstatus);
    }
}

global.UPDATE_FORTHP = function(verbose) {
    for (var rname in Game.rooms) {
        if(!Game.rooms[rname].isMine()) {
            continue;
        }
        Game.rooms[rname].updateFort();
    }
}

global.RAMPART_SPAWNS = function() {
    var ramparts_created = 0;
    for (var rname in Game.rooms) {
        if(!Game.rooms[rname].isMine()) {
            continue;
        }
        var key_structures = Game.rooms[rname].find(FIND_MY_STRUCTURES, {filter: function(s) {
            if (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_STORAGE || s.structureType == STRUCTURE_TERMINAL) {
                if (s.getRampartHP() == 0) {
                    return true;
                }
            }
            return false;
        }});
        for (var i = 0; i < key_structures.length; i++) {
            var cresult = Game.rooms[rname].createConstructionSite(key_structures[i].pos.x, key_structures[i].pos.y, STRUCTURE_RAMPART);
            if (cresult == OK) {
                ramparts_created++;
            }
        }
    }
    return ramparts_created;
}


Room.prototype.countFortifications = function() {
    var all_defenses = this.find(FIND_STRUCTURES, {filter: function(s) {
        if (s.structureType == STRUCTURE_RAMPART || s.structureType == STRUCTURE_WALL) {
            return true;
        }
        return false;
    }});
    var csites = this.find(FIND_MY_CONSTRUCTION_SITES,  {filter: function(c) {
        if (c.structureType == STRUCTURE_RAMPART || c.structureType == STRUCTURE_WALL) {
            return true;
        }
        return false;
    }});
    var wall_flags = this.getFlagsByType(STRUCTURE_WALL);
    var rampart_flags = this.getFlagsByType(STRUCTURE_RAMPART);
    return all_defenses.length + csites.length + wall_flags.length + rampart_flags.length;
}


Room.prototype.isFortified = function() {
    if (this.memory[MEMORY_FORTIFY]) {
        return true;
    }
    return false;
}

Room.prototype.makeFortified = function() {
    this.memory[MEMORY_FORTIFY] = true;
    this.assignBoost('XUH2O');
    return true;
}

Room.prototype.getRepairMax = function() {
    if (!this.isMine()) {
        return 0;
    }
    var lvl = this.getLevel();
    if (lvl < 3) {
        return 0; // no towers at this level anyway
    } else if (lvl == 3) {
        return 2000;
    } else if (lvl == 4) {
        return 5000;
    } else if (lvl == 5) {
        return 10000;
    } else if (lvl == 6) {
        return 20000;
    } else if (lvl == 7) {
        return 1000000;
    //} else if (this.isFortified()) {
    //    return 20000000;
    //    //return 25000000;
    } else if (lvl == 8) {
        return this.getFortRepairMax();
    }
    return 50000 * lvl;
}

Room.prototype.getFortRepairMax = function() {
    if(this.memory[MEMORY_FORT_REPAIRMAX]) {
        return this.memory[MEMORY_FORT_REPAIRMAX];
    }
    return 250000;
}

Room.prototype.getFortTarget = function() {
    if(this.memory[MEMORY_FORT_TARGET]) {
        return this.memory[MEMORY_FORT_TARGET];
    }
    return 250000;
}

Room.prototype.updateFort = function() {
    var raw_walls = this.getLowestFortHP();
    this.memory[MEMORY_FORT_HP] = raw_walls;

    var raw_target = 2000000;
    if (this.isFortified()) {
        raw_target = 20000000;
    }
    this.memory[MEMORY_FORT_TARGET] = raw_target;

    var raw_repairmax = raw_walls;
    if (raw_walls < raw_target) {
        raw_repairmax = raw_walls + 250000;
    }
    this.memory[MEMORY_FORT_REPAIRMAX] = raw_repairmax;
    
}


Room.prototype.getLowestFortHP = function() {
    var lowest_hp = Infinity;
    var all_defenses = this.find(FIND_STRUCTURES, {filter: function(s) {
        if (s.structureType == STRUCTURE_RAMPART || s.structureType == STRUCTURE_WALL) {
            return true;
        }
        return false;
        
    }});
    if (all_defenses.length == 0) {
        return 0;
    }
    
    for (var i = 0; i < all_defenses.length; i++) {
        if (all_defenses[i].hits < lowest_hp) {
            lowest_hp = all_defenses[i].hits;
        }
    }
    return lowest_hp;
}



