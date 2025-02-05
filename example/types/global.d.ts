declare const React: typeof import('preact/compat')
declare const cx: typeof import('classnames')

declare module '*.css' {
  const x: { [any: string]: string }
  export default x
}

interface Window {
  'Rollbar': import('rollbar')
}
