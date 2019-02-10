const presets = ['@babel/react']
if (process.env.NODE_ENV === 'test') {
  presets.push('@babel/env')
} else {
  presets.push(['@babel/env', { modules: false }])
}

module.exports = {
  presets,
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-export-default-from'
  ]
}
