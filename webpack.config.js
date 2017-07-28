const path = require('path');
const PATHS = {
	src: path.join(__dirname, 'src'),
	dist: path.join(__dirname, 'dist')
};

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const htmlWebpackPlugin = new HtmlWebpackPlugin({
	title: 'TodoList | Keepsolid',
	hash: true,
	template: PATHS.src + '/index.html'
});
const extractLess = new ExtractTextPlugin({
	filename: "[name].[contenthash].css",
	disable: process.env.NODE_ENV === "development"
});

module.exports = {
	entry: PATHS.src + '/main.js',
	output: {
		path: PATHS.dist,
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.less$/,
				use: extractLess.extract({
					use: [{
						loader: "css-loader", options: {
							sourceMap: true
						}
					}, {
						loader: "less-loader", options: {
							sourceMap: true
						}
					}],
					// use style-loader in development
					fallback: "style-loader"
				})
			},
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
					fallback: "style-loader",
					use: {
						loader: "css-loader",
						options: {
							sourceMap: true
						}
					},
					publicPath: PATHS.dist
				})
			}
		]
	},
	plugins: [
		htmlWebpackPlugin,
		extractLess
	],
	devtool: '#source-map'
};
