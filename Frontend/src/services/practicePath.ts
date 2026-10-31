// Curated sequence of existing engine questions: 6 multiple choice, 8 explanation, 6 trace.
export const guidedQuestionIds = [
  'diag_arrays_bounds',
  'arrays_sum_loop',
  'arrays_function_parameter',
  'diag_pointers_address',
  'pointers_update_value',
  'pointers_null_safety',
  'diag_structures_member',
  'structures_copy',
  'structures_pointer_access',
  'diag_linked_lists_head_insert',
  'linked_lists_head_insert_trace',
  'linked_lists_stack_push_transfer',
  'linked_lists_named_head_transfer',
  'diag_stacks_order',
  'stacks_empty_pop',
  'stacks_array_top',
  'diag_queues_order',
  'queues_endpoints',
  'queues_linked_enqueue',
  'searching_sorting_bubble_pass',
] as const

export const diagnosticQuestionIds = guidedQuestionIds.filter((id) => id.startsWith('diag_'))
