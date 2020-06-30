const fs = require('fs').promises;
const installExtensions = require("./installExtensions");
const setupArigo = require("./setupArigo");
const setupEslint = require("./setupEslint");
const setupTree = require("./setupTree");
const setupSftp = require("./setupSftp");
const setupDebug = require("./setupDebug");
const ensureDirs = require("./ensureDirs");

async function execute(){
	let installDir = process.env.INIT_CWD || process.cwd();
	await installExtensions(installDir);
	await ensureSetupFile(installDir);
	await setupArigo(installDir);
	await setupEslint(installDir);
	await setupTree(installDir);
	await setupSftp(installDir);
	await setupDebug(installDir);
	await ensureDirs(installDir);
}

async function ensureSetupFile(installDir){
	try{
		await fs.mkdir(`${installDir}/.vscode`);
	}catch(err){}
	try{
		await fs.access(`${installDir}/.vscode/settings.json`);
	}catch(err){
		await fs.writeFile(`${installDir}/.vscode/settings.json`,"{}","utf8");
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

start();
