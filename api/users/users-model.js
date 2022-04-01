const db = require('../../data/dbConfig');

const getAll = () => {
    return db('users');
};

const getById = (id) => {
    return db('users')
        .where('id', id)
        .first();
};

const getBy = (filter) => {
    return db('users')
        .where(filter);
};

const insert = async (user) => {
    const [id] = await db('users')
        .insert(user);
    
        return getById(id);
};

const update = async (id, changes) => {
    await db('users')
        .update({ username: changes.username, password: changes.password })
        .where('id', id);
    
    return getById(id);
};

const remove = async (id) => {
    const result = await getById(id);

    await db('users')
        .where('id', id)
        .del();

    return result;
};

module.exports = {
    getAll,
    getById,
    getBy,
    insert,
    update,
    remove,
};