module.exports = {
    process: function(){
        
        // Memory['ongoing_reactions'] = {}; Memory['assigned_labs'] = {};
        var ongoing_reactions = Memory['ongoing_reactions'];
        var assigned_labs = Memory['assigned_labs'];
    
        var product_chains = {
            RESOURCE_ZYNTHIUM_KEANITE: {
                'local_room': 'W58S17',
                'local_resource': RESOURCE_KEANIUM,
                'remote_resource': RESOURCE_ZYNTHIUM,
                'remote_room': 'W51S14'
            }, 
            RESOURCE_UTRIUM_LEMERGITE: {
                'local_room': 'W53S12',
                'local_resource': RESOURCE_LEMERGIUM, // have to buy this on market, no valid source for us :(
                'remote_resource': RESOURCE_UTRIUM,
                'remote_room': 'W57S14'
            },

            /*
            RESOURCE_GHODIUM: {
                'local_room': 'W53S12',
                'local_resource': RESOURCE_UTRIUM_LEMERGITE, 
                'remote_resource': RESOURCE_ZYNTHIUM_KEANITE,
                'remote_room': 'W58S17'
            },
            */
    
            RESOURCE_UTRIUM_HYDRIDE: {
                'local_room': 'W57S14',
                'local_resource': RESOURCE_UTRIUM, 
                'remote_resource': RESOURCE_HYDROGEN,
                'remote_room': 'W53S18'
            },
            /*
            RESOURCE_GHODIUM_OXIDE: {
                'local_room': 'W57S11',
                'local_resource': RESOURCE_OXYGEN,
                'remote_resource': RESOURCE_GHODIUM,
                'remote_room': 'W53S12'
            },
            */
            RESOURCE_LEMERGIUM_OXIDE: {
                'local_room': 'W53S12',
                'local_resource': RESOURCE_LEMERGIUM, // have to buy this on market, no valid source for us :(
                'remote_resource': RESOURCE_OXYGEN,
                'remote_room': 'W53S12'
            }, 
            
            RESOURCE_HYDROXIDE: {
                'local_room': 'W53S18',
                'local_resource': RESOURCE_HYDROGEN,
                'remote_resource': RESOURCE_OXYGEN,
                'remote_room': 'W53S12'
            },
        }
    
        for (var goal in ongoing_reactions) {
            var this_reaction = ongoing_reactions[goal];
            var rname = this_reaction['local_room'];
            var local_resource = this_reaction['local_resource'];
            var remote_resource = this_reaction['remote_resource'];
            var rm = Game.rooms[this_reaction['local_room']];
            if (this_reaction['state'] == 0) {
                // ASSIGNING LABS
                var rlabs = rm.find(FIND_MY_STRUCTURES, { filter: function(structure){ if(structure.structureType == STRUCTURE_LAB) { return 1; } else { return 0; } } });
                if (rlabs.length < 3) {
                    if (Game.time % 50 === 0) {
                        console.log('Science: ongoing_reaction ' + goal + ' is stuck in a room ' + rname + ' without 3 labs...');
                    }
                    continue;
                }
                
                for (var lab in rlabs) {
                    var thislab = rlabs[lab];
                    var thislabid = thislab.id;
                    if (thislab.mineralAmount > 0) {
                        continue;
                    }
                    if (assigned_labs[thislabid] != undefined) {
                        var reactionid = assigned_labs[thislabid]['reactionid'];
                        if (assigned_labs[thislabid]['endproduct'] == undefined || assigned_labs[thislabid]['endproduct'] != goal) {
                            //console.log('Science: skipping lab assigned to another project: ' + thislabid);
                            continue;
                        }
                    }
                    if (this_reaction['input_1'] == undefined) {
                        console.log('Science: assigned ' + thislabid + ' in ' + rm.name + ' as input_1 for ' + goal);
                        this_reaction['input_1'] = thislabid;
                        assigned_labs[thislabid] = {'mineralid': local_resource, 'purpose': 'reaction', 'endproduct': goal, 'action': 'fill'};
                        continue;
                    } else {
                        var first_lab = Game.structures[this_reaction['input_1']];
                        var range_to = first_lab.pos.getRangeTo(thislab);
                        if (range_to > 2) {
                            //console.log('Science: skipping too-far lab ID: ' + thislabid);
                            continue;
                        }
                        if (this_reaction['input_2'] == undefined) {
                            console.log('Science: assigned ' + thislabid + ' in ' + rm.name + ' as input_2 for ' + goal);
                            this_reaction['input_2'] = thislabid;
                            assigned_labs[thislabid] = {'mineralid': remote_resource, 'purpose': 'reaction', 'endproduct': goal,  'action': 'fill'};
                            continue;
                        } else if (this_reaction['output'] == undefined) {
                            console.log('Science: assigned ' + thislabid + ' in ' + rm.name + ' as output for ' + goal);
                            this_reaction['output'] = thislabid;
                            assigned_labs[thislabid] = {'mineralid': goal, 'purpose': 'reaction', 'endproduct': goal,  'action': 'ignore'};
                            continue;
                        }
                    }
                }
                
                if (this_reaction['input_1'] == undefined || this_reaction['input_2'] == undefined || this_reaction['output'] == undefined) {
                    console.log('Science: ongoing_reaction ' + goal + ' lacks appropriate labs. Debug: ' + JSON.stringify(this_reaction));
                    continue;
                }
                this_reaction['state'] = 1;
                this_reaction['reactionid'] = rm.name + goal + Game.time;
                console.log('Science: ongoing_reaction ' + goal + ' was successfully assigned labs!');
                
                Memory['ongoing_reactions'][goal] = this_reaction;
                Memory['assigned_labs'] = assigned_labs;
                
            } else if (this_reaction['state'] == 1) {
                // FUELING LABS
                
                empire[rname].sources['labs'] = {'sourcename': empire[rname]['roomname'] + '-L', 'x':25, 'y':25, 'assigned': {}, 'expected_income': 25, 'dynamic': 1}
                empire[rname].sources['labs'].assigned['labtech'] = 1;
                
                var lab_input_1 = Game.structures[this_reaction['input_1']];
                var lab_input_2 = Game.structures[this_reaction['input_2']];
                var lab_output = Game.structures[this_reaction['output']];
                var terminal = rm.terminal;
                if (lab_input_1.mineralAmount < lab_input_1.mineralCapacity) {
                    var local_amt = 0;
                    if(terminal.store[local_resource] != undefined && terminal.store[local_resource] > 0) {
                        local_amt = terminal.store[local_resource];
                    }
                    console.log('Science: ' + rname + '/' + goal + ': waiting for lab1 ' + lab_input_1.id + ' to fill with ' + local_resource + ' (' + lab_input_1.mineralAmount + '/' + lab_input_1.mineralCapacity + '), ' + local_amt + ' in storage.');
                    Memory['assigned_labs'][lab_input_1.id] = {'mineralid': local_resource, 'purpose': 'reaction', 'endproduct': goal,  'action': 'fill'};
                    new RoomVisual(rm.name).text(local_resource, lab_input_1.pos.x, lab_input_1.pos.y + 1.5, {color: 'red', backgroundColor: 'white', font: 0.8});
                    continue;
                }
                if (lab_input_2.mineralAmount < lab_input_2.mineralCapacity) {
                    var remote_amt = 0;
                    if(terminal.store[remote_resource] != undefined && terminal.store[remote_resource] > 0) {
                        remote_amt = terminal.store[remote_resource];
                    }
                    console.log('Science: ' + rname + '/' + goal + ': waiting for lab2 ' + lab_input_2.id + ' to fill with ' + remote_resource + ' (' + lab_input_2.mineralAmount + '/' + lab_input_2.mineralCapacity + '), ' + remote_amt + ' in storage.');
                    Memory['assigned_labs'][lab_input_2.id] = {'mineralid': remote_resource, 'purpose': 'reaction', 'endproduct': goal,  'action': 'fill'};
                    new RoomVisual(rm.name).text(remote_resource, lab_input_2.pos.x, lab_input_2.pos.y + 1.5, {color: 'red', backgroundColor: 'white', font: 0.8});
                    continue;
                }
                this_reaction['state'] = 2;
                console.log('Science: ongoing_reaction ' + goal + ' is fueled up!');
                
                assigned_labs[lab_input_1.id]['action'] = 'ignore';
                assigned_labs[lab_input_2.id]['action'] = 'ignore';
                assigned_labs[lab_output.id]['action'] = 'ignore';
                
                Memory['ongoing_reactions'][goal] = this_reaction;
                Memory['assigned_labs'] = assigned_labs;
                
            } else if (this_reaction['state'] == 2) {
                // letting the reaction run.
                var lab_input_1 = Game.structures[this_reaction['input_1']];
                var lab_input_2 = Game.structures[this_reaction['input_2']];
                var lab_output = Game.structures[this_reaction['output']];
                if (lab_output.cooldown) {
                    //console.log('Science: ongoing_reaction ' + rname + ' ' + goal + ' lab ' + lab_output.id + ' on cooldown...');
                    continue;
                }
                var local_resource = this_reaction['local_resource'];
                var remote_resource = this_reaction['remote_resource'];
                var local_storage = lab_input_1.mineralAmount;
                var remote_storage = lab_input_2.mineralAmount;
                
                var result = lab_output.runReaction(lab_input_1, lab_input_2);
                if (lab_output.mineralAmount != lab_output.mineralCapacity) {
                    var result_string = '';
                    if (result != OK) {
                        result_string = ', NON-OK RESULT: ' + result;
                    }
                    //console.log('Science: ' + rname + '/' + goal + ': (lab ' + lab_output.id + ') running output: ' + lab_output.mineralAmount + '/' + lab_output.mineralCapacity + result_string);
                    continue;
                }
                console.log('Science: ' + rname + '/' + goal + ': lab ' + lab_output.id + ' is FINISHED. Cleaning up...');
                this_reaction['state'] = 3;

                assigned_labs[lab_input_1.id]['action'] = 'empty';
                assigned_labs[lab_input_2.id]['action'] = 'empty';
                assigned_labs[lab_output.id]['action'] = 'empty';
                
                Memory['ongoing_reactions'][goal] = this_reaction;
                Memory['assigned_labs'] = assigned_labs;
                
            } else if (this_reaction['state'] == 3) {

                // CLEARING UP
                
                empire[rname].sources['labs'] = {'sourcename': empire[rname]['roomname'] + '-L', 'x':25, 'y':25, 'assigned': {}, 'expected_income': 25, 'dynamic': 1}
                empire[rname].sources['labs'].assigned['labtech'] = 1;

                var lab_input_1 = Game.structures[this_reaction['input_1']];
                var lab_input_2 = Game.structures[this_reaction['input_2']];
                var lab_output = Game.structures[this_reaction['output']];
                var labs_to_clear = [lab_input_1, lab_input_2, lab_output];
                var labs_not_cleared = 0;
                for (var thislab in labs_to_clear) {
                    if (thislab.mineralAmount > 0) {
                        console.log('Science: ' + rname + '/' + goal + ': lab ' + thislab.id + ' is being cleared, ' + thislab.mineralAmount + '/' + thislab.mineralCapacity);
                        labs_not_cleared++;
                    } 
                }
                if (labs_not_cleared > 0) {
                    continue;
                }
                console.log('Science: ' + rname + '/' + goal + ': lab ' + lab_output.id + ' is FINISHED and CLEANED UP. Deleting...');
                delete Memory['ongoing_reactions'][goal];
                delete Memory['assigned_labs'][lab_input_1.id];
                delete Memory['assigned_labs'][lab_input_2.id];
                delete Memory['assigned_labs'][lab_output.id];
                return;
            }
        }
        
        for (var goal in product_chains) {
    
            if (ongoing_reactions[goal] != undefined) {
                //console.log('Science: skipping ' + goal + ' because it has a live reaction.');
                continue;
            }
    
            var reaction = product_chains[goal];
            var factory_room_name = reaction['local_room'];
            if (factory_room_name == undefined) {
                console.log('Science: skipping ' + goal + ' because local_room is undefined.');
                continue;
            }
            if (Game.rooms[factory_room_name] == undefined) {
                console.log('Science: skipping ' + goal + ' because factory_room_name room is undefined.');
                continue;
            }
            var factory_room_terminal = Game.rooms[factory_room_name].terminal;
            if (factory_room_terminal == undefined) {
                console.log('Science: skipping ' + goal + ' because factory_room_terminal is undefined.');
                continue;
            }
            var local_component = reaction['local_resource'];
            var mined_mineral_amount = factory_room_terminal.store[local_component];
            if (mined_mineral_amount == undefined || mined_mineral_amount < 3000) {
                console.log('Science: skipping ' + goal + '/' + factory_room_name + ' because local_room room terminal lacks 3000 ' + local_component);
                continue;
            }
            if (factory_room_terminal.store[goal] != undefined && factory_room_terminal.store[goal] >= 20000) {
                console.log('Science: skipping ' + goal + '/' + factory_room_name + ' because we already have at least 20k of the end product ' + goal);
                continue;
            }
            if (reaction['remote_resource'] == undefined) {
                console.log('Science: skipping ' + goal + '/' + factory_room_name + ' because it has no remote_resource.');
                continue;
            }
            if (reaction['remote_room'] == undefined) {
                console.log('Science: skipping ' + goal + '/' + factory_room_name + ' because it has no remote_room.');
                continue;
            }
            var remote_resource = reaction['remote_resource'];
            var remote_room_name = reaction['remote_room'];
            if (factory_room_terminal.store[remote_resource] == undefined || factory_room_terminal.store[remote_resource] < 3000) {
                //console.log('Science: in making ' + goal + ' the terminal in ' + factory_room_name + ' lacks 3k ' + remote_resource + ', trying to get some from ' + remote_room_name);
                var remote_room_object = Game.rooms[remote_room_name];
                if (remote_room_object == undefined) {
                    console.log('Science: ' + goal + '/' + factory_room_name + ': the remote room ' + remote_room_name + ' is undefined.');
                    continue;
                }
                if (remote_room_object.terminal == undefined) {
                    console.log('Science: ' + goal + '/' + factory_room_name + ': the remote room ' + remote_room_name + ' has no terminal.');
                    continue;
                }
                if (!remote_room_object.terminal.isActive()) {
                    console.log('Science: ' + goal + '/' + factory_room_name + ': the remote room ' + remote_room_name + ' has an inactive terminal.');
                    continue;
                }
                var remote_terminal_object = remote_room_object.terminal;
                if (remote_terminal_object.store[remote_resource] == undefined || remote_terminal_object.store[remote_resource] < 3000) {
                    console.log('Science: ' + goal + '/' + factory_room_name + ': the remote ' + remote_room_name + ' lacks 3k ' + remote_resource);
                    continue;
                }
                if (remote_terminal_object.cooldown) {
                    continue;
                }
                var send_result = remote_terminal_object.send(remote_resource, 3000, factory_room_name, 'reaction: ' + goal);
                console.log('Science: ' + goal + '/' + factory_room_name + ': had ' + remote_room_name + ' send 3k ' + remote_resource + ' to ' + factory_room_name + ' with result: ' + send_result);
                
                return; // prevents any further resource-sharing from trying to ship the same minerals to two different rooms at once.
            }
            // we're ready to start a reaction, and there is NOT one in progress. Should we create one?
            var output_products = factory_room_terminal.store[goal];
            if (output_products != undefined && output_products >= 6000) {
                console.log('Science: ' + goal + '/' + factory_room_name + ': not proceeding because ' + factory_room_name + ' already has 6k ' + goal);
                continue;
            }
            if (ongoing_reactions[goal] != undefined) {
                console.log('Science: ' + goal + '/' + factory_room_name + ': BUG: already have a LIVE REACTION TASK FOR: ' + goal + ' when we went to create one!');
                continue;
            }
            // Yes, we should create one!            
            ongoing_reactions[goal] = reaction;
            reaction['state'] = 0;
            console.log('Science: CREATED LIVE REACTION TASK FOR: ' + goal);
            
        }
    }

};