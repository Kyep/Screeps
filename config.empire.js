
    global.cpu_reporting = 0;

    global.overlord = 'Phisec';
    global.allies = ['Kamots'];
    
    global.empire_defaults = {
        'spawner': '59ce24a6b1421365236708e4',
        'room': 'W53S18',
        'sourceid': '59bbc3f82052a716c3ce7289',
        'priority_roles': ['teller', 'teller-towers'],
        'military_roles': ['scout', 'slasher', 'rogue', 'ninja', 'ninjaheals', 'dragon', 'siegedragon', 'boss', 'wizard', 'healer', 'siege', 'siegefar', 'siegemini', 'drainer'],
        'defense_roles': ['boss', 'dragon', 'ninja', 'rogue', 'slasher', 'scout'], // LIST MOST POWERFUL FIRST.
        'alerts_duration' : 34560, // alerts last ~24h, or until we've verified that whatever caused them is dead.
        'alerts_recycle' : 0,
        'alerts_reassign': {}, // Don't reassign anything.
        'repairmax_creeps' : 250000,
        'repairmax_towers' : 150000,
        'terminal_energy_min' : 50000,
        'terminal_energy_max' : 60000,
        'room_energy_min' : 100000, // 50k in terminal, 50k in storage
        'room_energy_max' : 300000, // 50k in termal, 250k in storage
        'room_history_ticks': 50,
        'room_minimum_energy_pc': 60, // what % of max stored energy (spawn/extensions) should rooms maintain? If we're below this avg % for room_history_ticks then we will spawn a teller
        'room_crit_energy_pc': 40 // if below this, spawn 2 tellers
        }
    
    global.empire = {
        // 1st base
        'W53S18': {
            'roomname' : '1',
            'spawns_from': 'Spawn4',
            'sources': {
                'base-maint': {
                    'sourcename': '1-base', 'x':20, 'y':20, 
                    'assigned': {}, 
                    'expected_income': 90, 'dynamic': 1
                },
                'upgrader': { 'sourcename': 'upgrader', 'x':20, 'y':20, 'assigned': {}, 'expected_income': 40, 'dynamic': 1 },
                '59bbc3f82052a716c3ce7289': {
                    'sourcename':'1-E', 'x':25, 'y':18,  'target_x': 24, 'target_y': 19, 'steps':15, 'spaces':4,
                    'assigned': {'bharvester': 2},
                    'expected_income': 85
                },
                '59bbc3f82052a716c3ce728b': {
                    'sourcename':'1-W', 'x':16, 'y':26, 'target_x': 16, 'target_y': 15,'steps':15, 'spaces':3,
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
            'spawns_from': 'Spawn4',
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
            'spawns_from': 'Spawn4',
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
            'spawns_from': 'Spawn4',
            'sources': {
                '59bbc3e92052a716c3ce70b6': {'sourcename':'1W-E', 'x':42, 'y':6, 'target_x': 41, 'target_y': 7, 'steps':29, 'capacity': 3000, 'spaces':3,
                    'assigned': {'c30harvester': 1, 'hauler': 1},
                    'expected_income': 60
                },
                '59bbc3e92052a716c3ce70b7': {'sourcename':'1W-W', 'x':5, 'y':37, 'target_x': 5, 'target_y': 38,'steps':63, 'capacity': 3000, 'spaces':3,
                    'assigned': {'c30harvester': 1, 'hauler': 1},
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
            'spawns_from': 'Spawn4',
            'sources': {
                '59bbc3e82052a716c3ce70b4': {'sourcename':'1NW', 'x':38, 'y':31, 'target_x': 37, 'target_y': 32, 'steps':60, 'spaces':3,
                    'assigned': {'c15harvester': 1, 'hauler': 1}, 
                    'expected_income': 45
                }
            } 
        },
        
        // 2ND BASE
        'W51S18': {
            'roomname' : '2',
            'spawns_from': 'Spawn5',
            'sources': {
                'upgrader': { 'sourcename': 'upgrader', 'x':20, 'y':20, 'assigned': {}, 'expected_income': 40 },
                'base-maint': {'sourcename': '2-base', 'x':16, 'y':24, 
                    'assigned': {}, 
                    'expected_income': 90 
                }, 
                '59bbc4182052a716c3ce758c': {'sourcename':'2-E', 'x':14, 'y':20, 'target_x': 15, 'target_y': 21, 'steps':10, 'spaces':3,
                    'assigned': {'upgclose':1},
                    'expected_income': 80
                },
                '59bbc4182052a716c3ce758d': {'sourcename':'2-W', 'x':3, 'y':27, 'target_x': 4, 'target_y': 27, 'steps':10, 'spaces':2,
                    'assigned': {'bharvester':2},
                    'expected_income': 85
                }
            },
            'safespot': {'x': 17, 'y':14 },
            'mineralid': '59bbc645ae9e1411a425ae18'
        },
        
        // 2nd base remote mining
        'W51S19': {
            'roomname' : '2S',
            'spawns_from': 'Spawn5',
            'sources': {
                '59bbc4182052a716c3ce758f': {'sourcename':'2S', 'x':34, 'y':6, 'target_x': 33, 'target_y': 5,'steps':32, 'spaces':1,
                    'assigned': {'c15harvester': 1, 'hauler': 1},
                    'expected_income': 70
                }
            }
        },
        'W51S17': {
            'roomname' : '2N',
            'spawns_from': 'Spawn5',
            'sources': {
                '59bbc4182052a716c3ce7589': {'sourcename':'2N-E', 'x':46, 'y':29, 'target_x': 45, 'target_y': 29, 'steps':36, 'capacity': 3000, 'spaces':3, // really 'steps':86, , but we have a link that bypases ~50
                    'assigned': {'c30harvester': 1, 'hauler': 2}, 'link_from': '59d850539212a60b7683ce93', 'link_to': '59d84a28947f701c72c375a7', 
                    'expected_income': 60
                },
                '59bbc4182052a716c3ce7588': {'sourcename':'2N-W', 'x':4, 'y':26, 'target_x': 3, 'target_y': 26, 'steps':64, 'capacity': 3000, 'spaces':3, // really 'steps':114,
                    'assigned': {'c30harvester': 1, 'hauler': 2}, 'link_from': '59d850539212a60b7683ce93', 'link_to': '59d84a28947f701c72c375a7', 
                    'expected_income': 50
                },
                'reserver': {'sourcename':'2N-R', 'x':4, 'y':26,
                    'assigned': {'reserver': 1},
                    'expected_income': 40, 'dynamic': 1
                }
            }
        },
        
        // 3rd base
        'W51S14': {
            'roomname' : '3',
            'spawns_from': 'Spawn3',
            'mineralid': '59bbc645ae9e1411a425ae14',
            'sources': {
                '59bbc4172052a716c3ce757d': {'sourcename': '3-W', 'x':31, 'y':15, 'spaces':3,
                    'assigned': {'bharvester': 2},
                    'expected_income': 85
                },
                '59bbc4172052a716c3ce757c': {'sourcename': '3-E', 'x':42, 'y':13, 'spaces':3,
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
                '59bbc4172052a716c3ce757a': {'sourcename': '3N', 'x':34, 'y':33, 'target_x': 33, 'target_y': 34, 'steps':36, 'spaces':2,
                    'assigned': {'c15harvester': 1, 'hauler': 1},
                    'expected_income': 80
                }
            }
        },
        'W51S15': {
            'roomname' : '3S',
            'spawns_from': 'Spawn3',
            'farcontroller': 1,
            'sources': {
                '59bbc4172052a716c3ce7580': {'sourcename': '3S-W', 'x':14, 'y':3, 'target_x': 14, 'target_y': 2, 'steps':43,  'spaces':3,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, // 'c15harvester': 1, 'hauler': 1
                    'expected_income': 70
                },
                '59bbc4172052a716c3ce7582': {'sourcename': '3S-E', 'x':36, 'y':16, 'target_x': 35, 'target_y': 15, 'steps':66,  'spaces':5,
                    'assigned': {'c30harvester': 1, 'hauler': 1}, // 'c15harvester': 1, 'hauler': 1
                    'expected_income': 60
                },
                'reserver': {'sourcename':'3S-R', 'x':20, 'y':15,
                    'assigned': {'reserver': 1},
                    'expected_income': 40, 'dynamic': 1
                }
            }
        },

        // 4th Base
        'W53S12': {
            'roomname' : '4',
            'spawns_from': 'Spawn6',
            'farcontroller': 1,
            'sources': {
                '59bbc3f72052a716c3ce7275': {'sourcename': '4-N', 'x':31, 'y':17, 'spaces':2,
                    'assigned': {'upgfar': 1, 'harvester': 1}, // only two slots...
                    'expected_income': 90
                },
                '59bbc3f72052a716c3ce7276': {'sourcename': '4-S', 'x':32, 'y':28, 'spaces':1,
                    'assigned': {'harvester': 1}, // only one slot...
                    'expected_income': 80
                }
            }
        },
        // 4th base expansions
        'W53S11': {
            'roomname' : '4N',
            'spawns_from': 'Spawn6',
            'sources': {
                '59bbc3f62052a716c3ce7272': {'sourcename': '4N-S', 'x':31, 'y':34, 'target_x': 30, 'target_y': 35, 'spaces':3,
                    'assigned': {'c30harvester': 1, 'hauler': 2},
                    'expected_income': 50
                },
                '59bbc3f62052a716c3ce7270': {'sourcename': '4N-N', 'x':21, 'y':8, 'target_x': 21, 'target_y': 8, 'spaces':1,
                    'assigned': {'c30harvester': 1, 'hauler': 2},
                    'expected_income': 40
                },
                'reserver': {'sourcename':'4N-R', 'x':25, 'y':25,
                    'assigned': {'reserver': 1},
                    'expected_income': 30, 'dynamic': 1
                }
            }
        },
        'W52S12': {
            'roomname' : '4E',
            'spawns_from': 'Spawn6',
            'sources': {
                '59bbc4062052a716c3ce73f5': {'sourcename': '4E', 'x':24, 'y':11, 'target_x': 23, 'target_y': 11, 'spaces':4,
                    'assigned': {'harvester': 2},
                    'expected_income': 45
                }
            }
        },
        'W54S12': {
            'roomname' : '4W',
            'spawns_from': 'Spawn6',
            'sources': {
                '59bbc3e82052a716c3ce7092': {'sourcename': '4W', 'x':37, 'y':5, 'target_x': 37, 'target_y': 6, 'spaces':3,
                    'assigned': {'c15harvester': 1, 'hauler': 1},
                    'expected_income': 10
                }
            }
        },
        'W52S11': {
            'roomname' : '4NE',
            'spawns_from': 'Spawn6',
            'sources': {
                '59bbc4052052a716c3ce73f2': {'sourcename': '4NE', 'x':24, 'y':43, 'target_x': 23, 'target_y': 44, 'spaces':3,
                    'assigned': {},
                    'expected_income': 5
                }
            }
        },
        // 5th base, disabled for the moment.
        /*
        'W52S17': {
            'roomname' : '5',
            'spawns_from': 'Spawn7',

            'expansion': {
                'gcltarget': 5,
                'controllerid': '59bbc4062052a716c3ce7405',
                'spawner_x': 24,
                'spawner_y': 28,
                'expansionsource': '59bbc4062052a716c3ce7406'
            },

            'sources': {
                '59bbc4062052a716c3ce7404': {'sourcename': '5-W', 'x':11, 'y':18, 'target_x': 11, 'target_y': 18, 
                    'assigned': {'harvester': 2},
                    'expected_income': 90
                },
                '59bbc4062052a716c3ce7406': {'sourcename': '5-E', 'x':21, 'y':30, 'target_x': 20, 'target_y': 30, 
                    'assigned': {'harvester': 1, 'upgclose': 1},
                    'expected_income': 80
                }
            }
        },

        // 5th base expansions
        'W52S16': {
            'roomname' : '5N',
            'ignoreattacks': 1,
            'spawns_from': 'Spawn7',
            'sources': {
                '59bbc4062052a716c3ce7401': {'sourcename': '5N-E', 'x':44, 'y':27, 'target_x': 44, 'target_y': 27, 
                    'assigned': {'c15harvester': 1, 'hauler': 1},
                    'expected_income': 50
                },
                '59bbc4062052a716c3ce7402': {'sourcename': '5N-W', 'x':9, 'y':43, 'target_x': 9, 'target_y': 43, 
                    'assigned': {'c15harvester': 1, 'hauler': 1},
                    'expected_income': 40
                },
                'reserver': {'sourcename':'5N-R', 'x':25, 'y':25,
                    'assigned': {'sreserver': 1},
                    'expected_income': 30, 'dynamic': 1
                }
            }
        },
        */
        /*
        'W51S15': {
            'roomname' : 'X3-NN',
            'ignoreattacks': 1,
            'spawns_from': 'Spawn4',
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
            'spawns_from': 'Spawn8',
            'sources': {
                '59bbc3c92052a716c3ce6c47': {'sourcename': '6-N', 'x':31, 'y':30, 'spaces':4,
                    'assigned': {'bharvester': 2},  // 'upgclose': 2, 'harvester': 2
                    'expected_income': 85
                },
                '59bbc3c92052a716c3ce6c48': {'sourcename': '6-S', 'x':35, 'y':39, 'spaces':4,
                    'assigned': {'bharvester': 2}, // 'harvester': 4
                    'expected_income': 80
                }
            },
            'safespot': {'x': 40, 'y':30 },
        },  
        // 6N
        'W56S17': {
            'roomname' : '6N',
            'spawns_from': 'Spawn8',
            'sources': {
                '59bbc3c92052a716c3ce6c42': {'sourcename': '6N-N', 'x':24, 'y':29,  'target_x': 25, 'target_y': 30, 'spaces':3,
                    'assigned': {'c30harvester': 1, 'hauler': 2},
                    'expected_income': 78
                },
                '59bbc3c92052a716c3ce6c44': {'sourcename': '6N-S', 'x':35, 'y':42,  'target_x': 34, 'target_y': 42, 'spaces':2,
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
            'spawns_from': 'Spawn8',
            'sources': {
                '59bbc3db2052a716c3ce6e79': {'sourcename': '6E', 'x':9, 'y':3, 'target_x': 10, 'target_y': 4, 'spaces':1,
                    'assigned': {'c15harvester': 1, 'hauler': 1},
                    'expected_income': 65
                }
            }
        },
        // 6W
        'W57S18': {
            'roomname' : '6W',
            'spawns_from': 'Spawn8',
            'sources': {
                '59bbc3bc2052a716c3ce6a3d': {'sourcename': '6W-N', 'x':30, 'y':12, 'target_x': 30, 'target_y': 13, 'spaces':5,
                    'assigned': {'c15harvester': 1, 'hauler': 1},
                    'expected_income': 55
                },
                '59bbc3bc2052a716c3ce6a3e': {'sourcename': '6W-S', 'x':10, 'y':26, 'target_x': 11, 'target_y': 25, 'spaces':3,
                    'assigned': {'c15harvester': 1, 'hauler': 1},
                    'expected_income': 50
                }
            }
        },
        // 6S
        'W56S19': {
            'roomname' : '6S',
            'spawns_from': 'Spawn8',
            'sources': {
                '59bbc3ca2052a716c3ce6c4b': {'sourcename': '6S-W', 'x':9, 'y':31, 'target_x': 10, 'target_y': 32, 'spaces':1,
                    'assigned': {}, 
                    'expected_income': 45
                },
                '59bbc3ca2052a716c3ce6c4c': {'sourcename': '6S-E', 'x':40, 'y':35, 'target_x': 39, 'target_y': 34, 'spaces':1,
                    'assigned': {},
                    'expected_income': 40
                }
            }
        }, 

        // 6NE
        'W55S17': {
            'roomname' : '6NE',
            'spawns_from': 'Spawn8',
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
    }
    
