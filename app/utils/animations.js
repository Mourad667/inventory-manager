export const transitions = {
  fast: 0.2,
  base: 0.3,
  slow: 0.5,
  hover: {
    scale: 1.02,
    duration: 0.3
  },
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    duration: 0.5
  }
};