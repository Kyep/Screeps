"use strict";

Room.prototype.isRemote = function() {
    if (!Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT]) {
        return false;
    }
    if (!Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][this.name]) {
        return false;
    }
    if (!Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][this.name]['spawn_room']) {
        return false;
    }
    if (Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][this.name]['spawn_room'] == this.name) {
        return false;
    }
    return true;
}


global.COMPARE_ALL_REMOTES = function() {
    var bases = global.LIST_BASES();
    var diff = 0;
    for (var i = 0; i < bases.length; i++) {
        var rname = bases[i];
        diff += Game.rooms[rname].compareRemotes();
    }
    return diff;
}

Room.prototype.compareRemotes = function() {
    var origins = this.getFlagsByType(FLAG_ROADORIGIN);
}

Room.prototype.compareRemotes = function() {
    var actual = this.listRemotes();
    var suggested = this.suggestRemotes(); // true
    var differences = 0;
    for (var i = 0; i < actual.length; i++) {
        if (suggested.indexOf(actual[i]) == -1) {
            console.log(this.name +': suggest removing: ' + actual[i]);
            differences++;
        }
    }
    for (var i = 0; i < suggested.length; i++) {
        if (actual.indexOf(suggested[i]) == -1) {
            console.log(this.name +': suggest adding: ' + suggested[i]);
            differences++;
        }
    }
    return differences;
}

Room.prototype.setRemotes = function() {
    this.deleteRemotes();
    var suggested = this.suggestRemotes();
    var color_list = FLAG_TYPE_TO_COLORS_COLORS(FLAG_ROADORIGIN);
    
    for (var i = 0; i < suggested.length; i++) {
        var found_origin = false;
        for (var hash in Game.flags) {
            if (Game.flags[hash].pos.roomName != suggested[i]) {
                continue;
            }
            if (Game.flags[hash].color != color_list[0]) {
                continue;
            }
            if (Game.flags[hash].secondaryColor != color_list[1]) {
                continue;
            }
            found_origin = true;
            break;
        }
        if (found_origin) {
            console.log(this.name + ': adding remote: ' + suggested[i]);
        } else {
            console.log(this.name + ': adding remote WITH NO ROAD ORIGIN: ' + suggested[i]);
        }
        global.CLAIM_ROOM(suggested[i], this.name);
    }
    return suggested.length;
}

Room.prototype.listRemotes = function() {
    var my_remotes = [];
    for (var rname in Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT]) {
        if (rname == this.name) {
            continue;
        }
        if (Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][rname]['spawn_room'] == this.name) {
            my_remotes.push(rname);
        }
    }
    return my_remotes;
}

Room.prototype.deleteRemotes = function() {
    var myremotes = this.listRemotes();
    for (var i = 0; i < myremotes.length; i++) {
        delete Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][myremotes[i]];
        delete Memory.rooms[myremotes[i]];
    }
}

Room.prototype.suggestRemotes = function(verbose) {
    if (!this.isMine()) {
        return [];
    }
    var dist = 2;
    
    var original_exits = Object.values(Game.map.describeExits(this.name)); 
    var candidate_batch = Object.values(Game.map.describeExits(this.name)); // dist = 0.
    var chosen_candidates = [];
    var ok_candidates = [];
    var bad_candidates = [];

    for (var i = 0; i < dist; i++) { // Run this loop the same number of times as 'dist'.
        // consider existing candidates.
        if (verbose) {
            console.log(i +': ' + candidate_batch);
        }
        var next_batch = [];
        for (var j = 0; j < candidate_batch.length; j++) {
            var cand = candidate_batch[j];
            if (cand == this.name) {
                continue;
            }
            var e = Game.map.describeExits(cand);
            if (!e) {
                continue;
                
            }
            var their_exits = Object.values(e);
            if (chosen_candidates.indexOf(cand) == -1 && ok_candidates.indexOf(cand) == -1 && bad_candidates.indexOf(cand) == -1) {
                var rconf = GET_ROOM_CONFIG(cand);
                var scount = undefined;
                var einfo = Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][cand];
                if (rconf) {
                    if (Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][cand] && Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][cand]['spawn_room'] && Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][cand]['spawn_room'] != this.name) {
                        if (verbose) {
                            console.log(this.name +': bad potential remote: ' + cand + ' already taken by another base: ' + Memory[MEMORY_GLOBAL_EMPIRE_LAYOUT][cand]['spawn_room']);
                        }
                    } else {
                        scount = rconf['scount'];
                    }
                } else {
                    var einfo = Memory[MEMORY_GLOBAL_ESPIONAGE]['rooms'][cand];
                    if (einfo && einfo['scount']) {
                        scount = einfo['scount'];
                    }
                }
                if (einfo && einfo['owner'] && einfo['owner'] != overlord) {
                    if (verbose) {
                        console.log(this.name +': bad potential remote: ' + cand + ' owned by: ' + einfo['owner']);
                    }
                } else if (einfo && einfo['reserver'] && einfo['reserver'] != overlord) {
                    if (verbose) {
                        console.log(this.name +': bad potential remote: ' + cand + ' reserved by someone else.');
                    }
                } else if (scount == undefined) {
                    if (verbose) {
                        console.log(this.name +': bad potential remote: ' + cand + ' with no rconfig or einfo.');
                    }
                } else if (scount == 1) {
                    if (ok_candidates.indexOf(cand) == -1) {
                        if (verbose) {
                            console.log(this.name +': ok potential remote: ' + cand + ' with ' + scount + ' sources.');
                        }
                        ok_candidates.push(cand);
                    }
                } else if (scount == 2) {
                    if (chosen_candidates.indexOf(cand) == -1 && bad_candidates.indexOf(cand) == -1) {
                        if (original_exits.indexOf(cand) == -1) {
                            // if this is a good room that is NOT directly connected to our spawn room.
                            var shared_rooms = [];
                            var adj_base = false;
                            for (var k = 0; k < original_exits.length; k++) {
                                for (var l = 0; l < their_exits.length; l++) {
                                    if (original_exits[k] == their_exits[l] && (chosen_candidates.indexOf(their_exits[l]) != -1 || ok_candidates.indexOf(their_exits[l]) != -1)) {
                                        shared_rooms.push(their_exits[l]);
                                    }
                                    if (Game.rooms[their_exits[l]] && Game.rooms[their_exits[l]].isMine() && their_exits[l] != this.name) {
                                        adj_base = true;
                                    }
                                }
                            }
                            var path_through = undefined;
                            for (var k = 0; k < shared_rooms.length; k++) {
                                if (chosen_candidates.indexOf(shared_rooms[k]) != -1) {
                                    path_through = shared_rooms[k];
                                }
                            }
                            if (adj_base) {
                                if (verbose) {
                                    console.log(this.name +': potential remote: ' + cand + ' excluded as it is next to another base of ours.');
                                }
                            } else if (path_through) {
                                if (verbose) {
                                    console.log(this.name +': good potential remote: ' + cand + ' with ' + scount + ' sources and existing chosen connection through ' + path_through);
                                }
                                chosen_candidates.push(cand);
                            } else if (shared_rooms.length) {
                                chosen_candidates.push(cand);
                                chosen_candidates.push(shared_rooms[0]);
                                if (verbose) {
                                    console.log(this.name +': good potential remote: ' + cand + ' with ' + scount + ' sources, but connecting room not previously chosen, choosing now: ' + shared_rooms[0]);
                                }
                            } else {
                                if (verbose) {
                                    console.log(this.name +': good potential remote: ' + cand + ' with ' + scount + ' sources, but no valid path or potentially valid path: ');
                                }
                            }
                        } else {
                            if (verbose) {
                                console.log(this.name +': good potential remote: ' + cand + ' with ' + scount + ' sources.');
                            }
                            chosen_candidates.push(cand);
                        }
                        if (chosen_candidates.length >= 3) {
                            return chosen_candidates;
                        }
                    }
                } else {
                    if (verbose) {
                        console.log(this.name +': bad potential remote: ' + cand + ' with ' + scount + ' sources.');
                    }
                }

            }

            for (var k = 0; k < their_exits.length; k++) {
                var this_exit = their_exits[k];
                if (candidate_batch.indexOf(this_exit) == -1 && next_batch.indexOf(this_exit) == -1) {
                    next_batch.push(this_exit);
                } 
            }
            
        }
        candidate_batch = next_batch.slice();
    }
    if (chosen_candidates.length < 3 && ok_candidates.length) {
        chosen_candidates.push(ok_candidates.shift());
    }
    if (chosen_candidates.length < 3 && ok_candidates.length) {
        chosen_candidates.push(ok_candidates.shift());
    }
    if (verbose) {
        console.log(this.name +': advising remotes: ' + chosen_candidates);
    }
    return chosen_candidates;
}

Room.prototype.suicideRemoteCreeps = function() {
    var num = 0;
    for (var crname in Game.creeps) {
        var cr = Game.creeps[crname];
        if (cr.memory[MEMORY_HOME] != this.name) {
            continue;
        }
        if (cr.memory[MEMORY_DEST] == this.name) {
            continue;
        }
        cr.suicide();
        num++;
    }
    return num;
}