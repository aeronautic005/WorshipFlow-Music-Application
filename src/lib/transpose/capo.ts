import { getSemitoneDistance } from "./index"

export interface CapoOption {
  capoFret: number
  openChordShape: string // "G", "C", "D", "E"
  description: string
}

const COMMON_OPEN_SHAPES = ["G", "C", "D", "E", "A"]

export function calculateCapoPositions(targetKey: string): CapoOption[] {
  const cleanTarget = targetKey.replace(/m$/, "")
  const options: CapoOption[] = []

  for (const shape of COMMON_OPEN_SHAPES) {
    // If the song is already in the open shape, no capo needed (Capo 0)
    if (cleanTarget === shape) {
      options.push({
        capoFret: 0,
        openChordShape: shape,
        description: `No capo needed: play standard ${shape} shapes`,
      })
      continue
    }

    // Distance from shape to targetKey
    let fret = getSemitoneDistance(shape, cleanTarget)
    if (fret > 0 && fret <= 7) {
      options.push({
        capoFret: fret,
        openChordShape: shape,
        description: `Capo on fret ${fret} to play open ${shape} chord shapes`,
      })
    }
  }

  // Sort by lowest capo fret
  return options.sort((a, b) => a.capoFret - b.capoFret)
}
