module.exports = {
    process: function(){
        // Memory['ongoing_reactions'] = {}; Memory['assigned_labs'] = {};
        var ongoing_reactions = Memory['ongoing_reactions'];
        var assigned_labs = Memory['assigned_labs'];
    
        var product_chains = {}
        product_chains[RESOURCE_ZYNTHIUM_KEANITE] = // 1st pre-req for GHODIUM
            {
                'local_room': 'W58S17',
                'local_resource': RESOURCE_KEANIUM,
                'remote_resource': RESOURCE_ZYNTHIUM,
                'remote_room': 'W51S14'
            }
        product_chains[RESOURCE_UTRIUM_LEMERGITE] = // 2nd pre-req for GHODIUM 
            {
                'local_room': 'W48S18',
                'local_resource': RESOURCE_LEMERGIUM, 
                'remote_resource': RESOURCE_UTRIUM,
                'remote_room': 'W57S14'
            }
        product_chains[RESOURCE_GHODIUM] = 
            {
                'local_room': 'W48S18',
                'local_resource': RESOURCE_UTRIUM_LEMERGITE, 
                'remote_resource': RESOURCE_ZYNTHIUM_KEANITE,
                'remote_room': 'W58S17'
            }
        product_chains[RESOURCE_UTRIUM_HYDRIDE] =  // +100% ATTACK (T1)
            {
                'local_room': 'W57S14',
                'local_resource': RESOURCE_UTRIUM, 
                'remote_resource': RESOURCE_HYDROGEN,
                'remote_room': 'W53S18'
            }
        product_chains[RESOURCE_UTRIUM_ACID] = // +200% ATTACK (T2)
            {
                'local_room': 'W57S14',
                'local_resource': RESOURCE_UTRIUM_HYDRIDE, 
                'remote_resource': RESOURCE_HYDROXIDE,
                'remote_room': 'W53S18'
            }
        //product_chains[RESOURCE_GHODIUM_OXIDE] = // -30% DMG TAKEN
            //{
            //    'local_room': 'W57S11',
            //    'local_resource': RESOURCE_OXYGEN,
            //    'remote_resource': RESOURCE_GHODIUM,
            //    'remote_room': 'W48S18'
            //}
        product_chains[RESOURCE_LEMERGIUM_OXIDE] = // // +100% HEAL
            {
                'local_room': 'W48S18',
                'local_resource': RESOURCE_LEMERGIUM,
                'remote_resource': RESOURCE_OXYGEN,
                'remote_room': 'W53S12'
            }
        product_chains[RESOURCE_LEMERGIUM_ALKALIDE] = // +200% HEAL (T2)
            {
                'local_room': 'W53S18',
                'local_resource': RESOURCE_HYDROXIDE,
                'remote_room': 'W48S18',
                'remote_resource': RESOURCE_LEMERGIUM_OXIDE
            }
        product_chains[RESOURCE_HYDROXIDE] = // REQUIRED FOR T2 BOOSTS
            {
                'local_room': 'W53S18',
                'local_resource': RESOURCE_HYDROGEN,
                'remote_resource': RESOURCE_OXYGEN,
                'remote_room': 'W53S12'
            }
        /*
        product_chains[RESOURCE_HYDROXIDE] = // REQUIRED FOR T2 BOOSTS, 2ND COPY
            {
                'local_room': 'W46S17',
                'local_resource': RESOURCE_HYDROGEN,
                'remote_resource': RESOURCE_OXYGEN,
                'remote_room': 'W56S18'
            }
        */
        product_chains[RESOURCE_ZYNTHIUM_HYDRIDE] = // T1, +100% dismantle
            {
                'local_room': 'W53S6',
                'local_resource': RESOURCE_ZYNTHIUM,
                'remote_resource': RESOURCE_HYDROGEN,
                'remote_room': 'W46S17'
            }
        product_chains[RESOURCE_ZYNTHIUM_HYDRIDE] = // T2, +200% dismantle
            {
                'local_room': 'W53S6',
                'local_resource': RESOURCE_ZYNTHIUM_HYDRIDE,
                'remote_resource': RESOURCE_HYDROXIDE,
                'remote_room': 'W53S18'
            }
        for (var goal in ongoing_reactions) {
            
            var this_reaction = ongoing_reactions[goal];
            
            var reaction_created = 0;
            if (this_reaction['creation_time']) {
                reaction_created = this_reaction['creation_time'];
            }
            var reaction_age = Game.time - reaction_created;
            if (reaction_age > 5000 && this_reaction['state'] != 3) {
                console.log('Science eval OLD ( ' + reaction_age + ') state ' + this_reaction['state'] + ' reaction for ' + goal + ': ' + JSON.stringify(this_reaction));
                Memory['ongoing_reactions'][goal]['state'] = 3;
                continue;
                
            }
            var rname = this_reaction['local_room'];
            var local_resource = this_reaction['local_resource'];
            var remote_resource = this_reaction['remote_resource'];
            var rm = Game.rooms[this_reaction['local_room']];
            if (this_reaction['state'] == 0) {
                empire[rname].sources['labs'] = {'sourcename': empire[rname]['roomname'] + '-L', 'x':25, 'y':25, 'assigned': {}, 'expected_income': 25, 'dynamic': 1}
                empire[rname].sources['labs'].assigned['labtech'] = 1;
                // ASSIGNING LABS
                var rlabs = rm.find(FIND_MY_STRUCTURES, { filter: function(structure){ if(structure.structureType == STRUCTURE_LAB && structure.isAvailable()) { return 1; } else { return 0; } } });
                if (rlabs.length < 3) {
                    if (Game.time % 50 === 0) {
                        console.log('Science: ongoing_reaction ' + goal + ' is stuck in a room ' + rname + ' without 3 labs for ' + reaction_age + '...');
                    }
                    continue;
                }
                var input_lab_1 = _.sample(rlabs);
                if (input_lab_1 == undefined || input_lab_1.id == undefined) {
                    console.log('Science: ' + rname + '/' + goal + ': lab 1 unpickable for ' + reaction_age + ', debug: ' + JSON.stringify(rlabs));
                    continue;
                }
                var rlabs2 = rm.find(FIND_MY_STRUCTURES, { filter: function(structure){ 
                    if (structure.structureType == STRUCTURE_LAB && structure.isAvailable() && structure.pos.getRangeTo(input_lab_1) <= 2 && structure.id != input_lab_1.id) { return 1; } else { return 0; } 
                } });
                var input_lab_2 = _.sample(rlabs2);
                if (input_lab_2 == undefined || input_lab_2.id == undefined) {
                    console.log('Science: ' + rname + '/' + goal + ': lab 2 unpickable for ' + reaction_age + ', debug: ' + JSON.stringify(rlabs2));
                    continue;
                }
                var rlabs3 = rm.find(FIND_MY_STRUCTURES, { filter: function(structure){ 
                    if (structure.structureType == STRUCTURE_LAB && structure.isAvailable() && structure.pos.getRangeTo(input_lab_1) <= 2 && structure.id != input_lab_1.id 
                    && structure.pos.getRangeTo(input_lab_2) <= 2 && structure.id != input_lab_2.id) { return 1; } else { return 0; } 
                    
                } });
                var output_lab = _.sample(rlabs3);
                if (output_lab == undefined || output_lab.id == undefined) {
                    console.log('Science: ' + rname + '/' + goal + ': lab 3 unpickable for ' + reaction_age + ', debug: ' + JSON.stringify(rlabs3));
                    continue;
                }                

                // We're good to go, do assignments.
                this_reaction['input_1'] = input_lab_1.id;
                assigned_labs[input_lab_1.id] = {'mineralid': local_resource, 'purpose': 'reaction', 'endproduct': goal, 'action': 'fill'};
                
                this_reaction['input_2'] = input_lab_2.id;
                assigned_labs[input_lab_2.id] = {'mineralid': remote_resource, 'purpose': 'reaction', 'endproduct': goal,  'action': 'fill'};
                
                this_reaction['output'] = output_lab.id;
                assigned_labs[output_lab.id] = {'mineralid': goal, 'purpose': 'reaction', 'endproduct': goal,  'action': 'ignore'};
                
                
                this_reaction['state'] = 1;
                this_reaction['reactionid'] = rm.name + goal + Game.time;
                console.log('Science: ongoing_reaction ' + goal + ' was successfully assigned labs! Debug: ' + JSON.stringify(this_reaction));
                
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
                    //console.log('Science: ' + rname + '/' + goal + ': waiting for lab1 ' + lab_input_1.id + ' to fill with ' + local_resource + ' (' + lab_input_1.mineralAmount + '/' + lab_input_1.mineralCapacity + '), ' + local_amt + ' in storage.');
                    Memory['assigned_labs'][lab_input_1.id] = {'mineralid': local_resource, 'purpose': 'reaction', 'endproduct': goal,  'action': 'fill'};
                    new RoomVisual(rm.name).text(local_resource, lab_input_1.pos.x, lab_input_1.pos.y + 1.5, {color: 'red', backgroundColor: 'white', font: 0.8});
                    continue;
                }
                if (lab_input_2.mineralAmount < lab_input_2.mineralCapacity) {
                    var remote_amt = 0;
                    if(terminal.store[remote_resource] != undefined && terminal.store[remote_resource] > 0) {
                        remote_amt = terminal.store[remote_resource];
                    }
                    //console.log('Science: ' + rname + '/' + goal + ': waiting for lab2 ' + lab_input_2.id + ' to fill with ' + remote_resource + ' (' + lab_input_2.mineralAmount + '/' + lab_input_2.mineralCapacity + '), ' + remote_amt + ' in storage.');
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
                
                for (var crname in Game.creeps) {
                    if (Game.creeps[crname].memory[MEMORY_ROLE] != 'labtech') {
                        continue;
                    }
                    if (Game.creeps[crname].memory[MEMORY_DEST] != rname) {
                        continue;
                    }
                    Game.creeps[crname].memory[MEMORY_JOB] = JOB_IDLE;
                }
                
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
                if (result != OK) {
                    console.log('Science: ' + rname + '/' + goal + ': (lab ' + lab_output.id + ') running output: ' + lab_output.mineralAmount + '/' + lab_output.mineralCapacity + ': result:' + result);
                }
                if (result == ERR_NOT_IN_RANGE || result == ERR_INVALID_ARGS) {
                    var setup_fail_msg = 'Science: ' + rname + '/' + goal + ': (lab ' + lab_output.id + ') FATAL SETUP ERROR, BAD DISTANCE OR LAB MATERIALS MISMATCH.  Debug: ' + JSON.stringify(this_reaction);
                    console.log(setup_fail_msg);
                    Game.notify(setup_fail_msg);
                } else {
                    if (lab_output.mineralAmount != lab_output.mineralCapacity && lab_input_1.mineralAmount >= 5 && lab_input_2.mineralAmount >= 5){
                        continue;
                    }
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

                if (this_reaction['input_1']){
                    delete Memory['assigned_labs'][this_reaction['input_1']];
                }
                if (this_reaction['input_2']){
                    delete Memory['assigned_labs'][this_reaction['input_2']];
                }
                if (this_reaction['output']){
                    delete Memory['assigned_labs'][this_reaction['output']];
                }

                /*
                var lab_input_1 = Game.structures[this_reaction['input_1']];
                var lab_input_2 = Game.structures[this_reaction['input_2']];
                var lab_output = Game.structures[this_reaction['output']];
                var labs_to_clear = [];
                if (lab_input_1) {
                    labs_to_clear.push(lab_input_1);
                }
                if (lab_input_2) {
                    labs_to_clear.push(lab_input_2);
                }
                if (lab_output) {
                    labs_to_clear.push(lab_output);
                }
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
                delete Memory['assigned_labs'][lab_input_1.id];
                delete Memory['assigned_labs'][lab_input_2.id];
                delete Memory['assigned_labs'][lab_output.id];
                */
                console.log('Science: reaction ' + rname + '/' + goal + ':  is FINISHED. Deleted...');
                delete Memory['ongoing_reactions'][goal];

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
                //console.log('Science: skipping ' + goal + ' because factory_room_terminal is undefined.');
                continue;
            }
            var local_component = reaction['local_resource'];
            var mined_mineral_amount = factory_room_terminal.store[local_component];
            if (mined_mineral_amount == undefined || mined_mineral_amount < 3000) {
                //console.log('Science: skipping ' + goal + '/' + factory_room_name + ' because local_room room terminal lacks 3000 ' + local_component);
                continue;
            }
            var product_amount = 0;
            if (factory_room_terminal.store[goal] != undefined) {
                product_amount = factory_room_terminal.store[goal];
            }
            if (product_amount >= 20000) {
                //console.log('Science: skipping ' + goal + '/' + factory_room_name + ' because we already have ' + product_amount + ' of our 20k target for ' + goal);
                continue;
            } else {
                //console.log('Science: for ' + goal + '/' + factory_room_name + ' has ' + factory_room_terminal.store[goal] + ' of goal :::' + goal);
                //console.log(JSON.stringify(factory_room_terminal.store));
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
                    if (Game.time % 100 == 0) {
                        console.log('Science: ' + goal + '/' + factory_room_name + ': the remote ' + remote_room_name + ' lacks 3k ' + remote_resource);
                    }
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
            if (output_products != undefined && output_products >= 20000) {
                console.log('Science: ' + goal + '/' + factory_room_name + ': not proceeding because ' + factory_room_name + ' already has 20k ' + goal);
                continue;
            }
            if (ongoing_reactions[goal] != undefined) {
                console.log('Science: ' + goal + '/' + factory_room_name + ': BUG: already have a LIVE REACTION TASK FOR: ' + goal + ' when we went to create one!');
                continue;
            }
            var rlabs = Game.rooms[factory_room_name].find(FIND_MY_STRUCTURES, { filter: function(structure){ if(structure.structureType == STRUCTURE_LAB && structure.isUnassigned()) { return 1; } else { return 0; } } });
            if (rlabs.length < 3) {
                //console.log('Science: ' + goal + '/' + factory_room_name + ': cannot create live reaction task for: ' + goal + ' as that room does not have three unassigned labs!');
                continue;
            }
            // Yes, we should create one!            
            reaction['state'] = 0;
            reaction['creation_time'] = Game.time;
            ongoing_reactions[goal] = reaction;
            console.log('Science: CREATED LIVE REACTION TASK FOR: ' + goal + '/' + factory_room_name + ': ' + JSON.stringify(reaction));
            
            return; // This prevents us from creating multiple live reactions in a single tick, which could lead to two reactions competing for the same stockpile.
            
        }
    }

};