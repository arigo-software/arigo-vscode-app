const fs = require('fs').promises;

async function ensureDirs(installDir){
	await ensureDir(`${installDir}/type`);
	await ensureDir(`${installDir}/type/app`);
	await ensureDir(`${installDir}/type/fb`);
}

async function ensureDir(dir){
	try{
		await fs.mkdir(dir);
	}catch(err){}

}

module.exports = ensureDirs;
