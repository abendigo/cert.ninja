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

function validateDomain(domain, secret, callback) {
  fetchWellKnownFile(domain, (err, res) => {
    if (err) {
      callback(err);
    } else {
      if (secret && res.secret && secret === res) {
        callback();
      } else {
        callback({
          message: `Secrets don't match.`,
          expected: secret,
          found: res.secret
        });
      }
    }
  });
}


function fetchWellKnownFile(domain, callback) {
  function _responseHandler(res, body, callback) {
    console.log('3', res.statusCode);
    if (res.statusCode == 200) {
      console.log('4', body)
      callback(undefined, {
        secret: body
      })
    } else {
      console.log('oops')
      callback({

      })
    }
    // console.log(body.url);
    // console.log(body.explanation);
  }

  request.get(`https://${domain}/.well-known/cert-ninja.txt`, (httpsErr, res, body) => {
    if (httpsErr) {
      request.get(`http://${domain}/.well-known/cert-ninja.txt`, (httpErr, res, body) => {
        if (httpErr) {
          console.log('2', err);
          callback({
            message: 'Error fetching domain file. I tried both HTTP and HTTPS',
            url: `https://${domain}/.well-known/cert-ninja.txt`,
            httpsErr,
            httpErr
          });
        } else {
          _responseHandler(res, body, callback);
        }
      });
    } else {
      _responseHandler(res, body, callback);
    }
  });
}



module.exports = {
  sendMailgun,
  fetchWellKnownFile,
  validateDomain,
};
