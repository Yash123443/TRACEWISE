import type { LinkedListInsertionFixtureTrace } from '../types/workbenchTrace';

/**
 * Fixture Trace for Linked-List Insertion at Beginning.
 * Clearly labeled mock trace data separating simulation mechanics from presentation.
 */
export const LINKED_LIST_INSERTION_FIXTURE: LinkedListInsertionFixtureTrace = {
  fixtureVersion: '1.0.0',
  fixtureLabel: 'TraceWise Simulator Contract Demo: LL_INSERT_HEAD_V1',
  problemStatement: {
    title: 'Insert Node at the Beginning of a Singly Linked List',
    description:
      'Given an existing singly linked list with head pointer pointing to node A (A → B → C → NULL), insert a newly allocated node N at the front of the list such that N becomes the new head and preserves access to all existing nodes.',
    initialListRepresentation: 'head → [ A ] → [ B ] → [ C ] → NULL',
    nodeToInsert: {
      val: 'N',
      address: '0x1040',
    },
    targetListRepresentation: 'head → [ N ] → [ A ] → [ B ] → [ C ] → NULL',
  },

  steps: [
    {
      stepIndex: 0,
      label: 'Initial Heap State',
      codeInstruction: '// Initial state before insertion\nListNode* head = &nodeA;',
      description:
        'The linked list contains 3 nodes (A, B, C). The head pointer references node A (address 0x2000). All nodes are reachable.',
      targetPointersAffected: ['head'],
      snapshot: {
        nodes: [
          { id: 'node-a', val: 'A', memoryAddress: '0x2000', nextId: 'node-b', status: 'initial', isHeadTarget: true },
          { id: 'node-b', val: 'B', memoryAddress: '0x2040', nextId: 'node-c', status: 'initial' },
          { id: 'node-c', val: 'C', memoryAddress: '0x2080', nextId: null, status: 'initial' },
        ],
        pointers: [
          { name: 'head', targetNodeId: 'node-a', color: '#0d9488' },
        ],
        headTargetId: 'node-a',
        unreachableNodeIds: [],
        hasCycle: false,
        invariantStatus: 'valid',
        invariantNote: 'Base list invariant satisfied: Head points to A, terminating at NULL.',
      },
    },
    {
      stepIndex: 1,
      label: 'Step 1: Allocate New Node',
      codeInstruction: 'ListNode* newNode = new ListNode(\'N\');',
      description:
        'A new node with value \'N\' is allocated on the heap at memory address 0x1040. Its next pointer is initialized to NULL.',
      targetPointersAffected: ['newNode'],
      snapshot: {
        nodes: [
          { id: 'node-new', val: 'N', memoryAddress: '0x1040', nextId: null, status: 'allocated' },
          { id: 'node-a', val: 'A', memoryAddress: '0x2000', nextId: 'node-b', status: 'initial', isHeadTarget: true },
          { id: 'node-b', val: 'B', memoryAddress: '0x2040', nextId: 'node-c', status: 'initial' },
          { id: 'node-c', val: 'C', memoryAddress: '0x2080', nextId: null, status: 'initial' },
        ],
        pointers: [
          { name: 'head', targetNodeId: 'node-a', color: '#0d9488' },
          { name: 'newNode', targetNodeId: 'node-new', color: '#2563eb' },
        ],
        headTargetId: 'node-a',
        unreachableNodeIds: ['node-new'],
        hasCycle: false,
        invariantStatus: 'in-progress',
        invariantNote: 'newNode is allocated but unlinked. It is currently unreachable from head.',
      },
      prediction: {
        id: 'pred-step-1',
        question: 'What pointer operation MUST occur next to prevent losing the original list?',
        promptContext:
          'Consider what happens if you reassign head before connecting newNode to the existing nodes.',
        options: [
          {
            id: 'opt-a',
            text: 'newNode->next = head; (Link newNode to current head first)',
            isCorrect: true,
            conceptualExplanation:
              'Correct invariant reasoning: By wiring newNode->next to head (Node A), we preserve the link to the existing chain before moving the head pointer.',
          },
          {
            id: 'opt-b',
            text: 'head = newNode; (Directly reassign head to newNode)',
            isCorrect: false,
            conceptualExplanation:
              'Overwriting head immediately severs your only reference to Node A, causing the entire original list (A → B → C) to become unreachable memory leaks.',
          },
          {
            id: 'opt-c',
            text: 'newNode->next = head->next; (Link newNode directly to Node B)',
            isCorrect: false,
            conceptualExplanation:
              'Wiring newNode directly to Node B skips Node A entirely, causing Node A to be dropped from the list.',
          },
        ],
      },
    },
    {
      stepIndex: 2,
      label: 'Step 2: Connect newNode.next to Head',
      codeInstruction: 'newNode->next = head;',
      description:
        'newNode\'s next pointer now points to Node A (0x2000). The existing chain is preserved behind newNode.',
      targetPointersAffected: ['newNode->next'],
      snapshot: {
        nodes: [
          { id: 'node-new', val: 'N', memoryAddress: '0x1040', nextId: 'node-a', status: 'linked' },
          { id: 'node-a', val: 'A', memoryAddress: '0x2000', nextId: 'node-b', status: 'initial', isHeadTarget: true },
          { id: 'node-b', val: 'B', memoryAddress: '0x2040', nextId: 'node-c', status: 'initial' },
          { id: 'node-c', val: 'C', memoryAddress: '0x2080', nextId: null, status: 'initial' },
        ],
        pointers: [
          { name: 'head', targetNodeId: 'node-a', color: '#0d9488' },
          { name: 'newNode', targetNodeId: 'node-new', color: '#2563eb' },
        ],
        headTargetId: 'node-a',
        unreachableNodeIds: ['node-new'],
        hasCycle: false,
        invariantStatus: 'in-progress',
        invariantNote: 'Chain link established: N points to A. Head still references A.',
      },
    },
    {
      stepIndex: 3,
      label: 'Step 3: Update Head Pointer',
      codeInstruction: 'head = newNode;',
      description:
        'The head pointer is updated to reference newNode (0x1040). All 4 nodes (N, A, B, C) are now sequentially reachable from head.',
      targetPointersAffected: ['head'],
      snapshot: {
        nodes: [
          { id: 'node-new', val: 'N', memoryAddress: '0x1040', nextId: 'node-a', status: 'active', isHeadTarget: true },
          { id: 'node-a', val: 'A', memoryAddress: '0x2000', nextId: 'node-b', status: 'linked' },
          { id: 'node-b', val: 'B', memoryAddress: '0x2040', nextId: 'node-c', status: 'linked' },
          { id: 'node-c', val: 'C', memoryAddress: '0x2080', nextId: null, status: 'linked' },
        ],
        pointers: [
          { name: 'head', targetNodeId: 'node-new', color: '#0d9488' },
          { name: 'newNode', targetNodeId: 'node-new', color: '#2563eb' },
        ],
        headTargetId: 'node-new',
        unreachableNodeIds: [],
        hasCycle: false,
        invariantStatus: 'valid',
        invariantNote: 'Operation complete: head → N → A → B → C → NULL. Zero unreachable orphan nodes.',
      },
    },
  ],

  constraintCorrectionScenarios: [
    {
      id: 'scen-correct',
      name: 'Correct Ordering: Link Then Reassign',
      description: 'Standard safe invariant: Wire newNode.next first, then update head.',
      codeSnippet: ['newNode->next = head;', 'head = newNode;'],
      headTarget: 'node-new',
      newNodeNextTarget: 'node-a',
      resultingSnapshot: {
        nodes: [
          { id: 'node-new', val: 'N', memoryAddress: '0x1040', nextId: 'node-a', status: 'active', isHeadTarget: true },
          { id: 'node-a', val: 'A', memoryAddress: '0x2000', nextId: 'node-b', status: 'linked' },
          { id: 'node-b', val: 'B', memoryAddress: '0x2040', nextId: 'node-c', status: 'linked' },
          { id: 'node-c', val: 'C', memoryAddress: '0x2080', nextId: null, status: 'linked' },
        ],
        pointers: [
          { name: 'head', targetNodeId: 'node-new', color: '#0d9488' },
          { name: 'newNode', targetNodeId: 'node-new', color: '#2563eb' },
        ],
        headTargetId: 'node-new',
        unreachableNodeIds: [],
        hasCycle: false,
        invariantStatus: 'valid',
        invariantNote: 'All nodes reachable from head. No memory leaks.',
      },
      diagnosticObservation:
        'Correct pointer sequence preserved access to Node A before overwriting the head variable.',
    },
    {
      id: 'scen-head-overwrite-trap',
      name: 'Classic Bug: Head Overwrite Trap',
      description: 'Accidentally reassigning head before wiring newNode.next.',
      codeSnippet: ['head = newNode; // premature reassign', 'newNode->next = head; // points to itself!'],
      headTarget: 'node-new',
      newNodeNextTarget: 'node-new',
      resultingSnapshot: {
        nodes: [
          { id: 'node-new', val: 'N', memoryAddress: '0x1040', nextId: 'node-new', status: 'active', isHeadTarget: true },
          { id: 'node-a', val: 'A', memoryAddress: '0x2000', nextId: 'node-b', status: 'unreachable' },
          { id: 'node-b', val: 'B', memoryAddress: '0x2040', nextId: 'node-c', status: 'unreachable' },
          { id: 'node-c', val: 'C', memoryAddress: '0x2080', nextId: null, status: 'unreachable' },
        ],
        pointers: [
          { name: 'head', targetNodeId: 'node-new', color: '#0d9488' },
          { name: 'newNode', targetNodeId: 'node-new', color: '#2563eb' },
        ],
        headTargetId: 'node-new',
        unreachableNodeIds: ['node-a', 'node-b', 'node-c'],
        hasCycle: true,
        cycleNodeId: 'node-new',
        invariantStatus: 'flawed',
        invariantNote: 'CRITICAL BUG: Nodes A, B, and C are permanently orphaned (memory leak). Node N loops to itself.',
      },
      diagnosticObservation:
        'Since head was overwritten to point to newNode, evaluating `newNode->next = head` evaluated to `newNode->next = newNode`, creating an infinite cycle while orphaning original nodes A, B, and C.',
    },
    {
      id: 'scen-skip-head-bug',
      name: 'Omission Bug: Skipped Head Node',
      description: 'Accidentally wiring newNode->next to head->next instead of head.',
      codeSnippet: ['newNode->next = head->next;', 'head = newNode;'],
      headTarget: 'node-new',
      newNodeNextTarget: 'node-b',
      resultingSnapshot: {
        nodes: [
          { id: 'node-new', val: 'N', memoryAddress: '0x1040', nextId: 'node-b', status: 'active', isHeadTarget: true },
          { id: 'node-a', val: 'A', memoryAddress: '0x2000', nextId: 'node-b', status: 'unreachable' },
          { id: 'node-b', val: 'B', memoryAddress: '0x2040', nextId: 'node-c', status: 'linked' },
          { id: 'node-c', val: 'C', memoryAddress: '0x2080', nextId: null, status: 'linked' },
        ],
        pointers: [
          { name: 'head', targetNodeId: 'node-new', color: '#0d9488' },
          { name: 'newNode', targetNodeId: 'node-new', color: '#2563eb' },
        ],
        headTargetId: 'node-new',
        unreachableNodeIds: ['node-a'],
        hasCycle: false,
        invariantStatus: 'flawed',
        invariantNote: 'Node A is orphaned from the list because newNode bypassed it and linked directly to B.',
      },
      diagnosticObservation:
        'Node A is disconnected and cannot be accessed from head, losing whatever value was stored in A.',
    },
  ],

  transferQuestion: {
    id: 'tq-doubly-and-sentinel',
    title: 'Transfer Reasoning: Sentinel Nodes & Doubly-Linked Lists',
    prompt:
      'Now that you have traced why `newNode->next = head` must precede `head = newNode`:\n\n1. If this were a Doubly Linked List with both `prev` and `next` pointers, which two additional pointer updates are necessary to maintain bidirectional consistency?\n2. How would using a dummy/sentinel head node eliminate the need for special handling when inserting at index 0 versus index k?',
    targetConcept: 'Doubly Linked Invariants & Sentinel Pattern',
    targetInvariants: [
      'Maintaining (node.next.prev == node) invariant in doubly linked structures',
      'Non-null guarantee of sentinel node removing null-pointer edge cases',
    ],
    placeholderNotice:
      'This transfer question contract is wired for the future learning engine simulator evaluator. Responses in this phase are stored locally without fabricated AI scoring.',
  },
};

