/*
  The room's two looks: NIGHT (matched by eye to the reference image, art/room-source.png)
  and DAY (a sunlit room, LED strips barely showing). Both have the same keys;
  draw-room.js and sprites.js only ever read colours from here.
*/
export const NIGHT = {
  // Wall: dark plum, warmed where the LED strips light it.
  wall: '#1d1723',
  wallDeep: '#18131f',
  led: '#ffd793',
  ledGlow: '#f0a050',

  // Wood: shelves, bookcase, desk.
  woodTop: '#6a3a26',
  woodLight: '#8a4c2e',
  woodFront: '#3c2019',
  woodDark: '#24141a',
  deskTop: '#7a4028',
  deskLit: '#8c4a2c',
  deskShine: '#a65a33',
  deskFront: '#4b2622',
  deskLine: '#83452a',
  underDesk: '#0b0910',
  caseBack: '#160f1c',


  // Monitor.
  bezel: '#090b1c',
  bezelLit: '#1a1f3e',
  screen: ['#121650', '#1e2378', '#3a2c8e', '#7a3f8f', '#e0726a'],
  mountain: '#191d5c',
  mountainFar: '#2a2a78',
  water: '#1c2a86',
  waterDeep: '#14206a',
  waterLit: '#4256c0',
  sun: '#ff9a6a',
  lightBar: '#2f2b46',
  monitorGlow: '#3a3aa0',

  // Desk things.
  mat: '#17111d',
  keyboard: '#14122a',
  key: '#2a2952',
  keyGlowA: '#6a7cff',
  keyGlowB: '#a46cff',
  mouse: '#121433',

  // Furniture below the desk.
  chair: '#0b0e22',
  chairMesh: '#161a3c',
  chairLit: '#28305e',
  chairArm: '#14183a',
  cabinet: '#0c1432',
  drawer: '#121c40',
  drawerLit: '#1f2a54',
  handle: '#050a1c',
  pc: '#0b1028',
  pcLit: '#2a6cff',


  // Plants and pots.
  leafDark: '#1d4520',
  leaf: '#2f7a2a',
  leafLight: '#6fae3a',
  leafShine: '#b6d84a',
  pot: '#4a3a6a',
  potLit: '#6a5590',
  potDark: '#2e2445',
}

export const DAY = {
  // Wall: warm cream in daylight; the LED strips are on but hardly show.
  wall: '#e6d9c6',
  wallDeep: '#d6c6b0',
  led: '#fff8e6',
  ledGlow: '#fff4dc',

  // Wood: shelves, bookcase, desk, in sunlight.
  woodTop: '#a8703f',
  woodLight: '#c8894f',
  woodFront: '#8a5432',
  woodDark: '#5e3a24',
  deskTop: '#b5733f',
  deskLit: '#c4824a',
  deskShine: '#dba068',
  deskFront: '#87502f',
  deskLine: '#a46838',
  underDesk: '#4a3c36',
  caseBack: '#cdbba2',


  // Monitor: the same lake, at midday.
  bezel: '#1a1c26',
  bezelLit: '#3a3e52',
  screen: ['#2f80d8', '#4d98e6', '#72b2ee', '#a2cdf4', '#fde3a6'],
  mountain: '#3f6f8f',
  mountainFar: '#6f97b4',
  water: '#2c76c6',
  waterDeep: '#1d58a0',
  waterLit: '#9ccdf2',
  sun: '#fff3b8',
  lightBar: '#4a4658',
  monitorGlow: '#ffffff',

  // Desk things.
  mat: '#3a3036',
  keyboard: '#2a2838',
  key: '#4a4866',
  keyGlowA: '#6a7cff',
  keyGlowB: '#a46cff',
  mouse: '#2a2c44',

  // Furniture below the desk.
  chair: '#3a3f52',
  chairMesh: '#4c5268',
  chairLit: '#6c7492',
  chairArm: '#2c3040',
  cabinet: '#c4b29c',
  drawer: '#d6c6b0',
  drawerLit: '#eadfce',
  handle: '#8a7660',
  pc: '#2a2e3e',
  pcLit: '#4a8cff',


  // Plants and pots.
  leafDark: '#2a6a2a',
  leaf: '#3f9a36',
  leafLight: '#7cc444',
  leafShine: '#c6e45c',
  pot: '#7a6aa0',
  potLit: '#9a8cc0',
  potDark: '#56487a',
}
