'use strict';

const path = require( 'path' );
const BrowserSyncPlugin = require( 'browser-sync-webpack-plugin' );

const componentName = 'countdown-timer';

module.exports = {
	mode: process.env.NODE_ENV ? 'development' : 'production',
	entry: [
		'./src/index.js'
	],
	output: {
		path: path.resolve( __dirname, './dist' ),
		filename: `${ componentName }.js`,
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				enforce: 'pre',
				use: {
					loader: 'eslint-loader',
					options: {
						fix: true,
					}
				}
			},
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				use: {
					loader: 'babel-loader'
				}
			}
		]
	},
	devtool: 'source-map',
	stats: {
		colors: true
	},
	plugins: [
		new BrowserSyncPlugin( {
			host: '0.0.0.0',
			port: 3000,
			server: { baseDir: [ __dirname ] },
			notify: false,
			files: ['index.html', 'dist/**/*'],
			stream: { once: true },
			injectChanges: true
		} )
	],
};
