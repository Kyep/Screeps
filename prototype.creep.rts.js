"use strict";

Creep.prototype.getRetResTgt = function(myresource) {
    var mtgt = undefined;
    if (this.memory[MEMORY_RETURNRESOURCES_TARGET]) {
        mtgt = Game.getObjectById(this.memory[MEMORY_RETURNRESOURCES_TARGET]);
        if (!mtgt || !mtgt.isActive() || mtgt.getResourceAmountAccepted(myresource) < 1) {
            delete this.memory[MEMORY_RETURNRESOURCES_TARGET];
            mtgt = undefined;
        }
    }
    return mtgt;
}

Creep.prototype.clearRetResTgt = function() {
    if (this.memory[MEMORY_RETURNRESOURCES_TARGET]) {
        delete this.memory[MEMORY_RETURNRESOURCES_TARGET];
    }
    return true;
}

Creep.prototype.setRetResTgt = function(myresource, includeList, excludeList, priList) {
    var total_scan = this.room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
            return (
                (includeList.length == 0 || includeList.includes(structure.structureType)) &&
                (excludeList.length == 0 || !excludeList.includes(structure.structureType)) &&
                structure.getResourceAmountAccepted(myresource, false) > 0
            )
        }
    });
    var best_result;
    if (total_scan.length) {
        if (priList.length) {
            var filtered_list = [];
            for (var i = 0; i < total_scan.length; i++) {
                if (priList.includes(total_scan[i].structureType)) {
                    filtered_list.push(total_scan[i]);
                }
            }
            if (filtered_list.length) {
                best_result = this.pos.findClosestByPath(filtered_list);
            } else {
                best_result = this.pos.findClosestByPath(total_scan);
            }
        } else {
            best_result = this.pos.findClosestByPath(total_scan);
        }
    }
    if (best_result) {
        this.memory[MEMORY_RETURNRESOURCES_TARGET] = best_result.id;
    }
    return best_result;
}

Creep.prototype.returnToStorage = function(includeList = [], excludeList = [], priList = [], sleepDelay = 5) {

    var myresource = RESOURCE_ENERGY;
    var storekeys = Object.keys(this.carry);
    for (var i = 0; i < storekeys.length; i++) {
        if (storekeys[i] != RESOURCE_ENERGY) {
            myresource = storekeys[i];
            break;
        }
    }
    if (_.sum(this.carry) == 0) {
        this.clearRetResTgt();
        return false;
    }
    
    var did_scan = false;
    var cargo_dest = this.getRetResTgt(myresource);
    if (cargo_dest && cargo_dest.getResourceAmountAccepted(myresource, true) == 0) {
        cargo_dest = undefined;
        this.clearRetResTgt();
    }
    if (!cargo_dest) {
        cargo_dest = this.setRetResTgt(myresource, includeList, excludeList, priList);
        did_scan = true;
    }

    if (!cargo_dest) {
        this.say('!rTS()');
        this.sleepFor(sleepDelay);
        return false;
    }
    
    var linecolor = 'yellow';
    var linestyle = undefined;
    if (myresource != RESOURCE_ENERGY) {
        linecolor = 'white';
    }
    if (!did_scan) {
        linestyle = 'dashed';
    }
    new RoomVisual(this.room.name).line(this.pos.x, this.pos.y, cargo_dest.pos.x, cargo_dest.pos.y, {color: linecolor, lineStyle: linestyle});
    
    var amount_to_deposit = cargo_dest.getResourceAmountAccepted(myresource, true);
    if (amount_to_deposit > this.carry[myresource]) {
        amount_to_deposit = this.carry[myresource];
    }
    if (amount_to_deposit == 0) {
        console.log(this.name + 'RR to ' + cargo_dest.id + ' ' + cargo_dest.structureType + ' trying to deposit nothing of the ' + cargo_dest.getResourceAmountAccepted(myresource) + ' it would accept. ' + JSON.stringify(this.carry));
        this.clearRetResTgt();
        return true;
    }
    var result = this.transfer(cargo_dest, myresource, amount_to_deposit);
    if (result == ERR_NOT_IN_RANGE) {
        this.moveToRUP(cargo_dest);
    } else if (result == OK) {
        this.clearRetResTgt();
        this.adjustEarnings(amount_to_deposit);
    } else {
        console.log(this.name + 'RR to ' + cargo_dest.id + ' sending ' + amount_to_deposit + ' returned ' + result);
        this.clearRetResTgt();
    }
    if (_.sum(this.carry) == 0) {
        this.clearRetResTgt();
    }
    return true;

};
