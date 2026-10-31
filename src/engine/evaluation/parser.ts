import type { OperationProposal } from '../contracts/index.js'
import type { ReplaySetup } from './rules.js'

export function parseInsertExplanation(text: string, setup: ReplaySetup): OperationProposal {
  const marks = [...text.matchAll(/\b(?:scratch that|no wait|wait no|i mean|correction)\b/gi)]
  const input = marks.length ? text.slice((marks.at(-1)?.index ?? 0) + (marks.at(-1)?.[0].length ?? 0)) : text
  const rawClauses = input.split(/(?<=[.,;])|\b(?:and then|then|after that|finally)\b/i).map((item) => item.trim()).filter(Boolean)
  const clauses = rawClauses.reduce<string[]>((items, clause) => {
    if (/^(?:to|the|old|previous|original|prior|existing)\b/i.test(clause) && items.length) items[items.length - 1] += ` ${clause}`
    else items.push(clause)
    return items
  }, [])
  const operations: OperationProposal['operations'] = []
  for (const clause of clauses) {
    const lower = clause.toLowerCase()
    if (/\b(?:before|after)\b/i.test(clause)) return { status: 'uncertain', operations: [], clarification_question: `Please clarify the order in “${clause}”.` }
    if (lower.includes('next') && /(?:\bn\b|new node|newcontact|new contact|\bit\b)/i.test(clause) || /\b(?:point|link|connect)\b\s+(?:the\s+)?(?:\bn\b|new node|newcontact|new contact|\bit\b)/i.test(clause)) { operations.push({ op: 'set_next', node: setup.newNode, target: /(?:old|previous|original|prior|existing)\s+(?:head|top|firstcontact|front)/i.test(clause) ? '$old_head' : 'head', source_text: clause }); continue }
    if (/(?:make|set|move|update)/i.test(clause) && /(?:head|top|firstcontact|first contact|front)/i.test(clause) && /(?:\bn\b|new node|newcontact|new contact|\bit\b)/i.test(clause) || /(?:head|top|firstcontact|first contact|front)\s*=\s*(?:n|new node|newcontact|it)/i.test(clause) || /(?:\bn\b|new node|newcontact|new contact|\bit\b)\s+becomes\s+the\s+(?:head|top|firstcontact|front)/i.test(clause)) { operations.push({ op: 'set_head', target: setup.newNode, source_text: clause }); continue }
    if (/(?:create|allocate|make)\s+(?:a\s+)?new\s+node/i.test(clause)) { operations.push({ op: 'allocate', node: setup.newNode, source_text: clause }); continue }
    if (/\b(?:next|head|point|link|top)\b/i.test(clause)) return { status: 'uncertain', operations: [], clarification_question: `Please clarify this pointer step: “${clause}”.` }
  }
  if (!operations.length) return { status: 'insufficient_answer', operations: [], clarification_question: 'Please describe the pointer updates in order.' }
  if (operations.some((op) => op.op === 'set_next' && op.target === '$old_head')) operations.unshift({ op: 'capture', name: 'old_head', from: 'head', source_text: 'implicit capture of the head before any change' })
  if (!operations.some((op) => op.op === 'allocate')) operations.unshift({ op: 'allocate', node: setup.newNode, source_text: 'implicit: node already allocated' })
  return { status: 'identified', operations, clarification_question: null }
}
