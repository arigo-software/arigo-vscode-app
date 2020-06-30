#!/usr/bin/env node

process.emitWarning = function(){};

let commands = {
	target : require("./target"),
	"start-mode" : require("./start-mode"),
	restart : require("./restart")
};

function showHelp(error){
	let log = error?console.error:console.log;
	if (error){
		log("Error:",error);
		log("");
	}
	log("Commands for developing apps with Visual Studio Code.");
	log("");
	log("usage: npx arigo [options]");
	log("   -h    --help            Shows this help.");
	log("");
	log("usage: npx arigo <command> [options]");
	log("");
	log("Available commands:");

	for (let command in commands){
		console.log(setTab(`   ${command}`, 27) + commands[command].getDescription());
	}
	log("");
	log("For help for a command call:");
	log("npx arigo <command> --help");
	if (error) process.exit(-1);
	else process.exit(0);
}

function setTab(str, tabPos){
	return (str + "                        ").substr(0,tabPos);
}

if (process.argv.length < 3){
	showHelp("Missing parameters.");
}

let command = process.argv[2];
if (command === "-h" || command === "--help"){
	showHelp();
}


async function execute(command){
	if (!commands[command]){
		showHelp(`Unknown command "${command}."`);
	}
	try{
		let args = process.argv.slice(3);
		await commands[command].execute(args);
		process.exit(0);
	}catch(err){
		console.error(err);
		process.exit(-1);
	}
}

execute(command);
