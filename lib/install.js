const fs = require('fs').promises;
const setupEslint = require("./setupEslint");
const setupTree = require("./setupTree");
const setupSftp = require("./setupSftp");

async function execute(){
	await ensureSetupFile();
	await setupEslint();
	await setupTree();
	await setupSftp();
}

async function ensureSetupFile(){
	try{
		await fs.mkdir('./.vscode');
	}catch(err){}
	try{
		await fs.access('./.vscode/settings.json');
	}catch(err){
		await fs.writeFile('./.vscode/settings.json',"{}","utf8");
	}
}

async function start(){
	try{
		await execute();
	}catch(err){
		console.error(err);
		process.exit(-1);
	}
}
console.log("#############################################");
console.log(process.cwd());

start();
