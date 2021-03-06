const path = require('path')

module.exports = {
	mode: 'development',
	devtool: 'inline-source-map',

	devServer: {
		static: './dist',
	},

	entry: {
		index: './src/index.js',
	},

	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
	},

	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader'],
			},
			{

				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: 'asset/resource',
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/i,
				type: 'asset/resource',
			},
			{
				test: /\.html$/i,
				loader: 'html-loader',
			},
			{
				test: /\.(csv|tsv)$/i,
				use: ['csv-loader'],
			},
		],
	},

}
