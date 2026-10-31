import type { CConceptGraphFixture } from '../types/conceptGraph';

/**
 * C Language Data Structures & Algorithms Concept Graph Fixture
 * Contains deep concepts, prerequisite/supporting relationships,
 * and demographic learner states strictly labeled as demo data.
 */
export const C_CONCEPT_GRAPH_FIXTURE: CConceptGraphFixture = {
  fixtureVersion: '1.0.0-c-dsa',
  syllabusTitle: 'Data Structures & Algorithms in C Syllabus Concept Graph',
  disclaimerNotice:
    'Demo Learner State: Demographic cohort values provided for UI preview. Neural assessment model pending connection.',

  nodes: [
    {
      id: 'pointers',
      title: 'Pointers & Memory Addresses',
      cSyntaxSignature: 'int val = 42;\nint *ptr = &val;  // ptr holds &val\n*ptr = 100;       // dereference write',
      category: 'Memory Foundations',
      tier: 1,
      summary:
        'Direct memory address referencing, dereferencing operator (*), address-of operator (&), and pointer arithmetic.',
      detailedDescription:
        'Pointers in C are first-class variables holding raw virtual memory addresses. Understanding how pointers interact with variable scope, stack frames, type scale increments (ptr + 1 jumps sizeof(T) bytes), and constant pointers is the prerequisite foundation for all dynamic data structures.',
      prerequisites: [],
      dependents: ['array', 'structures', 'dynamic-memory', 'trees'],
      misconceptions: [
        {
          id: 'misc-ptr-1',
          title: 'Conflating Pointer Value with Pointed-To Value',
          explanation:
            'Mistaking pointer assignment (p = q) with value assignment (*p = *q). The former copies the memory address; the latter alters the target memory cell.',
          cCodeIllustration: 'p = q;   // Re-targets pointer p to address q\n*p = *q; // Overwrites value at *p with value at *q',
        },
        {
          id: 'misc-ptr-2',
          title: 'Uninitialized / Wild Pointer Dereference',
          explanation:
            'Declaring `int *p;` and immediately executing `*p = 10;` without allocating memory or pointing to an existing lvalue causes undefined memory corruption or segmentation fault.',
        },
      ],
      nextActivity: {
        id: 'act-ptr-drill',
        title: 'Pointer Arithmetic & Indirection Trace',
        type: 'trace_reasoning',
        estimatedMinutes: 10,
        prompt: 'Trace the memory offsets when incrementing an `int*` vs `char*` vs `double*` array pointer in C.',
      },
      demoLearnerState: {
        status: 'strong',
        statusLabel: 'Strong',
        lastPracticed: 'Yesterday',
        retentionEstimatePercent: 92,
        demographicCohortAveragePercent: 74,
        isDemoData: true,
      },
    },

    {
      id: 'array',
      title: 'Arrays & Contiguous Buffers',
      cSyntaxSignature: 'int arr[5] = {10, 20, 30, 40, 50};\nint val = *(arr + 2); // Identical to arr[2]',
      category: 'Memory Foundations',
      tier: 1,
      summary:
        'Fixed-size contiguous memory blocks, base address indexing, row-major multidimensional layouts, and pointer decay.',
      detailedDescription:
        'An array in C represents a contiguous sequence of homogeneous elements allocated in stack or static memory. Array names decay into a pointer to their first element when passed to functions. Access formula `arr[i]` computes `BaseAddress + (i * sizeof(element))` in O(1) time.',
      prerequisites: ['pointers'],
      dependents: ['stacks', 'queues', 'searching-sorting'],
      misconceptions: [
        {
          id: 'misc-arr-1',
          title: 'Believing Array Size Is Retained Across Function Calls',
          explanation:
            'In C, passing `void fn(int arr[])` actually passes `int *arr`. Calling `sizeof(arr)` inside the function yields pointer size (4 or 8 bytes), not buffer length.',
          cCodeIllustration: 'void inspect(int arr[]) {\n  // sizeof(arr) == sizeof(int*), NOT 5 * sizeof(int)!\n}',
        },
        {
          id: 'misc-arr-2',
          title: 'Off-by-One Buffer Overflow Invariant Violation',
          explanation:
            'Iterating `for (int i = 0; i <= N; i++)` instead of `i < N` reads or writes past the allocated stack boundary.',
        },
      ],
      nextActivity: {
        id: 'act-arr-audit',
        title: 'Array Decay & Pointer Equivalence Proof',
        type: 'code_audit',
        estimatedMinutes: 8,
        prompt: 'Prove why `i[arr]` is syntactically equivalent to `arr[i]` in C using pointer arithmetic identity.',
      },
      demoLearnerState: {
        status: 'strong',
        statusLabel: 'Strong',
        lastPracticed: '3 days ago',
        retentionEstimatePercent: 88,
        demographicCohortAveragePercent: 79,
        isDemoData: true,
      },
    },

    {
      id: 'structures',
      title: 'Structures & Data Alignment',
      cSyntaxSignature: 'struct Student {\n  int id;       // 4 bytes\n  char grade;   // 1 byte + 3 bytes padding\n  double gpa;   // 8 bytes\n};\nstruct Student *s = &alex;\ns->gpa = 3.9;',
      category: 'Memory Foundations',
      tier: 1,
      summary:
        'User-defined composite types (`struct`), memory padding, alignment rules, and dot (`.`) vs arrow (`->`) operators.',
      detailedDescription:
        'Structures group heterogeneous data elements under a single type name. The C compiler aligns members to natural byte boundaries, frequently inserting padding bytes. Structures are foundational for creating self-referential linked nodes in dynamic data structures.',
      prerequisites: ['pointers'],
      dependents: ['dynamic-memory', 'linked-lists', 'graphs'],
      misconceptions: [
        {
          id: 'misc-struct-1',
          title: 'Assuming sizeof(struct) Is Simply Sum of Member Sizes',
          explanation:
            'CPUs require data alignment (e.g. 4-byte integers aligned on 4-byte boundaries). Compilers add padding bytes, making `sizeof(struct)` larger than sum of individual members.',
        },
        {
          id: 'misc-struct-2',
          title: 'Passing Heavy Structs by Value Instead of Pointer',
          explanation:
            'Passing `fn(struct Node n)` forces the callstack to duplicate the entire memory block. Passing `fn(struct Node *n)` passes a single 8-byte pointer.',
        },
      ],
      nextActivity: {
        id: 'act-struct-padding',
        title: 'Struct Memory Padding & Offset Calculation',
        type: 'invariant_drill',
        estimatedMinutes: 12,
        prompt: 'Reorder struct members to minimize padding overhead from 24 bytes down to 16 bytes on a 64-bit architecture.',
      },
      demoLearnerState: {
        status: 'strong',
        statusLabel: 'Strong',
        lastPracticed: '4 days ago',
        retentionEstimatePercent: 85,
        demographicCohortAveragePercent: 68,
        isDemoData: true,
      },
    },

    {
      id: 'dynamic-memory',
      title: 'Dynamic Memory Allocation (Heap)',
      cSyntaxSignature: 'int *arr = (int*)malloc(n * sizeof(int));\nif (arr == NULL) { /* handle OOM */ }\n// ... use buffer ...\nfree(arr);\narr = NULL; // Prevent dangling pointer',
      category: 'Dynamic Heap & Structures',
      tier: 2,
      summary:
        'Heap memory lifecycle using `malloc`, `calloc`, `realloc`, and `free`. Memory leaks, dangling pointers, and double-free traps.',
      detailedDescription:
        'Unlike automatic stack variables that dissolve upon function exit, dynamically allocated memory on the heap persists until explicitly returned via `free()`. Reliable dynamic memory code must check for NULL on allocation failure, avoid memory leaks by tracking ownership, and neutralize pointers after deallocation.',
      prerequisites: ['pointers', 'structures'],
      dependents: ['linked-lists'],
      misconceptions: [
        {
          id: 'misc-dma-1',
          title: 'Memory Leak via Overwritten Pointer',
          explanation:
            'Reassigning a pointer before calling `free()` drops the only memory address reference to that heap block, permanently leaking memory.',
          cCodeIllustration: 'char *buf = malloc(100);\nbuf = malloc(200); // 100 bytes permanently lost in heap!',
        },
        {
          id: 'misc-dma-2',
          title: 'Use-After-Free / Dangling Pointer Trap',
          explanation:
            'Executing `free(ptr)` does not clear the pointer variable itself; `ptr` still holds the dead address. Accessing `*ptr` afterwards invokes undefined behavior.',
        },
      ],
      nextActivity: {
        id: 'act-dma-audit',
        title: 'Heap Ownership & Memory Leak Audit',
        type: 'memory_workbench',
        estimatedMinutes: 15,
        prompt: 'Identify the exact program execution point where a dynamically allocated array loses its reachable pointer.',
      },
      demoLearnerState: {
        status: 'learning',
        statusLabel: 'Learning',
        lastPracticed: '2 days ago',
        retentionEstimatePercent: 64,
        demographicCohortAveragePercent: 58,
        isDemoData: true,
      },
    },

    {
      id: 'linked-lists',
      title: 'Linked Lists (Singly, Doubly, Circular)',
      cSyntaxSignature: 'struct Node {\n  int data;\n  struct Node *next;\n};\nstruct Node* head = malloc(sizeof(struct Node));\nhead->data = 1;\nhead->next = NULL;',
      category: 'Dynamic Heap & Structures',
      tier: 2,
      summary:
        'Non-contiguous node chains linked by heap pointers. Head/tail maintenance, pointer rewiring invariants, and traversal.',
      detailedDescription:
        'Linked lists store elements in independently allocated heap nodes, each containing payload data and one or more pointers to neighbors. Unlike arrays, linked lists allow $O(1)$ insertions and deletions at known positions without shifting memory, but sacrifice $O(1)$ random indexing.',
      prerequisites: ['structures', 'dynamic-memory'],
      dependents: ['stacks', 'queues', 'trees'],
      misconceptions: [
        {
          id: 'misc-ll-1',
          title: 'Head Pointer Loss During Traversal',
          explanation:
            'Advancing `head = head->next` in a display loop permanently destroys your access to the front of the list. Traversal requires an auxiliary pointer `curr = head`.',
        },
        {
          id: 'misc-ll-2',
          title: 'Premature Link Overwrite (Orphan Trap)',
          explanation:
            'In head insertion, executing `head = newNode;` before `newNode->next = head;` severs the link to all downstream nodes.',
        },
      ],
      nextActivity: {
        id: 'act-ll-workbench',
        title: 'Interactive Memory Workbench: Head Insertion',
        type: 'memory_workbench',
        estimatedMinutes: 12,
        prompt: 'Step through heap node allocations and prevent node orphaning during pointer rewiring.',
      },
      demoLearnerState: {
        status: 'learning',
        statusLabel: 'Learning',
        lastPracticed: 'Yesterday',
        retentionEstimatePercent: 71,
        demographicCohortAveragePercent: 62,
        isDemoData: true,
      },
    },

    {
      id: 'stacks',
      title: 'Stacks (LIFO Abstract Data Type)',
      cSyntaxSignature: 'typedef struct {\n  int items[MAX];\n  int top;\n} Stack;\nvoid push(Stack *s, int val) { s->items[++(s->top)] = val; }\nint pop(Stack *s) { return s->items[(s->top)--]; }',
      category: 'Linear Abstract Data Types',
      tier: 3,
      summary:
        'Last-In, First-Out (LIFO) discipline. Array-based and pointer-linked stack implementations, push, pop, peek, and overflow/underflow checks.',
      detailedDescription:
        'Stacks enforce restricted access: insertions and removals occur exclusively at the `top` element. Stacks are fundamental for expression evaluation (postfix/infix conversion), syntax bracket matching, depth-first search (DFS), and managing execution call stacks.',
      prerequisites: ['array', 'linked-lists'],
      dependents: ['trees', 'graphs'],
      misconceptions: [
        {
          id: 'misc-stack-1',
          title: 'Popping an Empty Stack (Stack Underflow)',
          explanation:
            'Attempting to pop when `top == -1` accesses out-of-bounds negative indices in array implementations or dereferences NULL in linked stacks.',
        },
        {
          id: 'misc-stack-2',
          title: 'Confusing Pre-Increment vs Post-Increment on Top Index',
          explanation:
            'Writing `arr[top++] = val` when `top` initially starts at -1 writes to index -1 before advancing, triggering immediate stack corruption.',
        },
      ],
      nextActivity: {
        id: 'act-stack-brackets',
        title: 'Parentheses Balance & Invariant Verification',
        type: 'invariant_drill',
        estimatedMinutes: 14,
        prompt: 'Formulate the stack state invariant verifying that opening brackets match corresponding closing brackets.',
      },
      demoLearnerState: {
        status: 'learning',
        statusLabel: 'Learning',
        lastPracticed: '3 days ago',
        retentionEstimatePercent: 68,
        demographicCohortAveragePercent: 66,
        isDemoData: true,
      },
    },

    {
      id: 'queues',
      title: 'Queues (FIFO & Circular Queues)',
      cSyntaxSignature: 'typedef struct {\n  int items[CAPACITY];\n  int front, rear, count;\n} CircularQueue;\nvoid enqueue(CircularQueue *q, int val) {\n  q->rear = (q->rear + 1) % CAPACITY;\n  q->items[q->rear] = val;\n}',
      category: 'Linear Abstract Data Types',
      tier: 3,
      summary:
        'First-In, First-Out (FIFO) discipline. Linear queues, circular buffer modulo wrapping, double-ended queues (deque), and priority queues.',
      detailedDescription:
        'Queues preserve arrival order: insertions occur at the `rear` and removals occur at the `front`. In fixed-size arrays, standard queues suffer from false-overflow (empty slots left behind front). Circular queues solve this with modular arithmetic: `(rear + 1) % size`.',
      prerequisites: ['array', 'linked-lists'],
      dependents: ['graphs'],
      misconceptions: [
        {
          id: 'misc-q-1',
          title: 'False Overflow in Linear Array Queue',
          explanation:
            'When `rear == CAPACITY - 1`, a linear queue reports full even if several items have been dequeued from `front`. Requires circular modulo wrapping.',
        },
        {
          id: 'misc-q-2',
          title: 'Circular Queue Full vs Empty Ambiguity',
          explanation:
            'In a circular queue with only `front` and `rear` pointers, `front == rear` can mean either completely empty or completely full unless tracked via `count` or a sacrificial empty slot.',
        },
      ],
      nextActivity: {
        id: 'act-q-circular',
        title: 'Circular Modulo Boundary Invariant Drill',
        type: 'code_audit',
        estimatedMinutes: 15,
        prompt: 'Audit a circular queue implementation for capacity overflow conditions under alternating enqueue/dequeue sequences.',
      },
      demoLearnerState: {
        status: 'needs-revision',
        statusLabel: 'Needs Revision',
        lastPracticed: '6 days ago',
        retentionEstimatePercent: 49,
        demographicCohortAveragePercent: 54,
        isDemoData: true,
      },
    },

    {
      id: 'trees',
      title: 'Trees & Binary Search Trees (BST)',
      cSyntaxSignature: 'struct TreeNode {\n  int key;\n  struct TreeNode *left;\n  struct TreeNode *right;\n};\n// BST Invariant: left->key < root->key < right->key',
      category: 'Non-Linear Hierarchies',
      tier: 4,
      summary:
        'Hierarchical non-linear nodes with left and right branching pointers. Pre/in/post-order traversals, BST search property, and recursive invariants.',
      detailedDescription:
        'Trees represent hierarchical relationships with a root node branching to disjoint subtrees. A Binary Search Tree (BST) maintains the recursive invariant that all keys in the left subtree are smaller than the node key, and all keys in the right subtree are larger, enabling average $O(\\log N)$ search and insertion.',
      prerequisites: ['linked-lists', 'pointers', 'stacks'],
      dependents: ['graphs', 'searching-sorting'],
      misconceptions: [
        {
          id: 'misc-tree-1',
          title: 'Local BST Check Trap (Failing Global Invariant)',
          explanation:
            'Checking only `node->left->val < node->val < node->right->val` is insufficient. Every node in the left subtree must be smaller than all its ancestor nodes.',
        },
        {
          id: 'misc-tree-2',
          title: 'Unbalanced BST Degradation to O(N) Linked List',
          explanation:
            'Inserting strictly ascending or descending keys into an unbalance-protected BST turns the tree into a linear linked chain with $O(N)$ lookup.',
        },
      ],
      nextActivity: {
        id: 'act-tree-traversal',
        title: 'BST In-Order Monotonicity Proof',
        type: 'trace_reasoning',
        estimatedMinutes: 18,
        prompt: 'Prove why an in-order traversal (left, root, right) of a valid BST always produces a strictly sorted sequence.',
      },
      demoLearnerState: {
        status: 'needs-revision',
        statusLabel: 'Needs Revision',
        lastPracticed: '8 days ago',
        retentionEstimatePercent: 44,
        demographicCohortAveragePercent: 48,
        isDemoData: true,
      },
    },

    {
      id: 'graphs',
      title: 'Graphs & Adjacency Structures',
      cSyntaxSignature: 'struct Graph {\n  int V; // Number of vertices\n  struct AdjListNode* adjList[MAX_V]; // Array of linked lists\n};\nvoid addEdge(struct Graph *g, int src, int dest);',
      category: 'Non-Linear Hierarchies',
      tier: 4,
      summary:
        'Vertices and connecting edges. Adjacency matrices ($O(V^2)$) vs adjacency lists ($O(V+E)$). Depth-First Search (DFS) and Breadth-First Search (BFS).',
      detailedDescription:
        'Graphs generalize trees by allowing arbitrary connections, including cycles and disconnected components. Traversal algorithms (DFS with recursion/stacks, BFS with queues) require tracking a `visited[]` state array to prevent infinite cycles.',
      prerequisites: ['trees', 'structures', 'queues'],
      dependents: [],
      misconceptions: [
        {
          id: 'misc-graph-1',
          title: 'Omitting Visited Array Causing Infinite Callstack Overflow',
          explanation:
            'Traversing a cyclic graph without marking vertices in `visited[]` causes recursive DFS to oscillate back and forth between adjacent nodes until stack overflow.',
        },
        {
          id: 'misc-graph-2',
          title: 'Using BFS Without Queue (Accidental Recursion)',
          explanation:
            'Breadth-First Search requires FIFO order. Implementing BFS with recursive function calls accidentally mimics DFS instead of layer-by-layer traversal.',
        },
      ],
      nextActivity: {
        id: 'act-graph-cycle',
        title: '3-State Color Cycle Detection in Directed Graph',
        type: 'trace_reasoning',
        estimatedMinutes: 20,
        prompt: 'Formulate the invariant distinguishing between unvisited (WHITE), active callstack (GRAY), and fully explored (BLACK) nodes.',
      },
      demoLearnerState: {
        status: 'not-started',
        statusLabel: 'Not Started',
        lastPracticed: 'Unattempted',
        retentionEstimatePercent: 0,
        demographicCohortAveragePercent: 35,
        isDemoData: true,
      },
    },

    {
      id: 'searching-sorting',
      title: 'Searching & Sorting Algorithms',
      cSyntaxSignature: '// Binary Search:\nint low = 0, high = n - 1;\nwhile (low <= high) {\n  int mid = low + (high - low) / 2;\n  if (arr[mid] == target) return mid;\n  else if (arr[mid] < target) low = mid + 1;\n  else high = mid - 1;\n}',
      category: 'Algorithmic Operations',
      tier: 5,
      summary:
        'Linear search, Binary search ($O(\\log N)$), Bubble, Insertion, Selection, QuickSort ($O(N \\log N)$), MergeSort, and stability properties.',
      detailedDescription:
        'Searching and sorting operations build upon array index manipulation, pointer swapping, and divide-and-conquer partitions. QuickSort leverages pivot partitioning; MergeSort guarantees $O(N \\log N)$ worst-case time by splitting and recursively merging sorted sub-arrays.',
      prerequisites: ['array', 'trees'],
      dependents: [],
      misconceptions: [
        {
          id: 'misc-sort-1',
          title: 'Integer Overflow in Binary Search Midpoint',
          explanation:
            'Writing `mid = (low + high) / 2` overflows positive signed 32-bit integers when `low + high > 2^31 - 1`. Correct invariant: `mid = low + (high - low) / 2`.',
        },
        {
          id: 'misc-sort-2',
          title: 'Assuming All $O(N \\log N)$ Sorts Require Auxiliary Space',
          explanation:
            'While MergeSort requires $O(N)$ extra buffer memory for merging sub-arrays in C, QuickSort partitions in-place requiring only $O(\\log N)$ recursion stack space.',
        },
      ],
      nextActivity: {
        id: 'act-search-sort',
        title: 'QuickSort Partitioning Invariant Derivation',
        type: 'invariant_drill',
        estimatedMinutes: 16,
        prompt: 'Prove why elements to the left of the pivot index are strictly <= pivot after Lomuto partition termination.',
      },
      demoLearnerState: {
        status: 'not-started',
        statusLabel: 'Not Started',
        lastPracticed: 'Unattempted',
        retentionEstimatePercent: 0,
        demographicCohortAveragePercent: 42,
        isDemoData: true,
      },
    },
  ],

  edges: [
    {
      id: 'e-ptr-to-arr',
      source: 'pointers',
      target: 'array',
      relationshipLabel: 'Pointer arithmetic & contiguous index offsets',
      nature: 'strict_prerequisite',
    },
    {
      id: 'e-ptr-to-struct',
      source: 'pointers',
      target: 'structures',
      relationshipLabel: 'Member addresses & arrow operator (->)',
      nature: 'strict_prerequisite',
    },
    {
      id: 'e-ptr-to-dma',
      source: 'pointers',
      target: 'dynamic-memory',
      relationshipLabel: 'Heap address referencing & deallocation',
      nature: 'strict_prerequisite',
    },
    {
      id: 'e-struct-to-dma',
      source: 'structures',
      target: 'dynamic-memory',
      relationshipLabel: 'Composite byte size allocation (sizeof)',
      nature: 'supporting_invariant',
    },
    {
      id: 'e-dma-to-ll',
      source: 'dynamic-memory',
      target: 'linked-lists',
      relationshipLabel: 'Dynamic node allocation & free() lifecycle',
      nature: 'strict_prerequisite',
    },
    {
      id: 'e-struct-to-ll',
      source: 'structures',
      target: 'linked-lists',
      relationshipLabel: 'Self-referential struct node definition',
      nature: 'strict_prerequisite',
    },
    {
      id: 'e-arr-to-stack',
      source: 'array',
      target: 'stacks',
      relationshipLabel: 'Contiguous buffer array stack backing',
      nature: 'supporting_invariant',
    },
    {
      id: 'e-ll-to-stack',
      source: 'linked-lists',
      target: 'stacks',
      relationshipLabel: 'Dynamic head push/pop linked implementation',
      nature: 'supporting_invariant',
    },
    {
      id: 'e-arr-to-queue',
      source: 'array',
      target: 'queues',
      relationshipLabel: 'Modulo circular buffer arithmetic',
      nature: 'supporting_invariant',
    },
    {
      id: 'e-ll-to-queue',
      source: 'linked-lists',
      target: 'queues',
      relationshipLabel: 'Head dequeue & tail enqueue pointers',
      nature: 'supporting_invariant',
    },
    {
      id: 'e-ll-to-tree',
      source: 'linked-lists',
      target: 'trees',
      relationshipLabel: 'Extension to multi-branching left/right pointers',
      nature: 'strict_prerequisite',
    },
    {
      id: 'e-ptr-to-tree',
      source: 'pointers',
      target: 'trees',
      relationshipLabel: 'Subtree reference passing & double pointer updates',
      nature: 'supporting_invariant',
    },
    {
      id: 'e-stack-to-tree',
      source: 'stacks',
      target: 'trees',
      relationshipLabel: 'Callstack recursion & iterative tree traversal',
      nature: 'supporting_invariant',
    },
    {
      id: 'e-tree-to-graph',
      source: 'trees',
      target: 'graphs',
      relationshipLabel: 'Generalization from acyclic root to cyclic network',
      nature: 'strict_prerequisite',
    },
    {
      id: 'e-queue-to-graph',
      source: 'queues',
      target: 'graphs',
      relationshipLabel: 'FIFO queue state for Breadth-First Search (BFS)',
      nature: 'supporting_invariant',
    },
    {
      id: 'e-arr-to-sort',
      source: 'array',
      target: 'searching-sorting',
      relationshipLabel: 'Contiguous element swapping & range partitions',
      nature: 'strict_prerequisite',
    },
    {
      id: 'e-tree-to-sort',
      source: 'trees',
      target: 'searching-sorting',
      relationshipLabel: 'Binary search tree divide-and-conquer property',
      nature: 'supporting_invariant',
    },
  ],
};

