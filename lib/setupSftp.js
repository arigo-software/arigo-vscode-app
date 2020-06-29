const fs = require('fs').promises;

const sftpFileName = 'sftp.json';
async function setupSftp(installDir){
	try{
		await fs.access(`${installDir}/.vscode/${sftpFileName}`);
	}catch(err){
		await fs.copyFile(__dirname + `/../files/${sftpFileName}`, `${installDir}/.vscode/${sftpFileName}`);
	}
}


module.exports = setupSftp;
