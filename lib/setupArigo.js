const fs = require('fs').promises;

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
	await fs.symlink(process.cwd() + '/bin/arigo.js', `${installDir}/node_modules/.bin/arigo`);
}

module.exports = setupArigo;
