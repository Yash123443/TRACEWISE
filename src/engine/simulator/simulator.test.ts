import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import { compareTraces, correctInsertAtHead, correctInsertAtHeadWithCapture, diagnoseTrace, runReplay } from './index.js'
import type { Operation, Trace } from '../contracts/index.js'

const op = (operation: Operation): Operation => operation
const lostOperations: Operation[] = [
  op({ op: 'allocate', node: 'N', source_text: 'allocate N' }),
  op({ op: 'set_head', target: 'N', source_text: 'head = N' }),
  op({ op: 'set_next', node: 'N', target: 'head', source_text: 'N.next = head' }),
]
const fixture = (name: string) => JSON.parse(readFileSync(new URL(`../../../fixtures/${name}`, import.meta.url), 'utf8')) as Trace

describe('linked-list replay simulator', () => {
  test('correct order preserves the list', () => {
    const trace = runReplay(correctInsertAtHead())
    expect(trace.final_list).toEqual(['N', 'A', 'B', 'C'])
    expect(trace.unreachable_nodes).toEqual([])
    expect(trace.error).toBeUndefined()
  })

  test('capturing the old head gives the same correct list', () => {
    expect(runReplay(correctInsertAtHeadWithCapture()).final_list).toEqual(['N', 'A', 'B', 'C'])
  })

  test('resolves head at execution time and diagnoses a self-loop', () => {
    const trace = runReplay(lostOperations)
    expect(trace.steps.at(-1)?.nodes.N.next).toBe('N')
    expect(trace.final_list).toEqual(['N'])
    expect(trace.unreachable_nodes).toEqual(['A', 'B', 'C'])
    expect(trace.steps.at(-1)?.note).toContain('cycle')
    expect(diagnoseTrace(trace).code).toBe('LL_SELF_LOOP')
  })

  test('captured old head stays the captured reference after head moves', () => {
    const operations: Operation[] = [
      { op: 'allocate', node: 'N', source_text: 'allocate N' },
      { op: 'capture', name: 'old_head', from: 'head', source_text: 'capture head' },
      { op: 'set_head', target: 'N', source_text: 'move head' },
      { op: 'set_next', node: 'N', target: '$old_head', source_text: 'link captured head' },
    ]
    expect(runReplay(operations).final_list).toEqual(['N', 'A', 'B', 'C'])
  })

  test('diagnoses lost original nodes after head changes before linking', () => {
    const trace = runReplay([
      { op: 'allocate', node: 'N', source_text: 'allocate N' },
      { op: 'set_head', target: 'N', source_text: 'head = N' },
    ])
    expect(trace.unreachable_nodes).toEqual(['A', 'B', 'C'])
    expect(diagnoseTrace(trace).code).toBe('LL_INSERT_ORDER')
  })

  test('diagnoses missing head update', () => {
    const trace = runReplay([
      { op: 'allocate', node: 'N', source_text: 'allocate N' },
      { op: 'set_next', node: 'N', target: 'head', source_text: 'N.next = head' },
    ])
    expect(diagnoseTrace(trace).code).toBe('LL_FORGOT_HEAD_UPDATE')
  })

  test('errors before an unallocated node is linked', () => {
    const trace = runReplay([{ op: 'set_next', node: 'N', target: 'head', source_text: 'link N' }])
    expect(trace.error).toBeDefined()
    expect(trace.steps).toHaveLength(0)
    expect(diagnoseTrace(trace).code).toBeNull()
  })

  test.each([
    ['unknown capture', [{ op: 'set_head', target: '$x', source_text: 'use x' }]],
    ['duplicate allocate', [{ op: 'allocate', node: 'A', source_text: 'allocate A' }]],
    ['empty operations', []],
  ] as const)('%s returns a simulation error without diagnosis', (_label, operations) => {
    const trace = runReplay(operations as Operation[])
    expect(trace.error).toBeDefined()
    expect(diagnoseTrace(trace).code).toBeNull()
  })

  test('compares traces at the first different step', () => {
    const correct = runReplay(correctInsertAtHead())
    const student = runReplay([{ op: 'allocate', node: 'N', source_text: 'allocate N' }, { op: 'set_head', target: 'N', source_text: 'head = N' }])
    expect(compareTraces(student, correct).firstDivergenceIndex).toBe(1)
  })

  test('supports transfer lists with different starting nodes', () => {
    expect(runReplay(correctInsertAtHead('X'), { head: 'P', list: ['P', 'Q'] }).final_list).toEqual(['X', 'P', 'Q'])
  })

  test('matches the correct trace fixture', () => {
    const operations: Operation[] = [
      { op: 'allocate', node: 'N', source_text: 'allocate N' },
      { op: 'set_next', node: 'N', target: 'head', source_text: 'N.next = head' },
      { op: 'set_head', target: 'N', source_text: 'head = N' },
    ]
    const actual = runReplay(operations)
    const expected = fixture('trace-correct.json')
    expect(actual.steps.map(({ index, operation, nodes, head, reachable, unreachable }) => ({ index, operation, nodes, head, reachable, unreachable })))
      .toEqual(expected.steps.map(({ index, operation, nodes, head, reachable, unreachable }) => ({ index, operation, nodes, head, reachable, unreachable })))
    expect([actual.final_head, actual.final_list, actual.unreachable_nodes]).toEqual([expected.final_head, expected.final_list, expected.unreachable_nodes])
  })

  test('matches the lost-nodes trace fixture', () => {
    const actual = runReplay(lostOperations)
    const expected = fixture('trace-lost-nodes.json')
    expect(actual.steps.slice(1).map(({ index, nodes, head, reachable, unreachable }) => ({ index, nodes, head, reachable, unreachable })))
      .toEqual(expected.steps.map(({ index, nodes, head, reachable, unreachable }) => ({ index: index + 1, nodes, head, reachable, unreachable })))
    expect([actual.final_head, actual.final_list, actual.unreachable_nodes]).toEqual([expected.final_head, expected.final_list, expected.unreachable_nodes])
  })
})
