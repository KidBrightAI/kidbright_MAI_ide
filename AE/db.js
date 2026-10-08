const mariadb = require("mariadb")

const pool = mariadb.createPool({
  /*host : process.env.MYSQL_HOST || 'localhost',
  port : process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306, 
  user : process.env.MYSQL_USER ||'user',
  password :  process.env.MYSQL_PASSWORD ||'password',
  database : process.env.MYSQL_DATABASE || 'stat'
  */
  host : process.env.MYSQL_HOST || '203.185.145.17',
  port : process.env.MYSQL_PORT || 6666,
  user : process.env.MYSQL_USER || 'simulator',
  password :  process.env.MYSQL_PASSWORD ||'3CEZcbqx5cKU',
  database : process.env.MYSQL_DATABASE || 'simulator_stat',

})

async function bodyParser(req) {
  let body = ''

  // Listen for data chunks
  for await (const chunk of req) {
    body += chunk.toString()
  }

  try {
    // Parse body if it's JSON
    return JSON.parse(body)
  } catch (error) {
    // If not JSON, return raw body
    return body
  }
};

// Function to query the database
async function query(sql, params) {
  let conn
  try {
    conn = await pool.getConnection()
    
    return await conn.query(sql, params)  // Return query result
  } catch (err) {
    console.log("query error: ",err)
    throw err  // Throw error if query fails
  } finally {
    if (conn) conn.release()  // Release connection back to the pool
  }
}

async function insertDataImpact(ip, userid, email, duration, sessionid, ssid) {
  const sql = 'INSERT INTO kmv_usage (ip, userid, email, duration, sessionid, ssid) VALUES (?, ?, ?, ?, ?, ?)'
  try {
    const result = await query(sql, [ip, userid, email, duration, sessionid, ssid])

    //If the result contains a BigInt (e.g., insertId), convert it to a string
    return {
      message: 'User created',
      id: result.insertId ? result.insertId.toString() : null,  // Convert BigInt to string
    }

  } catch (err) {
    console.log("Insert data error: ",err)
    throw err
  }
}
async function updateDataImpact(ip, userid, email, duration, sessionid, ssid) {
  const sql = 'UPDATE kmv_usage SET duration = ? WHERE ip = ? AND sessionid = ?'

  //const sql = 'INSERT INTO vk_usage (ip,duration,sessionid) VALUES (?, ?, ?)';
  try {
    const result = await query(sql, [duration, ip, sessionid])

    // Check if any rows were affected by the update
    return {
      message: result.affectedRows > 0 ? 'User updated' : 'No matching record found',
      rowsAffected: result.affectedRows,
    }

  } catch (err) {
    console.log("Update data error: ", err)
    throw err
  }
}

/*async function insertDataAE(ip, userid, duration, sessionid, status, objectname, objectid, scenename, sceneid, direction, location, runprogram, appid, item, result) {
  const sql = 'INSERT INTO vk_sim (ip, userid, duration, sessionid, status, objectname, objectid, scenename, sceneid, direction, location, runprogram, appid, item, result) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  try {
    const result_q = await query(sql, [ip, userid, duration, sessionid, status, objectname, objectid, scenename, sceneid, direction, location, runprogram, appid, item, result]);

    //If the result contains a BigInt (e.g., insertId), convert it to a string
    const response = {
      message: 'User created',
      id: result_q.insertId ? result_q.insertId.toString() : null  // Convert BigInt to string
    };
    //console.log("res",result_q);
    return response;

  } catch (err) {
    console.log("Insert data error: ",err);
    throw err;
  }
}

async function insertDataIDE(ip, userid, sessionid, duration, status, blockname, blockid, _id, newparentid, element, newinputname, node, item, result, appid, aistep) {
  const sql = 'INSERT INTO vk_ide (ip, userid, sessionid, duration, status, blockname, blockid, _id, newparentid, element, newinputname, node, item, result, appid, aistep) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  try {
    const result_q = await query(sql, [ip, userid, sessionid, duration, status, blockname, blockid, _id, newparentid, element, newinputname, node, item, result, appid, aistep]);
    const response = {
      message: 'User created',
      id: result_q.insertId ? result_q.insertId.toString() : null // Convert BigInt to string
    };
    return response;
  } catch (err) {
    console.log("Insert data error: ",err);
    throw err;
  }
}*/

async function ipImpact(){

  return 'userIP'
}

//module.exports = { insertDataImpact, updateDataImpact, insertDataAE, insertDataIDE, bodyParser, ipImpact };
module.exports = { insertDataImpact, updateDataImpact, bodyParser, ipImpact }