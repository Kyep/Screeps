
// rule: must have 1 move part for 1 every other part, or 2 every other parts if creep uses roads exclusively
global.empire_workers = { 
    'upclose': { 'body': global.CONSTRUCT_BODY({WORK: 2, CARRY: 1, MOVE: 1}) },
	'upfar': { 'body': global.CONSTRUCT_BODY({WORK: 1, CARRY: 1, MOVE: 1}) },
	'up8': { 'body': global.CONSTRUCT_BODY({WORK: 4, CARRY: 4, MOVE: 8}), 'noresizing': 1 },

	'remoteconstructor': { 'body': global.CONSTRUCT_BODY({WORK: 2, CARRY: 2, MOVE: 4}), 'renew_allowed': 0, 'abbr': 'RC'},
	'minirc': { 'body': global.CONSTRUCT_BODY({WORK: 2, CARRY: 2, MOVE: 4}), 'noresizing': 1, 'renew_allowed': 0, 'abbr': 'miniRC'},
    'dismantler': { 'body': global.CONSTRUCT_BODY({WORK: 3, CARRY: 27, MOVE: 10}), 'renew_allowed': 1, 'abbr': 'DIS'},

	'sharvester': { 'body': global.CONSTRUCT_BODY({WORK: 1, CARRY: 1, MOVE: 1}) },
	'fharvester': { 'body': global.CONSTRUCT_BODY({WORK: 1, CARRY: 1, MOVE: 2}) },
	'bharvester': { 'body': global.CONSTRUCT_BODY({WORK: 4, CARRY: 4, MOVE: 4}), 'noresizing': 1, 'abbr': 'bHar'}, // 800e. takes 6 WORK units to deplete a c30 vein. These have 4. So you need 2 per base, allowing some refill time.

	'c15harvester': { 'body': global.CONSTRUCT_BODY({WORK: 3, CARRY: 1, MOVE: 2}), 'noresizing': 1, 'abbr': 'c15', 'rup': 10},
	'c30harvester': { 'body': global.CONSTRUCT_BODY({WORK: 6, CARRY: 1, MOVE: 3}), 'noresizing': 1, 'abbr': 'c30', 'rup': 10},

	'hauler': { 'body': global.CONSTRUCT_BODY({WORK: 1, CARRY: 3, MOVE: 3}), 'noresizing': 1, 'abbr': 'haul', 'rup': 20},

	'grower': { 'body': global.CONSTRUCT_BODY({CARRY: 25, MOVE: 25}), 'noresizing': 1, 'abbr': 'grow'},
	'fetcher': { 'body': global.CONSTRUCT_BODY({CARRY: 25, MOVE: 25}), 'noresizing': 1, 'abbr': 'fetch'},

	'extractor': { 'body': global.CONSTRUCT_BODY({WORK: 2, CARRY: 2, MOVE: 2}), 'abbr': 'Ext' },
	
	'scavenger': { 'body': global.CONSTRUCT_BODY({WORK: 1, CARRY: 5, MOVE: 3}), 'noresizing': 1, 'renew_allowed': 0 },
	'bigscavenger': { 'body': global.CONSTRUCT_BODY({CARRY: 1, MOVE: 1}) },
	
	'builder': { 'body': global.CONSTRUCT_BODY({WORK: 1, CARRY: 1, MOVE: 1}) },
	'builderstorage': { 'body': global.CONSTRUCT_BODY({WORK: 2, CARRY: 2, MOVE: 2}), 'abbr': 'BS' }, // full speed on roads
	
	'upstorclose': { 'body': global.CONSTRUCT_BODY({WORK: 2, CARRY: 1, MOVE: 1}), 'abbr': 'USc' },  // halfspeed on roads, quarter speed offroad
	'upstorfar': { 'body': global.CONSTRUCT_BODY({WORK: 2, CARRY: 2, MOVE: 2}), 'abbr': 'USf' },  // halfspeed on roads, quarter speed offroad
	'upstor8': { 'body': global.CONSTRUCT_BODY({WORK: 15, CARRY: 15, MOVE: 15}), 'noresizing': 1, 'abbr': 'US8' },  // halfspeed on roads, quarter speed offroad
	
	'labtech': { 'body': global.CONSTRUCT_BODY({CARRY: 20, MOVE: 10}), 'noresizing': 1, 'abbr': 'LTec' },
	'nuketech': { 'body': global.CONSTRUCT_BODY({CARRY: 12, MOVE: 6}), 'noresizing': 1, 'renew_allowed': 0, 'abbr': 'NUKE', 'rup': 3 },

    // MILITARY CREEP DESIGN RULES:
    // 1. Must have 1:1 movespeed offroad. All NPCs do this, and 2/3 (4/6 counting RCL>=4) have a ranged attack. Catching them is hopeless without one.
    // 2. Favor ATTACK over RANGED_ATTACK as it is cheaper/stronger for all cases except groups of enemies with heal.
    // 3. TOUGH parts cost 60 (including 50 for MOVE) so including a few is a good idea.

    // Anti-invader defense classes.
    'scout': { 'body':      global.CONSTRUCT_BODY({ATTACK: 1, MOVE: 1}), 'noresizing': 1, 'renew_allowed': 0 }, // 130e, 200 HP, 30 DPS. Disposable scout.
    'slasher': { 'body':    global.CONSTRUCT_BODY({ATTACK: 2, MOVE: 2}), 'noresizing': 1, 'renew_allowed': 0 }, // 380e, 800 HP, 60 DPS. Bread-and-butter defender, should be able to take most RCL<4 invaders by itself.
	'rogue': { 'body':      global.CONSTRUCT_BODY({TOUGH: 2, MOVE: 6, ATTACK: 4}), 'noresizing': 1, 'renew_allowed': 0}, // 640e, 1,200 HP, 120 DPS. Capable of out-damaging a RCL<4 healer.
    'ninja': { 'body':      global.CONSTRUCT_BODY({TOUGH: 2, MOVE: 8, ATTACK: 6}), 'noresizing': 1, 'renew_allowed': 0}, // 900e, 1,600 HP, 180 DPS. 
    'dragon': { 'body':     global.CONSTRUCT_BODY({TOUGH: 6, MOVE: 16, ATTACK: 10}), 'noresizing': 1, 'renew_allowed': 0}, // 1,660e, 3,200 HP, 300 DPS.
    'boss': { 'body':       global.CONSTRUCT_BODY({MOVE: 25, ATTACK: 25}), 'noresizing': 1, 'renew_allowed': 0}, // {"cost":2840,"dps":600}
    'uberboss': { 'body':   global.CONSTRUCT_BODY({ATTACK: 30, MOVE: 10, HEAL: 10}), 'noresizing': 1, 'renew_allowed': 0}, // {"cost":5400,"dps":900,"hps":120}

    'siegedefense': { 'body':   global.CONSTRUCT_BODY({TOUGH: 10, ATTACK: 20, MOVE: 10, HEAL: 10}), 'noresizing': 1, 'renew_allowed': 0}, //  {"cost":4700,"dps":600,"hps":120}, with boosts {"cost":4700,"dps":2400,"hps":480}

    // priorityDefend classes
    'gar_melee': { 'body':   global.CONSTRUCT_BODY({MOVE: 16, ATTACK: 32}), 'noresizing': 1, 'renew_allowed': 0}, // {"cost":3360,"dps":960}
    'gar_ranged': { 'body':   global.CONSTRUCT_BODY({MOVE: 16, RANGED_ATTACK: 32}), 'noresizing': 1, 'renew_allowed': 0}, // {"cost":5600,"ranged_dps":320}


    // ANTIKITE
    'antikite2': { 'body':  global.CONSTRUCT_BODY({RANGED_ATTACK: 2, MOVE: 2}), 'noresizing': 1, 'renew_allowed': 0, 'antikite': 1, 'abbr': 'ak2'}, 
    'antikite4': { 'body':  global.CONSTRUCT_BODY({RANGED_ATTACK: 4, MOVE: 4}), 'noresizing': 1, 'renew_allowed': 0, 'antikite': 1, 'abbr': 'ak4'}, 
    'antikite8': { 'body':  global.CONSTRUCT_BODY({RANGED_ATTACK: 8, MOVE: 8}), 'noresizing': 1, 'renew_allowed': 0, 'antikite': 1, 'abbr': 'ak8'}, 
    'antikite16': { 'body': global.CONSTRUCT_BODY({RANGED_ATTACK: 16, MOVE: 16}), 'noresizing': 1, 'renew_allowed': 0, 'antikite': 1, 'abbr': 'ak16'}, 

    // Anti-player defense classes
	'wizard': { 'body':   global.CONSTRUCT_BODY({MOVE: 25, RANGED_ATTACK: 20, HEAL: 5}), 'noresizing': 1, 'renew_allowed': 0}, // {"cost":5500,"ranged_dps":200,"hps":60}

    // Anti-player SIEGE TEAM ATTACK classes (boosted)
	//'siegeX': { 'body':      global.CONSTRUCT_BODY({TOUGH: 10, MOVE: 10, ATTACK: 3, WORK: 27}), 'noresizing': 1, 'renew_allowed': 0, 'abbr': 'SX'},   // {"cost":3600,"dismantle_dps":1500} <--- 6k DPS with boosts
	'siegeX': { 'body':      global.CONSTRUCT_BODY({TOUGH: 10, MOVE: 10, ATTACK: 30}),  'noresizing': 1, 'renew_allowed': 0, 'abbr': 'SX'},
	'siegerx': { 'body':     global.CONSTRUCT_BODY({MOVE: 10, RANGED_ATTACK: 40}), 'noresizing': 1, 'renew_allowed': 0, 'abbr': 'SrX'}, // {"cost":6500,"ranged_dps":400} -> 1600 DPS with boosts
	'siegehealerX': { 'body':     global.CONSTRUCT_BODY({TOUGH: 20, MOVE: 10, HEAL: 20}), 'noresizing': 1, 'renew_allowed': 0, 'abbr': 'SHX'}, // {"cost":5700,"hps":240}

    // Anti-player SIEGE TEAM ATTACK classes (unboosted)
	'siege': { 'body':     global.CONSTRUCT_BODY({MOVE: 20, WORK: 20}), 'noresizing': 1, 'renew_allowed': 0, 'abbr': 'S'}, // {"cost":3000,"dismantle_dps":1000}
	'sieger': { 'body':     global.CONSTRUCT_BODY({MOVE: 25, RANGED_ATTACK: 25}), 'noresizing': 1, 'renew_allowed': 0, 'abbr': 'Sr'}, // {"cost":6500,"ranged_dps":250}
	'siegehealer': { 'body':   global.CONSTRUCT_BODY({TOUGH: 15, MOVE: 10, HEAL: 15}), 'noresizing': 1, 'abbr': 'SH' }, // {"cost":4400,"hps":180}

    // Anti-player SOLO ATTACK classes (unboosted)
	'drainer': { 'body': [MOVE], 'noresizing': 1, 'renew_allowed': 0, 'rup': 20}, 
	'drainerbig': { 'body': global.CONSTRUCT_BODY({TOUGH: 5, MOVE: 25, ATTACK: 1, HEAL: 19}), 'noresizing': 1, 'renew_allowed': 0, 'rup': 20}, // {"cost":4800,"hps":180}



    // Territory control classes
	'reserver' : { 'body': global.CONSTRUCT_BODY({CLAIM: 2, MOVE: 2}), 'noresizing': 1, 'renew_allowed': 0, 'rup': 10 },
	'sreserver' : { 'body': [CLAIM, MOVE], 'noresizing': 1, 'renew_allowed': 0 },
	'claimer': { 'body': [CLAIM, MOVE], 'noresizing': 1, 'renew_allowed': 0 },
	'bclaimer': { 'body': global.CONSTRUCT_BODY({CLAIM: 14, MOVE: 14}), 'renew_allowed': 0 },
	'signer': { 'body': [MOVE], 'noresizing': 1, 'renew_allowed': 0}, 
	'wiper': { 'body':      global.CONSTRUCT_BODY({MOVE: 10, ATTACK: 10}), 'noresizing': 1, 'renew_allowed': 0},

    // Base maint/defense classes.
    'banker': { 'body': global.CONSTRUCT_BODY({CARRY: 10, MOVE: 5}), 'noresizing': 1},
	'bankerb': { 'body': global.CONSTRUCT_BODY({CARRY: 32, MOVE: 16}), 'noresizing': 1},
	'teller': { 'body': global.CONSTRUCT_BODY({CARRY: 20, MOVE: 10}), 'noresizing': 1, 'renew_allowed': 0, 'rup': 5}, // {"cost":1500}
	'teller-mini': { 'body': global.CONSTRUCT_BODY({CARRY: 4, MOVE: 2}), 'noresizing': 1, 'renew_allowed': 0, 'rup': 3}, // {"cost":300}
	'teller-towers': { 'body': global.CONSTRUCT_BODY({CARRY: 10, MOVE: 5}), 'noresizing': 1, 'renew_allowed': 0, 'rup': 5 }, // {"cost":750}
	'safemoder': { 'body': global.CONSTRUCT_BODY({CARRY: 20, MOVE: 10}), 'noresizing': 1, 'renew_allowed': 0, 'rup': 5}
}