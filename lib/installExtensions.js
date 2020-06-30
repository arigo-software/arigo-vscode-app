const child_process = require("child_process");

async function installExtensions(){
	await installExtension("dbaeumer.vscode-eslint");
	await installExtension("liximomo.sftp");
}

async function installExtension(extension){
	child_process.execSync(`code --install-extension ${extension}`);
}

module.exports = installExtensions;
