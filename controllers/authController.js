const path = require("path");
const bcrypt = require("bcrypt");

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
	if (!pwdMatch) return res.sendStatus(401);
	res.json({ success: `User ${user} is logged in.` });
};

module.exports = { handleLogin };
