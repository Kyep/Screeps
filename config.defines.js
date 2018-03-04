// GLOBAL memory keys, IE: Memory['this_key']
global.MEMORY_GLOBAL_ROOMSTOCLAIM = 'rooms_to_claim';
global.MEMORY_GLOBAL_ESPIONAGE = 'espionage';
global.MEMORY_GLOBAL_CPUSTATS = 'cpustats';
global.MEMORY_GLOBAL_GCONFIG = 'gconfig';
global.MEMORY_GLOBAL_TICKCOMPLETED = 'tickcompleted';
global.MEMORY_GLOBAL_LINKS = 'links';

global.GLOBALCONFIG = global.GET_ALL_GLOBAL_CONFIG();


// Creep memory, top-level categories
global.MEMORY_ROLE = 'role';
global.MEMORY_AISCRIPT = 'aiscript';
global.MEMORY_SOURCE = 'source';
global.MEMORY_HOME = 'home';
global.MEMORY_HOME_X = 'home_x';
global.MEMORY_HOME_Y = 'home_y';
global.MEMORY_DEST = 'dest';
global.MEMORY_DEST_X = 'dest_x';
global.MEMORY_DEST_Y = 'dest_y';
global.MEMORY_NEXTDEST = 'nextdest'
global.MEMORY_SPAWNERNAME = 'spawnername';
global.MEMORY_SPAWNERROOM = 'spawnerroom';
global.MEMORY_RENEW = 'renew_allowed';
global.MEMORY_RENEWALS = 'renewals';
global.MEMORY_CREATED_AT = 'created_at';
global.MEMORY_NEEDED = 'needed';
global.MEMORY_JOB = 'job';
global.MEMORY_CONTAINER = 'container';
global.MEMORY_H_CONTAINER = 'container_h';
global.MEMORY_EARNINGS = 'earnings';
global.MEMORY_JOURNEYSTART = 'journeystart';
global.MEMORY_ATTACKEDIN = 'attackedin';
global.MEMORY_ATTACKEDAT = 'attackedat';
global.MEMORY_RALLYROOM = 'rallyroom';
global.MEMORY_LAST_WAYPOINT = 'lastwaypoint';
global.MEMORY_REUSEPATH = 'reusepath';
global.MEMORY_SLEEPFOR = 'sleepfor';
global.MEMORY_INIT = 'init_time';
global.MEMORY_TANK = 'tank';
global.MEMORY_HEALER = 'healer';
global.MEMORY_STEPS_ACTUAL = 'steps_actual';
global.MEMORY_STEPS_EXPECTED = 'steps_expected';
global.MEMORY_FRUSTRATION = 'frustration';
global.MEMORY_MINERALID = 'mineralid';
global.MEMORY_LABID = 'labid';
global.MEMORY_SIGN = 'sign';
global.MEMORY_TARGETID = 'targetid';
global.MEMORY_BOOSTSALLOWED = 'boostsallowed';
global.MEMORY_BOOSTSWANTED = 'boostswanted';
global.MEMORY_BOOSTSGOT = 'boostsgot';
global.MEMORY_BOOSTSMISSING = 'boostsmissing';
global.MEMORY_HAULERSLEEP = 'haulersleep';

// Creep memory, roles
global.ROLE_HARVESTER = 'harvester';
global.ROLE_CHARVESTER = 'charvester';
global.ROLE_HAULER = 'hauler';
global.ROLE_EXTRACTOR = 'extractor';
global.ROLE_UPGRADER = 'upgrader';
global.ROLE_UPGRADERSTORAGE = 'upgraderstorage';
global.ROLE_GROWER = 'grower';
global.ROLE_BUILDER = 'builder';
global.ROLE_BUILDERSTORAGE = 'builderstorage';
global.ROLE_TELLER = 'teller';
global.ROLE_TELLERTOWERS = 'tellertowers';
global.ROLE_DRAINER = 'drainer';
global.ROLE_SIEGE = 'siege';
global.ROLE_SIEGEHEALER = 'siegehealer';
global.ROLE_DEFENSE = 'defense';
global.ROLE_SCAVENGER = 'scavenger';
global.ROLE_CLAIMER = 'claimer';
global.ROLE_RESERVER = 'reserver';
global.ROLE_RECYCLER = 'recycler';
global.ROLE_SIGNER = 'signer';
global.ROLE_REMOTECONSTRUCTOR = 'remoteconstructor';
global.ROLE_LABTECH = 'labtech';
global.ROLE_NUKETECH = 'nuketech';
global.ROLE_DISMANTLER = 'dismantler';


// Creep memory, job types
global.JOB_HARVEST = 'mine';
global.JOB_BUILD = 'build';
global.JOB_GFS = 'gfs';
global.JOB_PATROL = 'patrol';
global.JOB_RENEW = 'renew';
global.JOB_REPAIR = 'repair';
global.JOB_RETURN = 'return';
global.JOB_SCAVENGE = 'clean';
global.JOB_UPGRADE = 'upgrade';
global.JOB_TRAVEL_OUT = 'go-out';
global.JOB_TRAVEL_BACK = 'go-back';
global.JOB_IDLE = 'idle';
global.JOB_EXTRACT ='extract';
global.JOB_STOREMINERALS = 'storeminerals';
global.JOB_USELINK = 'uselink'
global.JOB_HIDE = 'hide';
global.JOB_DISMANTLE = 'dismantle';

// Rooms, top level memory categories
global.MEMORY_ROAD_NETWORK = 'road_network';
global.MEMORY_RCONFIG = 'rconfig';
global.MEMORY_EHISTORY = 'ehistory';

// Spawns, top level memory categories
global.MEMORY_SPAWNINGROLE = 'role_spawning';
global.MEMORY_SPAWNINGDEST = 'dest_spawning';


global.COLOR_HARVEST = '#ffffff';
global.COLOR_UPGRADE = '#0000ff';
global.COLOR_BUILD = '#0000ff';
global.COLOR_REPAIR = '#0000ff';
global.COLOR_PATROL = '#ff0000';
global.COLOR_DROPOFF = '#ffff00';
global.COLOR_GFS = '#ffff00';
global.COLOR_RENEW = '#ff00ff';
global.COLOR_SCAVAGE = '#000000';


global.FLAG_GROUNDZERO = 'nucleartarget';
global.FLAG_ROADORIGIN = 'roadorigin';
global.FLAG_ROADDEST = 'roaddest';
global.FLAG_RALLYMIL = 'mobrallymil';
global.FLAG_SIEGETARGET = 'siegetarget';
