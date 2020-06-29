const fs = require('fs').promises;
const setupEslint = require("./setupEslint");
const setupTree = require("./setupTree");
const setupSftp = require("./setupSftp");

async function execute(){
	let installDir = process.env.INIT_CWD || process.cwd();
	await ensureSetupFile(installDir);
	await setupEslint(installDir);
	await setupTree(installDir);
	await setupSftp(installDir);
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
