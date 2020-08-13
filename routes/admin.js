const router = require('express').Router();
const validator = require('validator');
const passport = require('passport');
const {sql, dbConnPool} = require(('../database/db.js'));

const SQL_SELECT_ALL = 'Select title, releseDate from ca2.movies for json path;';

router.get('/',passport.authenticate('jwt', { session: false}),
async (req, res) => {
    try {
        const pool = await dbConnPool
        const result = await pool.request()
        .query(SQL_SELECT_ALL);
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500);
        res.send(err.message);
    }
});
module.exports = router;