const pool = require("./db");
                                          
async function initDB() {
  try {
    console.log("Creating tables...");

    // USERS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user'
      );
    `);

    // COURSES
    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        price INTEGER NOT NULL CHECK (price >= 0),
        thumbnail_url TEXT,
        creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // SECTIONS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sections (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        order_index INTEGER NOT NULL,
        UNIQUE(course_id, order_index)
      );
    `);

    // LECTURES
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lectures (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        video_url TEXT,
        section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
        order_index INTEGER NOT NULL,
        is_preview BOOLEAN DEFAULT false,
        UNIQUE(section_id, order_index)
      );
    `);

    // PURCHASES
    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE(user_id, course_id)
      );
    `);

    console.log("Tables created successfully ✅");

  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    await pool.end();
  }
}

initDB();