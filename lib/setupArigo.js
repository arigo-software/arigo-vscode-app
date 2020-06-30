const fs = require('fs').promises;
const path = require('path');

const targetConfigFileName = 'target.json';
async function setupArigo(installDir){
	await ensureTargetConfig(installDir);
	await setBinaryLink(installDir);
}

async function ensureTargetConfig(installDir){
	try{
		await fs.access(`${installDir}/.vscode/${targetConfigFileName}`);
	}catch(err){
		await fs.copyFile(__dirname + `/../files/${targetConfigFileName}`, `${installDir}/.vscode/${targetConfigFileName}`);
	}
}

async function setBinaryLink(installDir){
	let target = process.cwd() + '/bin/arigo.js';
	let src = `${installDir}/node_modules/.bin/arigo`;
	await fs.symlink(path.relative(src,target), src);
}

module.exports = setupArigo;
