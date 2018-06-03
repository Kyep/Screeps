
    global.overlord = 'Phisec';
    global.allies = []; // not including anyone in alliance.
    global.enemies = ['Kaim0d0'];
    
    global.empire_defaults = {
        'sign': 'Reserved. #overlords',
        'priority_roles': ['teller', 'teller-towers'],
        'military_roles': ['scout', 'slasher', 'rogue', 'ninja', 'dragon', 'boss', 'uberboss', 'wizard', 'healer', 'siege', 'siegebig', 'drainer', 'drainerbig', 'antikite16', 'antikite8', 'antikite4', 'antikite2'],
        'defense_roles': ['uberboss', 'boss', 'dragon', 'ninja', 'rogue', 'slasher', 'scout'], // LIST MOST POWERFUL FIRST.
        'defense_roles_ranged': ['antikite16', 'antikite8', 'antikite4', 'antikite2'], // LIST MOST POWERFUL FIRST.
        'siege_roles': ['siegebig','siege', 'drainerbig', 'drainer', 'healer', 'siegehealer', 'wizard'], 

        'alerts_duration' : 34560, // alerts last ~24h, or until we've verified that whatever caused them is dead.
        'alerts_recycle' : 0,
        'alerts_reassign': {}, // Don't reassign anything.

        'mineralcap' : 500000, // once terminal has this many minerals, no more will be mined in a room.

        'room_history_ticks': 10,
        'room_minimum_energy_pc': 50, // what % of max stored energy (spawn/extensions) should rooms maintain? If we're below this avg % for room_history_ticks then we will spawn a teller
        'room_crit_energy_pc': 25, // if below this, spawn 2 tellers

        }

global.RECONFIG_EMPIRE = function() {
    for (var rname in Game.rooms) {
        var troom = Game.rooms[rname];
        troom.fullUpdate();
    }
}


