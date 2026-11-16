// shortcut: matter-js has no bundled types and the sponsor brief allows no extra packages (@types/matter-js);
// add that package if the physics code grows beyond src/lib/blikjes.ts.
declare module 'matter-js' {
  const Matter: any // eslint-disable-line @typescript-eslint/no-explicit-any
  export default Matter
}
