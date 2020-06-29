const fs = require('fs').promises;

const eslintConfigFileName = '.eslintrc.json';
async function setupEslint(installDir){
	try{
		await fs.access(`${installDir}/${eslintConfigFileName}`);
	}catch(err){
		await fs.copyFile(__dirname + `/../files/${eslintConfigFileName}`, `${installDir}/${eslintConfigFileName}`);
	}
}

module.exports = setupEslint;
