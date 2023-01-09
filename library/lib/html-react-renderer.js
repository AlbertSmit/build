const renderToString = require('preact-render-to-string')
// const ReactDOMServer = require('react-dom/server')
const { isElement } = require('react-dom/test-utils')

module.exports = function htmlReactRenderer(template) {
  // if (!isElement(template)) return template
  // return '<!DOCTYPE html>\n' + ReactDOMServer.renderToStaticMarkup(template)

  return '<!DOCTYPE html>\n' + renderToString(template)
}
