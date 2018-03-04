
global.ROOM_UNDER_ATTACK = function(roomname) {
    var myalert = Memory['sectors_under_attack'][roomname];
    if (myalert == undefined) {
        return 0;
    }
    return 1;
}

global.HANDLE_ALL_ROOM_ALERTS = function() {
    for (var thisname in Memory['sectors_under_attack']) {
        global.HANDLE_ROOM_ALERT(thisname);
    }
}

global.HANDLE_ROOM_ALERT = function(roomname) {
    var myalert = Memory['sectors_under_attack'][roomname];

    if (myalert == undefined) {
        console.log('ERROR: TRYING TO HANDLE NON-EXISTENT ALERT FOR ' + roomname);
        return;
    }
    if (myalert['updateCount'] == undefined || myalert['updateCount'] < 1) {
        console.log('HANDLE_ROOM_ALERT: skipping alert as its not been updated with threat data yet: ' + roomname);
        return;
    }
    
    var myinfo = GET_ROOM_CONFIG(roomname);
    if (!myinfo) {
        return;
    }
    
    var baseforce = {};
    var patrolforce = {};
    var room_has_spawn = 0;
    for (var thisspawn in Game.spawns) {
        if (Game.spawns[thisspawn].room.name == roomname) {
            room_has_spawn = 1;
        }
    }
    var towercount = 0;
    if (Game.rooms[roomname] != undefined) {
        var towerlist = Game.rooms[roomname].find(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return (
                                structure.structureType == STRUCTURE_TOWER && structure.energy > 0 && structure.isActive()
                        );
                    }
        });
        towercount = towerlist.length;
    }
    var try_safemode = 0;
    if(room_has_spawn) {
        var newcount = Game.rooms[roomname].getMyStructuresCount();
        var oldcount = myalert['myStructureCount'];
        if (newcount < oldcount && !myalert['nukeCount']) {
            try_safemode = 1;
        }
    }

    if (try_safemode) {
        var cc = Game.rooms[roomname].controller;
        var is_in_safemode = 0;
        if (cc.safeMode != undefined && cc.safeMode > 0) {
            is_in_safemode = cc.safeMode;
        }
        if (is_in_safemode > 0) {
            // nothing.
        } else if (cc.safeModeAvailable) {
            cc.activateSafeMode();
            Game.notify('!!!!! WOULD SAFEMODE ACTIVATION: ' + roomname);
            console.log('SAFE MODE ACTIVATED: ATTACK: ' + roomname);
        } else {
            Game.notify('!!!!! CANNOT ACTIVATE SAFEMODE: ' + roomname);
            console.log('SAFE MODE UNAVAILABLE: ATTACK: ' + roomname);
        }
    }
    var theirthreat = myalert['hostileCost'];
    var alert_age = Game.time - myalert['attackStart'];
    if (towercount > 0) {
        if (myalert['hostileUsername'] == 'Invader' && alert_age < 120) {
            theirthreat -= (1000 * towercount);
        }
        if (Game.rooms[roomname] != undefined && Game.rooms[roomname].storage != undefined) {
            baseforce['teller-towers'] = 1;
            if (theirthreat > 15000) {
                baseforce['teller-towers'] = 2;
                baseforce['teller'] = 2;
            } else if (theirthreat > 8000) {
                baseforce['teller'] = 1;
            }
        }
    }
    if (myinfo['spawn_room'] == undefined) {
        console.log('ATTACK CONFIG WARNING, SECTOR ' + roomname + ' HAS NO spawn_room SET ON ITS ROOM!');
        patrolforce['rogue'] = 1; // the sad default.
    } else if (theirthreat > 0) {
        var gsapfr = GET_SPAWNER_AND_PSTATUS_FOR_ROOM(roomname, true);
        var spawner = gsapfr[0];
        var using_primary = gsapfr[1];
        if (spawner == undefined) {
            //console.log('XAT: ' + roomname + " has no free 1x spawner");
            return;
        }
        var home_room = spawner.room.name;
        if (!using_primary && myinfo['spawn_room'] != undefined) {
            home_room = myinfo['spawn_room'];
        }
        if (spawner == undefined) {
            //console.log('XAT: ' + roomname + " has no free 1x-b spawner");
            return;
        } else {
            //console.log('XAT: Deciding what to spawn for the ' + theirthreat + ' attack on ' + roomname + ' defended by ' + spawner.name);
        }
        var enow = spawner.room.energyAvailable;
        var emax = spawner.room.energyCapacityAvailable;
        var defense_roles = empire_defaults['defense_roles'];
        if (myalert['hostileCount'] == 1 && myalert['hostileRanged'] == 1) {
            // there is one guy, he's ranged, and he cannot heal. This is probably a kiting attack.
            defense_roles = empire_defaults['defense_roles_ranged'];
            //console.log('KITING DETECTED: ' + roomname);
        }
        for (var i = 0; i < defense_roles.length; i++) {
            var oname = defense_roles[i];
            //console.log('checking cost for' + oname);
            var obody = empire_workers[oname]['body'];
            var outfit_cost = global.UNIT_COST(obody);
            if (outfit_cost > emax) {
                //console.log('XAT: No point using ' + oname + ' as it exceeds our spawn power ' + emax);
                // no point using this... we can't possibly afford it.
                continue;
            }
            if ((i + 1) != defense_roles.length) {
                if (outfit_cost > (theirthreat * 1.2)) { 
                    //console.log('XAT: No point using ' + oname + ' as its cost ' + outfit_cost + ' is > 1.2*their_threat ' + theirthreat + ' (i: ' + i +  ', DRL:' + defense_roles.length + ')');
                    continue; // overkill...
                }
            }
            if (patrolforce[oname] == undefined) {
                if (i == defense_roles.length && theirthreat > (outfit_cost * 2)) {
                    patrolforce[oname] = 2;
                } else {
                    patrolforce[oname] = 1;
                }
            } else {
                patrolforce[oname] += 1;
            }
            theirthreat -= outfit_cost;
            //console.log('XAT: Defending ' + roomname + ' with ' + patrolforce[oname] + ' ' + oname + ' (cost: ' + outfit_cost + ' ea) against threat. ' + theirthreat + '/' + myalert['hostileCost'] + ' threat remaining.');
            if (theirthreat < 0) {
                break;
            }
        }
    } else {
        console.log('DEFENSE: Decided that  ' + roomname + ' can handle the incoming threat of ' + theirthreat + ' without any units being spawned');
    }
    var rconf = GET_ROOM_CONFIG(roomname);
    rconf = ADD_ROOM_KEY_ASSIGNMENT(rconf, 'basemil', baseforce, 25, true);
    rconf = ADD_ROOM_KEY_ASSIGNMENT(rconf, 'defmil', patrolforce, 50, true);
    
}

Room.prototype.getHostileCreeps = function() {
    return this.find(FIND_HOSTILE_CREEPS, {filter: function(c){ if (IS_ALLY(c.owner.username)) { return false } else { return true } } });
}

Room.prototype.getHostileStructures = function(include_public_ramparts) {
    return this.find(FIND_HOSTILE_STRUCTURES, {filter: function(s){ 
        if (IS_ALLY(s.owner.username) || s.isInvincible()) { 
            return false;
        }
        if (!include_public_ramparts && s.structureType == STRUCTURE_RAMPART) {
            if (s.isPublic) {
                return false;
            }
        }
        return true;
    } });
}


Room.prototype.hasAlert = function() {
    if (this.name in Memory['sectors_under_attack']) {
        return 1;
    }
    return 0;
}

Room.prototype.getAlertObject = function() {
    if (this.name in Memory['sectors_under_attack']) {
        return Memory['sectors_under_attack'][this.name];
    }
    console.log('ERROR: getAlertObject called on ' + this.name + ' that has no alert...');
    return {};
}

Room.prototype.shouldHaveAlert = function(enemy_details, nuke_details) {
    var debug = 0;
    /*if (enemy_details['hostileCount'] > 0) { 
        console.log(this.name + ': shouldHaveAlert: ' + 'eval');   
        debug = 1;
    }*/
    if (!this.inEmpire()) {
        if (debug) { console.log(this.name + ': shouldHaveAlert: ' + ' not in empire');   }
        return 0; // never create alerts for rooms we do not claim.
    }
    if (this.controller != undefined && this.controller.owner != undefined && this.controller.owner.username != overlord) {
        if (debug) { console.log(this.name + ': shouldHaveAlert: ' + 'not ours');   }
        return 0; // never create alerts for rooms owned by other players, even if they are defined as part of us.
    }
    
    if (enemy_details['hostileCount'] > 0) {
        if (!IS_ALLY(enemy_details['hostileUsername'])) {
            return 1;
        }
    }
    if (nuke_details['nukeCount'] > 0 && nuke_details['nukeTimeToLand'] < 200) {
        return 1;
    }
    
    if (this.hasAlert()) {
        var thealert = this.getAlertObject();
        var tgap = Game.time - thealert['lastRefreshed']; 
        if (tgap >= empire_defaults['alerts_duration']) {
            return 0;
        }
    }
    if (debug) {  console.log(this.name + ': shouldHaveAlert: ' + 'no condition met');   }
    return 0;
}

Room.prototype.detailEnemies = function() {
    var details = {};

    details['hostileCost'] = 0;

    var enemiesList = this.find(FIND_HOSTILE_CREEPS);
    details['hostileCount'] = enemiesList.length;
    details['hostileRanged'] = 0;
    details['hostileUsername'] = 'Invader';

    if(enemiesList.length) {
        for(var i = 0; i < enemiesList.length; i++) {
            var this_enemy_cost = global.CREEP_COST(enemiesList[i].body);
            if(enemiesList[i].isBoosted()) {
                this_enemy_cost *= 5; // This treats boosted creeps as 5x as dangerous.
            }
            details['hostileCost'] += this_enemy_cost;
            if (enemiesList[i].owner != undefined) {
                if (enemiesList[i].owner.username != undefined) {
                    if (enemiesList[i].owner.username != details['hostileUsername']) {
                        details['hostileUsername'] = enemiesList[i].owner.username;
                    }
                }
            }
            if (details['hostileUsername'] == 'Invader' && enemiesList[i].classifyMilitaryType() == RANGED_ATTACK && enemiesList[i].getActiveBodyparts(HEAL) == 0 ) {
                details['hostileRanged']++;
            }
        }
    }
    return details;
}

Room.prototype.detailNukes = function() {
    var details = {};
    details['nukeCount'] = 0;
    details['nukeTimeToLand'] = Infinity;
    details['nukeLaunchRoomName'] = '';
    var nuke_list = this.find(FIND_NUKES);
    for (var i = 0; i < nuke_list.length; i++) {
        details['nukeCount']++;
        if (nuke_list[i].timeToLand < details['nukeTimeToLand']) {
            details['nukeTimeToLand'] = nuke_list[i].timeToLand;
            details['nukeLaunchRoomName'] = nuke_list[i].launchRoomName;
        }
    }
    return details;
}

Room.prototype.createAlert = function(enemy_details, nuke_details) {
    var thisalert = {};
    thisalert['attackStart'] = Game.time;
    thisalert['myStructureCount'] = this.getMyStructuresCount();
    thisalert['updateCount'] = 0;
    
    var texits = Game.map.describeExits(this.name);
    var exit_arr = []
    for (var ex in texits) {
        exit_arr.push(texits[ex]);
    }
    for (var tc in Game.creeps) {
        if (!exit_arr.includes(Game.creeps[tc].room.name)) { // if they aren't next door, skip them.
            continue;
        }
        if (Game.creeps[tc].memory[MEMORY_ROLE] == undefined) {
            continue;
        }
        if (!Game.creeps[tc].isMilitary()) {
            continue;
        }
        if (Game.creeps[tc].isSiege()) {
            continue;
        }
        var theirEnemies = Game.creeps[tc].room.find(FIND_HOSTILE_CREEPS);
        if (theirEnemies.length) {
            continue;
        }
        Game.creeps[tc].memory[MEMORY_DEST] = this.name;
        console.log('createAlert REASSIGN: sent ' + Game.creeps[tc].name + ' to defend ' + this.name);
        //Game.notify('REASSIGN: sent ' + Game.creeps[tc].name + ' to defend ' + this.name);
    }
    thisalert['myStructureData'] = {}
    var my_structures = this.find(FIND_STRUCTURES);
    for (var i = 0; i < my_structures.length; i++) {
        if(thisalert['myStructureData'][my_structures[i].structureType] == undefined) {
            thisalert['myStructureData'][my_structures[i].structureType] = [];
        }
        thisalert['myStructureData'][my_structures[i].structureType].unshift(my_structures[i].pos);
    }

    Memory['sectors_under_attack'][this.name] = thisalert;
    return thisalert;
}

Room.prototype.deleteAlert = function() {
    
    var myalert = Memory['sectors_under_attack'][this.name];
    
    if (myalert == undefined) {
        var alert_string = this.name +': ERROR: trying to delete a non-existent alert.';
	    console.log(alert_string);
	    Game.notify(alert_string);
        return 1;
    }

    var alert_age = Game.time - myalert['attackStart'];

    // Rebuild any structures that were destroyed during the alert.
    var old_structurelist = myalert['myStructureData'];
    for (var stype in old_structurelist) {
        for (var i = 0; i < old_structurelist[stype].length; i++) {
            var structure_pos = old_structurelist[stype][i];
        	var structures_at = this.lookForAt(LOOK_STRUCTURES, structure_pos.x, structure_pos.y, structure_pos);
        	var is_intact = 0;
        	for (var j = 0; j < structures_at.length; j++) {
        		if (structures_at[j].structureType == stype) {
        			is_intact = 1;
        		}
        	}
        	if (!is_intact) {
        	    var alert_string = this.name +': MISSING ' + stype + ' AT: ' +structure_pos.x + ',' + structure_pos.y + ' after attack from ' + myalert['hostileUsername'] + ' - REBUILDING!';
        	    console.log(alert_string);
        	    Game.notify(alert_string);
        		this.createConstructionSite(structure_pos.x, structure_pos.y, stype);
        	}
        }
    }
    
    // Reassign or recycle mobs created because of the alert.
    if(empire_defaults['alerts_recycle'] == 1) {
        for(var name in Game.creeps) {
            if(Game.creeps[name].memory[MEMORY_DEST] == this.name && Game.creeps[name].isMilitary()) {
                Game.creeps[name].memory[MEMORY_ROLE] = 'recycler';
                Game.creeps[name].say('🔄 recycle');
                console.log('RECYCLE: ' + name + ' due to it being part of sector defense forces for a sector that is no longer under attack.');
            }
        }
    } else if (empire_defaults['alerts_reassign']) {
        for(var crname in Game.creeps) {

            if(Game.creeps[crname].memory[MEMORY_DEST] == this.name && Game.creeps[crname].isMilitary()) {
                if (Game.creeps[crname].memory[MEMORY_SPAWNERNAME] == undefined) {
                    continue;
                }
                var spname = Game.creeps[crname].memory[MEMORY_SPAWNERNAME];
            }

            if (empire_defaults['alerts_reassign'][spname]) {
                Game.creeps[crname].memory[MEMORY_DEST] = empire_defaults['alerts_reassign'][spname];
                console.log('HARASS: sent ' + crname + ' to harass' + empire_defaults['alerts_reassign'][spname]);
                Game.notify('HARASS: sent ' + crname + ' to harass' + empire_defaults['alerts_reassign'][spname]);
            }

        }
    }


    var end_msg = 'ATTACK on ' + this.name + ' by ' + myalert['hostileUsername'] + ' worth ' + myalert['hostileCostMax'] + ' ENDED after ' + alert_age + ' ticks.';
    console.log(end_msg);
    if (myalert['hostileUsername'] != 'Invader') {
        if (myalert['hostileCostMax'] > 50) {
            Game.notify(end_msg);
        }
    }

    // Actually delete the alert.
    var all_alerts = Memory['sectors_under_attack'];
    if (all_alerts[this.name] != undefined) {
        delete all_alerts[this.name];
    }
    Memory['sectors_under_attack'] = all_alerts;
    return 1;

}

Room.prototype.updateAlert = function(enemy_details, nuke_details) {
    
    var thisalert = {};
    if(this.hasAlert) {
        thisalert = this.getAlertObject();
    } else {
        var tmsg = 'updateAlert ERROR: ' + this.name + ' has no alert to start with!';
        console.log(tmsg);
        Game.notify(tmsg);
        return {};
    }
    
    /*
    var sanitized = Object.assign({}, thisalert);
    delete sanitized['myStructureData'];
    console.log('Updatealert: ' + JSON.stringify(sanitized));
    */

    if (thisalert['updateCount'] == undefined) {
        thisalert['updateCount'] = 0;
    }
    if (thisalert['hostileCostMax'] == undefined) {
        thisalert['hostileCostMax'] = 0;
    }
    if (enemy_details['hostileCost'] > thisalert['hostileCostMax']) {
        thisalert['hostileCostMax'] = enemy_details['hostileCost'];
    }
    
    thisalert['updateCount']++;
    
    if (thisalert['updateCount'] == 2) {
        // why 2? because we need to run update at least once.
        var attack_details = this.name + ': ' + thisalert['hostileCount'] + ' hostiles, ' + thisalert['hostileCost'] + ' cost, ' + thisalert['hostileRanged'] + ' ranged, ' + thisalert['nukeCount'] + ' nukes, sent by: ' + thisalert['hostileUsername'];
        if (thisalert['nukeCount'] > 0 && thisalert['nukeTimeToLand'] < 200) {
            var tmsg = 'ATTACK: !!!!!NUCLEAR!!!!! ATTACK LANDING in: ' + this.name + ', launched from: ' + thisalert['nukeLaunchRoomName'];
            console.log(tmsg);
            Game.notify(tmsg);
        } else if (thisalert['hostileUsername'] == 'Invader') {
            console.log('ATTACK: NEW NPC ATTACK DETECTED: ' + attack_details );
        } else {
            if (thisalert['hostileCostMax'] > 50) {
                Game.notify('NON-NPC ATTACK! ' + attack_details);
            }
            console.log('ATTACK: NEW *PLAYER* ATTACK DETECTED: ' + attack_details );
        }
    }

    

    for (var thiskey in enemy_details) { 
        //console.log('saving ' + thiskey);
        thisalert[thiskey] = enemy_details[thiskey];
    }
    for (var thiskey in nuke_details) {
        //console.log('saving ' + thiskey);
        thisalert[thiskey] = nuke_details[thiskey];
    }


    Memory['sectors_under_attack'][this.name] = thisalert;
    return thisalert;
}