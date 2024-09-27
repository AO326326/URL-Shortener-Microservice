require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb');
const dns = require('dns');
const urlparser = require('url');

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db('urlshortener');
let urls = db.collection('urls');

// Basic Configuration
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI;



app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});
app.post('/api/shorturl', function(req, res){
  const originalUrl = req.body.url;
  console.log(req.body)
  const { hostname } = new URL(originalUrl);
  const dnslookup = dns.lookup(hostname, async (err, address) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
  const urlCount = await urls.countDocuments({});
  const urlDoc = {
    originalUrl,
    short_url: urlCount
  }
  const result = await urls.insertOne(urlDoc)
  console.log(result)
  res.json({
    original_url: originalUrl,
    short_url: urlCount
  })
}
})
})
app.get('/api/shorturl/:short_url', async (req, res) => {
const shortUrl = req.params.short_url;

const urlDoc = await urls.findOne({short_url: +shortUrl})
  res.redirect(urlDoc.originalUrl); 
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
