const https = require("./https");
const configuration = require("./configuration");

function showHelp(error){
	let log = error?console.error:console.log;
	if (error){
		log("Error:",error);
		log("");
	}
	log(module.exports.getDescription());
	log("");
	log("usage: npx arigo start-mode [start-mode]");
	log("");
	log("Available start modes:");
	log("   none                    Start without debugging.(Default)");
	log("   inspect                 Start in debug mode");
	log("   inspect-brk             Start in debug mode and break before");
	log("                           the app code starts");
	log("");
	log("!!! Caution !!!");
	log("If you set the start mode the target is restarted.");
	log("");
	log("usage: npx arigo start-mode [options]");
	log("   -h    --help            Shows this help.");

	if (error) process.exit(-1);
	else process.exit(0);
}


async function execute(args){
	let startMode = "none";
	if (args.length > 0) startMode = args[0];
	if (startMode === "-h" || startMode === "--help") showHelp();
	if (startMode === "none" ||
		startMode === "inspect" ||
		startMode === "inspect-brk") return await setStartMode(startMode);

	showHelp(`Unknown option "${startMode}."`);
}

async function setStartMode(startMode){
	let config = await configuration.get();
	console.log(`Set start mode for target "${config.target}" to "${startMode}"`);
	await https.PUT("/~/dev/0/fb/develop/dp/nodeDebug/dat/value",startMode);
}

module.exports = {
	getDescription : function(){ return "Change the start-mode, none, inspect, inspect-brk.";},
	execute : execute
};
