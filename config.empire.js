
    global.cpu_reporting = 0;

    global.overlord = 'Phisec';
    global.allies = []; // not including anyone in alliance.
    global.enemies = ['Asasel', 'FeTiD', 'Eiskalt'];
    
    global.empire_defaults = {
        'sign': 'Reserved. #overlords',
        'priority_roles': ['teller', 'teller-towers'],
        'military_roles': ['scout', 'slasher', 'rogue', 'ninja', 'dragon', 'boss', 'wizard', 'healer', 'siege', 'siegebig', 'drainer', 'drainerbig', 'antikite16', 'antikite8', 'antikite4', 'antikite2'],
        'defense_roles': ['boss', 'dragon', 'ninja', 'rogue', 'slasher', 'scout'], // LIST MOST POWERFUL FIRST.
        'defense_roles_ranged': ['antikite16', 'antikite8', 'antikite4', 'antikite2'], // LIST MOST POWERFUL FIRST.
        'siege_roles': ['siegebig','siege', 'drainerbig', 'drainer', 'healer', 'siegehealer', 'wizard'], 

        'MSL_4_types': ['c15harvester', 'c30harvester', 'hauler'],
        'MSL_4_replacement': 'fharvester',

        'alerts_duration' : 34560, // alerts last ~24h, or until we've verified that whatever caused them is dead.
        'alerts_recycle' : 0,
        'alerts_reassign': {}, // Don't reassign anything.

        'repairmax_creeps' : 250000,
        'repairmax_towers' : 150000,

        'terminal_energy_min' : 50000, // below this, don't withdraw any energy from terminal
        'terminal_energy_sell' : 60000, // above this, try to sell energy for credits
        'terminal_energy_share' : 90000, // above this, give away energy
        'terminal_energy_max' : 100000, // above this, refuse to allow any more energy to be deposited in the terminal

        'mineralcap' : 500000, // once terminal has this many minerals, no more will be mined in a room.

        'storage_energy_max' : 1000000,

        'room_energy_min' : 100000, // 50k in terminal, 50k in storage
        'room_energy_max' : 300000, // 50k in termal, 250k in storage
        'room_history_ticks': 50,
        'room_minimum_energy_pc': 60, // what % of max stored energy (spawn/extensions) should rooms maintain? If we're below this avg % for room_history_ticks then we will spawn a teller
        'room_crit_energy_pc': 40, // if below this, spawn 2 tellers

        }
    
    global.empire = {
        // 1st base
        'W53S18': {
            'roomname' : '1',
            'spawn_room': 'W53S18'
        },

        // 1st base remote mining
        'W52S18': {
            'roomname' : '1E',
            'spawn_room': 'W53S18'
        },
        'W51S18': {
            'roomname' : '1EE',
            'spawn_room': 'W53S18'
        },
        'W53S17': {
            'roomname' : '1N',
            'spawn_room': 'W53S18',
            'backup_spawn_room': 'W56S18'
        },
        'W54S18': {
            'roomname' : '1W',
            'spawn_room': 'W53S18',
            'backup_spawn_room': 'W56S18'
        },
        'W54S17': {
            'roomname' : '1NW',
            'spawn_room': 'W53S18'
        },
        

        // 5th base
        'W52S17': {
            'roomname' : '5',
            'spawn_room': 'W52S17',
            'backup_spawn_room': 'W53S18'
        },

        // 5th base expansions
        'W52S16': {
            'roomname' : '5N',
            'spawn_room': 'W52S17'
        },
        'W51S17': {
            'roomname' : '5E',
            'spawn_room': 'W52S17',
            'backup_spawn_room': 'W51S14'
        },

        // Base 6
        'W56S18': {
            'roomname' : '6',
            'spawn_room': 'W56S18'
        },  
        // 6N
        'W56S17': {
            'roomname' : '6N',
            'spawn_room': 'W56S18'
        },  
        // 6 E
        'W55S18': {
            'roomname' : '6E',
            'spawn_room': 'W56S18'
        },
        // 6W
        'W57S18': {
            'roomname' : '6W',
            'spawn_room': 'W56S18'
        },
        // 6S
        'W56S19': {
            'roomname' : '6S',
            'spawn_room': 'W56S18'
        }, 

        // 6NE
        'W55S17': {
            'roomname' : '6NE',
            'spawn_room': 'W56S18'
        }, 


        // 7 Base
        'W58S17': {
            'roomname' : '7',
            'spawn_room': 'W58S17'
        },  
        // 7W
        'W59S17': {
            'roomname' : '7W',
            'spawn_room': 'W58S17'
        },
        // 7E
        'W57S17': {
            'roomname' : '7E',
            'spawn_room': 'W58S17'
        },
        'W58S18': {
            'roomname' : '7S',
            'spawn_room': 'W58S17'
        },

        // 8 Base
        'W57S11': {
            'roomname' : '8',
            'spawn_room': 'W57S11',
            'backup_spawn_room': 'W57S14'
        },
        // 8 Expansions
        'W56S11': {
            'roomname' : '8E',
            'spawn_room': 'W57S11',
            'backup_spawn_room': 'W53S12'
        },
        'W57S12': {
            'roomname' : '8S',
            'spawn_room': 'W57S11',
            'backup_spawn_room': 'W57S14'
        },


        // 10 Base
        'W57S14': {
            'roomname': '10',
            'spawn_room': 'W57S14',
            'backup_spawn_room': 'W57S11'
        },
        // 10 Expansions
        'W57S13': {
            'roomname': '10N',
            'spawn_room': 'W57S14',
            'backup_spawn_room': 'W57S11'
        },
        'W58S15': {
            'roomname': '10SW',
            'spawn_room': 'W57S14',
            'backup_spawn_room': 'W57S11'
        },
        'W58S14': {
            'roomname': '10W',
            'spawn_room': 'W57S14',
            'backup_spawn_room': 'W57S11'
        },
        
        // 11 Base
        'W48S18': {
            'roomname': '11',
            'spawn_room': 'W48S18'
        },

        // 11 Expansions
        'W48S19': {
            'roomname': '11S',
            'spawn_room': 'W48S18'

        },
        'W47S18': {
            'roomname': '11E',
            'spawn_room': 'W48S18'
        },
        'W47S19': {
            'roomname': '11SE',
            'spawn_room': 'W48S18'
        },

        // 12 Base
        'W46S17': {
            'roomname': '12',
            'spawn_room': 'W46S17'
        },
        // 12 Expansions
        'W47S17': {
            'roomname': '12W',
            'spawn_room': 'W46S17',
            'backup_spawn_room': 'W48S18'
        },
        'W45S17': {
            'roomname': '12E',
            'spawn_room': 'W46S17'
        },
        'W45S18': {
            'roomname': '12SE',
            'spawn_room': 'W46S17'
        },

        // 13 Base
        'W53S6': {
            'roomname': '13',
            'spawn_room': 'W53S6',
            'backup_spawn_room': 'W53S12'
        },

        // 13 Base expansions
        'W53S5': {
            'roomname': '13N',
            'spawn_room': 'W53S6'
        },
        'W52S6': {
            'roomname': '13E',
            'spawn_room': 'W53S6'
        },
        'W52S7': {
            'roomname': '13SE',
            'spawn_room': 'W53S6'
        },


        // 14 Base
        'W54S9': {
            'roomname': '14',
            'spawn_room': 'W54S9',
            'backup_spawn_room': 'W53S12'
        },
        // 14 Base expansions
        'W54S8': {
            'roomname': '14N',
            'spawn_room': 'W54S9',
            'backup_spawn_room': 'W55S9'
        },
        'W53S9': {
            'roomname': '14E',
            'spawn_room': 'W54S9',
            'backup_spawn_room': 'W55S9'
        },
        'W53S8': {
            'roomname': '14NE',
            'spawn_room': 'W54S9',
            'backup_spawn_room': 'W55S9'
        },
        

        // 15 Base
        'W55S8': {
            'roomname': '15',
            'spawn_room': 'W55S8',
            'backup_spawn_room': 'W54S9'
        },
        // 15 Base expansions
        'W55S9': {
            'roomname': '15S',
            'spawn_room': 'W55S8',
            'backup_spawn_room': 'W54S9'
        },
        'W56S8': {
            'roomname': '15W',
            'spawn_room': 'W55S8'
        },
        'W55S7': {
            'roomname': '15N',
            'spawn_room': 'W55S8'
        },

        // 16 Base
        'W43S18': {
            'roomname': '16',
            'spawn_room': 'W43S18',
            'backup_spawn_room': 'W46S17'
        },
        // 16 Base expansions
        'W42S18': {
            'roomname': '16E',
            'spawn_room': 'W43S18'
        },
        'W43S17': {
            'roomname': '16N',
            'spawn_room': 'W43S18' 
            // source keepers.
        },
        
        
        // 17 Base
        'W46S8': {
            'roomname': '17',
            'spawn_room': 'W46S8'
        },
        // 17 Expansions
        'W47S8': {
            'roomname': '17W',
            'spawn_room': 'W46S8'
        },
        'W48S8': {
            'roomname': '17WW',
            'spawn_room': 'W46S8'
        },
    }
    
