const { Pool } = require('pg');
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.PGURI,
    ssl:false
})

module.exports = pool;