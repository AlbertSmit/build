const { relative, dirname } = require('path')
const loaderUtils = require('loader-utils')
const postcss = require('postcss')

const plugins = [
  // these plugis need to run on each file individual file
  // look at the source of postcss-modules to see that it effectively runs all modules twice
  ['postcss-plugin-composition', ({ onImport, onExport, resolve }, options) => [
    // postcss-import is advised to be the first
    require('postcss-import')({ onImport, /* path: rootDirectories, */ glob: true, resolve }),
    require('postcss-apply')(), // https://github.com/kaliberjs/build/issues/34
    require('postcss-modules')({
      getJSON: (_, json) => { onExport(json) },
      generateScopedName: options.minimize ? '[hash:base64:5]' : '[folder]-[name]-[local]__[hash:base64:5]'
    }),
  ]],
  // these plugins need to run on final result
  ['../postcss-plugins/postcss-url-replace', ({ onUrl }) => ({ replace: (url, file) => onUrl(url, file) })],
  ['postcss-cssnext'],
  ['cssnano', {}, options => options.minimize]
]

const pluginCreators = plugins.map(([ name, config, includePlugin ]) => {
  const createPlugin = require(name)
  return (handlers, options) => (includePlugin ? includePlugin(options) : true)
    ? createPlugin(typeof(config) === 'function' ? config(handlers, options) : config)
    : null
})

module.exports = function CssLoader(source, map) {
  const loaderOptions = loaderUtils.getOptions(this)
  const self = this
  const callback = this.async()

  let exports = {}
  const handlers = {
    onImport: imports => { imports.forEach(i => self.addDependency(i)) },
    resolve: (id, basedir, importOptions) => resolve(basedir, id),
    onExport: locals  => { exports = locals },
    onUrl   : (url, file) => {
      if (isDependency(url)) {
        return resolve(dirname(file), url)
          .then(resolved => loadModule(resolved).then(executeModuleAt(resolved)))
      } else return Promise.resolve(url)
    }
  }

  const plugins = pluginCreators.map(create => create(handlers, loaderOptions)).filter(_ => _)
  const filename = relative(this.options.context, this.resourcePath)
  const options = {
    from: this.resourcePath,
    to  : this.resourcePath,
    map : { prev: map || false, inline: false, annotation: false }
  }

  const result = postcss(plugins).process(source, options)
  result
    .then(({ css, map }) => {
      throwErrorForWarnings(result.warnings())
      this.emitFile(filename, css, map.toJSON())
      callback(null, exports)
    })
    .catch(e => { callback(e) })

  function resolve(context, request) {
    return new Promise((resolve, reject) => {
      self.resolve(context, request, (err, result) => { err ? reject(err) : resolve(result) })
    }).catch(e => { callback(e) }) // this should not be required, by it seems postcss-plugin-composition does not pass along 'warnings' (more commonly known as 'errors')
  }

  function loadModule(url) {
    return new Promise((resolve, reject) => {
      self.loadModule(url, (err, source) => { if (err) reject(err); else resolve(source) })
    })
  }

  function executeModuleAt(url) {
    return source => {
      const completeSource = `const __webpack_public_path__ = '${self.options.output.publicPath || '/'}'\n` + source
      return self.exec(completeSource, url)
    }
  }

  function throwErrorForWarnings(warnings) {
    if (warnings.length) throw new Error(warnings
      .sort(({ line: a = 0 }, { line: b = 0}) => a - b)
      .map(warning => fileAndLine(warning) + warning.text).join('\n\n') + '\n'
    )

    function fileAndLine({ line }) {
      return filename + ((line || '') && (':' + line)) + '\n\n'
    }
  }
}

function isDependency(s) { return !/^data:|^(https?:)?\/\//.test(s) }
