const fs = require('fs').promises;

async function setupTree(installDir){
	let settings = JSON.parse(await fs.readFile(`${installDir}/.vscode/settings.json`));
	setupSchema(settings);
	setupAssociations(settings);
	await fs.writeFile(`${installDir}/.vscode/settings.json`,JSON.stringify(settings, null, 2),"utf8");
}

function setupSchema(settings){
	if (!settings["json.schemas"]) settings["json.schemas"] = [];
	settings["json.schemas"] = addTreeSchema(settings["json.schemas"]);
}

function addTreeSchema(schemas){
	schemas = removeTreeSchema(schemas);
	schemas.push({
		"fileMatch": [
			"*.tree"
		],
		"schema": {
			"type": "object",
			"properties": {
				"path" : {
					"type": "string",
					"description": "This defines where to find this app in the Project Editor tree. The last element is the name which is shown for this app."
				},
				"pos" : {
					"type": "string",
					"description": "With this you can define the position in the tree. ."
				},
				"singleton" : {
					"type": "boolean",
					"description": "With this you can define that it is only possible to create one instance of this app. Default: false"
				}
			}
		}
	});
	return schemas;
}

function removeTreeSchema(schemas){
	return schemas.filter(e=>e.fileMatch && e.fileMatch[0] !== '*.tree');
}

function setupAssociations(settings){
	if (!settings["files.associations"]) settings["files.associations"] = {};
	settings["files.associations"]["*.tree"] = "json";
}


module.exports = setupTree;
