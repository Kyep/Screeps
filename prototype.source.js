Source.prototype.getSlotPositions = function() {
    var slots = [];
    for (var i = this.pos['x'] - 1; i <= this.pos['x'] + 1; i++) {
        for (var j = this.pos['y'] - 1; j <= this.pos['y'] + 1; j++) {
            var tpos = new RoomPosition(i, j, this.room.name);
            var lresults = Game.map.getTerrainAt(tpos);
            //console.log(JSON.stringify(lresults));
            if (lresults == "plain" || lresults == "swamp") {
                slots.push(tpos);
                //new RoomVisual(this.room.name).circle(tpos, {stroke: 'green'});
            } else {
                //new RoomVisual(this.room.name).circle(tpos, {stroke: 'red'});
            }
        }
    }
    return slots;
}

Source.prototype.getQuadrant = function() {
    var x = this.pos.x;
    var y = this.pos.y;
    if (x >= 25) {
        if (y >= 25) {
            return 'SE';
        }  else {
            return 'NE';
        }
    } else {
        if (y >= 25) {
            return 'SW';            
        }  else {
            return 'NW';            
        }
    }
}