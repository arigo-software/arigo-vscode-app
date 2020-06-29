const fs = require('fs').promises;

const launchConfigFileName = 'launch.json';
async function setupDebug(installDir){
	try{
		await fs.access(`${installDir}/${launchConfigFileName}`);
	}catch(err){
		await fs.copyFile(__dirname + `/../files/${launchConfigFileName}`, `${installDir}/${launchConfigFileName}`);
	}
}

module.exports = setupDebug;
