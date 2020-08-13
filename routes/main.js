const router = require('express').Router();
const jwt = require('jsonwebtoken');
const validator = require('validator');
const passport = require('passport');
const {sql, dbConnPool} = require(('../database/db.js'));

const SQL_SELECT_ALL = 'Select * from ca2.movies for json path;';
const SQL_SEARCH_BY_NAME = "Select * from ca2.movies where title like @name for json path;"
const SQL_SEARCH_BY_ID = "Select * from ca2.movies where MovieId=@id for json path, without_array_wrapper;"
router.get('/', async (req,res)=> {
    try {
        const pool = await dbConnPool;
        const result = await pool.request()
        .query(SQL_SELECT_ALL);
        res.json(result.recordset[0]);
    }
    catch (err)
    {
        res.status(500)
        res.send(err.message)
    }
})

router.get('/search/name/:name', async (req,res) => {
    const search = validator.escape(req.params.name);
    if (search === "") {
        res.json({"error": "invalid name"})
    }
    try {
        const pool = await dbConnPool;
        const result = await pool.request()
        .input('name', `%${search}%`)
        .query(SQL_SEARCH_BY_NAME);
        res.json(result.recordset[0]);
    }
    catch (err) {
        console.log(err);
    }
})
router.get('/search/id/:id', async (req,res) => {
    const movieId = req.params.id;
    if (!validator.isNumeric(movieId, { no_symbols: true })) {
        res.json({ "error": "invalid id parameter" });
        return false;
    }
    try {
        const pool = await dbConnPool;
        const result = await pool.request()
        .input('id', movieId)
        .query(SQL_SEARCH_BY_ID);
        res.json(result.recordset[0]);
    }
    catch (err) {
        console.log(err);
    }
})
//Get movie details: sql join on movie id
const SQL_MOVIE_DETAIL = "select m.MovieId, Title, Category, ReleseDate, m.Country, Director, poster, a.ActorId, ActorName from [CA2].[movies] m inner join [CA2].[ActorsMovies] am on m.MovieId = am.MovieId inner join [CA2].[actors] a on am.ActorId = a.ActorId where m.MovieId = @id"
router.get('/movie/:id', async (req,res)=> {
    const movieId = req.params.id;
    if (!validator.isNumeric(movieId, { no_symbols: true })) {
        res.json({ "error": "invalid id parameter" });
        return false;
    }
    try {
        const pool = await dbConnPool;
        const result = await pool.request()
        .input('id', movieId)
        .query(SQL_MOVIE_DETAIL);
        //if (result.recordset[0]) {res.json(result.recordset)}
        //else {res.json({"error": "no detail"})};
        res.json(result.recordset)
    }
    catch (err) {
        console.log(err);
    }
})
//Add, update, delete Movies
const SQL_UPDATE = 'UPDATE ca2.movies SET Title = @movieTitle, Category = @movieCategory, ReleseDate = @releseDate, Country = @movieCountry, Director = @movieDirector WHERE MovieId = @id; SELECT * FROM ca2.Movies WHERE MovieId = @id;';
const SQL_INSERT = 'INSERT into ca2.movies (Title, Category, ReleseDate, Country, Director) values(@movieTitle, @movieCategory, @releseDate, @movieCountry, @movieDirector); SELECT * FROM ca2.Movies Where Title=@movieTitle'
const SQL_DEL = 'DELETE FROM ca2.Movies WHERE MovieId = @id;';
//Update
router.put('/update/:id', passport.authenticate('jwt', { session: false}),
async (req, res) => {

    // Validate input values (sent in req.body)
    let errors = "";
    const movieId = req.params.id;
    if (!validator.isNumeric(movieId, {no_symbols: true})) {
        errors+= "invalid movie id; ";
    }
    if (movieId <= 5) {
        errors+="this entry is protected";
    }
    const movieTitle = validator.escape(req.body.Title);
    if (movieTitle === "") {
        errors+= "invalid Title; ";
    }
    const movieCategory = validator.escape(req.body.Category);
    if (movieCategory === "") {
        errors+= "invalid Category; ";
    }
    const releseDate = req.body.ReleseDate;
    if (!validator.isISO8601(releseDate)) {
        errors+= "invalid date; ";
    }
    const movieCountry = validator.escape(req.body.Country);
    if (movieCountry === "") {
        errors+= "invalid Country; ";
    }
    const movieDirector = validator.escape(req.body.Director);
    if (movieDirector === "") {
        errors+= "invalid Director; ";
    }

    // If errors send details in response
    if (errors != "") {
        // return http response with  errors if validation failed
        res.json({ "error": errors });
        return false;
    }
    // If no errors
    try {
        // Get a DB connection and execute SQL
        const pool = await dbConnPool
        const result = await pool.request()
        // set parameters
        .input('id', sql.Int, movieId)   
        .input('movieTitle', sql.NVarChar, movieTitle)    
        .input('movieCategory', sql.NVarChar, movieCategory)
        .input('releseDate', sql.Date, releseDate)
        .input('movieCountry', sql.NVarChar,  movieCountry)
        .input('movieDirector', sql.NVarChar, movieDirector)
        // run query
        .query(SQL_UPDATE);      

        // If successful, return updated movie via HTTP    
        res.json(result.recordset[0]);

    } catch (err) {
    res.status(500)
    res.send(err.message)
    }

    }
);
//Insert
router.post('/update', passport.authenticate('jwt', { session: false}),
async (req, res) => {

    // Validate input values (sent in req.body)
    let errors = "";
    const movieTitle = validator.escape(req.body.Title);
    if (movieTitle === "") {
        errors+= "invalid Title; ";
    }
    const movieCategory = validator.escape(req.body.Category);
    if (movieCategory === "") {
        errors+= "invalid Category; ";
    }
    const releseDate = req.body.ReleseDate;
    if (!validator.isISO8601(releseDate)) {
        errors+= "invalid date; ";
    }
    const movieCountry = validator.escape(req.body.Country);
    if (movieCountry === "") {
        errors+= "invalid Country; ";
    }
    const movieDirector = validator.escape(req.body.Director);
    if (movieDirector === "") {
        errors+= "invalid Director; ";
    }

    // If errors send details in response
    if (errors != "") {
        // return http response with  errors if validation failed
        res.json({ "error": errors });
        return false;
    }
    // If no errors
    try {
        // Get a DB connection and execute SQL
        const pool = await dbConnPool
        const result = await pool.request()
        // set parameters   
        .input('movieTitle', sql.NVarChar, movieTitle)    
        .input('movieCategory', sql.NVarChar, movieCategory)
        .input('releseDate', sql.Date, releseDate)
        .input('movieCountry', sql.NVarChar,  movieCountry)
        .input('movieDirector', sql.NVarChar, movieDirector)
        // run query
        .query(SQL_INSERT);      

        // If successful, return updated movie via HTTP    
        res.json(result.recordset[0]);

    } catch (err) {
    res.status(500)
    res.send(err.message)
    }

    }
);
//DEL
router.delete('/update/:id', passport.authenticate('jwt', { session: false}),
async (req, res) => {

    // Validate
    const movieId = req.params.id;

    // If validation fails return an error message
    if (!validator.isNumeric(movieId, { no_symbols: true })) {
        res.json({ "error": "invalid id parameter" });
        return false;
    }
    if (movieId <= 5) {
        res.json({ "error": "this entry is protected" });
        return false;
    }
   
    // If no errors try delete
    try {
        // Get a DB connection and execute SQL
        const pool = await dbConnPool
        const result = await pool.request()
            .input('id', sql.Int, movieId)
            .query(SQL_DEL);      
    

        const rowsAffected = Number(result.rowsAffected);

        let response = {"deletedId": null}

        if (rowsAffected > 0)
        {
            response = {"deletedId": movieId}
        }

        res.json(response);

        } catch (err) {
            res.status(500)
            res.send(err.message)
        }
});

module.exports = router;