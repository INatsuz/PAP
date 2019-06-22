const jwt = require('jsonwebtoken');

const JWT_SECRET = "HkgitmTwUH4iK5g6";

module.exports = {
	generateToken: function generateToken(data) {
		return jwt.sign(data, JWT_SECRET, {expiresIn: 60 * 60 * 2});
	},

	verifyToken: function verifyToken(token) {
		return new Promise(function (resolve, reject) {
			try {
				let verify = jwt.verify(token, JWT_SECRET);
				resolve(verify);
			} catch (error) {
				reject(error);
			}
		});
	},

	isAuthenticated: function isAuthenticated(token) {
		try {
			let verification = jwt.verify(token, JWT_SECRET);
			return true
		} catch (err) {
			return false;
		}
	}
};