Structure.prototype.getRampartHP = function() {
    var rampart_hp = 0;
    var objects_here = this.room.lookAt(this.pos);
    for (var k = 0; k < objects_here.length; k++) {
        if (objects_here[k]["type"] != "structure") {
            continue;
        }
        var str = objects_here[k]["structure"];
        if (str.structureType == STRUCTURE_RAMPART) {
            rampart_hp += str.hits;
        }
    }
    return rampart_hp;
}

Structure.prototype.isInvincible = function() {
    var structure_blacklist = [STRUCTURE_CONTROLLER, STRUCTURE_POWER_BANK, STRUCTURE_KEEPER_LAIR];
    if (structure_blacklist.includes(this.structureType)) {
        return true;
    }
    return false;
}

Structure.prototype.killableWithNukes = function(num_nukes) {
    if (!num_nukes) {
        num_nukes = 1;
    }
    return ((NUKE_DAMAGE[0] * num_nukes) > (this.hits + this.getRampartHP()));
}
