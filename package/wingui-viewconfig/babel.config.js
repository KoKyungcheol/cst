module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        browsers: ['last 2 versions', 'ie >= 7']
      },
      useBuiltIns: 'usage',
      corejs: 3,
      shippedProposals: true
    }]
  ]
};
