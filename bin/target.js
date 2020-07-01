const fs = require('fs').promises;
const configuration = require("./configuration");
const https = require("./https");
const child_process = require("child_process");

function showHelp(error){
	let log = error?console.error:console.log;
	if (error){
		log("Error:",error);
		log("");
	}
	log(module.exports.getDescription());
	log("");
	log("Set the configuration for a target.");
	log("   usage: npx arigo target set <host> [options]");
	log("   host                    IP address of the target.");
	log("");
	log("   Options:");
	log("   -u    --user            Admin user of the target.");
	log("                           Default: admin or the previous configured value");
	log("   -p    --password        Password of the user.");
	log("                           Default: admin or the previous configured value");
	log("         --ssh-port        SSH Port");
	log("                           Default: 22 or the previous configured value");
	log("         --https-port      HTTPS Port.");
	log("                           Default: 443 or the previous configured value");
	log("   This configuration is also activated");
	log("");
	log("Shows the actual configuration for a target");
	log("   usage: npx arigo target show [<host>]");
	log("   host                    IP address of the target.");
	log("                           If not set the activated configuration is shown.");
	log("");
	log("Activate the configuration for a target with the previous set configuration");
	log("   usage: npx arigo target activate <host>");
	log("   host                    IP address of the target.");
	log("");
	log("Delete configuration for a target");
	log("   usage: npx arigo target delete <host>");
	log("   host                    IP address of the target.");
	log("");
	log("usage: npx arigo target [options]");
	log("   -h    --help            Shows this help.");
	log("");
	log("Copyright (c) 2014-2020 by ARIGO-Software GmbH. All rights reserved.");

	if (error) process.exit(-1);
	else process.exit(0);
}


async function execute(args){
	if (args.length === 0) showHelp("Missing parameters.");


	let command = args.shift();
	if (command === "-h" || command === "--help") showHelp();
	if (command !== "set" &&
		command !== "activate" &&
		command !== "delete" &&
		command !== "show") showHelp(`Unknown command "${command}."`);

	let host = args.shift();
	let target = await configuration.get(host);

	if (command === "show") return await showTargetConfig(target);
	if (!host) showHelp("Missing host.");
	if (command === "activate") return await activateTarget(target);
	if (command === "delete") return await deleteTarget(target);

	for (let i=0; i< args.length; i++){
		if (args[i] === "-u" || args[i] === "--user"){
			if (args.lenth -1 === i || args[i+1].startsWith("-")) showHelp("Missing value for parameter user.");
			target.username = args[i+1];
			i++;
		}
		else if (args[i] === "-p" || args[i] === "--password"){
			if (args.lenth -1 === i || args[i+1].startsWith("-")) showHelp("Missing value for parameter password.");
			target.password = args[i+1];
			i++;
		}
		else if (args[i] === "--ssh-port"){
			if (args.lenth -1 === i || args[i+1].startsWith("-")) showHelp("Missing value for parameter ssh-port.");
			target["ssh-port"] = args[i+1];
			i++;
		}
		else if (args[i] === "--https-port"){
			if (args.lenth -1 === i || args[i+1].startsWith("-")) showHelp("Missing value for parameter https-port.");
			target["https-port"] = args[i+1];
			i++;
		}else showHelp(`Unknown option "${args[i]}."`);
	}
	console.log(`Setup Visual Studion Code for target "${target.host}"`);
	await setupTarget(target);
}

async function showTargetConfig(target){
	console.log(`Actual config for target "${target.host}"`);
	console.log(`user:       ${target.username}`);
	console.log(`ssh-port:   ${target["ssh-port"]}`);
	console.log(`https-port: ${target["https-port"]}`);
}

async function setupTarget(target){
	await configuration.save(target);
	await activateTarget(target);
}

async function activateTarget(target){
	let actTarget = await configuration.get();
	await configuration.activate(target.host);
	await setupSftp(target);
	let version = await getVersion();
	await setupLauncher(target, version);
	console.log(`Target "${target.host}" activated`);
	if (actTarget.host !== target.host){
		console.log("");
		console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
		console.log("!!  To change the sftp target please save the file .vscode/sftp.json  !!");
		console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
		child_process.execSync(`code --goto .vscode/sftp.json`);
	}
}

async function getVersion(){
	return await https.GET("/~/dev/0/fb/Setup/dp/version/dat/value");
}

async function deleteTarget(target){
	await removeSftp(target);
	await removeLauncher(target);
	await configuration.delete(target.host);
}

async function setupSftp(target){
	let sftpConfig = await readSftp();
	sftpConfig.name = target.host;
	sftpConfig.host = target.host;
	sftpConfig.port = target["ssh-port"];
	sftpConfig.username = target.username;
	sftpConfig.password = target.password;
	await saveSftp(sftpConfig);
}

async function removeSftp(target){
	let sftpConfig = await readSftp();
	if (sftpConfig.host === target.host){
		sftpConfig.name = "your target";
		sftpConfig.host = "your target ip";
		sftpConfig.port = 22;
		sftpConfig.username = "";
		sftpConfig.password = "";
		await saveSftp(sftpConfig);
	}
}

async function readSftp(){
	return JSON.parse(await fs.readFile("./.vscode/sftp.json","utf8"));
}

async function saveSftp(sftpConfig){
	await fs.writeFile("./.vscode/sftp.json",JSON.stringify(sftpConfig,null,2),"utf8");
}

async function setupLauncher(target, version){
	let launchConfig = await readLauncherConfig();
	let found = false;
	launchConfig.configurations.forEach(configuration=>{
		if (configuration.address === target.host){
			found = true;
			configuration.name = target.host;
			configuration.address = target.host;
			configuration.remoteRoot = `/usr/lib/arigo/rumo/rumo_${version}`;
		}
	});
	if (!found){
		launchConfig.configurations.push(
			{
				"name": target.host,
				"type": "node",
				"request": "attach",
				"port": 9229,
				"address": target.host,
				"protocol": "inspector",
				"localRoot": "${workspaceFolder}",
				"remoteRoot":`/usr/lib/arigo/rumo/rumo_${version}`,
				"smartStep": true,
				"skipFiles": [
					"<node_internals>/**/*.js",
					"<eval>/*",
					"${workspaceFolder}/node_modules/**/*.js",
					"${workspaceFolder}/addon/**/*.js",
					"${workspaceFolder}/lib/**/*.js",
					"${workspaceFolder}/service/**/*.js",
					"${workspaceFolder}/**/processor.js"
				]
			}
		);
	}
	await saveLauncherConfig(launchConfig);
}

async function removeLauncher(target){
	let launchConfig = await readLauncherConfig();
	launchConfig.configurations = launchConfig.configurations.filter(configuration=>configuration.address !== target.host);
	await saveLauncherConfig(launchConfig);
}

async function readLauncherConfig(){
	return JSON.parse(await fs.readFile("./.vscode/launch.json","utf8"));
}

async function saveLauncherConfig(launchConfig){
	await fs.writeFile("./.vscode/launch.json",JSON.stringify(launchConfig,null,2),"utf8");
}


module.exports = {
	getDescription : function(){ return "Setup the target configuration.";},
	execute : execute
};
