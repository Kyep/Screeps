global.RESET_SCIENCE = function() {
    var chains = [];
    // ZK made in a KEANIUM room - verified
    chains.push( // 1st pre-req for GHODIUM
        {
            'goal': RESOURCE_ZYNTHIUM_KEANITE,
            'roomname': 'W58S17',
            'resource_1': RESOURCE_KEANIUM,
            'resource_2': RESOURCE_ZYNTHIUM
        });
    // UL made in a KEANIUM room
    chains.push( // 2nd pre-req for GHODIUM 
        {
            'goal': RESOURCE_UTRIUM_LEMERGITE,
            'roomname': 'W58S17',
            'resource_1': RESOURCE_LEMERGIUM, 
            'resource_2': RESOURCE_UTRIUM
        });
    // G made in a KEANIUM room
    chains.push( 
        {
            'goal': RESOURCE_GHODIUM,
            'roomname': 'W58S17',
            'resource_1': RESOURCE_UTRIUM_LEMERGITE, 
            'resource_2': RESOURCE_ZYNTHIUM_KEANITE
        });

    // ATTACK boosts made in UTRIUM room - VERIFIED
    chains.push(  // +100% ATTACK (T1)
        {
            'goal': RESOURCE_UTRIUM_HYDRIDE,
            'roomname': 'W57S14',
            'resource_1': RESOURCE_UTRIUM, 
            'resource_2': RESOURCE_HYDROGEN
        });
    chains.push( // +200% ATTACK (T2)
        {
            'goal': RESOURCE_UTRIUM_ACID,
            'roomname': 'W57S14',
            'resource_1': RESOURCE_UTRIUM_HYDRIDE, 
            'resource_2': RESOURCE_HYDROXIDE
        });
    chains.push( // +300% ATTACK (T3)
        {
            'goal': RESOURCE_CATALYZED_UTRIUM_ACID,
            'roomname': 'W57S14',
            'resource_1': RESOURCE_UTRIUM_ACID, 
            'resource_2': RESOURCE_CATALYST
        });

    // TOUGH boosts made in an OXYGEN room - verified
    chains.push( // -30% DMG TAKEN (T1)
        {
            'goal': RESOURCE_GHODIUM_OXIDE,
            'roomname': 'W56S18',
            'resource_2': RESOURCE_GHODIUM,
            'resource_1': RESOURCE_OXYGEN
        });
    chains.push( // -50% DMG TAKEN (T2)
        {
            'goal': RESOURCE_GHODIUM_ALKALIDE,
            'roomname': 'W56S18',
            'resource_2': RESOURCE_GHODIUM_OXIDE,
            'resource_1': RESOURCE_HYDROXIDE
        });
    chains.push( // -70% DMG TAKEN (T3)
        {
            'goal': RESOURCE_CATALYZED_GHODIUM_ALKALIDE,
            'roomname': 'W56S18',
            'resource_2': RESOURCE_GHODIUM_ALKALIDE,
            'resource_1': RESOURCE_CATALYST
        });

    // HEAL boosts made in a LEMERGIUM room - verified
    chains.push( // // +100% HEAL
        {
            'goal': RESOURCE_LEMERGIUM_OXIDE,
            'roomname': 'W43S18',
            'resource_1': RESOURCE_LEMERGIUM,
            'resource_2': RESOURCE_OXYGEN
        });
    chains.push( // +200% HEAL (T2)
        {
            'goal': RESOURCE_LEMERGIUM_ALKALIDE,
            'roomname': 'W53S18',
            'resource_1': RESOURCE_HYDROXIDE,
            'resource_2': RESOURCE_LEMERGIUM_OXIDE
        });
    chains.push( // +300% HEAL (T3)
        {
            'goal': RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,
            'roomname': 'W43S18',
            'resource_1': RESOURCE_LEMERGIUM_ALKALIDE,
            'resource_2': RESOURCE_CATALYST
        });

    // HYDROXIDE made in a HYDROGEN room
    chains.push( // REQUIRED FOR T2 BOOSTS
        {
            'goal': RESOURCE_HYDROXIDE,
            'roomname': 'W53S18',
            'resource_1': RESOURCE_HYDROGEN,
            'resource_2': RESOURCE_OXYGEN
        });
    chains.push( // REQUIRED FOR T2 BOOSTS
        {
        'goal': RESOURCE_HYDROXIDE,
        'roomname': 'W55S8',
        'resource_1': RESOURCE_HYDROGEN,
        'resource_2': RESOURCE_OXYGEN
        });


    // FATIGUE/MOVE made in a HYDROGEN room
    chains.push( // T1, +100% MOVE part effectiveness
        {
            'goal': RESOURCE_ZYNTHIUM_OXIDE,
            'roomname': 'W55S8',
            'resource_1': RESOURCE_ZYNTHIUM,
            'resource_2': RESOURCE_OXYGEN
        });
    chains.push( // T2, +200% MOVE part effectiveness
        {
            'goal': RESOURCE_ZYNTHIUM_ALKALIDE,
            'roomname': 'W55S8',
            'resource_1': RESOURCE_ZYNTHIUM_OXIDE,
            'resource_2': RESOURCE_HYDROXIDE
        });
    chains.push( // T3, +300%  MOVE part effectiveness
        {
            'goal': RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
            'roomname': 'W55S8',
            'resource_1': RESOURCE_ZYNTHIUM_ALKALIDE,
            'resource_2': RESOURCE_CATALYST
        });

    // DISMANTLE made in a ZYNTHIUM room
    chains.push( // T1, +100% dismantle
        {
            'goal': RESOURCE_ZYNTHIUM_HYDRIDE,
            'roomname': 'W53S6',
            'resource_1': RESOURCE_ZYNTHIUM,
            'resource_2': RESOURCE_HYDROGEN
        });
    chains.push( // T2, +200% dismantle
        {
            'goal': RESOURCE_ZYNTHIUM_ACID,
            'roomname': 'W53S6',
            'resource_1': RESOURCE_ZYNTHIUM_HYDRIDE,
            'resource_2': RESOURCE_HYDROXIDE
        });
    chains.push( // T3, +300% dismantle
        {
            'goal': RESOURCE_CATALYZED_ZYNTHIUM_ACID,
            'roomname': 'W53S6',
            'resource_1': RESOURCE_ZYNTHIUM_ACID,
            'resource_2': RESOURCE_CATALYST
        });

    // UPGRADE made in W46S17, another HYDROGEN room
    chains.push( // T1, +50% upgradeController
        {
            'goal': RESOURCE_GHODIUM_HYDRIDE,
            'roomname': 'W46S17',
            'resource_1': RESOURCE_GHODIUM,
            'resource_2': RESOURCE_HYDROGEN
        });
    chains.push( // T2, +80% upgradeController
        {
            'goal': RESOURCE_GHODIUM_ACID,
            'roomname': 'W46S17',
            'resource_1': RESOURCE_GHODIUM_HYDRIDE,
            'resource_2': RESOURCE_HYDROXIDE
        });
    chains.push( // T3, +100% upgradeController
        {
            'goal': RESOURCE_CATALYZED_GHODIUM_ACID,
            'roomname': 'W46S17',
            'resource_1': RESOURCE_GHODIUM_ACID,
            'resource_2': RESOURCE_CATALYST
        });

    Memory[MEMORY_GLOBAL_SCIENCEREACTIONS] = chains;
    Memory[MEMORY_GLOBAL_SCIENCELABS] = {}
    for (var crname in Game.creeps) {
        var crmem = Game.creeps[crname].memory
        if (crmem[MEMORY_ROLE] == "labtech") {
            if (crmem[MEMORY_JOB] == "fill_lab") {
                crmem[MEMORY_JOB] = "idle";
            }
        }
    }
    return true;
}

global.SCIENCE_PROCESS = function () {
    
    var max_fueling_time = 500;
    
    var science_reactions = Memory[MEMORY_GLOBAL_SCIENCEREACTIONS];
    var science_labs = Memory[MEMORY_GLOBAL_SCIENCELABS];

    for (var i = 0; i < science_reactions.length; i++) {
        var reaction = science_reactions[i];

        if (reaction['goal'] == undefined) {
            console.log('SCI: skipping reaction with no goal: ' + JSON.stringify(reaction));
            continue;
        }
        if (reaction['roomname'] == undefined) {
            console.log('SCI: skipping reaction with no roomname: ' + JSON.stringify(reaction));
            continue;
        }
        if (reaction['resource_1'] == undefined) {
            console.log('SCI: skipping reaction with no resource_1: ' + JSON.stringify(reaction));
            continue;
        }
        if (reaction['resource_2'] == undefined) {
            console.log('SCI: skipping reaction with no resource_2: ' + JSON.stringify(reaction));
            continue;
        }
        
        var rmobj = Game.rooms[reaction['roomname']];
        if (rmobj == undefined) {
            console.log('SCI: skipping reaction in room we lack visibility to: ' + JSON.stringify(reaction));
            continue;
        }
        var term = rmobj.terminal;
        if (term == undefined || !term.isActive()) {
            console.log('SCI: skipping reaction in room with no active terminal: ' + JSON.stringify(reaction));
            continue;
        }
        
        //console.log('SCI: evaluating reaction: ' + JSON.stringify(reaction));

        if (reaction['state'] == 'cleanup') {

            var lab_1 = Game.structures[reaction['lab_1']];
            var lab_2 = Game.structures[reaction['lab_2']];
            var lab_3 = Game.structures[reaction['lab_3']];

            if (lab_1.mineralAmount > 0) {
                continue;
            }
            if (lab_2.mineralAmount > 0) {
                continue;
            }
            if (lab_3.mineralAmount > 0) {
                continue;
            }
            
            delete science_labs[lab_1.id];
            delete science_labs[lab_2.id];
            delete science_labs[lab_3.id];
            reaction['state'] = 'finished';
            
            console.log('SCI: ' + reaction['roomname'] + '/' + reaction['goal'] + ' successfully cleaned up, now moving to reset: ' + JSON.stringify(reaction));
            
            science_reactions[i] = reaction; // Save to parent object.


        } else if (reaction['state'] == 'inprogress') {

            var lab_1 = Game.structures[reaction['lab_1']];
            var lab_2 = Game.structures[reaction['lab_2']];
            var lab_3 = Game.structures[reaction['lab_3']];
            if (lab_3.cooldown) {
                //console.log('SCI: reaction for ' + reaction['goal'] + ' in room ' + reaction['roomname'] +' skipped, as lab 3 on cooldown.');
                //new RoomVisual(rmobj.name).text('CD:' + lab_3.cooldown, lab_3.pos.x, lab_3.pos.y + 1.5, {color: 'blue', backgroundColor: 'white', font: 0.8});
                continue;
            }
            if (lab_3.mineralAmount < lab_3.mineralCapacity) {
            //if (lab_3.mineralAmount < 100) {
                var result = lab_3.runReaction(lab_1, lab_2);
                //new RoomVisual(rmobj.name).text('React:' + result, lab_3.pos.x, lab_3.pos.y + 1.5, {color: 'blue', backgroundColor: 'white', font: 0.8});
                if (result == ERR_NOT_IN_RANGE || result == ERR_INVALID_ARGS) {
                    var setup_fail_msg = 'SCI: reaction for ' + reaction['goal'] + ' in room ' + reaction['roomname'] +'  FATAL SETUP ERROR, BAD DISTANCE OR LAB MATERIALS MISMATCH.  Debug: ' + JSON.stringify(reaction);
                    console.log(setup_fail_msg);
                    Game.notify(setup_fail_msg);
                } else if (result == OK) {
                    //console.log('SCI: reaction for ' + reaction['goal'] + ' in room ' + reaction['roomname'] +' ran successfully: ' +lab_3.mineralAmount + '/' + lab_3.mineralCapacity);
                } else {
                    console.log('SCI: reaction for ' + reaction['goal'] + ' in room ' + reaction['roomname'] +' produced weird runReaction result: ' + result + '.');
                }
                continue;
            }
            
        
            science_labs[lab_1.id]['action'] = 'empty';
            science_labs[lab_2.id]['action'] = 'empty';
            science_labs[lab_3.id]['action'] = 'empty';
            
            reaction['state'] = 'cleanup';

            console.log('SCI: ' + reaction['roomname'] + '/' + reaction['goal'] + ' successfully finished, moving to cleanup stage: ' + JSON.stringify(reaction));

            science_reactions[i] = reaction; // Save to parent object.


            
        } else if (reaction['state'] == 'fuelinglabs') {
            
            var lab_1 = Game.structures[reaction['lab_1']];
            var lab_2 = Game.structures[reaction['lab_2']];
            var lab_3 = Game.structures[reaction['lab_3']];
            var labs_to_fill = [lab_1, lab_2];
            var count_filled = 0;
            var progress_tally = 0;
            var remaining_minerals = [];
            for (var l = 0; l < labs_to_fill.length; l++) {
                var ald  = science_labs[labs_to_fill[l].id];
                var pc_full = ROUND_NUMBER_TO_PLACES((labs_to_fill[l].mineralAmount / labs_to_fill[l].mineralCapacity) * 100, 0);
                progress_tally += pc_full;
                var text_color = 'red';
                if (labs_to_fill[l].mineralAmount == labs_to_fill[l].mineralCapacity) {
                    text_color = 'green';
                    count_filled++;
                } else {
                    remaining_minerals.push(ald['mineralid']);
                }
                var pc_text = ald['mineralid'] + ' ' + pc_full + '%';
                new RoomVisual(rmobj.name).text(pc_text, labs_to_fill[l].pos.x, labs_to_fill[l].pos.y + 1.5, {color: text_color, backgroundColor: 'white', font: 0.3});
            }
            var overall_pc = ROUND_NUMBER_TO_PLACES((progress_tally / labs_to_fill.length), 0);
            if (count_filled != labs_to_fill.length) {
                var reaction_age = Game.time - reaction['creation_time'];
                //console.log('SCI: reaction for ' + reaction['goal'] + ' in room ' + reaction['roomname'] +' is fueling, overall progress: ' + overall_pc + '% in ' + reaction_age + ' ticks. Remain: ' + remaining_minerals.join(', '));
                if (reaction_age > max_fueling_time) {
                    science_labs[lab_1.id]['action'] = 'empty';
                    science_labs[lab_2.id]['action'] = 'empty';
                    science_labs[lab_3.id]['action'] = 'empty';
                    reaction['state'] = 'cleanup';
                    console.log('SCI: ' + reaction['roomname'] + '/' + reaction['goal'] + ' has been fueling for > ' + max_fueling_time + ' ticks, assuming it will never fuel up and ending it: ' + JSON.stringify(reaction));
                    science_reactions[i] = reaction; // Save to parent object.
                }
                continue;
            }
            
            console.log('SCI: ' + reaction['roomname'] + '/' + reaction['goal'] + ' successfully fueled: ' + JSON.stringify(reaction));
            
            science_labs[lab_1.id]['action'] = 'ignore';
            science_labs[lab_2.id]['action'] = 'ignore';
            science_labs[lab_3.id]['action'] = 'ignore';
            
            reaction['state'] = 'inprogress';
            science_reactions[i] = reaction; // Save to parent object.
            
        } else { // reaction not started.
        
            
            var desired_amount = 10000; // by default, assume T1 or T2. have a little bit, but don't build up masses of it - the higher tier boosts matter more.
            if (MINERAL_REACTION_COUNT(reaction['goal']) == 0) {
                desired_amount = 40000; // this is T3... it is not used in any further reactions
            }
            if (term.store[reaction['goal']] && term.store[reaction['goal']] > desired_amount) {
                //console.log('SCI: skipping reaction for ' + reaction['goal'] + ' in room ' + reaction['roomname'] + ' because we already have enough end product');
                continue;
            }
            var required = [reaction['resource_1'], reaction['resource_2']];
            for (var r = 0; r < required.length; r++) {
                if (term.store[required[r]] == undefined || term.store[required[r]] < 3000) {
                    if (term.acquireMineralAmount(required[r], 3000, 6000)) {
                        console.log('SCI: ' + reaction['roomname'] + ' acquired ' + required[r] + ' for the ' + reaction['goal'] + ' reaction.');
                        return;
                    } else {
                        if (Game.time % 500 == 0) {
                            console.log('SCI: ' + reaction['roomname'] + ' COULD NOT ACQUIRE ' + required[r] + ' for the ' + reaction['goal'] + ' reaction.');
                        }
                        
                    }
                    continue;
                }
            }
            var rlabs = rmobj.find(FIND_MY_STRUCTURES, { filter: function(structure){ if(structure.structureType == STRUCTURE_LAB && structure.isUnassigned()) { return 1; } else { return 0; } } });
            if (rlabs.length < 3) {
                if (Game.time % 100 == 0) {
                    console.log('SCI: ' + reaction['roomname'] + '/' + reaction['goal'] + ' could not find 3 free labs.');
                }
                continue;
            }
            var input_lab_1 = _.sample(rlabs);
            var rlabs2 = rmobj.find(FIND_MY_STRUCTURES, { filter: function(structure){ 
                if (structure.structureType == STRUCTURE_LAB && structure.isAvailable(true) && structure.pos.getRangeTo(input_lab_1) <= 2 && structure.id != input_lab_1.id) { return 1; } else { return 0; } 
            } });
            var input_lab_2 = _.sample(rlabs2);
            if (input_lab_2 == undefined || input_lab_2.id == undefined) {
                //console.log('SCI: ' + reaction['roomname'] + '/' + reaction['goal'] + ' could not verify a second lab.');
                continue;
            }
            var rlabs3 = rmobj.find(FIND_MY_STRUCTURES, { filter: function(structure){ 
                if (structure.structureType == STRUCTURE_LAB && structure.isAvailable(true) && structure.pos.getRangeTo(input_lab_1) <= 2 && structure.id != input_lab_1.id 
                && structure.pos.getRangeTo(input_lab_2) <= 2 && structure.id != input_lab_2.id) { return 1; } else { return 0; } 
            } });
            var output_lab = _.sample(rlabs3);
            if (output_lab == undefined || output_lab.id == undefined) {
                //console.log('SCI: ' + reaction['roomname'] + '/' + reaction['goal'] + ' could not verify a third lab.');
                continue;
            }
            reaction['lab_1'] = input_lab_1.id;
            reaction['lab_2'] = input_lab_2.id;
            reaction['lab_3'] = output_lab.id;
            science_labs[input_lab_1.id] = {'roomname': reaction['roomname'], 'mineralid': reaction['resource_1'], 'purpose': 'reaction', 'endproduct': reaction['goal'], 'action': 'fill'};
            science_labs[input_lab_2.id] = {'roomname': reaction['roomname'], 'mineralid': reaction['resource_2'], 'purpose': 'reaction', 'endproduct': reaction['goal'],  'action': 'fill'};
            science_labs[output_lab.id] = {'roomname': reaction['roomname'], 'mineralid': reaction['goal'], 'purpose': 'reaction', 'endproduct': reaction['goal'],  'action': 'ignore'};
            
            reaction['state'] = 'fuelinglabs';
            reaction['creation_time'] = Game.time;
            
            console.log('SCI: ' + reaction['roomname'] + '/' + reaction['goal'] + ' successfully created: ' + JSON.stringify(reaction));
            
            science_reactions[i] = reaction; // Save to parent object.
            
            break; // so we don't try creating multiple ones.
            
        }
    }
    
    Memory[MEMORY_GLOBAL_SCIENCEREACTIONS] = science_reactions;
    Memory[MEMORY_GLOBAL_SCIENCELABS] = science_labs;
    
}

