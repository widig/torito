var request = require("request");

var urlAcl = 'http://localhost:3001/acl';
var options = {
	url: urlAcl,
	form : {
		action : "login",
		username : "alien",
		password : "g711"
	},
	headers: {
		'User-Agent': 'request'
	}
};

function callback(error, response, body) {
	if (!error && response.statusCode == 200) {
		console.log(response.headers);
		console.log(body);
		console.log(">>",response.headers["set-cookie"][0]);
		var cookieText = response.headers["set-cookie"][0];
		var options = {
			url: urlAcl,
			form : {
				action : "login",
				username : "alien",
				password : "g711"
			},
			headers: {
				'Cookie': cookieText
			}
		};
		request.post(options, function(error,response,body) {
			if (!error && response.statusCode == 200) {
				console.log(response.headers);
				console.log(body);
				request.post(options, function(error,response,body) {
					if (!error && response.statusCode == 200) {
						console.log(response.headers);
						console.log(body);
					}
				});
			}
		});
	}
}

request.post(options, callback);
