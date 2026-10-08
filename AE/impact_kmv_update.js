import { updateDataImpact } from './db'

export default async function impactKMVUpdate(req, res) {
  try {
    // Extract body payload
    //const { ip, duration, sessionid } = req.body;
    const { ip, userid, email, duration, sessionid, ssid } = req.body

    // Validate input
    if (!ip || !duration || !sessionid) {
      return res.status(400).json({ error: 'Missing required fields: ip, duration, or sessionid' })
    }

    // Call the database function
    const result = await updateDataImpact(ip, userid, email, duration, sessionid, ssid)

    // Send success response
    res.status(201).json({
      message: 'Impact update successfully',
      id: result.insertId,
    })
  } catch (err) {
    console.error('Error updating impact:', err)

    // Send error response
    res.status(500).json({
      error: 'Failed to update impact into the database',
      details: err.message,
    })
  }
}