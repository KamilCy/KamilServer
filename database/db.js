var sql = require('mssql');
const dbConfig = require('config')

let dbConnPool = new sql.ConnectionPool(dbConfig.get('connection'))
.connect()
.then(pool => {
console.log('Connected to MSSQL');
return pool
})
.catch(err => console.log('Database Connection Failed - error: ', err))
module.exports = {sql, dbConnPool};