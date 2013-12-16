var page = require('./routes/index');
var user = require('./routes/user');

module.exports = function(app) {
	app.get('/index', page.index);
	app.get('/oauth', page.oauth);
	app.get('/access', page.access);
	app.get('/logout', page.logout);
	app.get('/apiList', page.apiList);

	/*API Sample*/
	app.get('/api_sample/getProfile',user.auth_user, page.profile);
	app.get('/api_sample/getGroups',user.auth_user, page.groups);
	app.get('/api_sample/getOneGroup',user.auth_user, page.oneGroup);
	app.get('/api_sample/getFeedlist',user.auth_user, page.feedList);
	app.get('/api_sample/postDoc',user.auth_user, page.upload);

	app.post('/postDoc', page.postDoc);
}