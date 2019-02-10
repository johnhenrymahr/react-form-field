import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

export default {
  input: './src',
  output: [
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs'
    },
    {
      file: 'dist/bundle.esm.js',
      format: 'esm'
    },
    {
      file: 'dist/bundle.umd.js',
      format: 'umd',
      name: 'formField'
    }
  ],
  plugins: [
    resolve({
      customResolveOptions: {
        moduleDirectory: 'node_modules'
      },
      extensions: ['.js', '.json', '.jsx']
    }),
    babel({
      exclude: 'node_modules/**'
    })
  ],
  external: ['react', 'react-dom', 'prop-types']
}
