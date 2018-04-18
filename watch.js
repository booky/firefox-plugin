process.env.NODE_ENV = 'development';

/**
 * source: https://gist.github.com/jasonblanchard/ae0d2e304a647cd847c0b4493c2353d4
 *
 * TODO:
 *  1) need to update the reference to static folder inside the config dev to build inside `build/`.
 *  2) give a filename to the HTMLWebpackPlugin in order to build inside `build/`.
 *  3) check the paths in the HTML so they are well placed. We might look at the output.path property to prevent the need from adding build folder in the path: https://webpack.js.org/configuration/output/#output-path
 *
 * Parameters for the CLI:
 *  1) build destination
 *  2) public path
 */

const fs = require('fs-extra');
const paths = require('react-scripts/config/paths');
const webpack = require('webpack');
const config = require('react-scripts/config/webpack.config.dev.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * We need to update the webpack dev config in order to remove the use of webpack devserver
 */
config.entry = config.entry.filter(fileName => !fileName.match(/webpackHotDevClient/));
config.plugins = config.plugins.filter(
  plugin => !(plugin instanceof webpack.HotModuleReplacementPlugin),
);

/**
 * We also need to update the path where the different files get generated.
 */
config.output.path = paths.appBuild;
config.output.publicPath = '';
config.output.filename = `js/bundle.js`;
config.output.chunkFilename = `js/[name].chunk.js`;
// update media path destination
config.module.rules[1].oneOf[0].options.name = `media/[name].[hash:8].[ext]`;
config.module.rules[1].oneOf[3].options.name = `media/[name].[hash:8].[ext]`;
config.plugins[1] = new HtmlWebpackPlugin({
  inject: true,
  template: paths.appHtml,
  filename: 'index.html',
});

console.log(paths);

fs.emptyDir(paths.appBuild).then(() => {
  webpack(config).watch({}, (err, stats) => {
    if (err) {
      return console.error(err);
    }

    copyPublicFolder();

    console.log(
      stats.toString({
        chunks: false,
        colors: true,
      }),
    );
  });
});

function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });
}
