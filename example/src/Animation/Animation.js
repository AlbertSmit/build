import { a, useSpring } from '@react-spring/web'

/** Assure React compat works. */
export function Animation() {
  const style = useSpring({
    from: { color: 'red' },
    to: [{ color: 'blue' }, { color: 'red' }],
    loop: true
  })

  return (
    <a.div {... { style }}>
      Animated.
    </a.div>
  )
}
