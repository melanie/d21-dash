import path from 'path';
import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

// Theme layout partials are imported as raw HTML strings. Scoped to the
// themes folder so this rule never touches the src/index.html entry template.
rules.push({
  test: /\.html$/,
  include: path.resolve(__dirname, 'src', 'themes'),
  type: 'asset/source',
});

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
