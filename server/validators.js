const request = require('request');


/*
validators.sendMailgun(config, 'noreply@cert.ninja', 'doug@hcsw.org', 'mailgun test from node', 'this is the body, yey!', (err, resp) => {
  console.log(err, resp);
});
*/

function sendMailgun(config, from, to, subject, text, cb) {
  let formBody = { from, to, subject, text, };

  let url = `https://api:${config.mailgun.apiKey}@api.mailgun.net/v3/cert.ninja/messages`;

  request.post(url, {
    form: formBody,
  }, cb);
}

function _responseHandler(res, body) {
  console.log('3', res.statusCode);
  if (res.statusCode == 200) {
    console.log('4', body)
  } else {
    console.log('oops')
  }
  // console.log(body.url);
  // console.log(body.explanation);
}

function fetchWellKnownFile(domain) {
  let url = `https://${domain}/.well-known/cert-ninja.txt`;
  request.get(`https://${domain}/.well-known/cert-ninja.txt`, (err, res, body) => {
    // console.log('1', err, res)
    if (err) {
      console.log('1', err);
      if (err.code && err.code === 'ECONNREFUSED') {
        request.get(`http://${domain}/.well-known/cert-ninja.txt`, (err, res, body) => {
          // console.log('2', err, res)
          if (err) {
            console.log('2', err);
          } else {
            _responseHandler(res, body);
          }
        });
      }
    } else {
      _responseHandler(res, body);
    }
  });
}



module.exports = {
  sendMailgun,
  fetchWellKnownFile,
};
