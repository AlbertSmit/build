const { messages } = require('./')

module.exports = {
  'index': {
    valid: [
      {
        title: 'valid - allow tag in index.css',
        source: { filename: 'index.css', source: `div { }` },
      },
      {
        title: 'valid - allow global modifier class on body in index.css',
        source: { filename: 'index.css', source: `:global(body.prevent-scroll) { overflow: hidden; }` },
      },
      {
        title: 'valid - allow global class in index.css',
        source: { filename: 'index.css', source: `:global(.external-library) { color: 0; }` },
      },
      {
        title: 'valid - class selector not in index.css',
        source: `.good { }`,
      },
    ],
    invalid: [
      {
        title: 'invalid - no class in index.css',
        source: { filename: 'index.css', source: `.bad { }` },
        warnings: [messages['no class selectors']('bad')]
      },
      {
        title: 'invalid - no class in index.css',
        source: { filename: 'index.css', source: `div, .bad { }` },
        warnings: [messages['no class selectors']('bad')]
      },
    ]
  },
  'selector-policy': {
    valid: [
      {
        title: 'allow tag selectors in index.css',
        source: { filename: 'index.css', source: 'div { }' },
      },
    ],
    invalid: []
  },
  'no-import': {
    valid: [
      {
        title: 'allow font @import in index.css',
        source: {
          filename: 'index.css',
          source: `@import url('https://fonts.googleapis.com/css');`
        },
      },
    ],
    invalid: [
      {
        title: 'prevent non-font @import in index.css',
        source: {
          filename: 'index.css',
          source: `@import 'x';`
        },
        warnings: [messages['only import font']]
      },
    ]
  },
}
