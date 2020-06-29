const fs = require('fs').promises;

const sftpFileName = 'sftp.json';
async function setupSftp(){
	try{
		await fs.access(`./.vscode/${sftpFileName}`);
	}catch(err){
		await fs.copyFile(__dirname + `/../files/${sftpFileName}`, `./.vscode/${sftpFileName}`);
	}
}


module.exports = setupSftp;
