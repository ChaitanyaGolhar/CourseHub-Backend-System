const { Pool } = require('pg');
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.PGURI,
    ssl: {
      rejectUnauthorized: false,
      
    }
})

module.exports = pool;