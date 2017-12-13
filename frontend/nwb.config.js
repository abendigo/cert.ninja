module.exports = (c) => {
  let ret = {
    type: 'react-app',

    webpack: {
      rules: {
        svg: {
          use: [
            {
              loader: 'svg-inline-loader',
              options: {classPrefix: true}
            },
            'svgo-loader',
          ]
        }
      },
    }
  };

  return ret;
};
