const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JWTStrategy = passportJWT.Strategy;
const bcrypt = require('bcryptjs'); 
//genereting hashed password for admin user for testing
//bcrypt.hash("ca2",10,(err,hash)=>{console.log(hash)});

// require the database connection
const { sql, dbConnPool } = require('../database/db.js');

// config package used to manage configuration options
const config = require('config');

// Read secret key from config
const keys = config.get('keys');

// Function to get user
const getUser = async (username) => {
    try {
        const SQL_FIND_USER = 'SELECT * FROM ca2.AppUser WHERE Login = @login for json path, without_array_wrapper;';
        // Get a DB connection and execute SQL
        const pool = await dbConnPool;
        const result = await pool.request()
        .input('login', sql.NVarChar, username)
        .query(SQL_FIND_USER);
        return (result.recordset[0]);
    } catch (err){
        res.status(500);
        res.send(err.message)
    }
}

// The local strategy middleware
passport.use(new LocalStrategy({
    // These values are passsed via HTTP, done is the callback function
    usernameField: 'username',
    passwordField: 'password',
    },async (username, password, done) => {
        
    try {
        const user = await getUser(username);
        //used bcrypt compare function instead of plain text compare (password in db is stored as hash)
        const passwordsMatch = await bcrypt.compare(password, user.Password);

    if (passwordsMatch) {
    return done(null, user, { message: 'Logged In Successfully' });
    } else {
    return done(null, false, { message: 'Incorrect Username / Password' });
    }
    } catch (error) {
    done(error);
    }
    }));

    // JWT strategy middleware, retrieve JWT as jwtPayload

passport.use(new JWTStrategy({
    jwtFromRequest: req => req.cookies.jwt,
    secretOrKey: keys.secret
    },
    (jwtPayload, done) => {
    // Check if JWT has expired
    if (parseInt(Date.now()) > parseInt(jwtPayload.expires)) {
    return done('jwt expired');
    }
    return done(null, jwtPayload);
    }
    ));