var jobRecycle = require('job.recycle');

var roleRecycle = {
    run: function(creep) {
        jobRecycle.run(creep);
	}
};

module.exports = roleRecycle;