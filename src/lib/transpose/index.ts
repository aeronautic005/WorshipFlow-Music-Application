const SHARP_SCALE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const FLAT_SCALE = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]

// Map alternate note spellings to index
const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  "B#": 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  F: 5,
  "E#": 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
  Cb: 11,
}

// Keys that traditionally prefer flats
const PREFER_FLATS = new Set(["F", "Bb", "Eb", "Ab", "Db", "Gb", "Dm", "Gm", "Cm", "Fm", "Bbm"])

export function getSemitoneDistance(fromKey: string, toKey: string): number {
  const fromClean = fromKey.replace(/m$/, "")
  const toClean = toKey.replace(/m$/, "")

  const fromIndex = NOTE_TO_SEMITONE[fromClean] ?? 0
  const toIndex = NOTE_TO_SEMITONE[toClean] ?? 0

  let distance = toIndex - fromIndex
  if (distance < 0) distance += 12
  return distance
}

export function transposeSingleNote(note: string, semitones: number, preferFlat: boolean): string {
  const currentIndex = NOTE_TO_SEMITONE[note]
  if (currentIndex === undefined) return note

  const newIndex = (currentIndex + semitones + 12) % 12
  return preferFlat ? FLAT_SCALE[newIndex] : SHARP_SCALE[newIndex]
}

// Regex to match a chord token (e.g. C#m7, F#/A#, Bbdim)
const CHORD_REGEX = /\b([A-G][b#]?)(m|maj|min|dim|aug|sus[24]?|add[29]?|[0-9]+)?(\/[A-G][b#]?)?\b/g

export function transposeChordToken(chord: string, semitones: number, preferFlat: boolean): string {
  return chord.replace(CHORD_REGEX, (match, root, quality = "", bass = "") => {
    const newRoot = transposeSingleNote(root, semitones, preferFlat)
    let newBass = ""
    if (bass) {
      const bassNote = bass.replace("/", "")
      newBass = "/" + transposeSingleNote(bassNote, semitones, preferFlat)
    }
    return `${newRoot}${quality}${newBass}`
  })
}

/**
 * Transpose a chord chart line by line.
 * Lines enclosed in [brackets] (section headers) are untouched.
 * Lines containing predominantly chords are transposed.
 */
export function transposeChordChart(
  chartContent: string,
  fromKey: string,
  toKey: string
): string {
  if (fromKey === toKey) return chartContent

  const semitones = getSemitoneDistance(fromKey, toKey)
  const preferFlat = PREFER_FLATS.has(toKey)

  return chartContent
    .split("\n")
    .map((line) => {
      // Don't modify section headers like [Verse 1]
      if (line.trim().startsWith("[") && line.trim().endsWith("]")) {
        return line
      }

      // Check if line contains chords (spacing + chord symbols)
      // If line is lyrics without chords, return line as-is
      const tokens = line.trim().split(/\s+/)
      const isChordLine = tokens.every(
        (token) => !token || CHORD_REGEX.test(token) || /^[-|/\\:.]+$/.test(token)
      )

      if (isChordLine && tokens.length > 0 && tokens[0] !== "") {
        return transposeChordToken(line, semitones, preferFlat)
      }

      return line
    })
    .join("\n")
}
