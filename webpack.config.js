const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const StatsPlugin = require('stats-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const DotenvWebpack = require('dotenv-webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = () => {
  return {
    mode: 'production', // 本番用（開発ならdevelopment（圧縮されない））
    entry: ['@babel/polyfill', './src/assets/js/index.js'], // バンドル前のやつのエントリポイント
    devtool: 'inline-source-map',
    plugins: [
      new DotenvWebpack({
        path: path.join(__dirname, '.env'),
        systemvars: true,
      }),
      new StatsPlugin('stats.json', {
        chunkModules: true,
      }),
      new BundleAnalyzerPlugin(),
      new CompressionPlugin({
        test: /\.(css)|(js)$/,
        compressionOptions: {
          level: 9,
        },
      }),
    ],
    output: {
      // バンドル先
      filename: 'bundle.js',
      path: path.join(__dirname, './dist/js'),
    },
    optimization: {
      minimizer: [
        // js圧縮
        new TerserPlugin({
          extractComments: 'all', // コメント削除
          terserOptions: {
            compress: {
              drop_console: false, // console.log削除
            },
          },
        }),
      ],
    },
    module: {
      // ここ追加
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules\/(?!(dom7|ssr-window|swiper)\/).*/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  '@babel/preset-env', // デフォルトでES5になるはず
                ],
              },
            },
          ],
        },
        {
          test: /\.(glsl|vs|fs|vert|frag)$/,
          exclude: /node_modules/,
          use: ['raw-loader'],
        },
      ],
    },
  };
};
