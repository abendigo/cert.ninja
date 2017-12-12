const validators = require('./validators.js');

validators.fetchWellKnownFile('cert.ninja', (err, res) => {
  console.log('0', err, res)
});

validators.validateDomain('cert.ninja', 'hello friend', (err, res) => {
  console.log('1', err, res)
})
