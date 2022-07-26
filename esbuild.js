const { sassPlugin } = require('esbuild-sass-plugin');
const esbuild = require('esbuild');

Promise.all([
    esbuild.build({
        entryPoints: ['./main/index.ts'],
        outfile: './dist/main-bundle.js',
        target: 'node14',
        platform: 'node',
        external: ['fs', 'electron'],
        bundle: true,
        write: true,
        watch: true,
    }),
    esbuild.build({
        entryPoints: ['./terminal-light/index.tsx'],
        outfile: './dist/terminal-bundle.js',
        target: 'chrome89',
        sourcemap: true,
        external: ['fs', 'electron'],
        bundle: true,
        write: true,
        watch: true,
        plugins: [sassPlugin()],
    }),
]).catch(({ errors, warnings }) => {
    if (errors.length) {
        console.error(errors);
    }
    if (warnings.length) {
        console.warn(warnings);
    }

    console.log('Started watching');
});
