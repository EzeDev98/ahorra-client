export default {
  rules: {
    // No raw colours: use a token.
    'color-no-hex': true,
    'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch', 'color'],

    // No raw pixel values: use a token. Media query widths are exempt.
    'unit-disallowed-list': [['px'], { ignoreMediaFeatureNames: { '/.*/': ['px'] } }],

    // Only the design's values for decoration, weight and radius.
    'declaration-property-value-allowed-list': {
      '/^text-decoration(-line)?$/': ['none'],
      'font-weight': ['/^var\\(--font-weight\\)$/', 'inherit'],
      '/^border(-[a-z]+)*-radius$/': ['/^var\\(--radius(-sm)?\\)$/', '0', '50%', 'inherit'],
    },
  },
  overrides: [
    {
      // Raw values live here and only here.
      files: ['src/styles/tokens.css'],
      rules: { 'color-no-hex': null, 'function-disallowed-list': null, 'unit-disallowed-list': null },
    },
    {
      // @font-face must declare the real weight.
      files: ['src/styles/fonts.css'],
      rules: { 'declaration-property-value-allowed-list': null },
    },
  ],
};
