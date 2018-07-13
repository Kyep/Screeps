"use strict";

global.GET_ALL_FLAGS_OF_TYPE = function(ftype) {
    var flag_colors = FLAG_TYPE_TO_COLORS_COLORS(ftype);
    if (!flag_colors || flag_colors.length == 0) {
        console.log("GET_ALL_FLAGS_OF_TYPE: passed unknown flag type: " + ftype);
        return [];
    }
    var c1 = flag_colors[0];
    var c2 = flag_colors[1];
    return _.filter(Game.flags, (flag) => (flag.color == flag_colors[0]) && (flag.secondaryColor == flag_colors[1]));
}

global.SHOW_ALL_FLAGS_OF_TYPE = function(ftype) {
    var all_flags = GET_ALL_FLAGS_OF_TYPE(ftype);
    if (all_flags.length > 0) {
        for (var i = 0; i < all_flags.length; i++) {
            console.log('Flag: ' + all_flags[i].pos);
        }
    } else {
        console.log("SHOW_ALL_FLAGS_OF_TYPE: no flags exist of type: " + ftype);
    }
    return true;
}

global.CLEAR_ALL_FLAGS_OF_TYPE = function(ftype) {
    var all_flags = GET_ALL_FLAGS_OF_TYPE(ftype);
    for (var i = 0; i < all_flags.length; i++) {
        console.log('Flag: ' + all_flags[i].pos + ' - deleted.');
        all_flags[i].remove();
    }
    return true;
}