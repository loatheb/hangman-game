const https = require('https');
const config = require('./config');

const {playerId, defaultRequestOptions} = config;

module.exports = (data) => {
  const postData = Object.assign({}, {
    playerId,
  }, data);

  const options = Object.assign({}, defaultRequestOptions, {
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(postData)),
    },
  });

  return new Promise((resolve, reject) => {

    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
      const data = [];
      res.on('data', (chunk) => {
        data.push(chunk)
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data.join('')));
        } else {
          reject(`[ ${res.statusCode} ] with ${postData.action} `);
        }
      });
    });

    req.on('error', (e) => {
      reject(`Catch error with ${e.message}`);
    });

    req.write(JSON.stringify(postData));
    req.end();
  });
};
