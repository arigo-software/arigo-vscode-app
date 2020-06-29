const fs = require('fs').promises;

const launchConfigFileName = 'launch.json';
async function setupDebug(installDir){
	try{
		await fs.access(`${installDir}/.vscode/${launchConfigFileName}`);
	}catch(err){
		await fs.copyFile(__dirname + `/../files/${launchConfigFileName}`, `${installDir}/.vscode/${launchConfigFileName}`);
	}
}

module.exports = setupDebug;
