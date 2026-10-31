import type { ReplayInitialState } from '../simulator/index.js'

export interface EvaluationRule { required: RegExp[][]; wrong?: Array<{ pattern: RegExp; code: string; note: string }> }
export interface ReplaySetup { newNode: string; initial: ReplayInitialState; newNodeAliases: string[]; headAliases: string[] }
const literal = (text: string) => new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
const answers: Record<string, string> = {
  arrays_sum_loop: '12', arrays_function_parameter: 'In a function parameter, int a[] is adjusted to int *a, so sizeof(a) measures a pointer rather than the original array.', pointers_update_value: '7', pointers_null_safety: 'NULL does not point to a valid int object, so dereferencing it has undefined behavior.', structures_copy: '2', structures_pointer_access: 'p.field accesses a structure value; p->field accesses a field through a pointer to a structure.', stacks_empty_pop: 'It should check whether the stack is empty before reading or removing the top element.', stacks_array_top: 'It returns 9 and top becomes 0.', queues_endpoints: 'Enqueue adds at the rear and dequeue removes from the front.', queues_linked_enqueue: 'Set R->next to N, then update rear to N.', dynamic_memory_failure: 'It should check p != NULL because allocation can fail before dereferencing p.', trees_null_child: 'A missing child is represented by NULL, and dereferencing NULL has undefined behavior.', graphs_visited: 'It prevents repeated visits and infinite traversal around cycles.', searching_sorting_bubble_pass: '[2, 1, 3]',
}
export const rules: Record<string, EvaluationRule> = Object.fromEntries(Object.entries(answers).map(([id, answer]) => [id, { required: [[literal(answer)]] }]))
export const replaySetup: Record<string, ReplaySetup> = {
  diag_linked_lists_head_insert: { newNode: 'N', initial: { head: 'A', list: ['A', 'B', 'C'] }, newNodeAliases: ['N', 'new node', 'it'], headAliases: ['head'] },
  linked_lists_head_insert_trace: { newNode: 'N', initial: { head: 'A', list: ['A', 'B', 'C'] }, newNodeAliases: ['N', 'new node', 'it'], headAliases: ['head'] },
  linked_lists_stack_push_transfer: { newNode: 'N', initial: { head: 'A', list: ['A', 'B'] }, newNodeAliases: ['N', 'new node', 'it'], headAliases: ['top', 'head'] },
  linked_lists_named_head_transfer: { newNode: 'N', initial: { head: 'A', list: ['A', 'B', 'C'] }, newNodeAliases: ['newContact', 'new contact', 'new node', 'it'], headAliases: ['firstContact', 'first contact', 'head', 'front'] },
}
