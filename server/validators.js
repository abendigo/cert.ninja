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



module.exports = {
  sendMailgun,
};
