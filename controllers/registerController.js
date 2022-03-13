const path = require("path");
const fsPromises = require("fs").promises;
const bcrypt = require("bcrypt");

const usersDB = {
	users: require(path.join(__dirname, "..", "model", "users.json")),
	setUsers: function (data) {
		this.users = data;
	},
};

const handleNewUser = async (req, res) => {
	const { user, pwd } = req.body;
	if (!user || !pwd) return res.status(401).json({ message: "Username and password are required" });
	const duplicate = usersDB.users.find((person) => person.username === user);
	if (duplicate) return res.sendStatus(409);
	try {
		const hashedPwd = await bcrypt.hash(pwd, 10);
		const newUser = { username: user, password: hashedPwd };
		usersDB.setUsers([...usersDB.users, newUser]);
		await fsPromises.writeFile(
			path.join(__dirname, "..", "model", "users.json"),
			JSON.stringify(usersDB.users)
		);
		console.log(usersDB.users);
		res.status(201).json({ success: `New user ${user} created!` });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

module.exports = { handleNewUser };
