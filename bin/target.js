const fs = require('fs').promises;
const configuration = require("./configuration");
const https = require("./https");

function showHelp(error){
	let log = error?console.error:console.log;
	if (error){
		log("Error:",error);
		log("");
	}
	log(module.exports.getDescription());
	log("");
	log("usage: npx arigo target [options]");
	log("");
	log(" Setup the configuration.");
	log("   -h    --host            IP address of the target.");
	log("                           Default: Previous configured value");
	log("   -u    --user            Admin user of the target.");
	log("                           Default: admin or the previous configured value");
	log("   -p    --password        Password of the user.");
	log("                           Default: admin or the previous configured value");
	log("         --ssh-port        SSH Port");
	log("                           Default: 22 or the previous configured value");
	log("         --https-port      HTTPS Port.");
	log("                           Default: 443 or the previous configured value");
	log("");
	log(" Shows the actual configuration");
	log("   -s    --show");
	log("");
	log(" Show this help");
	log("         --help");

	if (error) process.exit(-1);
	else process.exit(0);
}


async function execute(args){
	if (args.length === 0){
		showHelp("Missing parameters.");
	}

	let config = await configuration.get();

	for (let i=0; i< args.length; i++){
		if (args[i] === "-h" || args[i] === "--host"){
			if (args.lenth -1 === i || args[i+1].startsWith("-")) showHelp("Missing value for parameter host.");
			config.target = args[i+1];
			i++;
		}
		else if (args[i] === "-u" || args[i] === "--user"){
			if (args.lenth -1 === i || args[i+1].startsWith("-")) showHelp("Missing value for parameter user.");
			config.username = args[i+1];
			i++;
		}
		else if (args[i] === "-p" || args[i] === "--password"){
			if (args.lenth -1 === i || args[i+1].startsWith("-")) showHelp("Missing value for parameter password.");
			config.password = args[i+1];
			i++;
		}
		else if (args[i] === "--ssh-port"){
			if (args.lenth -1 === i || args[i+1].startsWith("-")) showHelp("Missing value for parameter ssh-port.");
			config["ssh-port"] = args[i+1];
			i++;
		}
		else if (args[i] === "--https-port"){
			if (args.lenth -1 === i || args[i+1].startsWith("-")) showHelp("Missing value for parameter https-port.");
			config["https-port"] = args[i+1];
			i++;
		}else if (args[i] === "-s" || args[i] === "--show") return await showConfig(config);
		else if (args[i] === "--help") showHelp();
		else showHelp(`Unknown option "${args[i]}."`);
	}

	if (!config.target) showHelp("Missing host.");
	console.log(`Setup Visual Studion Code for target "${config.target}"`);
	await setupTarget(config);
}

async function showConfig(config){
	console.log("Actual target config");
	console.log(`target:     ${config.target}`);
	console.log(`user:       ${config.username}`);
	console.log(`ssh-port:   ${config["ssh-port"]}`);
	console.log(`https-port: ${config["https-port"]}`);
}

async function setupTarget(config){
	await configuration.save(config);
	await setupSftp(config);
	let version = await getVersion();
	await setupLauncher(config, version);
}

async function getVersion(){
	return await https.GET("/~/dev/0/fb/Setup/dp/version/dat/value");
}

async function setupSftp(config){
	let sftpConfig = JSON.parse(await fs.readFile("./.vscode/sftp.json","utf8"));
	sftpConfig.name = config.target;
	sftpConfig.host = config.target;
	sftpConfig.port = config["ssh-port"];
	sftpConfig.username = config.username;
	sftpConfig.password = config.password;
	await fs.writeFile("./.vscode/sftp.json",JSON.stringify(sftpConfig,null,2),"utf8");
}

async function setupLauncher(config, version){
	let lauchConfig = JSON.parse(await fs.readFile("./.vscode/launch.json","utf8"));
	let configuration = lauchConfig.configurations[0];
	configuration.name = config.target;
	configuration.address = config.target;
	configuration.remoteRoot = `/usr/lib/arigo/rumo/rumo_${version}`;
	await fs.writeFile("./.vscode/launch.json",JSON.stringify(lauchConfig,null,2),"utf8");
}

module.exports = {
	getDescription : function(){ return "Setup the target configuration.";},
	execute : execute
};
