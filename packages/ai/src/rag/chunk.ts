/**
 * Divisão de documentos em trechos para RAG.
 *
 * Estratégia simples e previsível: respeita parágrafos, quebra parágrafos
 * longos por frase e repete o fim do trecho anterior no começo do seguinte
 * (sobreposição), para que uma ideia cortada no meio não se perca.
 * Para a maioria dos documentos de negócio (políticas, manuais, contratos)
 * isso basta; meça com evals antes de complicar.
 */

export interface Chunk {
  index: number
  text: string
}

export interface ChunkOptions {
  /** Tamanho máximo de cada trecho, em caracteres. */
  maxChars?: number
  /** Quantos caracteres do fim do trecho anterior repetir no próximo. */
  overlapChars?: number
}

const SEPARATOR = '\n\n'

/** Corta texto sem pontuação em pedaços de até `size`, preferindo cortar num espaço. */
function hardSplit(text: string, size: number): string[] {
  const pieces: string[] = []
  let rest = text.trim()
  while (rest.length > size) {
    let cut = rest.lastIndexOf(' ', size)
    if (cut < size / 2) cut = size
    pieces.push(rest.slice(0, cut).trim())
    rest = rest.slice(cut).trim()
  }
  if (rest) pieces.push(rest)
  return pieces
}

function splitLongParagraph(paragraph: string, size: number): string[] {
  const sentences = paragraph.split(/(?<=[.!?;:])\s+/)
  const pieces: string[] = []
  let acc = ''

  for (const sentence of sentences) {
    if (sentence.length > size) {
      if (acc) pieces.push(acc)
      acc = ''
      pieces.push(...hardSplit(sentence, size))
    } else if (acc && acc.length + 1 + sentence.length > size) {
      pieces.push(acc)
      acc = sentence
    } else {
      acc = acc ? `${acc} ${sentence}` : sentence
    }
  }
  if (acc) pieces.push(acc)
  return pieces
}

function overlapTail(text: string, size: number): string {
  if (size <= 0 || text.length <= size) return size <= 0 ? '' : text
  const tail = text.slice(-size)
  const firstSpace = tail.search(/\s/)
  return firstSpace >= 0 ? tail.slice(firstSpace + 1) : tail
}

export function chunkText(text: string, options: ChunkOptions = {}): Chunk[] {
  const maxChars = options.maxChars ?? 1500
  const overlapChars = options.overlapChars ?? 200

  if (maxChars < 100) throw new Error('maxChars deve ser pelo menos 100.')
  if (overlapChars < 0 || overlapChars * 2 > maxChars) {
    throw new Error('overlapChars deve estar entre 0 e metade de maxChars.')
  }

  // Espaço útil para cada unidade, descontando a sobreposição e o separador.
  const unitSize = maxChars - overlapChars - SEPARATOR.length

  const paragraphs = text
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((p) => p.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)

  const units = paragraphs.flatMap((p) => (p.length > unitSize ? splitLongParagraph(p, unitSize) : [p]))

  const chunks: string[] = []
  let current = ''

  for (const unit of units) {
    const candidate = current ? current + SEPARATOR + unit : unit
    if (candidate.length <= maxChars) {
      current = candidate
      continue
    }
    chunks.push(current)
    const tail = overlapTail(current, overlapChars)
    current = tail ? tail + SEPARATOR + unit : unit
    if (current.length > maxChars) current = unit
  }
  if (current) chunks.push(current)

  return chunks.map((text, index) => ({ index, text }))
}
