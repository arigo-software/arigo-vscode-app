const fs = require('fs').promises;

async function get(host){
	let config = await readConfig();
	if (!host) host = config.activeHost;
	if (!host) return;
	let target = config.targets[host];
	if (!target) target = {};
	if (!target["username"]) target["username"] = "admin";
	if (!target["password"]) target["password"] = "admin";
	if (!target["ssh-port"]) target["ssh-port"] = 22;
	if (!target["https-port"]) target["https-port"] = 443;

	target.host = host;

	return target;
}

async function readConfig(){
	let config;
	try{
		config = JSON.parse(await fs.readFile("./.vscode/target.json","utf8"));
 	}catch(err){}
	if (!config) config = {};
	if (!config.targets) config.targets = {};
	return config;
}

async function save(target){
	let config = await readConfig();
	let host = target.host;
	delete target.host;
	config.targets[host] = target;
	await saveConfig(config);
	target.host = host;
}

async function saveConfig(config){
	await fs.writeFile("./.vscode/target.json",JSON.stringify(config,null,2),"utf8");
}

async function del(host){
	let config = await readConfig();
	delete config.targets[host];
	if (config.activeHost === host) config.activeHost = "";
	await saveConfig(config);
}


async function activate(host){
	let config = await readConfig();
	config.activeHost = host;
	await saveConfig(config);
}

module.exports = {
	get : get,
	save : save,
	delete : del,
	activate : activate
};
