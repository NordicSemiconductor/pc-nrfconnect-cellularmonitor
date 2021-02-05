const { merge } = require('webpack-merge');
const sharedConfig = require('pc-nrfconnect-shared/config/webpack.config.js');

module.exports = merge(sharedConfig, {
    module: {
        rules: [
            {
                test: /\.ya?ml$/,
                type: 'json', // Required by Webpack v4
                use: 'yaml-loader',
            },
        ],
    },
});
