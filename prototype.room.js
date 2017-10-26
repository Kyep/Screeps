
Room.prototype.getMyStructuresCount = function() {
    var mystructures = this.find(FIND_MY_STRUCTURES);
    var mywalls = this.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_WALL } } );
    return mystructures.length + mywalls.length;
}


Room.prototype.getTowerRepairMax = function() {
    var lvl = this.controller.level;
    if (lvl < 3) {
        return 0; // no towers at this level anyway
    } else if (lvl == 3) {
        return 10000;
    } else if (lvl == 4) {
        return 25000;
    } else {
        return 40000 * lvl;
    }
}

Room.prototype.getStoredEnergy = function() {
    var total_energy = 0;
    if (this.storage != undefined) {
        total_energy += this.storage.store.energy;
    }
    if (this.terminal != undefined) {
        var terminal_energy = this.terminal.store.energy;
        if (terminal_energy > empire_defaults['terminal_energy_min']) {
            terminal_energy -= empire_defaults['terminal_energy_min'];
            total_energy += terminal_energy;
        }
    }
    return total_energy;
}

Room.prototype.classifyStoredEnergy = function(energyamount) {
    if (!arguments.length) {
        energyamount = this.getStoredEnergy();
    }
    var energy_minimum = empire_defaults['room_energy_min'];
    var energy_maximum = empire_defaults['room_energy_max']; // 1,000,000 units in storage.
    if (energyamount < energy_minimum) {
        return ENERGY_EMPTY;
    } else if (energyamount > energy_maximum) {
        return ENERGY_FULL; 
    } else {
        if(energyamount >= (energy_minimum + 50000) && this.controller && this.controller.level && this.controller.level == 8) {
            // Level 8 rooms actively try to get rid of their energy, in favor of pushing it to other rooms that can better use it.
            return ENERGY_FULL;
        }
        return ENERGY_OK;
    }
}

Room.prototype.hasTerminalNetwork = function() {
    if (this.terminal == undefined) {
        return 0;
    }
    return 1;
}
