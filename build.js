import civetPlugin from '@danielx/civet/esbuild-plugin';
import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['src/index.js'],
  outfile: 'dist/index.js',
  format: 'esm',
  bundle: true,
  platform: 'node',
  plugins: [
    civetPlugin(),
  ],
}).catch(() => process.exit(1));
