module.exports = (c) => {
  let ret = {
    type: 'react-app',

    webpack: {
      publicPath: '/static/',

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

  if (c.command === 'serve-react-app') delete ret.webpack.publicPath;

  return ret;
};
