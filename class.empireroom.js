"use strict";

global.GET_ROOM_CONFIG = function(rname) {
    if (!Memory.rooms[rname] || !Memory.rooms[rname][MEMORY_RCONFIG]) {
        return undefined;
    }
    return Memory.rooms[rname][MEMORY_RCONFIG];
}

global.SHOW_ROOM_CONFIG = function(rname) {
    console.log(JSON.stringify(GET_ROOM_CONFIG(rname)));
}

global.SET_ROOM_KEY_ASSIGNMENT = function(rconfig, sourceidorkey, ass_object, priority) {
    // rconfig = this.setSourceAssignment(rconfig, '1111key1111', { 'sharvester': 1});
    if (!rconfig || !sourceidorkey || !ass_object || !priority) {
        return rconfig;
    }
    if (rconfig['assignments'] == undefined) {
        console.log('SET_ROOM_KEY_ASSIGNMENT warning - called with no rconfig to set: ' + sourceidorkey + '/' + JSON.stringify(ass_object));
        return rconfig;
    }
    rconfig['assignments'][sourceidorkey] = {'ass': ass_object, 'pri': priority};
    return rconfig;
}

global.GET_STEPS_TO_SOURCE = function(rname, sid) {
    if (Memory.rooms[rname] 
        && Memory.rooms[rname][MEMORY_RCONFIG]
        && Memory.rooms[rname][MEMORY_RCONFIG]['sources']
        && Memory.rooms[rname][MEMORY_RCONFIG]['sources'][sid]
        && Memory.rooms[rname][MEMORY_RCONFIG]['sources'][sid]['steps']
    ) {
        return Memory.rooms[rname][MEMORY_RCONFIG]['sources'][sid]['steps'];
    }
    return undefined;
}

Room.prototype.inEmpire = function() {
    if (empire[this.name] == undefined) {
        return false;
    }
    return true;
}

Room.prototype.getSpawnRoom = function() {
    var myconf = this.getConfig();
    if (!myconf) {
        return undefined;
    }
    return myconf['spawn_room'];
}

Room.prototype.showConfig = function() {
    var myconf = this.getConfig();
    if(myconf) {
        console.log(JSON.stringify(myconf));
        return true;
    }
    return false;
}

Room.prototype.getConfig = function() {
    var myconf = this.memory[MEMORY_RCONFIG];
    return myconf;
}

Room.prototype.createConfig = function() {
    if (empire[this.name] == undefined || empire[this.name]['spawn_room'] == undefined) {
        return undefined;
    }
    var myconf = this.makeConfigBase(empire[this.name]['spawn_room'], empire[this.name]['backup_spawn_room']);
    if(myconf) {
        myconf = this.makeAssignments();
        return myconf;
    }
    return undefined;
}

Room.prototype.updateConfig = function() {
    var myconf = this.getConfig();
    if (!myconf) {
        this.createConfig();
    } else {
        this.makeAssignments();
    }
    return true;
}

Room.prototype.fullUpdate = function() {
    this.createConfig();
    this.showConfig();
}

Room.prototype.makeConfigBase = function(spawn_room, backup_spawn_room) {
    var sproom = Game.rooms[spawn_room];
    if (!spawn_room || !sproom) {
        return undefined;
    }
    var sps = sproom.find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_SPAWN); } });
    var sppri = sps[0];

    var shouldupdate = true;
    var rconfig = {}
    rconfig['spawn_room'] = spawn_room;
    rconfig['backup_spawn_room'] = backup_spawn_room;
    var slist = this.find(FIND_SOURCES);
    rconfig['sources'] = {}
    rconfig['assignments'] = {}
    for (var i = 0; i < slist.length; i++) {
        var ts = slist[i];
        rconfig['sources'][ts.id] = {}
        rconfig['sources'][ts.id]['sourcename'] = i;
        rconfig['sources'][ts.id]['x'] = ts['pos']['x'];
        rconfig['sources'][ts.id]['y'] = ts['pos']['y'];
        rconfig['sources'][ts.id]['spaces'] = ts.getSlotPositions().length;
        var pfobj = PathFinder.search(sppri.pos, {'pos': ts.pos, 'range': 1}, {'swampCost': 1.1});
        var pfpath = pfobj['path'];
        var pflength = pfpath.length;
        for (var j = 0; j < pfpath.length; j++) {
            var thispos = pfpath[j];
            new RoomVisual(thispos['roomName']).circle(thispos, {stroke: 'yellow'});
        }
        if (pfobj['incomplete']) {
            console.log(this.name + ': WARNING, makeConfig generated an incomplete path to source ' + ts.id);
            shouldupdate = false;
            continue;
        }
        rconfig['sources'][ts.id]['steps'] = 50;
        if (pflength > 0) {
            rconfig['sources'][ts.id]['steps'] = pflength;
        }
        var lastpos = pfpath.slice(-1)[0];
        rconfig['sources'][ts.id]['dest_x'] = lastpos['x'];
        rconfig['sources'][ts.id]['dest_y'] = lastpos['y'];
        new RoomVisual(thispos['roomName']).circle(lastpos, {radius: 0.5, stroke: 'red'});
    }
    if (this.controller) {
        rconfig['controller'] = {'x': this.controller.pos['x'], 'y': this.controller.pos['y'] }
    } else {
        console.log(this.name + ': makeConfig saved no controller.');
    }
    var all_minerals = this.find(FIND_MINERALS);
    if (all_minerals.length) {
        rconfig['mineralid'] = all_minerals[0].id;
        rconfig['mineraltype'] = all_minerals[0].mineralType;
    }
    if (shouldupdate) {
        this.memory[MEMORY_RCONFIG] = rconfig;
        console.log(this.name + ': makeConfig saved: ' + JSON.stringify(rconfig));
    }
    return rconfig;
}

Room.prototype.setSourceAssignment = function(rconfig, sourceid, ass_object, steps) {
    //global.SET_ROOM_KEY_ASSIGNMENT = function(rconfig, sourceidorkey, ass_object, priority) {
    if (!rconfig || !sourceid || !ass_object || !steps) {
        return rconfig;
    }
    rconfig = global.SET_ROOM_KEY_ASSIGNMENT(rconfig, sourceid, ass_object, 500 - steps);
    return rconfig;
}

Room.prototype.makeAssignments = function() {
    var myconf = this.getConfig();
    if( myconf == undefined) {
        console.log(this.name + ': makeAssignments got asked to assign units to room without a base config');
        return myconf;
    }
    if (empire[this.name] == undefined) {
        console.log(this.name + ': makeAssignments got asked to assign units to non-empire room');
        return myconf;
    }
    myconf['']
    var rlvl = this.getLevel();
    if (rlvl > 3) {
        // We are a normal base
        console.log(this.name + ': makeAssignments assigned normal base units');
        for (var skey in myconf['sources']) {
            if (myconf['sources'][skey]['spaces'] == 1) {
                myconf = this.setSourceAssignment(myconf, skey, { 'sharvester': 1}, myconf['sources'][skey]['steps']);
            } else if (rlvl == 8) {
                myconf = this.setSourceAssignment(myconf, skey, { 'bharvester': 1, 'up8': 1 }, myconf['sources'][skey]['steps']); 
            } else {
                myconf = this.setSourceAssignment(myconf, skey, { 'bharvester': 2}, myconf['sources'][skey]['steps']); 
            }
        }
    } else if (rlvl > 0) {
        // We are a low-level base.
        console.log(this.name + ': makeAssignments assigned low-level base units');
        for (var skey in myconf['sources']) {
            myconf = this.setSourceAssignment(myconf, skey, { 'fharvester': 2}, myconf['sources'][skey]['steps']); 
        }
    } else if (myconf['controller']) {
        // We are a remote mining outpost.
        console.log(this.name + ': makeAssignments assigned remote mining units');

        var srn = myconf['spawn_room'];
        var sro = Game.rooms[srn];
        if (sro) {
            var srl = sro.getLevel();
            if (srl < 4) {
                for (var skey in myconf['sources']) {
                    myconf = this.setSourceAssignment(myconf, skey, { 'fharvester': 2}, myconf['sources'][skey]['steps']); 
                }  
            } else if (Object.keys(myconf['sources']) > 1) {
                var snum = 1;
                for (var skey in myconf['sources']) {
                    if (snum == 1) {
                        myconf = this.setSourceAssignment(myconf, skey, { 'c30harvester': 1, 'hauler': 2, 'reserver': 1 }, myconf['sources'][skey]['steps']);  
                    } else {
                        myconf = this.setSourceAssignment(myconf, skey, { 'c30harvester': 1, 'hauler': 2}, myconf['sources'][skey]['steps']);  
                    }
                    snum++;
                }
            } else {
                for (var skey in myconf['sources']) {
                    myconf = this.setSourceAssignment(myconf, skey, { 'c15harvester': 1, 'hauler': 1}, myconf['sources'][skey]['steps']);  
                }
            }
        } else {
            console.log(this.name + ': makeAssignments could not read object spawn_room for: ' + srn);
        }
    } else {
        console.log(this.name + ': makeAssignments assigned nothing because room lacks controller.');
    }

    // Minerals
    if (myconf['mineralid'] && rlvl >= 6) {
        var mineralpatch = Game.getObjectById(myconf['mineralid']);
        if (mineralpatch) {
            var term = this.terminal;
            if (term) {
                var got_minerals = term.store[myconf['mineralid']];
                if (got_minerals >= empire_defaults['mineralcap']) {
                    //console.log(rname + ' is capped on minerals with ' + got_minerals + ' > ' + empire_defaults['mineralcap']);
                } else if (mineralpatch.mineralAmount > 0) {
                    myconf = this.setSourceAssignment(myconf, 'extractor', { 'extractor': 1}, 30);
                }
            }
        }
    }

    // Adjust builders depending on unfinished projects.
    var projectsList = this.find(FIND_MY_CONSTRUCTION_SITES);
    if(projectsList.length > 0) {
        myconf = this.setSourceAssignment(myconf, 'builderstorage', { 'builderstorage': 1}, 30);
        if(energy_reserves > empire_defaults['room_energy_min']) {
            empire[rname].sources['builder'] = {'sourcename': empire[rname]['roomname'] + '-B', 'x':25, 'y':25, 'assigned': {}, 'expected_income': 10, 'dynamic': 1}
            empire[rname].sources['builder'].assigned['builderstorage'] = 2;
        }
    }

    this.memory[MEMORY_RCONFIG] = myconf;
    return myconf;
}
