module.exports = {

    process: function(){
        //console.log('RUNNING CLEANER');
         // Always place this memory cleaning code at the very top of your main loop!
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
    }

};