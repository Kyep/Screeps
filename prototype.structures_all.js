Structure.prototype.getResourceAmountAccepted = function(rtype, using_memory = false) {
    if (!this.isMine()) {
        return 0;
    }
    if (!this.isActive()) {
        return 0;
    }
    if (this.store !== undefined && this.storeCapacity !== undefined && _.sum(this.store) === this.storeCapacity) {
        return 0;
    }
    if (rtype == RESOURCE_ENERGY) {
        if (this.structureType == STRUCTURE_TOWER && !using_memory) {
            return Math.max(0, (this.energyCapacity - 250) - this.energy);
        }
        if (this.energy !== undefined && this.energyCapacity !== undefined) {
            return Math.max(0, this.energyCapacity - this.energy);
        }
        if (this.structureType == STRUCTURE_TERMINAL && !this.canDepositEnergy()) {
            return 0;
        }
    }
    if (rtype == RESOURCE_GHODIUM && this.structureType == STRUCTURE_NUKER) {
        return this.ghodiumCapacity - this.ghodium;
    }
    if (this.structureType == STRUCTURE_TERMINAL || this.structureType == STRUCTURE_STORAGE) {
        return this.storeCapacity - _.sum(this.store);
    }
    return 0;
}

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

Structure.prototype.isMine = function() {
    if(this.owner && this.owner.username && this.owner.username == overlord) {
        return true;
    }
    return false;
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
