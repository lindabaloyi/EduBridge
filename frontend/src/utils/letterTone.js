import { theme } from "../styles/themes";

const { sage, sageLight, brassLight, rustLight, rust } = theme.colors;

export function letterTone(letter) {
  if (letter.startsWith("A")) return { bg: sageLight, fg: sage };
  if (letter.startsWith("B")) return { bg: brassLight, fg: "#6B4F1F" };
  return { bg: rustLight, fg: rust };
}

export default letterTone;