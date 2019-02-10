const config = {
  moduleNameMapper: {
    '^.+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/__mocks__/fileMock.js',
    '^.+\\.(css|less)$': '<rootDir>/src/__mocks__/styleMock.js'
  },
  moduleDirectories: ['node_modules', 'src/'],
  setupFiles: ['@babel/polyfill', './scripts/enzymeTestAdapterSetup.js'],
  testPathIgnorePatterns: ['/node_modules'],
  coveragePathIgnorePatterns: ['node_modules']
}

module.exports = config
