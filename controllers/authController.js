const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fsPromises = require("fs").promises;
require("dotenv").config();

const usersDB = {
	users: require(path.join(__dirname, "..", "model", "users.json")),
	setUsers: function (data) {
		this.users = data;
	},
};

const handleLogin = async (req, res) => {
	const { user, pwd } = req.body;
	if (!user || !pwd) return res.status(401).json({ message: "Username and password are required" });
	const foundUser = usersDB.users.find((person) => person.username === user);
	if (!foundUser) return res.sendStatus(401);

	const pwdMatch = await bcrypt.compare(pwd, foundUser.password);
	if (pwdMatch) {
		// create JWTs
		const accessToken = jwt.sign(
			{ username: foundUser.username },
			process.env.ACCESS_TOKEN_SECRET,
			{ expiresIn: "30s" }
		);
		const refreshToken = jwt.sign(
			{ username: foundUser.username },
			process.env.REFRESH_TOKEN_SECRET,
			{ expiresIn: "1d" }
		);

		// saving refreshToken with current user
		const otherUsers = usersDB.users.filter((person) => person.username !== foundUser.username);
		const currentUser = { ...foundUser, refreshToken };
		usersDB.setUsers([...otherUsers, currentUser]);
		await fsPromises.writeFile(
			path.join(__dirname, "..", "model", "users.json"),
			JSON.stringify(usersDB.users)
		);
		res.cookie("jwt", refreshToken, {
			httpOnly: true,
			maxAge: 24 * 60 * 60 * 1000,
		});
		res.json({ accessToken });
	} else {
		res.sendStatus(401);
	}
	res.json({ success: `User ${user} is logged in.` });
};

module.exports = { handleLogin };
