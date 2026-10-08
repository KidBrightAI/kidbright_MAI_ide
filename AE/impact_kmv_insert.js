import { insertDataImpact } from './db'

export default async function impactKMVInsert(req, res) {
  console.log("Send to impactKMVInsert")
  try {
    // Extract body payload
    //const { ip, duration, sessionid } = req.body;
    const { ip, userid, email, duration, sessionid, ssid } = req.body

    // Validate input
    if (!ip || !duration || !sessionid) {
      return res.status(400).json({ error: 'Missing required fields: ip, duration, or sessionid' })
    }

    // Call the database function
    const result = await insertDataImpact(ip, userid, email, duration, sessionid, ssid)

    // Send success response
    res.status(201).json({
      message: 'Data inserted successfully',
      id: result.insertId,
    })
  } catch (err) {
    console.error('Error inserting data:', err)

    // Send error response
    res.status(500).json({
      error: 'Failed to insert data into the database',
      details: err.message,
    })
  }
}