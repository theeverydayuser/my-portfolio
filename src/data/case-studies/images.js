/*
  Builds image entries for a case study. Each image is exported from the original
  files at up to 2400px wide for desktop, plus a 1200px `-mobile` version for phones
  (sharp on 3x phone screens, which draw a full-width image with ~1000 pixels).
  `sizes` maps each file name to its desktop [width, height].
*/
export const imageSet = (folder, sizes) => (name, alt) => {
  const [width, height] = sizes[name]
  const mobileWidth = Math.min(1200, width)
  return {
    src: `/assets/projects/${folder}/${name}.webp`,
    width,
    height,
    alt,
    mobile: {
      src: `/assets/projects/${folder}/${name}-mobile.webp`,
      width: mobileWidth,
      height: Math.round((mobileWidth * height) / width),
    },
  }
}
