const dotenv = require('dotenv');
const express = require('express');
const request = require('request');
const path = require('path');

const app = express();

// 根据 NODE_ENV 加载不同的环境变量文件
if (process.env.NODE_ENV === 'production') {
  dotenv.config();
} else {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });
}

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, FRONTEND_URL, SERVER_PORT } = process.env;

// Serve static files from the React app only in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
}

app.get('/callback', function (req, res) {
  const code = req.query.code || null;
  console.log('Received code on server:', code);

  if (!code) {
    console.error('No code provided');
    return res.redirect(`${FRONTEND_URL}/#error=no_code`);
  }

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    },
    headers: {
      Authorization: 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (error || response.statusCode !== 200) {
      console.error('Error in token request:', error || body);
      return res.redirect(`${FRONTEND_URL}/#error=invalid_token`);
    }

    const access_token = body.access_token;
    console.log('Access token received on server:', access_token);

    // Redirect to the React app with the token
    res.redirect(`${FRONTEND_URL}/#access_token=${access_token}`);
  });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// Only use this in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

const PORT = SERVER_PORT || 8080;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
