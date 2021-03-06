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
	log("usage: npx arigo restart");
	log("");
	log(" Show this help");
	log("   -h    --help");
	log("");
	log("Copyright (c) 2014-2020 by ARIGO-Software GmbH. All rights reserved.");

	if (error) process.exit(-1);
	else process.exit(0);
}


async function execute(args){
	if (args.length === 0) return await restart();
	if (args[0] !== "-h" && args[0] !== "--help") showHelp(`Unknown option "${args[0]}."`);

	showHelp();
}

async function restart(){
	let target = await configuration.get();
	if (!target) throw "no activated target";
	console.log(`Restart target "${target.host}"`);
	await https.PUT("/~/dev/0/fb/develop/dp/restart/dat/value",true);
}

module.exports = {
	getDescription : function(){ return "Restart the target.";},
	execute : execute
};
