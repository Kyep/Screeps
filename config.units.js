
// rule: must have  1 move part for 1 every other part, or 2 every other parts if creep uses roads exclusively
global.empire_workers = {
    'upclose': { 'body': [WORK, WORK, CARRY, MOVE] },
	'upfar': { 'body': [WORK, CARRY, MOVE] },
	'up8': { 'body': [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'noresizing': 1 },

	'remoteconstructor': { 'body': [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 'renew_allowed': 0, 'abbr': 'RC'},
	'minirc': { 'body': [WORK, CARRY, CARRY, MOVE, MOVE, MOVE], 'noresizing': 1, 'renew_allowed': 0, 'abbr': 'miniRC'},

	'harvester': { 'body': [WORK, CARRY, MOVE] },
	'fharvester': { 'body': [WORK, CARRY, MOVE, MOVE] },
	'bharvester': { 'body': [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 'noresizing': 1, 'abbr': 'bHar'}, // 800e. takes 6 WORK units to deplete a c30 vein. These have 4. So you need 2 per base, allowing some refill time.
	'c15harvester': { 'body': [WORK, WORK, WORK, CARRY, MOVE, MOVE], 'noresizing': 1, 'abbr': 'c15'},
	'c30harvester': { 'body': [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE], 'noresizing': 1, 'abbr': 'c30' },
	'hauler': { 'body': [WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], 'noresizing': 1, 'abbr': 'haul'},

	'extractor': { 'body': [WORK, WORK, CARRY, CARRY, MOVE, MOVE], 'abbr': 'Ext' },
	'scavenger': { 'body': [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], 'noresizing': 1, 'renew_allowed': 0 },
	'bigscavenger': { 'body': [CARRY, MOVE] },
	'builder': { 'body': [WORK, CARRY, MOVE] },
	'builderstorage': { 'body': [WORK, WORK, CARRY, CARRY, MOVE, MOVE], 'renew_allowed': 0, 'abbr': 'BS' }, // full speed on roads
	'upstorclose': { 'body': [WORK, WORK, CARRY, MOVE], 'renew_allowed': 0, 'abbr': 'USc' },  // halfspeed on roads, quarter speed offroad
	'upstorfar': { 'body': [WORK, WORK, CARRY, CARRY, MOVE, MOVE], 'renew_allowed': 0, 'abbr': 'USf' },  // halfspeed on roads, quarter speed offroad
	'labtech': { 'body': [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'abbr': 'Tec' },
	'nuketech': { 'body': [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], 'noresizing': 1, 'renew_allowed': 0, 'abbr': 'NUKE'  },

    // MILITARY CREEP DESIGN RULES:
    // 1. all NPC invaders have 1:1 move speed offroad, 2/3 (4/6 counting RCL>=4 invaders) have a ranged attack, and another 1/3rd have ranged heals. Thus creeps MUST have 1:1 movespeed. If they do not, they might get kited.
    // 2. costs are ATTACK:80, RANGED_ATTACK:150, HEAL:250. ATTACK also has power 30, RANGED_ATTACK 10 and HEAL 12. Thus in MOST situations ATTACK is clearly preferable to all other options, as it is both cheapest AND strongest.
    // 3. notably, TOUGH only costs ***TEN*** energy (60 with MOVE), so its worthwhile to put TOUGH parts on everything. The only question is: how many.
    // global.CONSTRUCT_MILITARY_BODY(tough_parts, move_parts, attack_parts, rangedattack_parts, heal_parts)
    // Anti-invader defense classes.
    'scout': { 'body':      global.CONSTRUCT_MILITARY_BODY(0, 1, 1, 0, 0), 'noresizing': 1, 'renew_allowed': 0 }, // 130e, 200 HP, 30 DPS. Disposable scout.
    'slasher': { 'body':    global.CONSTRUCT_MILITARY_BODY(2, 4, 2, 0, 0), 'noresizing': 1, 'renew_allowed': 0 }, // 380e, 800 HP, 60 DPS. Bread-and-butter defender, should be able to take most RCL<4 invaders by itself.
	'rogue': { 'body':      global.CONSTRUCT_MILITARY_BODY(2, 6, 4, 0, 0), 'noresizing': 1, 'renew_allowed': 0}, // 640e, 1,200 HP, 120 DPS. Capable of out-damaging a RCL<4 healer.
    'ninja': { 'body':      global.CONSTRUCT_MILITARY_BODY(2, 8, 6, 0, 0), 'noresizing': 1, 'renew_allowed': 0}, // 900e, 1,600 HP, 180 DPS. 
    'ninjaheals': { 'body': global.CONSTRUCT_MILITARY_BODY(2, 9, 6, 0, 1), 'noresizing': 1, 'renew_allowed': 0}, // 1,050e, 1,800 HP, 180 DPS. 
    'dragon': { 'body':     global.CONSTRUCT_MILITARY_BODY(6, 16, 10, 0, 0), 'noresizing': 1, 'renew_allowed': 0}, // 1,660e, 3,200 HP, 300 DPS.
    'siegedragon': { 'body':global.CONSTRUCT_MILITARY_BODY(4, 14, 10, 0, 0), 'noresizing': 1, 'renew_allowed': 0}, // 1,540e, 2,800 HP, 300 DPS.
    'boss': { 'body':       global.CONSTRUCT_MILITARY_BODY(10, 20, 8, 0, 2), 'noresizing': 1, 'renew_allowed': 0}, // 2,240e, 4,000 HP, 240 DPS, 24 HPS.
    
    // ANTIKITE
    'antikite2': { 'body':      global.CONSTRUCT_MILITARY_BODY(0, 2, 0, 2, 0), 'noresizing': 1, 'renew_allowed': 0, 'antikite': 1, 'abbr': 'ak2'}, 
    'antikite4': { 'body':      global.CONSTRUCT_MILITARY_BODY(0, 4, 0, 4, 0), 'noresizing': 1, 'renew_allowed': 0, 'antikite': 1, 'abbr': 'ak4'}, 
    'antikite8': { 'body':      global.CONSTRUCT_MILITARY_BODY(0, 8, 0, 8, 0), 'noresizing': 1, 'renew_allowed': 0, 'antikite': 1, 'abbr': 'ak8'}, 
    'antikite16': { 'body':      global.CONSTRUCT_MILITARY_BODY(0, 16, 0, 16, 0), 'noresizing': 1, 'renew_allowed': 0, 'antikite': 1, 'abbr': 'ak16'}, 

    // Anti-player defense classes
	'wizard': { 'body':   [MOVE, RANGED_ATTACK], 'renew_allowed': 0}, // horrificly expensive anti-crowd unit

    // Anti-player ATTACK classes
	'siege': { 'body':         global.CONSTRUCT_MILITARY_BODY(0, 1, 2, 0, 0), 'renew_allowed': 0}, // half speed, strong but slow
	'siegemini': { 'body':     global.CONSTRUCT_MILITARY_BODY(0, 3, 3, 0, 0), 'noresizing': 1, 'renew_allowed': 0}, // small.
	'siegefar': { 'body':      global.CONSTRUCT_MILITARY_BODY(0, 6, 6, 0, 0), 'noresizing': 1, 'renew_allowed': 0}, // super-basic, but 1:1 move speed even on untiled surfaces.
	'drainer': { 'body': [MOVE], 'noresizing': 1, 'renew_allowed': 0, 'rup': 20}, // ultra-cheap unit used to drain enemy towers.
	'drainerbig': { 'body': global.CONSTRUCT_MILITARY_BODY(0, 12, 0, 0, 12), 'noresizing': 1, 'renew_allowed': 0, 'rup': 20}, 

	'siegebig': { 'body':      global.CONSTRUCT_MILITARY_BODY(0, 15, 15, 0, 0), 'noresizing': 1, 'renew_allowed': 0}, // 1950?
	'healer': { 'body':   global.CONSTRUCT_MILITARY_BODY(10, 8, 0, 0, 20), 'renew_allowed': 0}, // 5,600e!

    // Territory control classes
	'reserver' : { 'body': [CLAIM, CLAIM, MOVE, MOVE], 'noresizing': 1, 'renew_allowed': 0 },
	'sreserver' : { 'body': [CLAIM, MOVE], 'noresizing': 1, 'renew_allowed': 0 },
	'claimer': { 'body': [CLAIM, MOVE], 'noresizing': 1, 'renew_allowed': 0 },
	'bclaimer': { 'body': [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'renew_allowed': 0 },
	'signer': { 'body': [MOVE], 'noresizing': 1, 'renew_allowed': 0}, 

    // Base maint/defense classes.
	'teller': { 'body': [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], 'noresizing': 1, 'renew_allowed': 0},
	'teller-towers': { 'body': [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], 'noresizing': 1, 'renew_allowed': 0 }
}