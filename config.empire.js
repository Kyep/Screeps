
    global.cpu_reporting = 0;

    global.overlord = 'Phisec';
    global.allies = []; // not including anyone in alliance.
    global.enemies = ['Asasel', 'ballisto', 'Mar10G', 'FeTiD', 'Eiskalt'];
    
    global.empire_defaults = {
        'sign': 'Reserved. #overlords',

        'priority_roles': ['teller', 'teller-towers'],
        'military_roles': ['scout', 'slasher', 'rogue', 'ninja', 'dragon', 'boss', 'wizard', 'healer', 'siege', 'siegebig', 'drainer', 'drainerbig', 'antikite16', 'antikite8', 'antikite4', 'antikite2'],
        'defense_roles': ['boss', 'dragon', 'ninja', 'rogue', 'slasher', 'scout'], // LIST MOST POWERFUL FIRST.
        'defense_roles_ranged': ['antikite16', 'antikite8', 'antikite4', 'antikite2'], // LIST MOST POWERFUL FIRST.
        'siege_roles': ['siegebig','siege', 'drainerbig', 'drainer', 'healer', 'wizard'], 

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
            'spawn_room': 'W53S18',
            'sources': {
                'upgrader': { 'sourcename': 'upgrader', 'x':20, 'y':20, 'assigned': {}, 'expected_income': 40, 'dynamic': 1 },
                '59bbc3f82052a716c3ce7289': {
                    'sourcename':'1-E', 'x':25, 'y':18,  'target_x': 24, 'target_y': 19, 'steps':15, 'spaces':4,
                    'assigned': {'harvester': 1, 'upclose': 0},
                    'expected_income': 85
                },
                '59bbc3f82052a716c3ce728b': {
                    'sourcename':'1-W', 'x':16, 'y':26, 'target_x': 16, 'target_y': 25, 'steps':15, 'spaces':3,
                    'assigned': {'up8': 1, 'harvester': 0, 'upclose': 0},
                    'expected_income': 75
                }
            },
            'mineralid' : '59bbc644ae9e1411a425ad40',
            'mineraltype': RESOURCE_HYDROGEN
        },

        // 1st base remote mining
        'W52S18': {
            'roomname' : '1E',
            'spawn_room': 'W53S18',
            'sources': {
                '59bbc4062052a716c3ce7408': {'sourcename':'1E', 'x':11, 'y':14, 'target_x': 10, 'target_y': 13, 'steps':33, 'spaces':3, 
                    'assigned': {'c15harvester': 1, 'hauler': 1},
                    'expected_income': 65
                }/*,
                'reserver': {'sourcename':'1E-R', 'x':11, 'y':14, 'steps':33,
                    'assigned': {'reserver': 1},
                    'expected_income': 63, 'dynamic': 1
                }*/
            }
        },
        'W53S17': {
            'roomname' : '1N',
            'spawn_room': 'W53S18',
            'backup_spawn_room': 'W56S18',
            'sources': {
                '59bbc3f72052a716c3ce7287': {'sourcename':'1N', 'x':4, 'y':44, 'target_x': 5, 'target_y': 43, 'steps':32, 'spaces':1,
                    'assigned': {'c15harvester': 1, 'hauler': 1}, // , 'reserver': 1
                    'expected_income': 70
                }/*,
                'reserver': {'sourcename':'1N-R', 'x':4, 'y':44, 'steps':32,
                    'assigned': {'reserver': 1}, // , 'reserver': 1
                    'expected_income': 69, 'dynamic': 1
                },*/
            } 
        },
        'W54S18': {
            'roomname' : '1W',
            'spawn_room': 'W53S18',
            'backup_spawn_room': 'W56S18',
            'sources': {
                '59bbc3e92052a716c3ce70b6': {'sourcename':'1W-E', 'x':42, 'y':6, 'target_x': 41, 'target_y': 7, 'steps':29, 'capacity': 3000, 'spaces':3,
                    'assigned': {'c30harvester': 1, 'hauler': 2},
                    'expected_income': 60
                },
                '59bbc3e92052a716c3ce70b7': {'sourcename':'1W-W', 'x':5, 'y':37, 'target_x': 5, 'target_y': 38,'steps':63, 'capacity': 3000, 'spaces':3,
                    'assigned': {'c30harvester': 1, 'hauler': 2},
                    'expected_income': 55
                },
                'reserver': {'sourcename':'1W-R', 'x':5, 'y':37,
                    'assigned': {'reserver': 1},
                    'expected_income': 50, 'dynamic': 1
                } //ANOTHER -3/TICK UNIT. NOT WORTH IT!
            }
        },
        'W54S17': {
            'roomname' : '1NW',
            'spawn_room': 'W53S18',
            'sources': {
                '59bbc3e82052a716c3ce70b4': {'sourcename':'1NW', 'x':38, 'y':31, 'target_x': 37, 'target_y': 32, 'steps':60, 'spaces':3,
                    'assigned': {'c15harvester': 1, 'hauler': 1}, 
                    'expected_income': 45
                }
            } 
        },
        
        /*
        // 2ND BASE
        'W51S18': {
            'roomname' : '2',
            'spawn_room': 'W51S18',
            'backup_spawn_room': 'W53S18',
            'sources': {
                'upgrader': { 'sourcename': 'upgrader', 'x':20, 'y':20, 'assigned': {}, 'expected_income': 40 },
                '59bbc4182052a716c3ce758c': {'sourcename':'2-E', 'x':14, 'y':20, 'target_x': 15, 'target_y': 21, 'steps':10, 'spaces':3,
                    'assigned': {'bharvester':1, 'up8': 1},
                    'expected_income': 80
                },
                '59bbc4182052a716c3ce758d': {'sourcename':'2-W', 'x':3, 'y':27, 'target_x': 4, 'target_y': 27, 'steps':10, 'spaces':2,
                    'assigned': {'bharvester':2},
                    'expected_income': 85
                }
            },
            'mineralid': '59bbc645ae9e1411a425ae18',
            'mineraltype': RESOURCE_OXYGEN
        },
        
        // 2nd base remote mining
        'W51S19': {
            'roomname' : '2S',
            'spawn_room': 'W51S18',
            'sources': {
                '59bbc4182052a716c3ce758f': {'sourcename':'2S', 'x':34, 'y':6, 'target_x': 33, 'target_y': 5,'steps':32, 'spaces':1,
                    'assigned': {'c15harvester': 1, 'hauler': 1},
                    'expected_income': 70
                }
            }
        },
        */

        // 3rd base
        'W51S14': {
            'roomname' : '3',
            'spawn_room': 'W51S14',
            'mineralid': '59bbc645ae9e1411a425ae14',
            'mineraltype': RESOURCE_ZYNTHIUM,
            'sources': {
                '59bbc4172052a716c3ce757d': {'sourcename': '3-W', 'x':31, 'y':15, 'spaces':3,
                    'assigned': {'bharvester': 2, 'up8': 1},
                    'expected_income': 85
                },
                '59bbc4172052a716c3ce757c': {'sourcename': '3-E', 'x':42, 'y':13, 'spaces':3,
                    'assigned': {'bharvester': 2},
                    'expected_income': 90
                }
            },
            'farcontroller': 1
        },
        // 3rd base remote mining
        'W51S13': {
            'roomname' : '3N',
            'spawn_room': 'W51S14',
            'sources': {
                '59bbc4172052a716c3ce757a': {'sourcename': '3N', 'x':34, 'y':33, 'target_x': 33, 'target_y': 34, 'steps':36, 'spaces':2,
                    'assigned': {'c15harvester': 1, 'hauler': 1},
                    'expected_income': 80
                }
            }
        },
        'W51S15': {
            'roomname' : '3S',
            'spawn_room': 'W51S14',
            'farcontroller': 1,
            'sources': {
                '59bbc4172052a716c3ce7580': {'sourcename': '3S-W', 'x':14, 'y':3, 'target_x': 14, 'target_y': 2, 'steps':43,  'spaces':3,
                    'assigned': {'c30harvester': 1, 'hauler': 2}, // 'c15harvester': 1, 'hauler': 1
                    'expected_income': 70
                },
                '59bbc4172052a716c3ce7582': {'sourcename': '3S-E', 'x':36, 'y':16, 'target_x': 35, 'target_y': 15, 'steps':66,  'spaces':5,
                    'assigned': {'c30harvester': 1, 'hauler': 2}, // 'c15harvester': 1, 'hauler': 1
                    'expected_income': 60
                },
                'reserver': {'sourcename':'3S-R', 'x':20, 'y':15,
                    'assigned': {'reserver': 1},
                    'expected_income': 40, 'dynamic': 1
                }
            },
        },

        // 4th Base
        /*
        'W53S12': {
            'roomname' : '4',
            'spawn_room': 'W53S12',
            'farcontroller': 1,
            'sources': {
                '59bbc3f72052a716c3ce7275': {'sourcename': '4-N', 'x':31, 'y':17, 'spaces':2,
                    'assigned': {'upfar': 1, 'bharvester': 1}, // only two slots...
                    'expected_income': 90
                },
                '59bbc3f72052a716c3ce7276': {'sourcename': '4-S', 'x':32, 'y':28, 'spaces':1,
                    'assigned': {'harvester': 1}, // only one slot...
                    'expected_income': 80
                }
            },
            'mineralid': '59bbc644ae9e1411a425ad3a',
            'mineraltype': RESOURCE_OXYGEN
        },
        // 4th base expansions
        'W53S11': {
            'roomname' : '4N',
            'spawn_room': 'W53S12',
            'sources': {
                '59bbc3f62052a716c3ce7272': {'sourcename': '4N-S', 'x':31, 'y':34, 'target_x': 30, 'target_y': 35, 'spaces':3, 'steps':75,
                    'assigned': {'c30harvester': 1, 'hauler': 2},
                    'expected_income': 50
                },
                '59bbc3f62052a716c3ce7270': {'sourcename': '4N-N', 'x':21, 'y':8, 'target_x': 21, 'target_y': 8, 'spaces':1, 'steps':100,
                    'assigned': {'c30harvester': 1, 'hauler': 2},
                    'expected_income': 40
                },
                'reserver': {'sourcename':'4N-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 1},
                    'expected_income': 30, 'dynamic': 1
                }
            },
        },
        'W52S12': {
            'roomname' : '4E',
            'spawn_room': 'W53S12',
            'sources': {
                '59bbc4062052a716c3ce73f5': {'sourcename': '4E', 'x':24, 'y':11, 'target_x': 23, 'target_y': 11, 'spaces':4, 'steps':75,
                    'assigned': {}, // 'harvester': 2
                    'expected_income': 45
                }
            }
        },
        'W54S12': {
            'roomname' : '4W',
            'spawn_room': 'W53S12',
            'sources': {
                '59bbc3e82052a716c3ce7092': {'sourcename': '4W', 'x':37, 'y':5, 'target_x': 37, 'target_y': 6, 'spaces':3, 'steps':75,
                    'assigned': {'c15harvester': 1, 'hauler': 1},
                    'expected_income': 30
                },
                'reserver': {'sourcename':'4W-R', 'x':20, 'y':15,
                    'assigned': {'reserver': 1},
                    'expected_income': 40, 'dynamic': 1
                }
            }
        },
        'W52S11': {
            'roomname' : '4NE',
            'spawn_room': 'W53S12',
            'sources': {
                '59bbc4052052a716c3ce73f2': {'sourcename': '4NE', 'x':24, 'y':43, 'target_x': 23, 'target_y': 44, 'spaces':3, 'steps':75,
                    'assigned': {},
                    'expected_income': 5
                }
            }
        },
        'W55S12': {
            'roomname' : '4WW',
            'spawn_room': 'W53S12',
            'sources': {
                '59bbc3da2052a716c3ce6e57': {'sourcename': '4WW-W', 'x':30, 'y':30, 'target_x': 31, 'target_y': 29, 'spaces':3, 'steps':125,
                    'assigned': {'c30harvester': 1, 'hauler': 2},
                    'expected_income': 5
                },
                '59bbc3da2052a716c3ce6e56': {'sourcename': '4WW-E', 'x':46, 'y':29, 'target_x': 46, 'target_y': 28, 'spaces':4, 'steps':125,
                    'assigned': {'c30harvester': 1, 'hauler': 2},
                    'expected_income': 5
                },
                'reserver': {'sourcename':'4WW-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 1},
                    'expected_income': 3, 'dynamic': 1
                }
            }
        }, 
        */

        // 5th base
        'W52S17': {
            'roomname' : '5',
            'spawn_room': 'W52S17',
            'backup_spawn_room': 'W51S18',
            'sources': {
                '59bbc4062052a716c3ce7404': {'sourcename': '5-W', 'x':10, 'y':19, 'target_x': 11, 'target_y': 18, 'spaces':1,
                    'assigned': {'harvester': 2},
                    'expected_income': 90
                },
                '59bbc4062052a716c3ce7406': {'sourcename': '5-E', 'x':21, 'y':31, 'target_x': 20, 'target_y': 30, 'spaces':3,
                    'assigned': {'harvester': 1, 'upclose': 1},
                    'expected_income': 80
                }
            },
            'mineralid': '59bbc645ae9e1411a425adab',
            'mineraltype': RESOURCE_HYDROGEN
        },

        // 5th base expansions
        'W52S16': {
            'roomname' : '5N',
            'spawn_room': 'W52S17',
            'backup_spawn_room': 'W51S18',
            'sources': {
                '59bbc4062052a716c3ce7401': {'sourcename': '5N-E', 'x':45, 'y':26, 'target_x': 44, 'target_y': 26, 'steps': 60,
                    'assigned': {'c30harvester': 1, 'hauler': 1},
                    'expected_income': 40
                },
                '59bbc4062052a716c3ce7402': {'sourcename': '5N-W', 'x':8, 'y':44, 'target_x': 9, 'target_y': 43, 'steps': 60,
                    'assigned': {'c30harvester': 1, 'hauler': 1},
                    'expected_income': 30
                },
                'reserver': {'sourcename':'5N-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 1},
                    'expected_income': 20, 'dynamic': 1
                }
            }
        },
        'W51S17': {
            'roomname' : '5E',
            'spawn_room': 'W52S17',
            'backup_spawn_room': 'W51S14',
            'sources': {
                '59bbc4182052a716c3ce7589': {'sourcename':'5E-E', 'x':46, 'y':29, 'target_x': 45, 'target_y': 29, 'steps':60, 'capacity': 3000, 'spaces':3, // really 'steps':86, , but we have a link that bypases ~50
                    'assigned': {'c30harvester': 1, 'hauler': 2}, 
                    'expected_income': 70
                },
                '59bbc4182052a716c3ce7588': {'sourcename':'5E-W', 'x':4, 'y':26, 'target_x': 3, 'target_y': 26, 'steps':40, 'capacity': 3000, 'spaces':3, // really 'steps':114,
                    'assigned': {'c30harvester': 1, 'hauler': 2},
                    'expected_income': 60
                },
                'reserver': {'sourcename':'5E-R', 'x':4, 'y':26,
                    'assigned': {'reserver': 1},
                    'expected_income': 50, 'dynamic': 1
                }
            },
        },

        /*
        'W51S15': {
            'roomname' : 'X3-NN',
            'ignoreattacks': 1,
            'spawn_room': 'W52S17',
            'sources': {
                '59bbc4172052a716c3ce7582': {'sourcename': '4S-E', 'x':36, 'y':16,
                'assigned': {},
                'expected_income': 1
                }
            }
        },*/

        



        // Base 6
        'W56S18': {
            'roomname' : '6',
            'spawn_room': 'W56S18',
            //'backup_spawn_room': 'W53S18',
            'sources': {
                '59bbc3c92052a716c3ce6c47': {'sourcename': '6-N', 'x':31, 'y':30, 'spaces':4,
                    'assigned': {'bharvester': 3},  // 'upclose': 2, 'harvester': 2
                    'expected_income': 85
                },
                '59bbc3c92052a716c3ce6c48': {'sourcename': '6-S', 'x':35, 'y':39, 'spaces':4,
                    'assigned': {'bharvester': 3}, // 'harvester': 4
                    'expected_income': 80
                }
            },
            'mineralid' : '59bbc644ae9e1411a425ac50',
            'mineraltype' : RESOURCE_OXYGEN
        },  
        // 6N
        'W56S17': {
            'roomname' : '6N',
            'spawn_room': 'W56S18',
            //'backup_spawn_room': 'W53S18',
            'sources': {
                '59bbc3c92052a716c3ce6c42': {'sourcename': '6N-N', 'x':24, 'y':29,  'target_x': 25, 'target_y': 30, 'spaces':3, 'steps':75,
                    'assigned': {'c30harvester': 1, 'hauler': 2},
                    'expected_income': 78
                },
                '59bbc3c92052a716c3ce6c44': {'sourcename': '6N-S', 'x':35, 'y':42,  'target_x': 34, 'target_y': 42, 'spaces':2, 'steps':75,
                    'assigned': {'c30harvester': 1, 'hauler': 2},
                    'expected_income': 76
                },
                'reserver': {'sourcename':'6N-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 1},
                    'expected_income': 74, 'dynamic': 1
                }
            }
        },  
        // 6 E
        'W55S18': {
            'roomname' : '6E',
            'spawn_room': 'W56S18',
            //'backup_spawn_room': 'W53S18',
            'sources': {
                '59bbc3db2052a716c3ce6e79': {'sourcename': '6E', 'x':9, 'y':3, 'target_x': 10, 'target_y': 4, 'spaces':1, 'steps':60,
                    'assigned': {},
                    'expected_income': 65
                }
            }
        },
        // 6W
        'W57S18': {
            'roomname' : '6W',
            'spawn_room': 'W56S18',
            //'backup_spawn_room': 'W53S18',
            'sources': {
                '59bbc3bc2052a716c3ce6a3d': {'sourcename': '6W-N', 'x':30, 'y':12, 'target_x': 30, 'target_y': 13, 'spaces':5, 'steps':75,
                    'assigned': {'c30harvester': 1, 'hauler': 2},
                    'expected_income': 55
                },
                '59bbc3bc2052a716c3ce6a3e': {'sourcename': '6W-S', 'x':10, 'y':26, 'target_x': 11, 'target_y': 25, 'spaces':3, 'steps':75,
                    'assigned': {'c30harvester': 1, 'hauler': 2},
                    'expected_income': 50
                },
                'reserver': {'sourcename':'6W-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 1},
                    'expected_income': 48, 'dynamic': 1
                }
            }
        },
        // 6S
        'W56S19': {
            'roomname' : '6S',
            'spawn_room': 'W56S18',
            //'backup_spawn_room': 'W53S18',
            'sources': {
                '59bbc3ca2052a716c3ce6c4b': {'sourcename': '6S-W', 'x':9, 'y':31, 'target_x': 10, 'target_y': 32, 'spaces':1, 'steps':75,
                    'assigned': {}, 
                    'expected_income': 45
                },
                '59bbc3ca2052a716c3ce6c4c': {'sourcename': '6S-E', 'x':40, 'y':35, 'target_x': 39, 'target_y': 34, 'spaces':1, 'steps':75,
                    'assigned': {},
                    'expected_income': 40
                }
            }
        }, 

        // 6NE
        'W55S17': {
            'roomname' : '6NE',
            'spawn_room': 'W56S18',
            //'backup_spawn_room': 'W53S18',
            'sources': {
                '59bbc3da2052a716c3ce6e76': {'sourcename': '6NE-N', 'x':45, 'y':21, 'target_x': 44, 'target_y': 22, 'spaces':4,
                    'assigned': {}, 
                    'expected_income': 90
                },
                '59bbc3da2052a716c3ce6e77': {'sourcename': '6NE-S', 'x':29, 'y':40, 'target_x': 28, 'target_y': 41, 'spaces':1,
                    'assigned': {},
                    'expected_income': 1
                }
            }
        }, 


        // 7 Base
        'W58S17': {
            'roomname' : '7',
            'spawn_room': 'W58S17',
            'backup_spawn_room': 'W59S17',
            'sources': {
                '59bbc3ad2052a716c3ce68a6': {'sourcename': '7-W', 'x':8, 'y':27, 'spaces':4,
                    'assigned': {'bharvester': 2}, 
                    'expected_income': 85
                },
                '59bbc3ad2052a716c3ce68a5': {'sourcename': '7-E', 'x':17, 'y':21, 'spaces':4,
                    'assigned': {'bharvester': 2, 'upfar': 1}, 
                    'expected_income': 80
                }
            },
            'mineralid': '59bbc643ae9e1411a425ab8f',
            'mineraltype': RESOURCE_KEANIUM
            
        },  
        // 7W
        'W59S17': {
            'roomname' : '7W',
            'spawn_room': 'W58S17',
            'sources': {
                '59bbc39f2052a716c3ce6717': {'sourcename': '7W-N', 'x':46, 'y':13, 'target_x': 45, 'target_y': 13, 'spaces':4, 'steps':50,
                    'assigned': {'c30harvester': 1, 'hauler': 2},
                    'expected_income': 55
                },
                '59bbc39f2052a716c3ce6719': {'sourcename': '7W-S', 'x':33, 'y':46, 'target_x': 34, 'target_y': 45, 'spaces':4, 'steps':75,
                    'assigned': {'c30harvester': 1, 'hauler': 2},
                    'expected_income': 50
                },
                'reserver': {'sourcename':'7W-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 1},
                    'expected_income': 48, 'dynamic': 1
                }
            }
        },
        // 7E
        'W57S17': {
            'roomname' : '7E',
            'spawn_room': 'W58S17',
            'sources': {
                '59bbc3bc2052a716c3ce6a3a': {'sourcename': '7E-W', 'x':12, 'y':29, 'target_x': 12, 'target_y': 28, 'spaces':4, 'steps':40,
                    'assigned': {'c30harvester': 1, 'hauler': 2},
                    'expected_income': 45
                },
                '59bbc3bc2052a716c3ce6a38': {'sourcename': '7E-E', 'x':35, 'y':18, 'target_x': 35, 'target_y': 17, 'spaces':3, 'steps':50,
                    'assigned': {'c30harvester': 1, 'hauler': 2},
                    'expected_income': 40
                },
                'reserver': {'sourcename':'7E-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 1},
                    'expected_income': 35, 'dynamic': 1
                }
            }
        },

        // 8 Base
        'W57S11': {
            'roomname' : '8',
            'spawn_room': 'W57S11',
            'backup_spawn_room': 'W57S14',
            'sources': {
                '59bbc3bb2052a716c3ce6a22': {'sourcename': '8-W', 'x':7, 'y':21, 'spaces':4, 'target_x': 6, 'target_y': 22, 'steps':40,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, 
                    'expected_income': 85
                },
                '59bbc3bb2052a716c3ce6a24': {'sourcename': '8-E', 'x':30, 'y':43, 'spaces':4,
                    'assigned': {'bharvester': 0, 'upclose': 1}, 
                    'expected_income': 80
                }
            },
            'mineralid': '59bbc643ae9e1411a425abf5',
            'mineraltype': RESOURCE_OXYGEN
            
        },
        // 8 Expansions
        'W56S11': {
            'roomname' : '8E',
            'spawn_room': 'W57S11',
            'backup_spawn_room': 'W53S12',
            'sources': {
                '59bbc3c92052a716c3ce6c1d': {'sourcename': '8E-W', 'x':9, 'y':24, 'spaces':3, 'target_x': 8, 'target_y': 25, 'steps':70,
                    'assigned': {'c30harvester': 1, 'hauler': 2}, 
                    'expected_income': 75
                },
                '59bbc3c92052a716c3ce6c1e': {'sourcename': '8E-E', 'x':42, 'y':28, 'spaces':3, 'target_x': 41, 'target_y': 29, 'steps':100,
                    'assigned': {'c30harvester': 1, 'hauler': 2}, 
                    'expected_income': 70
                },
                'reserver': {'sourcename':'8E-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 1},
                    'expected_income': 69, 'dynamic': 1
                }
            }
        },
        'W57S12': {
            'roomname' : '8S',
            'spawn_room': 'W57S11',
            'backup_spawn_room': 'W57S14',
            'sources': {
                '59bbc3bb2052a716c3ce6a27': {'sourcename': '8S-W', 'x':14, 'y':15, 'spaces':4, 'target_x': 15, 'target_y': 15,  'steps':50,
                    'assigned': {'c30harvester': 1, 'hauler': 2}, 
                    'expected_income': 65
                },
                '59bbc3bb2052a716c3ce6a26': {'sourcename': '8S-E', 'x':24, 'y':13, 'spaces':1, 'target_x': 23, 'target_y': 14,  'steps':50,
                    'assigned': {'c30harvester': 1, 'hauler': 2}, 
                    'expected_income': 60
                },
                'reserver': {'sourcename':'8S-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 1},
                    'expected_income': 59, 'dynamic': 1
                }
            }
        },

        // 9 Base
        /*
        'W59S18': {
            'roomname': '9',
            'spawn_room': 'W59S18',
            'backup_spawn_room': 'W58S17',
            'sources': {
                '59bbc39f2052a716c3ce671b': {'sourcename': '9-N', 'x':40, 'y':8, 'spaces':3, 'target_x': 39, 'target_y': 8, 'steps':40,
                    'assigned': {'bharvester': 2}, 
                    'expected_income': 85
                },
                '59bbc39f2052a716c3ce671c': {'sourcename': '9-S', 'x':46, 'y':25, 'spaces':1,
                    'assigned': {'bharvester': 2}, 
                    'expected_income': 80
                }
            },
            'mineralid': '59bbc643ae9e1411a425ab24',
            'mineraltype': RESOURCE_CATALYST
            
        },
        // 9 Expansions
        'W59S19': {
            'roomname' : '9S',
            'spawn_room': 'W59S18',
            'backup_spawn_room': 'W58S17',
            'sources': {
                '59bbc39f2052a716c3ce6720': {'sourcename': '9S-W', 'x':4, 'y':37, 'spaces':1, 'target_x': 5, 'target_y': 38, 'steps':120,
                    'assigned': {'c30harvester': 1, 'hauler': 2}, 
                    'expected_income': 75
                },
                '59bbc39f2052a716c3ce6721': {'sourcename': '9S-E', 'x':34, 'y':38, 'spaces':2, 'target_x': 34, 'target_y': 37, 'steps':120,
                    'assigned': {'c30harvester': 1, 'hauler': 2}, 
                    'expected_income': 70
                },
                'reserver': {'sourcename':'9S-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 1},
                    'expected_income': 69, 'dynamic': 1
                }
            }
        },
        'W58S18': {
            'roomname' : '9E',
            'spawn_room': 'W59S18',
            'backup_spawn_room': 'W58S17',
            'sources': {
                '59bbc3ad2052a716c3ce68a9': {'sourcename': '9E', 'x':41, 'y':18, 'spaces':3, 'target_x': 40, 'target_y': 18, 'steps':60,
                    'assigned': {'c15harvester': 1, 'hauler': 1}, 
                    'expected_income': 68
                }
            }
        },
        'W58S19': {
            'roomname' : '9SE',
            'spawn_room': 'W59S18',
            'backup_spawn_room': 'W58S17',
            'sources': {
                '59bbc3ad2052a716c3ce68ad': {'sourcename': '9SE-N', 'x':26, 'y':39, 'spaces':2, 'target_x': 25, 'target_y': 39,  'steps':12,
                    'assigned': {'c30harvester': 1, 'hauler': 2}, 
                    'expected_income': 65
                },
                '59bbc3ad2052a716c3ce68ae': {'sourcename': '9SE-S', 'x':24, 'y':43, 'spaces':1, 'target_x': 23, 'target_y': 42,  'steps':120,
                    'assigned': {'c30harvester': 1, 'hauler': 2}, 
                    'expected_income': 60
                },
                'reserver': {'sourcename':'9SE-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 1},
                    'expected_income': 59, 'dynamic': 1
                }
            }
        },
        
        */

        // 10 Base
        'W57S14': {
            'roomname': '10',
            'spawn_room': 'W57S14',
            'backup_spawn_room': 'W57S11',
            'sources': {
                '59bbc3bb2052a716c3ce6a2e': {'sourcename': '10-N', 'x':42, 'y':15, 'spaces':2, 'target_x': 41, 'target_y': 15, 'steps':30,
                    'assigned': {'bharvester': 2}, 
                    'expected_income': 90
                },
                '59bbc3bb2052a716c3ce6a30': {'sourcename': '10-S', 'x':40, 'y':18, 'spaces':1,
                    'assigned': {'harvester': 1}, 
                    'expected_income': 95
                }
            },
            'mineralid': '59bbc643ae9e1411a425abf8',
            'mineraltype': RESOURCE_UTRIUM,
            
        },
        // 10 Expansions
        'W57S13': {
            'roomname': '10N',
            'spawn_room': 'W57S14',
            'backup_spawn_room': 'W57S11',
            'sources': {
                '59bbc3bb2052a716c3ce6a2a': {'sourcename': '10N-N', 'x':12, 'y':8, 'spaces':3, 'target_x': 13, 'target_y': 9, 'steps':100,
                    'assigned': {'c30harvester': 1, 'hauler': 2}, 
                    'expected_income': 80
                },
                '59bbc3bb2052a716c3ce6a2c': {'sourcename': '10N-S', 'x':16, 'y':25, 'target_x': 15, 'target_y': 25, 'spaces':3, 'steps':80,
                    'assigned': {'c30harvester': 1, 'hauler': 2}, 
                    'expected_income': 85
                },
                'reserver': {'sourcename':'10N-R', 'x':27, 'y':14,
                    'assigned': {'reserver': 1},
                    'expected_income': 70, 'dynamic': 1
                }
            }
        },
        'W58S15': {
            'roomname': '10SW',
            'spawn_room': 'W57S14',
            'backup_spawn_room': 'W57S11',
            'sources': {
                '59bbc3ad2052a716c3ce689f': {'sourcename': '10SW', 'x':43, 'y':15, 'spaces':1, 'target_x': 44, 'target_y': 14, 'steps':100,
                    'assigned': {'c15harvester': 1, 'hauler': 1}, 
                    'expected_income': 65
                },
                'reserver': {'sourcename':'10SW-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 0},
                    'expected_income': 60, 'dynamic': 1
                }
            }
        },
        'W58S14': {
            'roomname': '10W',
            'spawn_room': 'W57S14',
            'backup_spawn_room': 'W57S11',
            'sources': {
                '59bbc3ad2052a716c3ce689d': {'sourcename': '10W', 'x':10, 'y':41, 'spaces':3, 'target_x': 10, 'target_y': 40, 'steps':100,
                    'assigned': {'c15harvester': 1, 'hauler': 1}, 
                    'expected_income': 65
                },
                'reserver': {'sourcename':'10W-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 0},
                    'expected_income': 60, 'dynamic': 1
                }
            }
        },
        
        // 11 Base
        'W48S18': {
            'roomname': '11',
            'spawn_room': 'W48S18',
            //'backup_spawn_room': 'W53S18',
            'sources': {
                '5982fbe9b097071b4adbc5ed': {'sourcename': '11-W', 'x':18, 'y':44, 'spaces':4, 'target_x': 19, 'target_y': 44, 'steps':30,
                    'assigned': {'bharvester': 1, 'up8': 1}, 
                    'expected_income': 90
                },
                '5982fbe9b097071b4adbc5ec': {'sourcename': '11-E', 'x':46, 'y':25, 'spaces':1, 'target_x': 46, 'target_y': 24, 'steps':30,
                    'assigned': {'bharvester': 2}, 
                    'expected_income': 95
                }
            },
            'mineralid': '598342aaca90777e307b1343',
            'mineraltype': RESOURCE_LEMERGIUM,
        },

        // 11 Expansions
        'W48S19': {
            'roomname': '11S',
            'spawn_room': 'W48S18',
            //'backup_spawn_room': 'W53S18',
            'sources': {
                '5982fbe9b097071b4adbc5ef': {'sourcename': '11S-W', 'x':6, 'y':21, 'spaces':4, 'target_x': 7, 'target_y': 21, 'steps':70,
                    'assigned': {'c30harvester': 1, 'hauler': 2}, 
                    'expected_income': 90
                },
                '5982fbe9b097071b4adbc5f1': {'sourcename': '11S-E', 'x':13, 'y':28, 'spaces':1, 'target_x': 12, 'target_y': 27, 'steps':70,
                    'assigned': {'c30harvester': 1, 'hauler': 2}, 
                    'expected_income': 95
                },
                'reserver': {'sourcename':'11S-R', 'x':27, 'y':14,
                    'assigned': {'reserver': 1},
                    'expected_income': 85, 'dynamic': 1
                }
            }

        },
        'W47S18': {
            'roomname': '11E',
            'spawn_room': 'W48S18',
            'sources': {
                '5982fbf4b097071b4adbc737': {'sourcename': '11E', 'x':43, 'y':18, 'spaces':4, 'target_x': 43, 'target_y': 17, 'steps':60,
                    'assigned': {'c15harvester': 1, 'hauler': 1}, 
                    'expected_income': 50
                },

            }
        },
        'W47S19': {
            'roomname': '11SE',
            'spawn_room': 'W48S18',
            //'backup_spawn_room': 'W53S18',
            'sources': {
                '5982fbf4b097071b4adbc739': {'sourcename': '11SE-W', 'x':7, 'y':19, 'spaces':1, 'target_x': 8, 'target_y': 20, 'steps':110,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, 
                    'expected_income': 50
                },
                '5982fbf4b097071b4adbc73a': {'sourcename': '11SE-E', 'x':25, 'y':33, 'spaces':4, 'target_x': 24, 'target_y': 32, 'steps':110,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, 
                    'expected_income': 40
                },
                'reserver': {'sourcename':'11SE-R', 'x':11, 'y':36,
                    'assigned': {'reserver': 1},
                    'expected_income': 30, 'dynamic': 1
                }
            }
        },

        // 12 Base
        'W46S17': {
            'roomname': '12',
            'spawn_room': 'W46S17',
            //'backup_spawn_room': 'W53S18',
            'sources': {
                '5982fbffb097071b4adbc8ea': {'sourcename': '12-W', 'x':23, 'y':16, 'spaces':3, 'target_x': 24, 'target_y': 16, 'steps':10,
                    'assigned': {'bharvester': 1, 'up8': 1}, 
                    'expected_income': 90
                },
                '5982fbffb097071b4adbc8e8': {'sourcename': '12-E', 'x':40, 'y':14, 'spaces':4, 'target_x': 39, 'target_y': 14, 'steps':20,
                    'assigned': {'bharvester': 2}, 
                    'expected_income': 95
                }
            },
            'mineralid': '598342abca90777e307b13e1',
            'mineraltype': RESOURCE_HYDROGEN,
        },
        // 12 Expansions
        'W47S17': {
            'roomname': '12W',
            'spawn_room': 'W46S17',
            'backup_spawn_room': 'W53S18',
            'sources': {
                '5982fbf4b097071b4adbc733': {'sourcename': '12W-W', 'x':39, 'y':19, 'spaces':2, 'target_x': 39, 'target_y': 20, 'steps':60,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, 
                    'expected_income': 85
                },
                '5982fbf4b097071b4adbc734': {'sourcename': '12W-S', 'x':39, 'y':42, 'spaces':3, 'target_x': 39, 'target_y': 41, 'steps':60,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, 
                    'expected_income': 80
                },
                'reserver': {'sourcename':'12W-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 1},
                    'expected_income': 75, 'dynamic': 1
                }
            }
        },
        'W45S17': {
            'roomname': '12E',
            'spawn_room': 'W46S17',
            'sources': {
                '5982fc0ab097071b4adbcab9': {'sourcename': '12E-N', 'x':37, 'y':9, 'spaces':4, 'target_x': 38, 'target_y': 9, 'steps':60,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, 
                    'expected_income': 70
                },
                '5982fc0ab097071b4adbcabb': {'sourcename': '12E-S', 'x':21, 'y':30, 'spaces':5, 'target_x': 20, 'target_y': 30, 'steps':50,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, 
                    'expected_income': 65
                },
                'reserver': {'sourcename':'12E-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 1},
                    'expected_income': 60, 'dynamic': 1
                }
            }
        },
        // 13 Base
        'W53S6': {
            'roomname': '13',
            'spawn_room': 'W53S6',
            'backup_spawn_room': 'W53S12',
            'sources': {
                '59bbc3f62052a716c3ce7260': {'sourcename': '13-N', 'x':13, 'y':13, 'spaces':4, 'target_x': 12, 'target_y': 13, 'steps':20,
                    'assigned': {'bharvester': 2}, 
                    'expected_income': 90
                },
                '59bbc3f62052a716c3ce7261': {'sourcename': '13-S', 'x':16, 'y':31, 'spaces':4, 'target_x': 15, 'target_y': 31, 'steps':20,
                    'assigned': {'bharvester': 2}, 
                    'expected_income': 95
                }
            },
            'mineralid': '59bbc644ae9e1411a425ad35',
            'mineraltype': RESOURCE_ZYNTHIUM,
        },

        // 13 Base expansions
        'W53S5': {
            'roomname': '13N',
            'spawn_room': 'W53S6',
            'sources': {
                '59bbc3f62052a716c3ce725d': {'sourcename': '13N-W', 'x':8, 'y':33, 'spaces':4, 'target_x': 9, 'target_y': 33, 'steps':60,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, 
                    'expected_income': 86
                },
                '59bbc3f62052a716c3ce725e': {'sourcename': '13N-E', 'x':18, 'y':36, 'spaces':1, 'target_x': 17, 'target_y': 35, 'steps':60,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, 
                    'expected_income': 80
                },
                'reserver': {'sourcename':'13n-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 1},
                    'expected_income': 60, 'dynamic': 1
                }
            }
        },
        'W52S6': {
            'roomname': '13E',
            'spawn_room': 'W53S6',
            'sources': {
                '59bbc4052052a716c3ce73e1': {'sourcename': '13E-N', 'x':7, 'y':10, 'spaces':5, 'target_x': 7, 'target_y': 8, 'steps':60,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, 
                    'expected_income': 50
                },
                '59bbc4052052a716c3ce73e3': {'sourcename': '13E-S', 'x':20, 'y':39, 'spaces':1, 'target_x': 20, 'target_y': 38, 'steps':60,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, 
                    'expected_income': 45
                },
                'reserver': {'sourcename':'13E-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 1},
                    'expected_income': 40, 'dynamic': 1
                }
            }
        },



        // 14 Base
        'W54S9': {
            'roomname': '14',
            'spawn_room': 'W54S9',
            'backup_spawn_room': 'W53S12',
            'sources': {
                '59bbc3e72052a716c3ce708a': {'sourcename': '14-N', 'x':24, 'y':5, 'spaces':3, 'target_x': 25, 'target_y': 5, 'steps':20,
                    'assigned': {'bharvester': 2}, 
                    'expected_income': 90
                },
                '59bbc3e72052a716c3ce708b': {'sourcename': '14-S', 'x':44, 'y':29, 'spaces':4, 'target_x': 44, 'target_y': 28, 'steps':20,
                    'assigned': {'bharvester': 2}, 
                    'expected_income': 95
                }
            },
            'mineralid': '59bbc644ae9e1411a425acdb',
            'mineraltype': RESOURCE_OXYGEN,
        },
        // 14 Base expansions
        'W54S8': {
            'roomname': '14N',
            'spawn_room': 'W54S9',
            'backup_spawn_room': 'W55S9',
            'sources': {
                '59bbc3e72052a716c3ce7088': {'sourcename': '14N-W', 'x':5, 'y':29, 'spaces':1, 'target_x': 4, 'target_y': 30, 'steps':70,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, 
                    'expected_income': 86
                },
                '59bbc3e72052a716c3ce7087': {'sourcename': '14N-E', 'x':24, 'y':20, 'spaces':4, 'target_x': 23, 'target_y': 20, 'steps':60,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, 
                    'expected_income': 80
                },
                'reserver': {'sourcename':'14N-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 1},
                    'expected_income': 60, 'dynamic': 1
                }
            }
        },
        'W53S9': {
            'roomname': '14E',
            'spawn_room': 'W54S9',
            'backup_spawn_room': 'W55S9',
            'sources': {
                '59bbc3f62052a716c3ce726d': {'sourcename': '14E', 'x':42, 'y':34, 'spaces':1, 'target_x': 43, 'target_y': 35, 'steps':100,
                    'assigned': {'bharvester': 1}, 
                    'expected_income': 50
                },
            }
        },
        'W53S8': {
            'roomname': '14NE',
            'spawn_room': 'W54S9',
            'backup_spawn_room': 'W55S9',
            'sources': {
                '59bbc3f62052a716c3ce726a': {'sourcename': '14NE-W', 'x':4, 'y':35, 'spaces':1, 'target_x': 5, 'target_y': 35, 'steps':100,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, 
                    'expected_income': 70
                },
                '59bbc3f62052a716c3ce7269': {'sourcename': '14NE-E', 'x':31, 'y':32, 'spaces':4, 'target_x': 32, 'target_y': 33, 'steps':100,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, 
                    'expected_income': 60
                },
                'reserver': {'sourcename':'14NE-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 0},
                    'expected_income': 50, 'dynamic': 1
                }
            }
        },
        

        // 15 Base
        'W55S8': {
            'roomname': '15',
            'spawn_room': 'W55S8',
            'backup_spawn_room': 'W54S9',
            'sources': {
                '59bbc3da2052a716c3ce6e4a': {'sourcename': '15-W', 'x':8, 'y':32, 'spaces':2, 'target_x': 9, 'target_y': 33, 'steps':20,
                    'assigned': {'bharvester': 2}, 
                    'expected_income': 90
                },
                '59bbc3da2052a716c3ce6e4c': {'sourcename': '15-E', 'x':40, 'y':46, 'spaces':3, 'target_x': 40, 'target_y': 46, 'steps':40,
                    'assigned': {'bharvester': 2}, 
                    'expected_income': 95
                }
            },
            'mineralid': '59bbc644ae9e1411a425ac92',
            'mineraltype': RESOURCE_HYDROGEN,
        },
        // 15 Base expansions
        'W55S9': {
            'roomname': '15S',
            'spawn_room': 'W55S8',
            'backup_spawn_room': 'W54S9',
            'sources': {
                '59bbc3da2052a716c3ce6e50': {'sourcename': '15S-W', 'x':4, 'y':43, 'spaces':1, 'target_x': 5, 'target_y': 42, 'steps':70,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, 
                    'expected_income': 86
                },
                '59bbc3da2052a716c3ce6e4f': {'sourcename': '15S-E', 'x':20, 'y':33, 'spaces':4, 'target_x': 19, 'target_y': 33, 'steps':60,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, 
                    'expected_income': 80
                },
                'reserver': {'sourcename':'15S-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 1},
                    'expected_income': 60, 'dynamic': 1
                }
            }
        },
        'W56S8': {
            'roomname': '15W',
            'spawn_room': 'W55S8',
            'sources': {
                '59bbc3c82052a716c3ce6c16': {'sourcename': '15W', 'x':46, 'y':5, 'spaces':5, 'target_x': 47, 'target_y': 5, 'steps':40,
                    'assigned': {'c15harvester': 1, 'hauler': 1}, 
                    'expected_income': 50
                },
            }
        },

        // 16 Base
        'W43S18': {
            'roomname': '16',
            'spawn_room': 'W43S18',
            'backup_spawn_room': 'W46S17',
            'sources': {
                '5982fc21b097071b4adbce19': {'sourcename': '16-W', 'x':12, 'y':24, 'spaces':3, 'target_x': 13, 'target_y': 24, 'steps':20,
                    'assigned': {'bharvester': 2}, 
                    'expected_income': 95
                },
                '5982fc21b097071b4adbce17': {'sourcename': '16-E', 'x':34, 'y':7, 'spaces':3, 'target_x': 33, 'target_y': 8, 'steps':40,
                    'assigned': {'bharvester': 2}, 
                    'expected_income': 90
                }
            },
            'mineralid': '598342abca90777e307b14ab',
            'mineraltype': RESOURCE_LEMERGIUM,
        },
        // 16 Base expansions
        'W42S18': {
            'roomname': '16E',
            'spawn_room': 'W43S18',
            'backup_spawn_room': 'W46S17',
            'sources': {
                '5982fc2db097071b4adbcf62': {'sourcename': '16E-N', 'x':17, 'y':32, 'spaces':1, 'target_x': 16, 'target_y': 31, 'steps':60,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, 
                    'expected_income': 86
                },
                '5982fc2db097071b4adbcf63': {'sourcename': '16E-S', 'x':21, 'y':41, 'spaces':2, 'target_x': 20, 'target_y': 40, 'steps':60,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, 
                    'expected_income': 80
                },
                'reserver': {'sourcename':'16E-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 0},
                    'expected_income': 60, 'dynamic': 1
                }
            }
        },
        'W43S17': {
            'roomname': '16N',
            'spawn_room': 'W43S18',
            //'backup_spawn_room': 'W46S17', // source keepers.
            'sources': {
                '5982fc21b097071b4adbce13': {'sourcename': '16N-W', 'x':24, 'y':9, 'spaces':3, 'target_x': 25, 'target_y': 8, 'steps':80,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, 
                    'expected_income': 86
                },
                '5982fc21b097071b4adbce15': {'sourcename': '16N-E', 'x':26, 'y':12, 'spaces':1, 'target_x': 27, 'target_y': 13, 'steps':80,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, 
                    'expected_income': 80
                },
                'reserver': {'sourcename':'16N-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 0},
                    'expected_income': 60, 'dynamic': 1
                }
            }
        },
    /*
        'W53S7': { /// left in so I can add a L base next to it, and repurpose it.
            'roomname': '13S',
            'spawn_room': 'W53S6',
            'sources': {
                '59bbc3f62052a716c3ce7264': {'sourcename': '13S-N', 'x':37, 'y':8, 'spaces':4, 'target_x': 37, 'target_y': 7, 'steps':60,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, 
                    'expected_income': 50
                },
                '59bbc3f62052a716c3ce7266': {'sourcename': '13S-S', 'x':25, 'y':31, 'spaces':1, 'target_x': 25, 'target_y': 30, 'steps':60,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, 
                    'expected_income': 45
                },
                'reserver': {'sourcename':'13n-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 1},
                    'expected_income': 40, 'dynamic': 1
                }
            }
        },
    */

    }
    
