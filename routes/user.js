var util = require('../util');

exports.auth_user = function(req, res, next) {
	if (req.session.TOKEN && req.session.TOKEN_SECRET){
		return next();
	} else {
		res.redirect('/oauth');
	}
};