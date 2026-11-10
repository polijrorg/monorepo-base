import type { EvalReport } from './run'

const pct = (value: number) => `${(value * 100).toFixed(1)}%`

/** Relatório em markdown, para anexar ao PR, ao aceite ou à Weekly com o cliente. */
export function evalReportToMarkdown(report: EvalReport): string {
  const lines: string[] = []
  const status = report.meetsTarget ? 'Atingiu a meta' : 'Abaixo da meta'

  lines.push(`# Evals: ${report.name}`, '')
  lines.push(`**${status}**: ${pct(report.passRate)} de acerto, meta de ${pct(report.target)}.`, '')
  lines.push('| Métrica | Valor |', '|---|---|')
  lines.push(`| Casos | ${report.total} |`)
  lines.push(`| Tentativas por caso | ${report.trialsPerCase} |`)
  lines.push(`| Acerto por tentativa | ${pct(report.passRate)} |`)
  lines.push(`| Casos certos em todas as tentativas | ${pct(report.passAllRate)} |`)
  lines.push(`| Custo estimado da rodada | US$ ${report.totalCostUsd.toFixed(4)} |`, '')

  const tags = Object.entries(report.byTag)
  if (tags.length) {
    lines.push('## Por tipo de caso', '', '| Tag | Certos | Total |', '|---|---|---|')
    for (const [tag, s] of tags.sort(([a], [b]) => a.localeCompare(b))) {
      lines.push(`| ${tag} | ${s.passed} | ${s.total} |`)
    }
    lines.push('')
  }

  const failed = report.results.filter((r) => !r.passAll)
  if (failed.length) {
    lines.push('## Casos que falharam', '')
    for (const r of failed) {
      const reasons = [...new Set(r.trials.flatMap((t) => t.failures.map((f) => `${f.grader}: ${f.reason}`)))]
      lines.push(`- **${r.id}** (${r.trials.filter((t) => t.pass).length}/${r.trials.length}): ${reasons.join(' | ')}`)
    }
  }

  return lines.join('\n') + '\n'
}
