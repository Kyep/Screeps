
Room.prototype.getMyStructuresCount = function() {
    var mystructures = this.find(FIND_MY_STRUCTURES);
    var mywalls = this.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_WALL } } );
    return mystructures.length + mywalls.length;
}


Room.prototype.getTowerRepairMax = function() {
    var lvl = this.controller.level;
    if (lvl == 2) {
        return 1000;
    } else if (lvl == 3) {
        return 5000;
    } else if (lvl == 4) {
        return 25000;
    } else {
        return 10000 * lvl;
    }
}