
global.ANY_OBSERVER_IN_RANGE = function(tgt_room) {
    var available_observers = global.LIST_OBSERVERS();
    for (var i = 0; i < available_observers.length; i++) {
        var obsrange = Game.map.getRoomLinearDistance(available_observers[i].room.name, tgt_room);
        //console.log(available_observers[i].room.name + ' v ' + tgt_room + ' = ' + obsrange);
        if (obsrange <= OBSERVER_RANGE) {
            return 1;
        }
    }
    return 0;
}


global.LIST_OBSERVERS = function() {
    var available_observers = [];
    for(var id in Game.structures){
        if(Game.structures[id].structureType == STRUCTURE_OBSERVER){
            if (!Game.structures[id].isActive()) {
                continue;
            }
            //console.log('OBSERVER: OK in ' + Game.structures[id].room.name);
            available_observers.push(Game.structures[id]);
        }
    }
    return available_observers;
}

global.UPDATE_OBSERVERS = function(observe_energy) {
    
    var rooms_to_observe = [];
    if (Memory['energy_share_dests'] != undefined && observe_energy) {
        rooms_to_observe = Memory['energy_share_dests'];
    }

    var available_observers = _.shuffle(global.LIST_OBSERVERS());

    //console.log('OBS: ' + available_observers.length + ' observer(s) available, ' + rooms_to_observe.length + ' observation targets: ' + JSON.stringify(rooms_to_observe)); 
    if (available_observers.length == 0) {
        return;
    }
    if (rooms_to_observe.length > available_observers.length) {
        console.log('OBS: WARNING: we only have ' + available_observers.length + ' observers, but you are trying to monitor ' + rooms_to_observe.length + ' rooms!');
    } else if (available_observers.length > rooms_to_observe.length) {
        var espionage_targets = global.ESPIONAGE_LIST_TARGETS();
        var spare_capacity = available_observers.length - rooms_to_observe.length;
        for (var i = 0; i < spare_capacity && i < espionage_targets.length; i++) {
            var new_element = espionage_targets[i];
            rooms_to_observe.push(new_element);
            //console.log('OBS: ' + spare_capacity + ' spare capacity, adding ' + new_element + ' for espionage');
        }
    } else {
        //console.log('OBS: no spare_capacity for espionage');
    }
    for (var i = 0; i < available_observers.length && i < rooms_to_observe.length; i++) {
        var theobs = available_observers[i];
        var obsrange = Game.map.getRoomLinearDistance(theobs.room.name, rooms_to_observe[i]);
        if (obsrange > OBSERVER_RANGE) {
            //console.log('OBS: observer in ' + theobs.room.name + ' cannot monitor ' + rooms_to_observe[i] + ' as it is ' + obsrange + ' >10 rooms away.');
            continue;
        }
        var result = theobs.observeRoom(rooms_to_observe[i]);
        //console.log('OBS: observer in ' + theobs.room.name + ' now observing ' + rooms_to_observe[i] + ' with result: ' + result);
    }
}

global.ESPIONAGE_CREATE_TARGETS = function() {
	var start_x = 49;
	var end_x = 59;
	//var end_x = 50;
	var start_y = 1;
	var end_y = 29;
	var espionage_targets = [];
	for (var i = start_x; i < end_x; i++) {
		for (var j = start_y; j < end_y; j++) {
			var this_target = 'W' + i + 'S' + j;
			if (ANY_OBSERVER_IN_RANGE(this_target)) {
                espionage_targets.push(this_target);
			    //console.log('added: ' + this_target);
			} else {
			    //console.log('cannot add (no range): ' + this_target);
			}
		}
	}
	return espionage_targets;
}

global.ESPIONAGE_LIST_TARGETS = function() {
    if (Memory['espionage'] == undefined) {
        Memory['espionage'] = {}
    }
    if (Memory['espionage']['targets'] == undefined) {
        Memory['espionage']['targets'] = []
    }
	return Memory['espionage']['targets'];
}

global.ESPIONAGE_SET_TARGETS = function(thelist) {
	Memory['espionage']['targets'] = thelist;
}

global.ESPIONAGE_REMOVE_TARGET = function(thetarget) {
    var all_targets = global.ESPIONAGE_LIST_TARGETS();
    var index = all_targets.indexOf(thetarget);
    if (index != -1) {
        all_targets.splice(index, 1);
        global.ESPIONAGE_SET_TARGETS(all_targets);
    }
	return Memory['espionage']['targets'];
}

global.ESPIONAGE_GET_TARGET = function() {
    var all_targets = Memory['espionage']['targets'];
    if (all_targets.length == 0) {
        return undefined;
    }
    return _.sample(all_targets);
}

global.ESPIONAGE_REGEN_TARGETS = function() {
    Memory['espionage']['players'] = {}
    var new_target_list = _.shuffle(global.ESPIONAGE_CREATE_TARGETS());
    global.ESPIONAGE_SET_TARGETS(new_target_list);
    console.log('ESPIONAGE: REGEN: ' + new_target_list.length + ' targets identified');
}

global.ESPIONAGE = function() {
    if (Memory['espionage'] == undefined) {
        Memory['espionage'] = {}
        global.ESPIONAGE_REGEN_TARGETS();
    }
    var target_list = global.ESPIONAGE_LIST_TARGETS();

    if (target_list.length == 0) {
        //console.log('Espionage report: ' + JSON.stringify(Memory['espionage']['players']));
        return;
    }
    var num_processed = 0;
    var levels_added = 0;
    for (var rname in Game.rooms) {
        if (target_list.indexOf(rname) != -1) {
            //console.log('ESPIONAGE: scoring ' + rname);
            var theroom = Game.rooms[rname];
            if (theroom.controller != undefined) {
                if (theroom.controller.owner != undefined) {
                    if (theroom.controller.owner.username != undefined) {
                        if (theroom.controller.owner.username != overlord) {
                            var room_owner = theroom.controller.owner.username;
                            if (Memory['espionage']['players'][room_owner] == undefined) {
                                Memory['espionage']['players'][room_owner] = theroom.controller.level;
                            }
                            Memory['espionage']['players'][room_owner] += theroom.controller.level;
                            levels_added += theroom.controller.level;
                        }
                    }
                }
            }
            ESPIONAGE_REMOVE_TARGET(rname);
            num_processed++;
        }
    }
    console.log('ESPIONAGE: processed ' + num_processed + '/' + target_list.length + ', adding: ' + levels_added + ' running: ' + JSON.stringify(Memory['espionage']['players']));    
}
