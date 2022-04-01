const Users = require('../users/users-model');

const checkUsernameFree = async (req, res, next) => {
    try {
        const [user] = await Users.getBy({ username: req.body.username });

        if (user) {
            res.status(422).json({ messgae: 'username taken' });
        } else {
            req.user = user;
            next();
        }
    
    } catch (err) {
        next(err);
    }
};

const checkUsernameExists = async (req, res, next) => {
    try {
        const [user] = await Users.getBy({ username: req.body.username });

        if (!user) {
            res.status(422).json({ messgae: 'invalid credentials' });
        } else {
            req.user = user;
            next();
        }
    
    } catch (err) {
        next(err);
    }
};

const validateInput = async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password || !username.trim() || !password.trim()) {
        res.status(422).json({ message: 'username and password required' });
    } else {
        next();
    }
};

module.exports = {
    checkUsernameFree,
    checkUsernameExists,
    validateInput,
};