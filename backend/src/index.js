require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'domislink-backend' })
})

// Jobs endpoints
app.get('/api/jobs', (req, res) => {
  res.json({ jobs: [], message: 'No jobs found' })
})

app.get('/api/jobs/fixing', (req, res) => {
  res.json({ jobs: [], type: 'fixing', message: 'Fixing jobs endpoint' })
})

app.get('/api/jobs/repair', (req, res) => {
  res.json({ jobs: [], type: 'repair', message: 'Repair jobs endpoint' })
})

app.listen(PORT, () => {
  console.log(`DomisLink backend running on port ${PORT}`)
})
