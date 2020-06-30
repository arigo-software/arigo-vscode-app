const fs = require('fs').promises;

async function get(){
	let config = {};
	try{
		config = JSON.parse(await fs.readFile("./.vscode/target.json","utf8"));
 	}catch(err){}
	if (!config["target"]) config["target"] = "";
	if (!config["username"]) config["username"] = "admin";
	if (!config["password"]) config["password"] = "admin";
	if (!config["ssh-port"]) config["ssh-port"] = 22;
	if (!config["https-port"]) config["https-port"] = 443;

	return config;
}

async function save(config){
	await fs.writeFile("./.vscode/target.json",JSON.stringify(config,null,2),"utf8");
}

module.exports = {
	get : get,
	save : save
};
