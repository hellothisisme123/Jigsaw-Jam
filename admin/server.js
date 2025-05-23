const fs = require('fs'); // File system module
const https = require('https'); // HTTPS module
const express = require('express');
const mariadb = require('mariadb');
const cors = require('cors');

const app = express();
const port = 3006; // Define HTTPS port

// Load SSL certificate and key
const options = {
    key: fs.readFileSync('/var/lib/mysql/Jigsaw_Jam/server.key'), // Change path if using Let's Encrypt
    cert: fs.readFileSync('/var/lib/mysql/Jigsaw_Jam/server.cert') // Change path if using Let's Encrypt
};

// Enable CORS and JSON parsing
app.use(cors({
    origin: '*', // Allows all origins
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));
app.use(express.json());

// Create a MariaDB connection pool
const pool = mariadb.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'abc',
    password: process.env.DB_PASS || '123',
    database: process.env.DB_NAME || 'Jigsaw_Jam',
    connectionLimit: 50,
    queueLimit: 0,
    bigIntAsString: true // Force BigInt to be returned as a string
});

// API Endpoints
// Securely get data
app.get('/jigsawJam/data', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const userRows = await conn.query('SELECT * FROM Users');
        const puzzleRows = await conn.query('SELECT * FROM Puzzles');
        res.json({ Users: userRows, Puzzles: puzzleRows });
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.release();
    }
});

// Securely update data
app.post('/jigsawJam/updateRowByIDFilter', async (req, res) => {
    const { id, value, table, column } = req.body;
    let conn;
    let query;

    try {
        conn = await pool.getConnection();
        query = `UPDATE \`${table}\` SET \`${column}\` = ? WHERE id = ?`;
        const result = await conn.query(query, [value, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'No rows updated' });
        }

        res.json({ success: true, updated: { id, value, table, column }, query });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// securely create new puzzle row
app.post('/jigsawJam/addRowToPuzzles', async (req, res) => {
  const { Tags, Src, Sizes, Alt } = req.body;
  let conn;

  try {
    conn = await pool.getConnection();
    const query = `INSERT INTO Puzzles (Tags, Src, Sizes, Alt) VALUES (?, ?, ?, ?)`;
    const result = await conn.query(query, [Tags, Src, Sizes, Alt]);

    // Convert BigInt values to strings
    const safeResult = JSON.parse(JSON.stringify(result, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    ));

    res.status(200).json({
      success: true,
      message: 'Row added successfully',
      data: safeResult
    });
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).json({ success: false, error: 'Error inserting data' });
  } finally {
    if (conn) conn.release();
  }
});

// securely create new user row
app.post('/jigsawJam/addRowToUsers', async (req, res) => {
  const { Username, Password, SaveData, Settings } = req.body;
  let conn;

  try {
    conn = await pool.getConnection();
    const query = `INSERT INTO Users (Username, Password, SaveData, Settings) VALUES (?, ?, ?, ?)`;
    const result = await conn.query(query, [Username, Password, SaveData, Settings]);

  	// Convert BigInt values to strings
    const safeResult = JSON.parse(JSON.stringify(result, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    ));
  
    res.status(200).json({
      success: true,
      message: 'Row added successfully',
      data: safeResult
    });
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).json({ success: false, error: 'Error inserting data' });
  } finally {
    if (conn) conn.release();
  }
});


// Start the HTTPS server
https.createServer(options, app).listen(port, "0.0.0.0", () => {
    console.log(`HTTPS Server running at https://localhost:${port}`);
});