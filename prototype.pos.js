RoomPosition.prototype.hasStructureOfType = function(structuretype) {
    if (structuretype == undefined) {
        return false;
    }
    var objects_here = this.look();
    for (var k = 0; k < objects_here.length; k++) {
        if (objects_here[k]["type"] != "structure") {
            continue;
        }
        var str = objects_here[k]["structure"];
        if (str.structureType == structuretype) {
            return true;
        }
    }
    return false;
}