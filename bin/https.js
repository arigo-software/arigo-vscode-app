const https = require('https');
const configuration = require("./configuration");

function sendRequest(method){ return async (url, body)=>{
	let target = await configuration.get();
	if (!target) throw "no activated target";
	let p = new Promise(function(resolve, reject) {
		let options = {
			hostname : target.host,
			port : target["https-port"],
			method : method,
			path : url,
			rejectUnauthorized : false,
			headers : {authorization : "Basic " + base64(target.username + ":" + target.password)}
		};
		var req = https.request(options, function(res){
			res.setEncoding('utf8');
			let result = "";
			res.on('data', chunk=>{
				result += chunk;
			});
			res.on('end', chunk=>{
				if (chunk) result += chunk;
				try{
					result = JSON.parse(result);
					resolve(result);
				}catch(err){
					reject(err);
				}
			});
			res.on('error', err=>{
				reject(err);
			});
		});
		req.on('error' , err=>{
			reject(err);
		});
		if (body) req.write(JSON.stringify(body));
		req.end();
	});
	return p;
};}

var base64 = function(input){
	return (Buffer.from( input, 'utf8')).toString('base64');
};

module.exports = {
	GET : sendRequest("GET"),
	PUT : sendRequest("PUT")
};
