var config = {
	port: 8090,
	dbConnection: "localhost:27017/rds_qualification",
	needProxy: true,
	proxyUrl: 'http://proxy.tyo.sap.corp:8080',

	JAM_DOMAIN: "https://integration3.sapjam.com",
	CONSUMER_KEY: "YLSfuRYoL60woq8r598Z", //"Nym2SCHPZjUE6bAOck8C";
	CONSUMER_SECRET: "0izVk7meLEipALet1pxHH1q3nR9An94mvXbnr9ke", //"tB2H8KLgMgsTljUILPZhfhvxM0dRA5zcLDG54W3a";
	REQUEST_TOKEN_URL: "https://integration3.cubetree.com/oauth/request_token",
	ACCESS_TOKEN_URL: "https://integration3.cubetree.com/oauth/access_token"
};

var mongoskin = require('mongoskin');
var db = mongoskin.db(config.dbConnection);

exports.config = config;
exports.db = db;