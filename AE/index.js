import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

import impactKMVInsert from './impact_kmv_insert'
import impactKMVUpdate from './impact_kmv_update'

//import AEVKInsert from './ae_vk_insert'
//import AEIDEInsert from './ae_ide_insert';

const app = express()

console.log("-------index-------")

// Middleware to parse JSON and cookies
app.use(bodyParser.json())
app.use(cookieParser())

//Impact VK Insert API
app.post('/impactkmvinsert', impactKMVInsert)

// Impact VK Update API
app.post('/impactkmvupdate', impactKMVUpdate)

// // AE VK Insert
//app.post('/aevkinsert', AEVKInsert);

// AE Blockly Insert
//app.post('/aeideinsert', AEIDEInsert);

app.get('/learningfinished', (req, res) => {
  //const exampleCookie = req.kauth.grant.id_token.content;
  res.send(`
        <div style="
            display: flex;
            justify-content: center;
            align-items: center;
            height: 80vh;
            font-size: 42px;
        ">
            --------- Finished ---------
        </div>
    `)
})
app.get('/exam', (req, res) => {
  const { item } = req.query // Retrieve the examItem from query parameters

  if (!item) {
    return res.status(400).json({ error: 'Missing parameter: item' })
  }

  // Save the Item in a cookie
  res.cookie('item', item, { httpOnly: true, path: '/' }) // This option will be usable by server side only
  // redirec to root url
  res.redirect('/')

})

// POST route to fetch cookies and list matched variable names
app.get('/get-cookies', (req, res) => { // ?keys=A,B,C,..
  const reqkeys = req.query.keys ? req.query.keys.split(',') : []
  const matchedCookies = {}
  reqkeys.forEach(key => {
    if (req.cookies[key]) {
      matchedCookies[key] = req.cookies[key]
    }
  })
  res.json(matchedCookies) // Return the matched cookies as a JSON response
})


app.post('/set-cookies', (req, res) => { // ex: ?item=12&session=13
  // Get all query parameters
  const queryParams = req.query
  for (const [key, value] of Object.entries(queryParams)) {
    res.cookie(key, value, { httpOnly: true, path: '/' })
  }
  res.json({ message: 'Cookies set successfully' })
})

// Catch-all for undefined routes
app.use((req, res) => {
  console.log("request error Here")
  res.status(404).json({ error: 'Not Found' })
})

// Export the app for Nuxt serverMiddleware
module.exports = app