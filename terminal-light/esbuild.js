const { sassPlugin } = require('esbuild-sass-plugin');

require('esbuild')
    .build({
        entryPoints: ['index.tsx'],
        target: 'chrome89',
        sourcemap: false,
        outfile: '../dist/terminal-bundle.js',
        external: ['fs', 'electron'],
        bundle: true,
        write: true,
        watch: true,
        plugins: [sassPlugin()],
    })
    .then(({ errors, warnings }) => {
        if (errors.length) {
            console.error(errors);
        }
        if (warnings.length) {
            console.warn(warnings);
        }

        console.log('Started watching');
    });
