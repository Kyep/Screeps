// requirements ONLY

var roleHarvester = require('role.harvester');
var roleCHarvester = require('role.charvester');
var roleHauler = require('role.hauler');

var roleExtractor = require('role.extractor');
var roleUpgrader = require('role.upgrader');
var roleUpgraderstorage = require('role.upgraderstorage');
var roleBuilder = require('role.builder');
var roleAdventurer = require('role.adventurer');
var roleScavenger = require('role.scavenger');
var roleClaimer = require('role.claimer');
var roleReserver = require('role.reserver');
var roleRecycler = require('role.recycler'); 
var roleBuilderstorage = require('role.builderstorage');
var roleTeller = require('role.teller');
var roleRemoteconstructor = require('role.remoteconstructor');
var roleSiege = require('role.siege');
var roleDrainer = require('role.drainer');
var roleDrainerhealer = require('role.drainerhealer');
var roleSigner = require('role.signer');
var roleLabtech = require('role.labtech');

var structureTower = require('structure.tower');
var structureLink = require('structure.link');
var structureLab = require('structure.lab');

var cleaner = require('task.cleanmemory');
var spawncustom = require('task.spawncustom');

// ---------------------------
// CONFIG
// ---------------------------

    overlord = 'Phisec';
    
    empire_defaults = {
        'spawner': '59ce24a6b1421365236708e4',
        'room': 'W53S18',
        'sourceid': '59bbc3f82052a716c3ce7289',
        'priority_roles': ['teller', 'teller-towers'],
        'military_roles': ['slasher', 'rogue', 'ninja', 'ninjaheals', 'dragon', 'siegedragon', 'boss', 'wizard', 'healer', 'siege', 'siegefar', 'siegemini', 'drainer', 'drainerhealer'],
        'defense_roles': ['boss', 'dragon', 'ninja', 'rogue', 'slasher'], // LIST MOST POWERFUL FIRST.
        'alerts_duration' : 300,
        'alerts_recycle' : 0,
        'alerts_reassign': 'W55S17', // W55S17
        'repairmax_creeps' : 250000,
        'repairmax_towers' : 150000,
        'room_reserves_required' : 50000,
        'room_reserves_critical' : 25000,
        'room_history_ticks': 50,
        'room_minimum_energy_pc': 60, // what % of max stored energy (spawn/extensions) should rooms maintain? If we're below this avg % for room_history_ticks then we will spawn a teller
        'room_crit_energy_pc': 40 // if below this, spawn 2 tellers
        }
    
    empire = {
        // 1st base
        'W53S18': {
            'roomname' : '1',
            'spawns_from': 'Spawn1',
            'sources': {
                'base-maint': {
                    'sourcename': '1-base', 'x':20, 'y':20, 
                    'assigned': {}, 
                    'expected_income': 90
                },
                'upgrader': { 'sourcename': 'upgrader', 'x':20, 'y':20, 'assigned': {}, 'expected_income': 40 },
                '59bbc3f82052a716c3ce7289': {
                    'sourcename':'1-E', 'x':25, 'y':18,  'target_x': 24, 'target_y': 19, 'steps':15,
                    'assigned': {'harvester': 1},
                    'expected_income': 85
                },
                '59bbc3f82052a716c3ce728b': {
                    'sourcename':'1-W', 'x':16, 'y':26, 'target_x': 16, 'target_y': 15,'steps':15,
                    'assigned': {'upgclose': 1},
                    'expected_income': 75
                }
            },
            'safespot': {'x': 9, 'y':25 },
            'mineralid' : '59bbc644ae9e1411a425ad40'
        },

        // 1st base remote mining
        'W52S18': {
            'roomname' : '1E',
            'spawns_from': 'Spawn1',
            'sources': {
                '59bbc4062052a716c3ce7408': {'sourcename':'1E', 'x':11, 'y':14, 'target_x': 10, 'target_y': 13, 'steps':33,
                    'assigned': {'c15harvester': 1, 'hauler': 1},
                    'expected_income': 65
                }/*,
                'reserver': {'sourcename':'1E-R', 'x':11, 'y':14, 'steps':33,
                    'assigned': {'reserver': 1},
                    'expected_income': 63
                }*/
            }
        },
        'W53S17': {
            'roomname' : '1N',
            'spawns_from': 'Spawn4',
            'sources': {
                '59bbc3f72052a716c3ce7287': {'sourcename':'1N', 'x':4, 'y':44, 'target_x': 5, 'target_y': 43, 'steps':32,
                    'assigned': {'c15harvester': 1, 'hauler': 1}, // , 'reserver': 1
                    'expected_income': 70
                }/*,
                'reserver': {'sourcename':'1N-R', 'x':4, 'y':44, 'steps':32,
                    'assigned': {'reserver': 1}, // , 'reserver': 1
                    'expected_income': 69
                },*/
            } 
        },
        'W54S18': {
            'roomname' : '1W',
            'spawns_from': 'Spawn4',
            'sources': {
                '59bbc3e92052a716c3ce70b6': {'sourcename':'1W-E', 'x':42, 'y':6, 'target_x': 41, 'target_y': 7, 'steps':29, 'capacity': 3000,
                    'assigned': {'c30harvester': 1, 'hauler': 1},
                    'expected_income': 60
                },
                '59bbc3e92052a716c3ce70b7': {'sourcename':'1W-W', 'x':5, 'y':37, 'target_x': 5, 'target_y': 38,'steps':63, 'capacity': 3000,
                    'assigned': {'c30harvester': 1, 'hauler': 1},
                    'expected_income': 55
                },
                'reserver': {'sourcename':'1W-R', 'x':5, 'y':37,
                    'assigned': {'reserver': 1},
                    'expected_income': 50
                } //ANOTHER -3/TICK UNIT. NOT WORTH IT!
            }
        },
        'W54S17': {
            'roomname' : '1NW',
            'spawns_from': 'Spawn4',
            'sources': {
                '59bbc3e82052a716c3ce70b4': {'sourcename':'1NW', 'x':38, 'y':31, 'target_x': 37, 'target_y': 32, 'steps':60, 
                    'assigned': {'c15harvester': 1, 'hauler': 1}, 
                    'expected_income': 45
                }
            } 
        },
        
        // 2ND BASE
        'W51S18': {
            'roomname' : '2',
            'spawns_from': 'Spawn2',
            'sources': {
                'upgrader': { 'sourcename': 'upgrader', 'x':20, 'y':20, 'assigned': {}, 'expected_income': 40 },
                'base-maint': {'sourcename': '2-base', 'x':16, 'y':24, 
                    'assigned': {}, 
                    'expected_income': 90 
                }, 
                '59bbc4182052a716c3ce758c': {'sourcename':'2-E', 'x':14, 'y':20, 'target_x': 15, 'target_y': 21, 'steps':10,
                    'assigned': {'harvester':1, 'upgclose':1},
                    'expected_income': 80
                },
                '59bbc4182052a716c3ce758d': {'sourcename':'2-W', 'x':3, 'y':27, 'target_x': 4, 'target_y': 27, 'steps':10,
                    'assigned': {'harvester':2},
                    'expected_income': 85
                }
            },
            'safespot': {'x': 17, 'y':14 },
            'mineralid': '59bbc645ae9e1411a425ae18'
        },
        
        // 2nd base remote mining
        'W51S19': {
            'roomname' : '2S',
            'spawns_from': 'Spawn2',
            'sources': {
                '59bbc4182052a716c3ce758f': {'sourcename':'2S', 'x':34, 'y':6, 'target_x': 33, 'target_y': 5,'steps':32,
                    'assigned': {'c15harvester': 1, 'hauler': 1},
                    'expected_income': 70
                }
            }
        },
        'W51S17': {
            'roomname' : '2N',
            'spawns_from': 'Spawn2',
            'sources': {
                '59bbc4182052a716c3ce7589': {'sourcename':'2N-E', 'x':46, 'y':29, 'target_x': 45, 'target_y': 29, 'steps':36, 'capacity': 3000, // really 'steps':86, , but we have a link that bypases ~50
                    'assigned': {'c30harvester': 1, 'hauler': 2}, 'link_from': '59d850539212a60b7683ce93', 'link_to': '59d84a28947f701c72c375a7', 
                    'expected_income': 60
                },
                '59bbc4182052a716c3ce7588': {'sourcename':'2N-W', 'x':4, 'y':26, 'target_x': 3, 'target_y': 26, 'steps':64, 'capacity': 3000, // really 'steps':114,
                    'assigned': {'c30harvester': 1, 'hauler': 2}, 'link_from': '59d850539212a60b7683ce93', 'link_to': '59d84a28947f701c72c375a7', 
                    'expected_income': 50
                },
                'reserver': {'sourcename':'2N-R', 'x':4, 'y':26,
                    'assigned': {'reserver': 1},
                    'expected_income': 40
                }
            }
        },
        
        // 3rd base
        'W51S14': {
            'roomname' : '3',
            'spawns_from': 'Spawn3',
            'sources': {
                '59bbc4172052a716c3ce757d': {'sourcename': '3-W', 'x':31, 'y':15,
                    'assigned': {'bharvester': 2},
                    'expected_income': 85
                },
                '59bbc4172052a716c3ce757c': {'sourcename': '3-E', 'x':42, 'y':13,
                    'assigned': {'bharvester': 2},
                    'expected_income': 90
                }
            },
            'safespot': {'x': 31, 'y':30 }
        },
        // 3rd base remote mining
        'W51S13': {
            'roomname' : '3N',
            'spawns_from': 'Spawn3',
            'sources': {
                '59bbc4172052a716c3ce757a': {'sourcename': '3N', 'x':34, 'y':33, 'target_x': 33, 'target_y': 34, 'steps':36, 
                    'assigned': {'c15harvester': 1, 'hauler': 1},
                    'expected_income': 80
                }
            }
        },
        'W51S15': {
            'roomname' : '3S',
            'spawns_from': 'Spawn3',
            'sources': {
                '59bbc4172052a716c3ce7580': {'sourcename': '3S-W', 'x':14, 'y':3, 'target_x': 14, 'target_y': 2, 'steps':43, 
                    'assigned': {'c30harvester': 1, 'hauler': 2}, // 'c15harvester': 1, 'hauler': 1
                    'expected_income': 70
                },
                '59bbc4172052a716c3ce7582': {'sourcename': '3S-E', 'x':36, 'y':16, 'target_x': 35, 'target_y': 15, 'steps':66, 
                    'assigned': {'c30harvester': 1, 'hauler': 2}, // 'c15harvester': 1, 'hauler': 1
                    'expected_income': 60
                },
                'reserver': {'sourcename':'3S-R', 'x':20, 'y':15,
                    'assigned': {'reserver': 1},
                    'expected_income': 40
                }
            }
        },
        // 3rd base (planned)

        /*
        'W52S17': {
            'roomname' : '3',
            'ignoreattacks': 1,
            'spawns_from': 'Spawn1',
            'sources': {
                '59bbc4062052a716c3ce7404': {'sourcename': '3-N', 'x':10, 'y':19,
                    'assigned': {},
                    'expected_income': 1
                },
                '59bbc4062052a716c3ce7406': {'sourcename': '3-S', 'x':21, 'y':31,
                    'assigned': {},
                    'expected_income': 1
                }
            }
        },

        // 3rd base expansions (planned)
        'W52S16': {
            'ignoreattacks': 1,
            'spawns_from': 'Spawn1',
            'sources': {
                '59bbc4062052a716c3ce7401': {'sourcename': '3N-E', 'x':45, 'y':26,
                    'assigned': {},
                    'expected_income': 1
                },
                '59bbc4062052a716c3ce7402': {'sourcename': '3N-W', 'x':8, 'y':44,
                    'assigned': {},
                    'expected_income': 1
                }
            }
        },
        
        'W51S15': {
            'ignoreattacks': 1,
            'spawns_from': 'Spawn1',
            'sources': {
                '59bbc4172052a716c3ce7582': {'sourcename': '4S-E', 'x':36, 'y':16,
                'assigned': {},
                'expected_income': 1
                }
            }
        },*/

        
        // GUARDIAN north 
        'W56S17': {
            'ignoreattacks': 1,
            'spawns_from': 'Spawn1',
            'sources': {
                '59bbc3c92052a716c3ce6c42': {'sourcename': 'GN-N', 'x':24, 'y':29,
                    'assigned': {}, // 'drainer': 0
                    'expected_income': 90
                },
                '59bbc3c92052a716c3ce6c44': {'sourcename': 'GN-S', 'x':35, 'y':42,
                    'assigned': {},
                    'expected_income': 1
                }
            }
        },  

        // GUARDIAN north STAGING EAST
        'W55S17': {
            'ignoreattacks': 1,
            'spawns_from': 'Spawn4',
            'sources': {
                '59bbc3da2052a716c3ce6e76': {'sourcename': 'GNS-N', 'x':45, 'y':21,
                    'assigned': {'boss': 1}, // 'siegefar': 3, 'rogue' : 0
                    'expected_income': 90
                },
                '59bbc3da2052a716c3ce6e77': {'sourcename': 'GNS-S', 'x':29, 'y':40,
                    'assigned': {},
                    'expected_income': 1
                }
            }
        }, 
        // GUARDIAN home / south
        'W56S18': {
            'ignoreattacks': 1,
            'spawns_from': 'Spawn4',
            'sources': {
                '59bbc3c92052a716c3ce6c47': {'sourcename': 'G-N', 'x':31, 'y':30,
                    'assigned': {}, // 'drainer': 66
                    'expected_income': 1
                },
                '59bbc3c92052a716c3ce6c48': {'sourcename': 'G-S', 'x':35, 'y':39,
                    'assigned': {},
                    'expected_income': 1
                }
            }
        }, 
        // GUARDIAN WEST OF HOME
        'W57S18': {
            'ignoreattacks': 1,
            'spawns_from': 'Spawn4',
            'sources': {
                '59bbc3c92052a716c3ce6c47': {'sourcename': 'G-N', 'x':31, 'y':30,
                    'assigned': {}, // 'drainer': 66
                    'expected_income': 1
                },
                '59bbc3c92052a716c3ce6c48': {'sourcename': 'G-S', 'x':35, 'y':39,
                    'assigned': {},
                    'expected_income': 1
                }
            }
        },
        // GUARDIAN SOUTH STAGING EAST
        'W55S18': {
            'ignoreattacks': 1,
            'spawns_from': 'Spawn4',
            'sources': {
                '59bbc3db2052a716c3ce6e79': {'sourcename': 'GSS-N', 'x':9, 'y':3,
                    'assigned': {'boss': 0},
                    'expected_income': 90
                }
            }
        },
        // DARN WOLFE NORTH BASE
        'W53S11': {
            'ignoreattacks': 1,
            'spawns_from': 'Spawn3',
            'sources': {
                '59e117760a70e4046c980872': {'sourcename': 'XN', 'x':23, 'y':25,
                    'assigned': {'ninjaheals': 0, 'wizard': 0},
                    'expected_income': 60
                }
            }
        }
        
         
       
    }

// rule: must have  1 move part for 1 every other part, or 2 every other parts if creep uses roads exclusively
empire_workers = {
	'upgclose': { 'body': [WORK, WORK, CARRY, MOVE] },
	'upgfar': { 'body': [WORK, CARRY, MOVE] },
	'remoteupgrader': { 'body': [WORK, CARRY, MOVE, MOVE] },
	'remoteconstructor': { 'body': [WORK, CARRY, CARRY, MOVE, MOVE] },

	'harvester': { 'body': [WORK, CARRY, MOVE] },
	'bharvester': { 'body': [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 'noresizing': 1 }, // takes 6 WORK units to deplete a c30 vein. These have 4. So you need 2 per base, allowing some refill time.
	'c15harvester': { 'body': [WORK, WORK, WORK, CARRY, MOVE, MOVE], 'noresizing': 1 },
	'c30harvester': { 'body': [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE], 'noresizing': 1 },
	'hauler': { 'body': [WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], 'noresizing': 1 },

	'extractor': { 'body': [WORK, WORK, CARRY, CARRY, MOVE, MOVE] },
	'scavenger': { 'body': [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], 'noresizing': 1, 'renew_allowed': 0 },
	'bigscavenger': { 'body': [CARRY, MOVE] },
	'builder': { 'body': [WORK, CARRY, MOVE] },
	'builderstorage': { 'body': [WORK, WORK, CARRY, CARRY, MOVE, MOVE], 'renew_allowed': 0 }, // full speed on roads
	'upgraderstorage': { 'body': [WORK, WORK, CARRY, MOVE], 'renew_allowed': 0 },  // halfspeed on roads, quarter speed offroad

    // MILITARY CREEP DESIGN RULES:
    // 1. all NPC invaders have 1:1 move speed offroad, 2/3 (4/6 counting RCL>=4 invaders) have a ranged attack, and another 1/3rd have ranged heals. Thus creeps MUST have 1:1 movespeed. If they do not, they might get kited.
    // 2. costs are ATTACK:80, RANGED_ATTACK:150, HEAL:250. ATTACK also has power 30, RANGED_ATTACK 10 and HEAL 12. Thus in MOST situations ATTACK is clearly preferable to all other options, as it is both cheapest AND strongest.
    // 3. notably, TOUGH only costs ***TEN*** energy (60 with MOVE), so its worthwhile to put TOUGH parts on everything. The only question is: how many.
    
    // Anti-invader defense classes.
    'slasher': { 'body':    [TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK], 'noresizing': 1, 'renew_allowed': 0 }, // $380, 800 HP, 60 DPS. Bread-and-butter defender, should be able to take most RCL<4 invaders by itself.
	'rogue': { 'body':    [TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK], 'noresizing': 1, 'renew_allowed': 0}, // $640, 1,200 HP, 120 DPS. Capable of out-damaging a RCL<4 healer.
    'ninja': { 'body':    [TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK], 'noresizing': 1, 'renew_allowed': 0}, // $900, 1,600 HP, 180 DPS. 
    'ninjaheals': { 'body':    [TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, HEAL], 'noresizing': 1, 'renew_allowed': 0}, // $1050, 1,800 HP, 180 DPS. 
    'dragon': { 'body':    [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, HEAL, HEAL], 'noresizing': 1, 'renew_allowed': 0},
    'siegedragon': { 'body':    [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK], 'noresizing': 1, 'renew_allowed': 0},
    // This one breaks my normal philosophy, as it is slow (1/2 movement speed) and expensive ($1390) and only suitable for RCL+ rooms. However, it has 2,100 HP, deals 360 DPS/tick, and self-heals for 24/tick.
    'boss': { 'body':    [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, 
                          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                          ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
                          HEAL, HEAL, HEAL], 'noresizing': 1, 'renew_allowed': 0},
    
    // Anti-player defense classes
	'wizard': { 'body':   [MOVE, RANGED_ATTACK], 'renew_allowed': 0}, // horrificly expensive anti-crowd unit
	'healer': { 'body':   [MOVE, HEAL, HEAL], 'renew_allowed': 0}, // extremely expensive healer.

    // Anti-player ATTACK classes
	'siege': { 'body': [MOVE, ATTACK, ATTACK], 'renew_allowed': 0}, // half speed, strong but slow
	'siegemini': { 'body': [MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK], 'noresizing': 1, 'renew_allowed': 0}, // half speed, strong but slow
	'siegefar': { 'body': [MOVE, ATTACK], 'renew_allowed': 0}, // super-basic, but 1:1 move speed even on untiled surfaces.
	'drainer': { 'body': [MOVE], 'noresizing': 1, 'renew_allowed': 0}, // ultra-cheap unit used to drain enemy towers.
	'drainerhealer': { 'body': [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL], 'noresizing': 1, 'renew_allowed': 0}, // ultra-cheap unit used to drain enemy towers.

    // Territory control classes
	'reserver' : { 'body': [CLAIM, CLAIM, MOVE, MOVE], 'noresizing': 1, 'renew_allowed': 0 },
	'claimer': { 'body': [CLAIM, MOVE], 'noresizing': 1, 'renew_allowed': 0 },

    // Base maint/defense classes.
	'teller': { 'body': [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], 'noresizing': 1, 'renew_allowed': 0},
	'teller-towers': { 'body': [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], 'noresizing': 1, 'renew_allowed': 0 }
}

global.UNIT_COST = (body) => _.sum(body, p => BODYPART_COST[p]);
global.CREEP_COST = (body) => _.sum(body, p => BODYPART_COST[p.type])
global.CARRY_PARTS = (capacity, steps) => Math.ceil(capacity / ENERGY_REGEN_TIME * 2 * steps / CARRY_CAPACITY);
global.CONSTRUCT_HAULER_BODY = function (roomid, sourceid, max_cost) {
    var sourcecapacity = 1500;
    var steps = 100;
    if (empire[roomid] != undefined) {
        if (empire[roomid].sources != undefined) {
            if (empire[roomid].sources[sourceid] != undefined) {
                if (empire[roomid].sources[sourceid]['capacity'] != undefined) {
                    sourcecapacity = empire[roomid].sources[sourceid]['capacity'];
                }
                if (empire[roomid].sources[sourceid]['steps'] != undefined) {
                    steps = empire[roomid].sources[sourceid]['steps'];
                }
            } else {
                console.log('Warning: CONSTRUCT_HAULER_BODY is creating a hauler for room ' + roomid + ' using a source that does not exist: ' + sourceid);
            }
        } else {
            console.log('Warning: CONSTRUCT_HAULER_BODY is creating a hauler for a room with no sources in its empire definition: ' + roomid);
        }
    } else {
        console.log('Warning: CONSTRUCT_HAULER_BODY is creating a hauler for a room not defined in empire: ' + roomid);
    }
    //console.log('S: ' + sourcecapacity + ' Y: ' + steps);
    var carry_parts = global.CARRY_PARTS(sourcecapacity, steps);
    var partlist = [WORK, MOVE];
    for (var i = 0; i < Math.floor(carry_parts / 2); i++) {
        if ((UNIT_COST(partlist) + UNIT_COST([CARRY, CARRY, MOVE])) > max_cost) {
            console.log('Trying to build a hauler of ' + ((carry_parts / 2) - i) + ' bigger size than our spawner allows. Capping it.');
            break;
        }
        partlist.push(CARRY);
        partlist.push(CARRY);
        partlist.push(MOVE);
    }
    return partlist;
}

global.CONSTRUCT_RESERVER_BODY = function (resticksremaining) {
    if (resticksremaining > 2000) {
        return [MOVE, CLAIM];
    } else {
        return [MOVE, MOVE, CLAIM, CLAIM];
    }
}

global.MEMORY_ROLE = 'role';
global.MEMORY_SOURCE = 'source';
global.MEMORY_HOME = 'home';
global.MEMORY_DEST = 'target';
global.MEMORY_DEST_X = 'target_x';
global.MEMORY_DEST_Y = 'target_y';
global.MEMORY_NEXTDEST = 'nextdest'
global.MEMORY_SPAWNERNAME = 'spawnername';
global.MEMORY_RENEW = 'renew_allowed';
global.MEMORY_RENEWALS = 'renewals';
global.MEMORY_CREATED_AT = 'created_at';
global.MEMORY_NEEDED = 'needed';
global.MEMORY_JOB = 'job';
global.MEMORY_CONTAINER = 'container';
global.MEMORY_EARNINGS = 'earnings';
global.MEMORY_JOURNEYSTART = 'journeystart';
global.MEMORY_ATTACKEDIN = 'attackedin'
global.MEMORY_RALLYROOM = 'rallyroom';

global.JOB_HARVEST = 'mine';
global.JOB_BUILD = 'build';
global.JOB_GFS = 'gfs';
global.JOB_PATROL = 'patrol';
global.JOB_RENEW = 'renew';
global.JOB_REPAIR = 'repair';
global.JOB_RETURN = 'return';
global.JOB_SCAVENGE = 'clean';
global.JOB_UPGRADE = 'upgrade';
global.JOB_TRAVEL_OUT = 'go-out';
global.JOB_TRAVEL_BACK = 'go-back';
global.JOB_IDLE = 'idle';
global.JOB_EXTRACT ='extract';
global.JOB_STOREMINERALS = 'storeminerals';
global.JOB_USELINK = 'uselink'
global.JOB_HIDE = 'hide';

global.COLOR_HARVEST = '#ffffff';
global.COLOR_BUILD = '#0000ff';
global.COLOR_REPAIR = '#0000ff';
global.COLOR_PATROL = '#ff0000';
global.COLOR_DROPOFF = '#ffff00';
global.COLOR_GFS = '#ffff00';
global.COLOR_RENEW = '#ff00ff';
global.COLOR_SCAVAGE = '#000000';

Creep.prototype.announceJob = function() {
    if(this.memory[MEMORY_JOB] == undefined) {
        console.log('WARN: ' + this.name + ' has no job!');
        return -1;
    }
    this.say(this.memory[MEMORY_JOB]);
}

Creep.prototype.setupMemory = function() {
    if(this.memory[MEMORY_CREATED_AT] == undefined) {
        this.memory[MEMORY_CREATED_AT] = Game.time;
        //console.log('WARN: ' + this.name + ' has no created_at! Setting it to inital value of game time: ' + this.memory[MEMORY_CREATED_AT]);
    }
}

Creep.prototype.adjustEarnings = function(deposit) {
    if(this.memory[MEMORY_EARNINGS] == undefined) {
        this.memory[MEMORY_EARNINGS] = CREEP_COST(this.body) * -1;
        //console.log('WARN: ' + this.name + ' has no earnings! Setting it to inital value of creep cost: ' + this.memory[MEMORY_EARNINGS]);
    }
    this.memory[MEMORY_EARNINGS] = this.memory[MEMORY_EARNINGS] + deposit;
    if(this.memory[MEMORY_CREATED_AT] == undefined) {
        this.memory[MEMORY_CREATED_AT] = Game.time;
        //console.log('WARN: ' + this.name + ' has no created_at! Setting it to inital value of game time: ' + this.memory[MEMORY_CREATED_AT]);
    }
}

Creep.prototype.getEarnings = function() {
    this.adjustEarnings(0); 
    return (this.memory[MEMORY_EARNINGS]); 
}

Creep.prototype.getTicksAlive = function() {
    this.adjustEarnings(0); 
    return (Game.time - this.memory[MEMORY_CREATED_AT]);
}

Creep.prototype.getEarningsPerTick = function() {
    this.adjustEarnings(0); // to ensure they're defined.
    return (this.getEarnings() / this.getTicksAlive()); 
}

Creep.prototype.disableRenew = function() {
    this.memory[MEMORY_RENEW] = 0;
}

Creep.prototype.getRenewEnabled = function() {
    if (this.memory[MEMORY_RENEW] == 0) {
        return 0;
    }
    return 1;
}

Creep.prototype.getShouldHide = function() {
    if (this.memory.home == this.memory.target) {
        return 0;
    }
    if (this.memory.attackedin != undefined) {
        if (this.memory.attackedin in Memory['sectors_under_attack']) {
            return 1;
        }
    }
    if (this.room.name in Memory['sectors_under_attack']) {
        this.memory.attackedin = this.room.name;
        return 1;        
    }

    return 0;
}


Room.prototype.getMyStructuresCount = function() {
    var mystructures = this.find(FIND_MY_STRUCTURES);
    var mywalls = this.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_WALL } } );
    return mystructures.length + mywalls.length;
}

StructureTower.prototype.getPowerForRange = function(initialpower, dist) {
    var expected_effect = initialpower;
    if (dist > TOWER_OPTIMAL_RANGE) {
        if (dist > TOWER_FALLOFF_RANGE) {
            dist = TOWER_FALLOFF_RANGE;
        }
        expected_effect -= expected_effect * TOWER_FALLOFF * (dist - TOWER_OPTIMAL_RANGE) / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE);
    }
    return Math.floor(expected_effect);
}

StructureTower.prototype.getRepairMax = function() {
    var lvl = this.room.controller.level;
    if (lvl == 2) {
        return 1000;
    } else if (lvl == 3) {
        return 5000;
    } else if (lvl == 4) {
        return 10000;
    } else {
        return 10000 * lvl;
    }
}

Creep.prototype.getRepairMax = function() {
    if (this.room.controller == undefined) {
        return 0;
    }
    var lvl = this.room.controller.level;
    if (lvl == 2) {
        return 1000;
    } else if (lvl == 3) {
        return 5000;
    } else if (lvl == 4) {
        return 10000;
    } else {
        return 50000 * lvl;
    }
}

global.REPORT_EARNINGS = function() {
    for (var cr in Game.creeps) {
        var earnings = Game.creeps[cr].getEarnings(); 
        var ept = Math.round(Game.creeps[cr].getEarningsPerTick()); 
        var tal = Game.creeps[cr].getTicksAlive();
        if (!Game.creeps[cr].getRenewEnabled()) {
            var projected_life_cost = global.CREEP_COST(Game.creeps[cr].body) * -1;
            ept = projected_life_cost / 1500;
            //console.log('CREEP ' + cr + ' HAS PLC: ' + projected_life_cost + ' and EPT: ' + ept);
        }
        if (Game.creeps[cr].memory[MEMORY_SOURCE] == undefined) {
            console.log('CREEP ' + cr + ' HAS NO SOURCE');
            continue;
        }
        if (Game.creeps[cr].memory[MEMORY_DEST] == undefined) {
            console.log('CREEP ' + cr + ' HAS NO TARGET');
            continue;
        }
        if (empire[Game.creeps[cr].memory[MEMORY_DEST]] == undefined) {
            // target not in our empire.
            continue;
        }
        if (Game.creeps[cr].memory[MEMORY_SOURCE] == '') {
            continue;
        }
        if (empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]] == undefined) {
            console.log(cr + ': SOURCE ' + Game.creeps[cr].memory[MEMORY_SOURCE] + ' IS MISSING FROM EMPIRE DEFINITION.');
            Game.creeps[cr].disableRenew();
            continue;
        }
        if (empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]]['sourcename'] == undefined) {
            console.log('CREEP ' + cr + ' HAS NO SOURCENAME FOR SOURCE: ' + creep.memory.source);
            Game.creeps[cr].disableRenew();
            continue;
        }
        console.log('Creep ' + cr + ' working on ' + empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]]['sourcename'] + ' has earned ' + ept + ' energy per tick over its ' + tal + ' tick lifespan, ' + earnings + ' energy in total.'); 
    }
}

global.REPORT_EARNINGS_SOURCES = function() {
    for (var cr in Game.creeps) {
        var earnings = Game.creeps[cr].getEarnings(); 
        var ept = Math.round(Game.creeps[cr].getEarningsPerTick()); 
        var tal = Game.creeps[cr].getTicksAlive();

        if (Game.creeps[cr].memory[MEMORY_SOURCE] == undefined) {
            console.log('CREEP ' + cr + ' HAS NO SOURCE');
            continue;
        }
        if (Game.creeps[cr].memory[MEMORY_DEST] == undefined) {
            console.log('CREEP ' + cr + ' HAS NO TARGET');
            continue;
        }
        if (empire[Game.creeps[cr].memory[MEMORY_DEST]] == undefined) {
            // target not in our empire.
            continue;
        }
        if (empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]] == undefined) {
            console.log(cr + ': SOURCE ' + Game.creeps[cr].memory[MEMORY_SOURCE] + ' IS MISSING FROM EMPIRE DEFINITION.');
            Game.creeps[cr].disableRenew();
            continue;
        }
        if (empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]]['sourcename'] == undefined) {
            console.log('CREEP ' + cr + ' HAS NO SOURCENAME FOR SOURCE: ' + creep.memory.source);
            Game.creeps[cr].disableRenew();
            continue;
        }

        if (!Game.creeps[cr].getRenewEnabled()) {
            var projected_life_cost = global.CREEP_COST(Game.creeps[cr].body) * -1;
            ept = projected_life_cost / 1500;
            //console.log('CREEP ' + cr + ' HAS PLC: ' + projected_life_cost + ' and EPT: ' + ept);
        }

        if(empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]] != undefined) {
            if (empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]]['earnings'] == undefined) {
                empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]]['earnings'] = earnings;
            } else {
                empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]]['earnings'] += earnings;
            }
            if (empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]]['ticks'] == undefined) {
                empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]]['ticks'] = tal;
            } else {
                empire[Game.creeps[cr].memory[MEMORY_DEST]].sources[Game.creeps[cr].memory[MEMORY_SOURCE]]['ticks'] += tal;
            }
        }
    }
    var rt_earnings = 0;
    var rt_ticks = 0;
    for(var rname in empire) {
        var r_earnings = 0;
        var r_ticks = 0;
        for (var sname in empire[rname].sources) {
            var earnings = empire[rname].sources[sname]['earnings'];
            if(earnings == undefined) {
                continue;
            }
            var ticks = empire[rname].sources[sname]['ticks'];
            var ept = Math.round(earnings/ticks);
            console.log('- Source ' + empire[rname].sources[sname]['sourcename'] + ' has earned ' + earnings + ' over ' + ticks + ' or EPT: ' + ept); 
            rt_earnings += earnings;
            rt_ticks += ticks;
            r_earnings += earnings;
            r_ticks += ticks;
        }
        var r_ept = Math.round(r_earnings / r_ticks);
        if (r_earnings != 0) {
            console.log(rname +' has earned ' + r_earnings + ' over ' + r_ticks + ' or EPT: ' + r_ept); 
            console.log(' ');
        }
    }
    console.log('TOTAL: ' + rt_earnings + ' over ' + rt_ticks + ' ticks, or ' + Math.round(rt_earnings/rt_ticks) + ' earnings/tick.');

}

global.REPORT_CREEPS = function(prune) {
    var roleslist = {};
    for (var cr in Game.creeps) {
        if(Game.creeps[cr].memory[MEMORY_NEEDED] == 0) {
            console.log(cr + ', doing ' + Game.creeps[cr].memory[MEMORY_JOB] + ', is not needed. Renewal: ' + Game.creeps[cr].memory[MEMORY_RENEW] + '. Expires in: ' + Game.creeps[cr].ticksToLive);
            if (prune == undefined) {
                // do nothing.
            } else if (prune == 1) {
               Game.creeps[cr].disableRenew(); 
            } else if (prune == 2) {
                Game.creeps[cr].memory[MEMORY_ROLE] = 'recycler';
            } else if (prune == 3) {
                Game.creeps[cr].suicide();
            }
        } else {
            //console.log(cr + ', doing ' + Game.creeps[cr].memory[MEMORY_JOB] + ', is needed. Renewal: ' + Game.creeps[cr].memory[MEMORY_RENEW] + '. Expires in: ' + Game.creeps[cr].ticksToLive);
        }
        if (roleslist[Game.creeps[cr].memory[MEMORY_ROLE]] == undefined) {
            roleslist[Game.creeps[cr].memory[MEMORY_ROLE]] = 1;
        } else {
            roleslist[Game.creeps[cr].memory[MEMORY_ROLE]] += 1;
        }
    }
    console.log(JSON.stringify(roleslist));
}

global.SPAWN_UNIT = function (spawnername, role, targetroomname, roompath) {
    if (Game.spawns[spawnername] == undefined) {
        console.log('No such spawner.');
        return 0;
    }
    if ( empire_workers[role] == undefined) {
        console.log('Invalid role');
        return 0;
    }
    if (roompath == undefined) {
        roompath = [];
    }
    spawncustom.process(Game.spawns[spawnername], '', empire_workers[role]['body'], role, 
                        '', targetroomname, global.UNIT_COST(empire_workers[role]['body']), 
                        Game.spawns[spawnername].room.name, 25, 
                        25, 0);
    return 'DONE';
}

global.ATTACK_WAVE = function () {
    SPAWN_UNIT('Spawn1','boss','W55S17');
    SPAWN_UNIT('Spawn4','boss','W55S17');
}


// ---------------------------
// BEGIN MAIN LOOP 
// ---------------------------

module.exports.loop = function () {

    var divisor = 3;
    if (Game.cpu.bucket < 9000) {
        console.log('Account: ' + Game.cpu.limit + ', Cycle: ' + Game.cpu.tickLimit + ', Bucket: ' + Game.cpu.bucket);
        divisor = 5;
        if (Game.cpu.bucket < 8000) {
            divisor = 10;
        }
    }
    //return;

    cleaner.process()
    for(var cr in Game.creeps) {
        Game.creeps[cr].setupMemory();
    }

    var sectors_under_attack = {};
    if(Memory['sectors_under_attack'] != undefined) {
        sectors_under_attack = Memory['sectors_under_attack'];
    };

    if(Game.time % divisor === 0) {

        // EXPANSION CONTROLLER
        
        /*
        var myusername = overlord;
        var expansiontarget = Game.rooms['W51S14'];
        var expansiontargetname = 'W51S14';
        var expansionsource = '59bbc4172052a716c3ce757c';
        var controllertarget = Game.getObjectById('59bbc4172052a716c3ce757e');
        var gcltarget = 3;
        var spawner_posx = 37;
        var spawner_posy = 17;
        // CASE 1: My GCL is too low.
        if (Game.gcl.level < gcltarget) {
            // don't do anything, reservers are pointless.
        // ERROR CHECK: controller
        } else if (controllertarget == undefined) {
            console.log('EXPAND: CONTROLLER TARGET UNDEFINED - CHECK YOU HAVE UNITS THERE.');
            empire[expansiontargetname].sources[expansionsource].assigned = {'claimer': 1, 'remoteconstructor': 4};
        // CASE 2: I can claim the room.
        } else if (controllertarget.owner['username'] != myusername) {
            console.log('EXPAND: ' + expansiontarget + ': TRYING TO CLAIM CONTROLLER ');
            empire[expansiontargetname].sources[expansionsource].assigned = {'claimer': 1, 'remoteconstructor': 4};
        // CASE 3: I have already claimed the room.
        } else {
            var has_spawn = 0;
            for (key in Game.spawns) {
                if (Game.spawns[key].room.name == expansiontargetname) {
                    has_spawn = 1;
                }
            }
            var controller_level = controllertarget.level;
            //Apparently you don't have to upgrade controllers in rooms you capture before you can place a spawn.
            //
            //if(!has_spawn && controller_level == 0) {
            //    console.log('EXPAND: ' + expansiontarget + ': UPGRADE CONTROLLER TO 1');
            //    // CASE 4: I own the room, but the controller is level 0
            //    empire[expansiontargetname].sources[expansionsource].assigned = {'remoteupgrader': 3};
            //} else 
            if (!has_spawn) {
                // CASE 5: I own the room, the controller is level 1 (can have spawn) but there is no spawn
                var csites = expansiontarget.find(FIND_MY_CONSTRUCTION_SITES);
                if(csites.length) {
                    var csite = csites[0];
                    console.log('EXPAND: ' + expansiontarget + ': WAIT FOR SPAWNER TO BE BUILT, PROGRESS: ' + csite.progress + '/' + csite.progressTotal);
                    empire[expansiontargetname].sources[expansionsource].assigned = {'claimer': 1, 'remoteconstructor': 6};
                    // we have a spawn construction site, we just need to wait for it to be built.
                } else {
                    console.log('EXPAND: ' + expansiontarget + ': CREATE SPAWNER');
                    expansiontarget.createConstructionSite(spawner_posx, spawner_posy, STRUCTURE_SPAWN);
                }
                empire[expansiontargetname].sources[expansionsource].assigned = {'remoteconstructor': 6};
            } else { 
                console.log('EXPAND: ' + expansiontarget + ': SUCCESS');
                empire[expansiontargetname].spawn_from = expansiontargetname;
                empire[expansiontargetname].sources['59bbc4172052a716c3ce757c'].assigned = {'upgrader': 3}; // 3 slots, some travel time.
                empire[expansiontargetname].sources['59bbc4172052a716c3ce757d'].assigned = {'harvester': 3}; // 4 slots, no travel time.
                // CASE 6: I own the room, and there is a spawn there.
                // SUCCESS?
            } 
        }
        */

        //console.log('Prior to divisor loop: ' + Game.cpu.getUsed());

        // ROOM MANAGER
        var timenow = Game.time;
        for(var rname in Game.rooms) {
            
            // ENERGY MANAGEMENT
            var energy_reserves = 0;
            if(Game.rooms[rname]['storage'] != undefined) {
                if (Game.rooms[rname]['storage'].store.energy > 0) {

                    energy_reserves = Game.rooms[rname]['storage'].store.energy;

                    // In case we know of an enemy room with storage.
                    if(empire[rname] == undefined) {
                        continue;
                    }
                    empire[rname].energy_reserves = energy_reserves;

                    // Adjust builders depending on unfinished projects.
                    var projectsList = Game.rooms[rname].find(FIND_MY_CONSTRUCTION_SITES);
                    if(projectsList.length > 0) {
                        if(energy_reserves > empire_defaults['room_reserves_required']) {
                            empire[rname].sources['builder'] = {'sourcename': rname + '-B', 'x':25, 'y':25, 'assigned': {}, 'expected_income': 10}
                            empire[rname].sources['builder'].assigned['builderstorage'] = 2;
                        }
                    }

                    empire[rname].sources['upgrader'] = {'sourcename': empire[rname]['roomname'] + '-U', 'x':25, 'y':25, 'assigned': {}, 'expected_income': 5}
                    
                    
                    if(energy_reserves > (empire_defaults['room_reserves_required'] * 4)) {
                        empire[rname].sources['upgrader'].assigned = {'upgraderstorage': 4};
                    } else if(energy_reserves > (empire_defaults['room_reserves_required'] * 3)) {
                        empire[rname].sources['upgrader'].assigned = {'upgraderstorage': 3};
                    } else if(energy_reserves > (empire_defaults['room_reserves_required'] * 2)) {
                        empire[rname].sources['upgrader'].assigned = {'upgraderstorage': 2};
                    } else if(energy_reserves > empire_defaults['room_reserves_required']) {
                        empire[rname].sources['upgrader'].assigned = {'upgraderstorage': 1};
                    }     
                    
                    //console.log(rname +': ' + energy_reserves +' v ' + empire_defaults['room_reserves_required'] + ' hence ' + empire[rname].sources['upgrader'].assigned['upgraderstorage']);
                    
                }
            }
            
            // ENERGY AVAILABILITY MANAGEMENT
            if(Game.rooms[rname].energyCapacityAvailable > 0) {
                if (Game.rooms[rname].memory == undefined) {
                    Game.rooms[rname].memory = {};
                }
                if (Game.rooms[rname]['storage'] == undefined) {
                    continue;
                }
                var rmem = Game.rooms[rname].memory;
                var max_history = empire_defaults['room_history_ticks'];
                if (rmem['energyhistory'] == undefined) {
                    rmem['energyhistory'] = [];
                }
                if (rmem['energyhistory'].length >= max_history) {
                    rmem['energyhistory'].pop();
                }
                rmem['energyhistory'].unshift(Game.rooms[rname].energyAvailable);
                var e_hist_total = 0;
                for (var i = 0; i < rmem['energyhistory'].length; i++) {
                    e_hist_total += rmem['energyhistory'][i];
                }
                var e_hist_avg = Math.round(e_hist_total / rmem['energyhistory'].length);
                var e_hist_avg_pc = Math.round(e_hist_avg / Game.rooms[rname].energyCapacityAvailable * 100);
                if (e_hist_avg_pc < empire_defaults['room_minimum_energy_pc']) {
                    var rhid = empire[rname]['roomname'];
                    var mysname = rhid + '-T';
                    if(empire[rname].sources[mysname] == undefined) {
                        empire[rname].sources[mysname] = { 'sourcename': mysname, 'x':20, 'y':20, 'assigned': {}, 'expected_income': 100 }
                    }
                    if (e_hist_avg_pc < empire_defaults['room_crit_energy_pc']) {
                        empire[rname].sources[mysname].assigned['teller'] = 2;
                        console.log(rname + ' requires 2x teller: ' + e_hist_avg_pc + ' < ' + empire_defaults['room_minimum_energy_pc']);
                    } else {
                        empire[rname].sources[mysname].assigned['teller'] = 1;
                        console.log(rname + ' requires a teller: ' + e_hist_avg_pc + ' < ' + empire_defaults['room_minimum_energy_pc']);
                    }
                    
                } else { 
                    //console.log(rname + ' no requires a teller: ' + e_hist_avg_pc + ' > ' + empire_defaults['room_minimum_energy_pc']);
                }
                Game.rooms[rname].memory = rmem;
            }
            
            // SCAVENGER MANAGEMENT
            if(Game.rooms[rname].energyCapacityAvailable > 0) {
                var dropped_resources = Game.rooms[rname].find(FIND_DROPPED_RESOURCES, {filter: (s) => s.energy > 0});
                if (dropped_resources.length > 0) {
                    var energy_on_ground = 0;
                    for (var i = 0; i < dropped_resources.length; i++) {
                        energy_on_ground += dropped_resources[i].energy;
                    }
                    if (energy_on_ground > (1.5 * UNIT_COST(empire_workers['scavenger']['body']))) {
                        var rhid = empire[rname]['roomname'];
                        var mysname = rhid + '-scavenger';
                        if(empire[rname].sources[mysname] == undefined) {
                            empire[rname].sources[mysname] = { 'sourcename': mysname, 'x':20, 'y':20, 'assigned': {}, 'expected_income': 90 }
                        }
                    empire[rname].sources[mysname].assigned['scavenger'] = 1;
                    }
                }
            }
            
            // MINERAL MANAGEMENT
            if(empire[rname] != undefined) {
                if (empire[rname]['mineralid'] != undefined) {
                    var mineralpatch = Game.getObjectById(empire[rname]['mineralid'])
                    if (mineralpatch) {
                        if (mineralpatch.mineralAmount > 0) {
                            var rhid = empire[rname]['roomname'];
                            var mysname = rhid + '-mining';
                            if(empire[rname].sources[mysname] == undefined) {
                                empire[rname].sources[mysname] = { 'sourcename': mysname, 'x':20, 'y':20, 'assigned': {}, 'expected_income': 50 }
                            }
                            empire[rname].sources[mysname]['assigned'] = {'extractor': 1}
                            //console.log('ASSIGNED EXTRACTOR FOR '+ rname);
                        }
                    }
                }
            }

            // DEFCON MANAGEMENT
            var enemiesList = Game.rooms[rname].find(FIND_HOSTILE_CREEPS);
            var enemiesCost = 0;
            var attacker_username = 'Invader';
            if(enemiesList.length) {
                for(var i = 0; i < enemiesList.length; i++) {
                    enemiesCost += global.CREEP_COST(enemiesList[i].body);
                    if (enemiesList[i].owner != undefined) {
                        if (enemiesList[i].owner.username != undefined) {
                            if (enemiesList[i].owner.username != attacker_username) {
                                attacker_username = enemiesList[i].owner.username;
                            }
                        }
                    }
                }
                if(empire[rname] == undefined) {
                    //console.log('ATTACK: cannot do anything about enemies in a non-empire sector: ' + rname);
                    continue;
                } else if (empire[rname]['ignoreattacks'] != undefined) {
                    continue;
                }
                console.log('ALERT: ' + Game.rooms[rname].name + ' has ' + enemiesList.length + ' enemies, worth body cost: ' + enemiesCost + '!'); 
                if(sectors_under_attack[Game.rooms[rname].name] == undefined) {
                    console.log('ATTACK: NEW ATTACK DETECTED: ' + Game.rooms[rname].name);
                    sectors_under_attack[Game.rooms[rname].name] = {}
                    sectors_under_attack[Game.rooms[rname].name]['attackstart'] = timenow;
                    sectors_under_attack[Game.rooms[rname].name]['mystructures'] = Game.rooms[rname].getMyStructuresCount();
                    sectors_under_attack[Game.rooms[rname].name]['attacker_username'] = attacker_username;
                    var texits = Game.map.describeExits(rname);
                    var exit_arr = []
                    for (var ex in texits) {
                        exit_arr.push(texits[ex]);
                    }
                    for (var tc in Game.creeps) {
                        if(!exit_arr.includes(Game.creeps[tc].room.name)) { // if they aren't next door, skip them.
                            continue;
                        }
                        if(Game.creeps[tc].memory[MEMORY_ROLE] == undefined) {
                            continue;
                        }
                        if (!empire_defaults['military_roles'].includes(Game.creeps[tc].memory[MEMORY_ROLE])) {
                            continue;
                        }
                        var theirEnemies = Game.creeps[tc].room.find(FIND_HOSTILE_CREEPS);
                        if (theirEnemies.length) {
                            continue;
                        }
                        Game.creeps[tc].memory[MEMORY_DEST] = rname;
                        console.log('REASSIGN: sent ' + Game.creeps[tc].name + ' to defend' + rname);
                    }
                }
                sectors_under_attack[Game.rooms[rname].name]['time'] = timenow;
                sectors_under_attack[Game.rooms[rname].name]['threat'] = enemiesCost;
                sectors_under_attack[Game.rooms[rname].name]['enemycount'] = enemiesList.length;
                if(attacker_username != 'Invader') {
                    Game.notify('NON-NPC ATTACK! ' + rname + ': ' + JSON.stringify(sectors_under_attack[Game.rooms[rname].name]));
                }
            } else if(sectors_under_attack[Game.rooms[rname].name] != undefined) {
                sectors_under_attack[Game.rooms[rname].name]['threat'] = 0;
                sectors_under_attack[Game.rooms[rname].name]['enemycount'] = 0;
            }
        }
        for(var csector in sectors_under_attack) {
            var end_attack_now = 0;
            if( empire[csector] == undefined ) {
                console.log('ATTACK: sectors_under_attack: empire/' + csector + ' is undefined. DELETING ATTACK ALERT IN THAT SECTOR!');
                delete sectors_under_attack[csector];
                continue;
            }
            var tgap = timenow - sectors_under_attack[csector]['time'];
            if(sectors_under_attack[csector]['enemycount'] == 0) {
                console.log('ATTACK: ENDS (ENEMY WIPED OUT): ' + csector + ' in ' + (timenow - sectors_under_attack[csector]['attackstart']) + ' ticks.');
                end_attack_now = 1;
            } else if(tgap >= empire_defaults['alerts_duration']) {
                console.log('ATTACK: OLD ENDS: ' + csector + ' at ' + tgap + ' seconds since last detection.');
                end_attack_now = 1;
            }
            if (end_attack_now) {
                delete sectors_under_attack[csector];
                if(empire_defaults['alerts_recycle'] == 1) {
                    for(var name in Game.creeps) {
                        if(Game.creeps[name].memory.target == csector && (empire_defaults['military_roles'].includes(Game.creeps[name].memory[MEMORY_ROLE]))) {
                            Game.creeps[name].memory[MEMORY_ROLE] = 'recycler';
                            Game.creeps[name].say('🔄 recycle');
                            console.log('RECYCLE: ' + name + ' due to it being part of sector defense forces for a sector that is no longer under attack.');
                        }
                    }
                } else if (empire_defaults['alerts_reassign'] != undefined) {
                    if (empire_defaults['alerts_reassign'] != '') {
                        for(var name in Game.creeps) {
                            if(Game.creeps[name].memory.target == csector && (empire_defaults['military_roles'].includes(Game.creeps[name].memory[MEMORY_ROLE]))) {
                                Game.creeps[name].memory.target = empire_defaults['alerts_reassign'];
                            }
                        }
                    }
                }
            } else {

                if (empire[csector] == undefined) {
                    console.log('ERROR: attack csector: ' + csector + ' is undefined.');
                    continue;
                }

                if (Game.rooms[csector] != undefined) {
                    var enemiesList = Game.rooms[csector].find(FIND_HOSTILE_CREEPS);
                    var enemiesCost = 0;
                    var attacker_username = 'Invader';
                    if(enemiesList.length) {
                        for(var i = 0; i < enemiesList.length; i++) {
                            var ebody = enemiesList[i].body;
                            
                            enemiesCost += global.CREEP_COST(enemiesList[i].body);
                            if (enemiesList[i].owner != undefined) {
                                if (enemiesList[i].owner.username != undefined) {
                                    if (enemiesList[i].owner.username != attacker_username) {
                                        attacker_username = enemiesList[i].owner.username;
                                    }
                                }
                            }
                        }
                    }
                }

                var baseforce = {};
                var patrolforce = {};
                var room_has_spawn = 0;
                for (var thisspawn in Game.spawns) {
                    if (Game.spawns[thisspawn].room.name == csector) {
                        room_has_spawn = 1;
                    }
                }
                var towercount = 0;
                if (Game.rooms[csector] != undefined) {
                    var towerlist = Game.rooms[csector].find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } } );
                    towercount = towerlist.length;
                }

                if(room_has_spawn) {
                    var newcount = Game.rooms[csector].getMyStructuresCount();
                    var oldcount = sectors_under_attack[Game.rooms[csector].name]['mystructures'];
                    if (newcount < oldcount) {
                        var cc = Game.rooms[csector].controller;
                        if (cc.safeModeAvailable) {
                            cc.activateSafeMode();
                            Game.notify('SAFEMODE ACTIVATION DUE TO STRUCTURE LOSS: ' + rname + ': ' + JSON.stringify(sectors_under_attack[Game.rooms[csector].name]));
                            console.log('SAFE MODE ACTIVATED: ATTACK: ' + csector + ' only has ' + newcount + ' structures versus original count of ' + oldcount + '!');
                        } else {
                            Game.notify('CANNOT ACTIVATE SAFEMODE DESPITE STRUCTURE LOSS: ' + rname + ': ' + JSON.stringify(sectors_under_attack[Game.rooms[csector].name]));
                            console.log('SAFE MODE UNAVAILABLE: ATTACK: ' + csector + ' only has ' + newcount + ' structures versus original count of ' + oldcount + '!');
                        }
                    }
                }

                //rogue (640), ninja (900), dragon(1390)
                var theirthreat = sectors_under_attack[csector]['threat'];
                if (towercount > 0) {
                    theirthreat -= (400 * towercount);
                    baseforce['teller-towers'] = 1;
                    if (theirthreat > 8000) {
                        baseforce['teller'] = 1;
                    }
                }

            
                if (empire[csector]['spawns_from'] == undefined) {
                    console.log('ATTACK CONFIG WARNING, SECTOR ' + csector + ' HAS NO SPAWNS_FROM SET ON ITS ROOM!');
                    patrolforce['rogue'] = 1; // the sad default.
                } else if (theirthreat > 0) {
                    //console.log('XAT: Deciding what to spawn for the ' + theirthreat + ' attack on ' + csector);
                    var spawner = Game.spawns[empire[csector]['spawns_from']];
                    var enow = spawner.room.energyAvailable;
                    var emax = spawner.room.energyCapacityAvailable;
                    for (var i = 0; i < empire_defaults['defense_roles'].length; i++) {
                        var oname = empire_defaults['defense_roles'][i];
                        //console.log('checking cost for' + oname);
                        var obody = empire_workers[oname]['body'];
                        var outfit_cost = global.UNIT_COST(obody);
                        if (outfit_cost > emax) {
                            //console.log('XAT: No point using ' + oname + ' as it exceeds our spawn power ' + emax);
                            // no point using this... we can't possibly afford it.
                            continue;
                        }
                        if (outfit_cost > theirthreat) {
                            //console.log('XAT: No point using ' + oname + ' as it exceeds their threat ' + theirthreat);
                            continue; // overkill...
                        }
                        if (patrolforce[oname] == undefined) {
                            if (i == empire_defaults['defense_roles'].length && theirthreat > (outfit_cost * 2)) {
                                patrolforce[oname] = 2;
                            } else {
                                patrolforce[oname] = 1;
                            }
                        } else {
                            patrolforce[oname] += 1;
                        }
                        theirthreat -= outfit_cost;
                        //console.log('XAT: Using ' + oname + ' (cost: ' + outfit_cost + ') to match their threat, it is now: ' + theirthreat);
                    }
                }
                /*
                if (csector == 'W51S14') {
                    patrolforce['scout'] = 1;
                // defcon 1: single invader, invasion lasting less than 3m, not very strong
                } else if (sectors_under_attack[csector]['threat'] < 3000 && (timenow - sectors_under_attack[csector]['attackstart']) < 180 && sectors_under_attack[csector]['enemycount'] == 1) {
                    if (room_has_spawn) {
                        baseforce['teller-towers'] = 1;
                    } else {
                        patrolforce['scout'] = 2;
                    }
                    empire[csector]['defcon'] = 1;
                // defcon 2: big invader, or tougher group, invasion lasting less than 6 minutes, or up to 3 enemies               
                } else if (sectors_under_attack[csector]['threat'] < 6000 && (timenow - sectors_under_attack[csector]['attackstart']) < 360 && sectors_under_attack[csector]['enemycount'] > 1 && sectors_under_attack[csector]['enemycount'] < 4) {
                    if (room_has_spawn) {
                        baseforce['teller-towers'] = 1;
                        //baseforce['teller'] = 1;
                        patrolforce['scout'] = 1;
                    } else {
                        patrolforce['adventurer'] = 2;
                    }
                    empire[csector]['defcon'] = 2;

                // defcon 3: huge invader, or tougher group, over 9 minutes
                } else if (sectors_under_attack[csector]['threat'] < 10000 && (timenow - sectors_under_attack[csector]['attackstart']) < 540) {
                    if (room_has_spawn) {
                        baseforce['teller-towers'] = 1;
                        baseforce['teller'] = 1;
                        patrolforce['guardian'] = 1;
                        patrolforce['rogue'] = 1;
                    } else {
                        patrolforce['rogue'] = 2;
                        patrolforce['guardian'] = 1;
                    }
                    empire[csector]['defcon'] = 3;

                // defcon 4: big invader, or tougher group, invasion lasting > 9 minutes 
                } else {
                    if (room_has_spawn) {
                        baseforce['teller-towers'] = 2;
                        baseforce['teller'] = 2;
                        //patrolforce['wizard'] = 1;
                        patrolforce['guardian'] = 1;
                        patrolforce['rogue'] = 1;
                    } else {
                        patrolforce['guardian'] = 1;
                        patrolforce['rogue'] = 1;
                    }
                    empire[csector]['defcon'] = 4;
                }
                */
                
                empire[csector].sources['BASEFORCE'] = {'sourcename': empire[csector]['roomname'] + '-bforce', 'x':25, 'y':25,
                    'assigned': baseforce, 'expected_income': 95}
                empire[csector].sources['PATROLFORCE'] = {'sourcename': empire[csector]['roomname'] + '-pforce', 'x':25, 'y':25,
                    'assigned': patrolforce, 'expected_income': 94}
                if (tgap > 0) {
                    //console.log('ATTACK: TIMING OUT IN: ' + csector + ', age: ' + tgap + ' DEFCON: ' + empire[csector]['defcon']);
                    console.log('ATTACK: TIMING OUT IN: ' + csector + ', age: ' + tgap);
                } else {
                    //console.log('ATTACK: HOSTILES STILL IN ' + csector + '! 'DEFCON: ' + empire[csector]['defcon']');
                    //console.log('ATTACK: HOSTILES STILL IN ' + csector + '! ');
                }
            }
        }
        Memory['sectors_under_attack'] = sectors_under_attack;

        // SPAWNING MANAGER
        for (var rname in empire) {
            empire[rname].living = {};
        }
        var spawner_parts = {};
        for(var name in Memory.creeps) {
            Game.creeps[name].memory[MEMORY_NEEDED] = 0;
            if(Game.creeps[name].memory.spawner == undefined) {
                var pcount = Game.creeps[name].body.length;
                if (Game.creeps[name].memory[MEMORY_SPAWNERNAME] == undefined) {
                    console.log(name + ' has undefined spawner.');
                    continue;
                }
                if (spawner_parts[Game.creeps[name].memory[MEMORY_SPAWNERNAME]] == undefined) {
                    spawner_parts[Game.creeps[name].memory[MEMORY_SPAWNERNAME]] = pcount;
                }  else {
                    spawner_parts[Game.creeps[name].memory[MEMORY_SPAWNERNAME]] += pcount;
                }
            }
            if(Game.creeps[name].memory.source == undefined) {
                console.log('WARN: ' + Game.creeps[name] + ' in ' + Game.creeps[name].room.name + ' has no source defined.');
            }
            if(Game.creeps[name].memory[MEMORY_ROLE]) {
                myrole = Game.creeps[name].memory[MEMORY_ROLE];
                if(Game.creeps[name].memory.source != undefined) {
                    var mysource = Game.creeps[name].memory.source;
                    var myroom = Game.creeps[name].memory.target;
                    if(empire[myroom] == undefined) {
                        //console.log('WARN: ' + Game.creeps[name] + ' in ' + Game.creeps[name].room.name + ' has a room defined as target that has no empire definition.');
                        continue;
                    }
                    if(empire[myroom].living == undefined) {
                        empire[myroom].living = {};
                    }
                    if(empire[myroom].living[mysource] == undefined) {
                        empire[myroom].living[mysource] = {};
                    }
                    if(empire[myroom].living[mysource][myrole] == undefined) {
                        empire[myroom].living[mysource][myrole] = 1;
                    } else {
                        empire[myroom].living[mysource][myrole] += 1;
                    }
                    //console.log(name + ': Source ' + myroom + '/' + mysource +'/'+ myrole + ' set to ' + empire[myroom].living[mysource][myrole]);
                    var desired = 0;
                    if(Game.creeps[name].memory.target != undefined && Game.creeps[name].memory.source != undefined && Game.creeps[name].memory[MEMORY_ROLE] != undefined) {
                        if (empire[Game.creeps[name].memory.target] != undefined) {
                            if (empire[Game.creeps[name].memory.target].sources[Game.creeps[name].memory.source] != undefined) {
                                if (empire[Game.creeps[name].memory.target].sources[Game.creeps[name].memory.source].assigned[Game.creeps[name].memory[MEMORY_ROLE]] != undefined) {
                                    desired = empire[Game.creeps[name].memory.target].sources[Game.creeps[name].memory.source].assigned[Game.creeps[name].memory[MEMORY_ROLE]];
                                    if (empire[myroom].living[mysource][myrole] <= desired) {
                                        Game.creeps[name].memory[MEMORY_NEEDED] = 1;
                                    } 
                                }
                            }
                        }
                    }
                } else {
                    console.log('Creep ' + name + ' has NO SOURCE! THIS IS BAD, FIX IT!');
                }
            } else {
                console.log('Creep ' + name + ' has NO ROLE!');
                continue;
            }
        }

        for(var spawner in spawner_parts) {
            if(spawner_parts[spawner] > 400) {
                console.log('ALERT: spawner ' + spawner + ' is maintaining ' + spawner_parts[spawner] + ' > 400 creep parts. Not sustainable.');
            } else {
                //console.log('ALERT: spawner ' + spawner + ' is maintaining ' + spawner_parts[spawner] + ' parts.');
            }

        }


        EmpireSpawning: {
            var spawner_mobs = {};
            var spawnerless_mobs = [];
            for (mname in Game.creeps) {
                if (Game.creeps[mname].memory[MEMORY_SPAWNERNAME] != undefined) {
                    var theirsname = Game.creeps[mname].memory[MEMORY_SPAWNERNAME];
                    if(spawner_mobs[theirsname] == undefined) {
                        spawner_mobs[theirsname] = [];
                    }
                    spawner_mobs[theirsname].push(mname);
                } else {
                    spawnerless_mobs.push(mname);
                }
            }
            var spawn_queue = {};
            if(Memory['config.reportworkers'] == undefined) {
                Memory['config.reportworkers'] = 0;
            }
            for (var rname in empire) {
                for (var skey in empire[rname].sources) {
                    var s_status = 'Source: |' + empire[rname].sources[skey]['sourcename'] + '|: ';
                    if (empire[rname].living == undefined) {
                        empire[rname].living = {};
                    }
                    if (empire[rname].living[skey] == undefined) {
                        empire[rname].living[skey] = {};
                    }
                    for (var role in empire[rname].sources[skey].assigned) {
                        if (empire[rname].living[skey][role] == undefined) {
                            empire[rname].living[skey][role] = 0;
                        }
                        s_status += role + ': ' + empire[rname].living[skey][role] + '/' + empire[rname].sources[skey].assigned[role] + ' ';
                        if ( empire[rname].living[skey][role] < empire[rname].sources[skey].assigned[role]) {
                            if(sectors_under_attack[csector] != undefined && !empire_defaults['military_roles'].includes(role) && !empire_defaults['priority_roles'].includes(role)) {
                                //console.log('SPAWN: holding spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + '| until attack is over.');
                                continue;
                            }
                            //if (!empire_defaults['military_roles'].includes(role) && !empire_defaults['priority_roles'].includes(role)) {
                            //    console.log('TEMPORARY BLOCK! holding spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + '|');
                            //}
                            var spawner = spawner = Game.spawns[empire[rname]['spawns_from']];
                            if(spawner == undefined) {
                                console.log('SPAWNER UNDEFINED:  ' + role + ' for |' + empire[rname].sources[skey]['sourcename'] + '|');
                                continue;
                            } else if(spawner.spawning != null) {
                                continue;
                            }                
                            if (empire_workers[role] == undefined) {
                                console.log(spawner.name + ': UNDEFINED ROLE: ' + role)
                                continue;
                            }

                            var expected_income = 0;
                            if(empire[rname].sources[skey]['expected_income'] != undefined) {
                                expected_income = empire[rname].sources[skey]['expected_income'];
                            }
                            if(spawn_queue[spawner.name] != undefined) {
                                if(spawn_queue[spawner.name]['expected_income'] != undefined) {
                                    if (expected_income > spawn_queue[spawner.name]['expected_income']) {
                                        //console.log(spawner.name + ': permitting spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + '| because its expected_income ' + 
                                        //    expected_income + ' is > than the ' + spawn_queue[spawner.name]['expected_income'] + ' of ' +
                                        //    spawn_queue[spawner.name]['spawnrole'] + ' working on |' + empire[spawn_queue[spawner.name]['rname']].sources[spawn_queue[spawner.name]['skey']]['sourcename']  + '|');
                                    } else {
                                        console.log(spawner.name + ': holding spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + '| because its expected_income ' + 
                                            expected_income + ' is <= than the ' + spawn_queue[spawner.name]['expected_income'] + ' of ' +
                                            spawn_queue[spawner.name]['spawnrole'] + ' working on |' + empire[spawn_queue[spawner.name]['rname']].sources[spawn_queue[spawner.name]['skey']]['sourcename']  + '|');
                                        continue;
                                    }
                                } else {
                                    console.log(spawner.name + ': permitting spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + '| because its expected_income ' + 
                                        expected_income + ' is > than the (undefined) of ' +
                                        spawn_queue[spawner.name]['spawnrole'] + ' working on |' + empire[spawn_queue[spawner.name]['rname']].sources[spawn_queue[spawner.name]['skey']]['sourcename'] + '|');
                                }
                            } else {
                                //console.log(spawner.name + ': permitting spawn queue set as there is nothing in queue.');
                            }

                            /*
                            if (spawner.room.energyAvailable < 300) {
                                console.log(spawner.name + ': holding spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + '| as cost exceeds MIN ENERGY: ' + spawner.room.energyAvailable);
                                //continue;
                            }
                            */
                            var part_template = empire_workers[role]['body'];
                            var partlist = [];
                            var energy_cap = spawner.room.energyCapacityAvailable;
                            if (energy_cap > 5000) {
                                energy_cap = 5000;
                            }
                            var work_units = Math.max(1, Math.floor(energy_cap / global.UNIT_COST(part_template)));
                            var max_units = Math.floor(50 / part_template.length);
                            if (work_units > max_units) {
                                console.log('Warning: when building body for ' + role + ' work_units got to be ' + work_units + ' but we can only support ' + max_units + ' of this template.');
                                work_units = max_units;
                            }
                            
                            //console.log(work_units + ' based on ' + global.UNIT_COST(part_template) + ' in ' + spawner.room.energyCapacityAvailable);
                            var renew_allowed = 1;
                            
                            if (spawner_mobs[spawner.name] == undefined ) {
                                work_units = 1;
                                renew_allowed = 0;
                                console.log(spawner.name + ': ALLOWING ONLY ONE WORK UNIT, AS MY MOB LIST IS UNDEFINED. ');
                            } else  {
                                if (spawner_mobs[spawner.name].length < 4) {
                                    work_units = 1;
                                    renew_allowed = 0;
                                    console.log(spawner.name + ': ALLOWING ONLY ONE WORK UNIT, AS MY MOB LIST (' + spawner_mobs[spawner.name].length + ') HAS LESS THAN 4 MOBS. ');
                                }
                            }
                            if (empire_workers[role]['renew_allowed'] != undefined) {
                                if (empire_workers[role]['renew_allowed'] == 0) {
                                    renew_allowed = 0;   
                                }
                            }
                            var renewing_creeps = 0;
                            for (var cr in Game.creeps) {
                                //console.log(Game.creeps[cr].room['name'] + ' v ' + spawner.room.name);
                                if(Game.creeps[cr].room.name == spawner.room.name && Game.creeps[cr].memory.job == 'renew' && spawner.pos.getRangeTo(Game.creeps[cr]) < 3) {
                                    renewing_creeps++;
                                } 
                            }
                            if (renewing_creeps >= 1) {
                                if (renewing_creeps >= 6) {
                                    console.log(spawner.name + ' BLOCKED: number creeps renewing: ' + renewing_creeps);
                                }
                                continue;
                            } else {
                                //console.log(spawner.name + ': number creeps renewing: ' + renewing_creeps);
                            }

                            if(role == 'reserver') {
                                var ticksrem = 0;
                                if (Game.rooms[rname] != undefined) {
                                    if (Game.rooms[rname].controller != undefined) {
                                        if (Game.rooms[rname].controller.reservation != undefined) {
                                            if (Game.rooms[rname].controller.reservation.ticksToEnd != undefined) {
                                                ticksrem = Game.rooms[rname].controller.reservation.ticksToEnd;
                                            }
                                        }
                                    }   
                                }
                                partlist = CONSTRUCT_RESERVER_BODY(ticksrem);
                            } else if(role == 'hauler') {
                                partlist = CONSTRUCT_HAULER_BODY(rname, skey, spawner.room.energyCapacityAvailable);
                            } else if (empire_workers[role]['noresizing'] == undefined) {
                                for (k = 0; k < part_template.length; k++) {
                                    for (j = 0; j < work_units; j++) {
                                        partlist.push(part_template[k]);
                                    }
                                }
                            } else {
                                partlist = part_template;
                            }

                            var spawnrole = role;
                            var thecost = global.UNIT_COST(partlist);
                            if (spawner.room.energyCapacityAvailable < thecost) {
                                console.log(spawner.name + ': holding spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + '| as THIS UNIT cost ' + thecost + ' exceeds MAX STORAGE: ' + 
                                    spawner.room.energyAvailable + ' ');
                                continue;
                            }
                            
                            if (spawner.room.energyAvailable < thecost) {
                                console.log(spawner.name + ': holding spawn -' + role + '- for |' + empire[rname].sources[skey]['sourcename'] + '| as we lack the cost ' + thecost + ' exceeds storage: ' + spawner.room.energyAvailable);
                                continue;
                            }
                            
                            var target_x = 25;
                            var target_y = 25;
                            if(empire[rname].sources[skey]['x'] != undefined) { target_x = empire[rname].sources[skey]['x']; }
                            if(empire[rname].sources[skey]['y'] != undefined) { target_y = empire[rname].sources[skey]['y']; }
                            
                            console.log('SPAWNING: ' + spawner.name + ' created ' + spawnrole + ' for |' + empire[rname].sources[skey]['sourcename'] + 
                            '| cost: ' + thecost + '/' + spawner.room.energyAvailable + ' capacity:' + spawner.room.energyCapacityAvailable + ' based out of ' + spawner.room.name + ' with renew: ' + renew_allowed);

                            spawn_queue[spawner.name] = {
                                'spawner': spawner.name, 'sname': empire[rname].sources[skey]['sourcename'], 'partlist': partlist, 'spawnrole': spawnrole, 'skey': skey, 'rname': rname, 
                                'thecost': thecost, 'myroomname': spawner.room.name, 'target_x': target_x, 'target_y': target_y,  
                                'expected_income': expected_income, 'renew_allowed': renew_allowed
                            }
                            //console.log(JSON.stringify(spawn_queue));
                        }
                    }
                    if (Memory['config.reportworkers'] > 0) {
                        console.log(s_status);
                    }
                    
                }
            }
            if (Memory['config.reportworkers'] > 0) {
                Memory['config.reportworkers'] -= 1;
            }
            //console.log(JSON.stringify(spawn_queue));
            for(var spawnername in Game.spawns) {
                if (spawn_queue[spawnername] != undefined) {
                    var thespawner = Game.getObjectById(Game.spawns[spawnername].id);
                    //continue;
                    if (thespawner.room.energyAvailable >= spawn_queue[spawnername]['thecost']) {
                        spawncustom.process(
                            thespawner, spawn_queue[spawnername]['sname'], spawn_queue[spawnername]['partlist'], spawn_queue[spawnername]['spawnrole'], 
                            spawn_queue[spawnername]['skey'], spawn_queue[spawnername]['rname'], spawn_queue[spawnername]['thecost'], 
                            spawn_queue[spawnername]['myroomname'], spawn_queue[spawnername]['target_x'], 
                            spawn_queue[spawnername]['target_y'], spawn_queue[spawnername]['renew_allowed']
                        );
                    } else {
                        console.log(spawn_queue[spawnername]['sname'] + ': ' + spawn_queue[spawnername]['spawnrole'] + ' too expensive (' + spawn_queue[spawnername]['thecost'] + '/' + thespawner.room.energyAvailable + '), saving up.');
                    }
                } else {
                    // spawner ~thespawner~ has a full queue.
                }
            }
        }

    
    }
    
    for(var id in Game.structures){
        if(Game.structures[id].structureType == STRUCTURE_TOWER){
            structureTower.run(Game.structures[id]);
        }
        if(Game.structures[id].structureType == STRUCTURE_LINK){
            structureLink.run(Game.structures[id]);
        }
        if(Game.structures[id].structureType == STRUCTURE_LAB){
            structureLab.run(Game.structures[id]);
        }
    }

    //console.log('after divisor loop: ' + Game.cpu.getUsed());

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.spawning) {
            // don't even process this creep, it cannot do anything while it is being spawned, and even attempting to do so just wastes CPU.
        } else if(creep.memory[MEMORY_ROLE] == 'harvester' || creep.memory[MEMORY_ROLE] == 'bharvester') {
            roleHarvester.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'c15harvester' || creep.memory[MEMORY_ROLE] == 'c30harvester') {
            roleCHarvester.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'hauler') {
            roleHauler.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'extractor') {
            roleExtractor.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'upgclose' || creep.memory[MEMORY_ROLE] == 'upgfar') {
            roleUpgrader.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'upgraderstorage') {
            roleUpgraderstorage.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'builder') {
            roleBuilder.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'builderstorage') {
            roleBuilderstorage.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'teller') {
            roleTeller.run(creep, 0);
        } else if(creep.memory[MEMORY_ROLE] == 'teller-towers') {
            roleTeller.run(creep, 1);

        } else if(creep.memory[MEMORY_ROLE] == 'drainer') {
            roleDrainer.run(creep, 1);
        } else if(creep.memory[MEMORY_ROLE] == 'drainerhealer') {
            roleDrainerhealer.run(creep, 1);
        } else if(creep.memory[MEMORY_ROLE] == 'siege' || creep.memory[MEMORY_ROLE] == 'siegefar' || creep.memory[MEMORY_ROLE] == 'siegemini') {
            roleSiege.run(creep);
        } else if (empire_defaults['military_roles'].includes(creep.memory[MEMORY_ROLE])) {
            roleAdventurer.run(creep);

        } else if(creep.memory[MEMORY_ROLE] == 'scavenger' || creep.memory[MEMORY_ROLE] == 'bigscavenger') {
            roleScavenger.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'claimer') {
            roleClaimer.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'reserver') {
            roleReserver.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'recycler') {
            roleRecycler.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'signer') {
            roleSigner.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'remoteconstructor') {
            roleRemoteconstructor.run(creep);
        } else if(creep.memory[MEMORY_ROLE] == 'labtech') {
            roleLabtech.run(creep);
        } else {
            console.log('ALERT: ' + creep.name + ' has role ' + creep.memory[MEMORY_ROLE] + ' which I do not know how to handle!')
            creep.suicide();
        }
    }

    //console.log('after creep loop: ' + Game.cpu.getUsed());

    
}
