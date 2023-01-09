const render = require('preact-render-to-string')
const React = require('preact/compat')

module.exports = function htmlReactRenderer(template) {
  if (!React.isValidElement(template)) return template
  return '<!DOCTYPE html>\n' + render(template)
}
