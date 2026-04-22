const pool = require("./db");

async function initDB() {
  try {
    console.log("Resetting database...");

    // 🔥 DROP ALL TABLES (order matters because of FK constraints)
    await pool.query(`
      DROP TABLE IF EXISTS purchases CASCADE;
      DROP TABLE IF EXISTS lectures CASCADE;
      DROP TABLE IF EXISTS sections CASCADE;
      DROP TABLE IF EXISTS courses CASCADE;
      DROP TABLE IF EXISTS creators CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    console.log("Old tables dropped");

    // 🧱 USERS
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user'
      );
    `);

    // 🧱 CREATORS (NEW CORE TABLE)
    await pool.query(`
      CREATE TABLE creators (
        id SERIAL PRIMARY KEY,

        user_id INTEGER UNIQUE NOT NULL
          REFERENCES users(id)
          ON DELETE CASCADE,

        handle TEXT UNIQUE NOT NULL,

        brand_name TEXT,

        created_at TIMESTAMP DEFAULT NOW(),

        CONSTRAINT handle_format CHECK (handle ~ '^[a-z0-9_]+$')
      );
    `);

    // 🧱 COURSES (UPDATED → linked to creators)
    await pool.query(`
      CREATE TABLE courses (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        price INTEGER NOT NULL CHECK (price >= 0),
        thumbnail_url TEXT,

        creator_id INTEGER
          REFERENCES creators(id)
          ON DELETE CASCADE,

        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 🧱 SECTIONS
    await pool.query(`
      CREATE TABLE sections (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,

        course_id INTEGER
          REFERENCES courses(id)
          ON DELETE CASCADE,

        order_index INTEGER NOT NULL,

        UNIQUE(course_id, order_index)
      );
    `);

    // 🧱 LECTURES
    await pool.query(`
      CREATE TABLE lectures (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        video_url TEXT,

        section_id INTEGER
          REFERENCES sections(id)
          ON DELETE CASCADE,

        order_index INTEGER NOT NULL,
        is_preview BOOLEAN DEFAULT false,

        UNIQUE(section_id, order_index)
      );
    `);

    // 🧱 PURCHASES
    await pool.query(`
      CREATE TABLE purchases (
        id SERIAL PRIMARY KEY,

        user_id INTEGER
          REFERENCES users(id)
          ON DELETE CASCADE,

        course_id INTEGER
          REFERENCES courses(id)
          ON DELETE CASCADE,

        UNIQUE(user_id, course_id)
      );
    `);

    // ⚡ INDEXES (important for scaling)
    await pool.query(`
      CREATE INDEX idx_creators_user_id ON creators(user_id);
      CREATE INDEX idx_creators_handle ON creators(handle);
      CREATE INDEX idx_courses_creator_id ON courses(creator_id);
    `);

    console.log("New multi-tenant schema created ✅");

  } catch (err) {
    console.error("Error initializing DB:", err);
  } finally {
    await pool.end();
  }
}

initDB();