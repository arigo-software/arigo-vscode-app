const configuration = require("./configuration");
const SFTPClient = require('sftp-promises');
const { save } = require("./configuration");

function showHelp(error){
	let log = error?console.error:console.log;
	if (error){
		log("Error:",error);
		log("");
	}
	log(module.exports.getDescription());
	log("");
	log("Set the log level for an app.");
	log("   usage: npx arigo log-level <module> <loglevel>");
	log("");
	log("   module            Log module. Value passt to the out module.");
	log("   loglevel          Log level for the module.");
	log("                     Possible values: debug, info, warn, error, default");
	log("                     default means that the global log level is used.");
	log("");
	log("Show the log level for an app.");
	log("   usage: npx arigo log-level <module>");
	log("");
	log("   module            Log module. Value passt to the out module.");
	log("");
	log("usage: npx arigo log-level [options]");
	log("   -h    --help            Shows this help.");
	log("");
	log("Copyright (c) 2014-2020 by ARIGO-Software GmbH. All rights reserved.");

	if (error) process.exit(-1);
	else process.exit(0);
}


async function execute(args){
	if (args.length === 0) showHelp("Missing parameters.");


	let module = args.shift();
    if (module === "-h" || module === "--help") showHelp();
	if (args.length === 0) return await showLogLevel(module);
    let logLevel = args.shift();
    if (logLevel !== "debug" &&
        logLevel !== "log" &&
        logLevel !== "info" &&
        logLevel !== "warn" &&
        logLevel !== "error" &&
        logLevel !== "default") showHelp(`Unkown log level ${logLevel}`);

    if (logLevel === "log") logLevel = "debug";

    if (logLevel === "default") await removeEntry(module);
    else await addEntry(module, logLevel);
}

async function showLogLevel(module){
    let sftpClient = await getSftpClient();
    let config = await readConfig(sftpClient);
    console.log(config)

    let logLevel = config.log && config.log.byModule && config.log.byModule[module];
    if (!logLevel) logLevel = "default";

    console.log(`Log level for module ${module}: ${logLevel}`);
}


async function removeEntry(module){
    let sftpClient = await getSftpClient();
    let config = await readConfig(sftpClient);
    if (config.log && 
        config.log.byModule) delete config.log.byModule[module];

    await saveConfig(sftpClient, config);
}

async function addEntry(module, logLevel){
    let sftpClient = await getSftpClient();
    let config = await readConfig(sftpClient);
    if (!config.log) config.log = {};
    if (!config.log.byModule) config.log.byModule = {};
    config.log.byModule[module] = logLevel;

    await saveConfig(sftpClient, config);
    
}

async function getSftpClient(){
    let target = await configuration.get();
    return new SFTPClient({
        host: target.host, 
        username: target.username, 
        password: target.password,
        port : target["ssh-port"]
    });
}

async function readConfig(sftpClient){
    return JSON.parse(await sftpClient.getBuffer("/config/config.json"));
}

async function saveConfig(sftpClient, config){
    var buf = Buffer.from(JSON.stringify(config, null, 2), 'utf8');
    await sftpClient.putBuffer(buf, "/config/config.json")
}


module.exports = {
	getDescription : function(){ return "Configure the log level for apps.";},
	execute : execute
};
