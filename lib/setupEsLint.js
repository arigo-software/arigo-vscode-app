const fs = require('fs').promises;

const eslintConfigFileName = '.eslintrc.json';
async function setupEslint(){
	try{
		await fs.access(`./${eslintConfigFileName}`);
	}catch(err){
		await fs.copyFile(__dirname + `/../files/${eslintConfigFileName}`, `./${eslintConfigFileName}`);
	}
}

module.exports = setupEslint;
