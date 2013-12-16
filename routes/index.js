var config = require('../config').config;
var url = require('url');
var util = require('../util');
var request = require('request');
var qs = require('querystring');
var fs = require('fs');

var CONSUMER_KEY = config.CONSUMER_KEY;
var CONSUMER_SECRET = config.CONSUMER_SECRET;
var REQUEST_TOKEN_URL = config.REQUEST_TOKEN_URL;
var ACCESS_TOKEN_URL = config.ACCESS_TOKEN_URL;
var TOKEN = "";
var TOKEN_SECRET = "";
var AUTHORIZE_URL = config.JAM_DOMAIN + "/oauth/authorize?oauth_token=";
var LOGOUT_URL = config.JAM_DOMAIN + "/api/v1/auth/logout";

var GET_PROFILE_URL = config.JAM_DOMAIN + "/api/v1/members"; // "/v1/current_user/profile";
var GET_GROUP_URL = config.JAM_DOMAIN + "/api/v1/members/groups";
var GET_FEED_LIST_URL = config.JAM_DOMAIN + "/api/v1/feed/list";
var POST_DOC_URL = config.JAM_DOMAIN + "/api/v1/feed/doc";

exports.index = function(req, res) {
	res.render("index", {});
};

//Get request token
exports.oauth = function(req, res) {
	if (req.session.TOKEN && req.session.TOKEN_SECRET) {
		res.redirect("/apiList");
	} else {
		var requestOption = {
			url: REQUEST_TOKEN_URL,
			oauth: {
				callback: "oob",
				consumer_key: CONSUMER_KEY,
				consumer_secret: CONSUMER_SECRET
			}
		};
		if (config.needProxy) {
			requestOption.proxy = config.proxyUrl;
		}
		request.post(requestOption, function(e, r, body) {
			var access_token = qs.parse(body);
			console.log(access_token);
			TOKEN_SECRET = access_token.oauth_token_secret;
			res.redirect(AUTHORIZE_URL + access_token.oauth_token);
		});
	}
};

//Get access token
exports.access = function(req, res) {
	console.log(req.query);
	var requestOption = {
		url: ACCESS_TOKEN_URL,
		oauth: {
			consumer_key: CONSUMER_KEY,
			consumer_secret: CONSUMER_SECRET,
			token: req.query.oauth_token,
			token_secret: TOKEN_SECRET,
			verifier: req.query.oauth_verifier
		}
	};
	if (config.needProxy) {
		requestOption.proxy = config.proxyUrl;
	}
	request.post(requestOption, function(e, r, body) {
		var access_token = qs.parse(body);
		req.session.TOKEN = access_token.oauth_token;
		req.session.TOKEN_SECRET = access_token.oauth_token_secret;
		console.log(access_token);
		res.redirect("/apiList");
	});
};

exports.apiList = function(req, res) {
	if (req.session.TOKEN && req.session.TOKEN_SECRET) {		
		res.render("apiList", {});
	} else {
		res.redirect("/oauth");
	}
};

exports.upload = function(req, res) {
	res.render("api_demo/post_doc", {});
};

exports.logout = function(req, res){
	request.post(generateOAuthRequestOption(LOGOUT_URL, req), function(e, r, body) {
		res.send(body);
	});
};

exports.profile = function(req, res) {
	request.get(generateOAuthRequestOption(GET_PROFILE_URL, req), function(e, r, body) {
		res.render("api_demo/get_profile", {result:JSON.parse(body)});
	});
}

exports.groups = function(req, res) {
	request.get(generateOAuthRequestOption(GET_GROUP_URL, req), function(e, r, body) {
		res.render("api_demo/get_groups", {result:JSON.parse(body)});
	});
};

exports.oneGroup = function(req, res){

};

exports.feedList = function(req, res) {
	request.get(generateOAuthRequestOption(GET_FEED_LIST_URL, req), function(e, r, body) {
		res.render("api_demo/get_all_feeds", {result:JSON.parse(body)});
	});
};

exports.postDoc = function(req, res) {
	var fileRequestOpt = generateUploadFileRequestOption(req.files.data);

	var reqOpt = generateOAuthRequestOption(POST_DOC_URL, req);
	reqOpt.headers = fileRequestOpt.headers;
	reqOpt.body = fileRequestOpt.multipartBody;
	/*reqOpt.form = {
		group_id: 7994
	};*/
	request.post(reqOpt, function(e, r, body) {
		console.log(r);
		res.send(body);
	});
};

var generateUploadFileRequestOption = function(file){	
	var data = fs.readFileSync(file.path);
	var crlf = "\r\n";
	var boundary = '---------------------------10102754414578508781458777923';
	var separator = '--' + boundary;
	var footer = crlf + separator + '--' + crlf;
	var fileHeader = 'Content-Disposition: file; name="data"; filename="' + file.name + '"';
	var fileHeader1 = 'Content-Disposition: form-data; name="group_id"';
	var contents = separator + crlf + fileHeader + crlf + 'Content-Type: multipart/form-data' + crlf + crlf;
	var contents1 = separator + crlf + fileHeader1 + crlf + 'Content-Type: multipart/form-data' + crlf + crlf;

	var multipartBody = Buffer.concat([
		new Buffer(contents),
		data,
		new Buffer(footer)
	]);

	var headers = {
		'Content-Type': 'multipart/form-data; boundary=' + boundary,
	};

	return {
		multipartBody: multipartBody,
		headers: headers
	};
};

var generateOAuthRequestOption = function(url, req) {
	var requestOption = {
		url: url,
		oauth: {
			consumer_key: CONSUMER_KEY,
			consumer_secret: CONSUMER_SECRET,
			token: req.session.TOKEN,
			token_secret: req.session.TOKEN_SECRET
		}
	};
	if (config.needProxy) {
		requestOption.proxy = config.proxyUrl;
	}
	return requestOption;
};