Flag.prototype.isRoadActive = function() {
    var color_list = FLAG_TYPE_TO_COLORS_COLORS(FLAG_ROADDEST);
    if (!color_list.length) {
        return -1;
    }
    if (color_list[0] != this.color) {
        return -2;
    }
    if (color_list[1] != this.secondaryColor) {
        return -3;
    }
    var myexits = Game.map.describeExits(this.room.name);
    var exnum = 0;
    if (this.pos.x == 0) {
        exnum = "7";
    } else if (this.pos.x == 49) {
        exnum = "3";
    } else if (this.pos.y == 0) {
        exnum = "1";
    } else if (this.pos.y == 49) {
        exnum = "5";
    }
    if (exnum === 0) {
        return true;
    }
    var destr = myexits[exnum];
    if (!destr) {
        console.log("Flag.isRoadActive: " + this.name + " in " + this.room.name + " not active because my pos " + this.pos.x + "/" + this.pos.y + " is not on an edge.");
        return false;
    }
    if (!Game.rooms[destr]) {
        console.log("Flag.isRoadActive: Outgoing room is not in Game.rooms: " + destr + "...");
        return false;
    }
    if (Game.rooms[destr].isMine()) {
        console.log("Flag.isRoadActive: Outgoing room is not in Game.rooms: " + destr + "...");
        return true;
    }
    if (Game.rooms[destr].isRemote()) {
        console.log("Flag.isRoadActive: Outgoing room is not a remote: " + destr + "...");
        return true;
    }
    console.log("Flag.isRoadActive: Outgoing room IS a remote: " + destr + "...");
    return false;
    
}