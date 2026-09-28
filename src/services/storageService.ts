import {
  AIAccount,
  Provider,
  Workspace,
  Task,
  Message,
  Attachment,
  ProjectState,
  FilterReport,
  AppSettings,
  AvailabilityCheck,
  ManagerHandoff,
  InitialBriefing,
} from '../types/index.ts';
import { INITIAL_PROVIDERS } from './providerService.ts';

const STORAGE_KEYS = {
  PROVIDERS: 'aichat_providers_v1',
  ACCOUNTS: 'aichat_accounts_v1',
  WORKSPACES: 'aichat_workspaces_v1',
  TASKS: 'aichat_tasks_v1',
  MESSAGES: 'aichat_messages_v1',
  ATTACHMENTS: 'aichat_attachments_v1',
  PROJECT_STATES: 'aichat_project_states_v1',
  FILTER_REPORTS: 'aichat_filter_reports_v1',
  AVAILABILITY_CHECKS: 'aichat_availability_checks_v1',
  MANAGER_HANDOFFS: 'aichat_manager_handoffs_v1',
  INITIAL_BRIEFINGS: 'aichat_initial_briefings_v1',
  SETTINGS: 'aichat_settings_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  messagePresentationFormat: 'standard',
  availabilityCheckDelayMs: 2500,
  enableRealGeminiCalls: true,
  defaultProviderId: 'google-ai-studio',
  autoDispatchFilter: true,
};

export const INITIAL_ACCOUNTS: AIAccount[] = [
  {
    id: 'acc-grok-1',
    providerId: 'grok',
    canonicalName: 'Grok 1',
    identityNumber: 1,
    friendlyDescription: 'Primary Strategic Manager & Systems Lead',
    authType: 'api_key',
    connectionStatus: 'CONNECTED',
    capabilities: ['Strategic Planning', 'Workforce Orchestration', 'Root Cause Analysis', 'Decision Making'],
    availability: 'AVAILABLE',
    totalTasksCompleted: 42,
    filesProducedCount: 8,
    lastActivityAt: '2026-09-28T07:45:00Z',
    connectedAt: '2026-09-10T00:00:00Z',
    notes: 'Direct decision maker, prefers structured workforce reports over verbose chat.',
  },
  {
    id: 'acc-grok-2',
    providerId: 'grok',
    canonicalName: 'Grok 2',
    identityNumber: 2,
    friendlyDescription: 'Designated High-Availability Backup Manager',
    authType: 'api_key',
    connectionStatus: 'CONNECTED',
    capabilities: ['Failover Management', 'Incident Response', 'Task Re-allocation', 'State Recovery'],
    availability: 'AVAILABLE',
    totalTasksCompleted: 19,
    filesProducedCount: 4,
    lastActivityAt: '2026-09-28T07:15:00Z',
    connectedAt: '2026-09-12T00:00:00Z',
    notes: 'Maintains live project state mirror; ready for immediate handoff if Primary Manager experiences interruption.',
  },
  {
    id: 'acc-claude-1',
    providerId: 'claude',
    canonicalName: 'Claude 1',
    identityNumber: 1,
    friendlyDescription: 'Workforce Dispatcher / Caller & Senior Architect',
    authType: 'api_key',
    connectionStatus: 'CONNECTED',
    capabilities: ['Caller Routing', 'System Architecture', 'Availability Tracking', 'TypeScript / Node'],
    availability: 'AVAILABLE',
    totalTasksCompleted: 58,
    filesProducedCount: 14,
    lastActivityAt: '2026-09-28T08:10:00Z',
    connectedAt: '2026-09-08T00:00:00Z',
    notes: 'Assigned as Caller. Monitors dispatch channels and worker responses.',
  },
  {
    id: 'acc-chatgpt-2',
    providerId: 'chatgpt',
    canonicalName: 'ChatGPT 2',
    identityNumber: 2,
    friendlyDescription: 'Workforce Filter & Information Synthesizer',
    authType: 'api_key',
    connectionStatus: 'CONNECTED',
    capabilities: ['Filter Reports', 'Conflict Detection', 'Structured Synthesis', 'Data Verification'],
    availability: 'AVAILABLE',
    totalTasksCompleted: 35,
    filesProducedCount: 12,
    lastActivityAt: '2026-09-28T08:14:00Z',
    connectedAt: '2026-09-11T00:00:00Z',
    notes: 'Assigned as Filter. Does not summarize; compiles structured workforce reports with full worker attribution.',
  },
  {
    id: 'acc-chatgpt-1',
    providerId: 'chatgpt',
    canonicalName: 'ChatGPT 1',
    identityNumber: 1,
    friendlyDescription: 'Research & Technical Documentation Worker',
    authType: 'google_oauth',
    connectionStatus: 'CONNECTED',
    capabilities: ['Technical Documentation', 'API Contract Audits', 'Compliance'],
    availability: 'AVAILABLE',
    totalTasksCompleted: 27,
    filesProducedCount: 7,
    lastActivityAt: '2026-09-28T07:50:00Z',
    connectedAt: '2026-09-11T00:00:00Z',
  },
  {
    id: 'acc-gemini-1',
    providerId: 'gemini',
    canonicalName: 'Gemini 1',
    identityNumber: 1,
    friendlyDescription: 'High-Throughput Analytics & Benchmark Worker',
    authType: 'google_oauth',
    connectionStatus: 'CONNECTED',
    capabilities: ['Benchmarking', 'Data Analysis', 'Schema Migration', 'CSV/SQL Generation'],
    availability: 'WORKING',
    currentTaskId: 'TASK-003',
    totalTasksCompleted: 31,
    filesProducedCount: 11,
    lastActivityAt: '2026-09-28T08:18:00Z',
    connectedAt: '2026-09-09T00:00:00Z',
  },
  {
    id: 'acc-aistudio-1',
    providerId: 'google-ai-studio',
    canonicalName: 'Google AI Studio 1',
    identityNumber: 1,
    friendlyDescription: 'Real Server-Side AI Studio Worker',
    authType: 'server_environment',
    connectionStatus: 'CONNECTED',
    capabilities: ['Live Gemini Execution', 'Direct Code Generation', 'Artifact Compilation', 'Server Tools'],
    availability: 'AVAILABLE',
    totalTasksCompleted: 44,
    filesProducedCount: 19,
    lastActivityAt: '2026-09-28T08:20:00Z',
    connectedAt: '2026-09-07T00:00:00Z',
  },
  {
    id: 'acc-claude-2',
    providerId: 'claude',
    canonicalName: 'Claude 2',
    identityNumber: 2,
    friendlyDescription: 'Testing, Quality Assurance & Security Worker',
    authType: 'email_password',
    connectionStatus: 'CONNECTED',
    capabilities: ['Automated Tests', 'Security Audits', 'Boundary Case Verification'],
    availability: 'AVAILABLE',
    totalTasksCompleted: 22,
    filesProducedCount: 5,
    lastActivityAt: '2026-09-28T06:30:00Z',
    connectedAt: '2026-09-15T00:00:00Z',
  },
];

export const INITIAL_ATTACHMENTS: Attachment[] = [
  {
    id: 'att-001',
    name: 'database-replication-benchmark.csv',
    mimeType: 'text/csv',
    sizeBytes: 4210,
    formattedSize: '4.1 KB',
    fileType: 'csv',
    createdAt: '2026-09-28T07:55:00Z',
    creatorAccountId: 'acc-chatgpt-1',
    creatorName: 'ChatGPT 1',
    workspaceId: 'ws-cloud-migration',
    taskId: 'TASK-001',
    contentPreview: `Node,Region,WriteLatency_ms,ReadLatency_ms,ReplicationLag_sec,Status
pg-primary-01,us-central1,2.4,0.8,0.00,HEALTHY
pg-replica-02,us-east4,14.2,1.1,0.08,HEALTHY
pg-replica-03,europe-west1,98.6,1.4,0.42,HEALTHY
pg-replica-04,asia-northeast1,142.1,2.0,0.89,WARN_LAG
pg-replica-05,australia-southeast1,194.5,2.6,1.25,WARN_LAG`,
  },
  {
    id: 'att-002',
    name: 'circuit-breaker-policy.ts',
    mimeType: 'text/typescript',
    sizeBytes: 2850,
    formattedSize: '2.8 KB',
    fileType: 'code',
    createdAt: '2026-09-28T08:05:00Z',
    creatorAccountId: 'acc-claude-1',
    creatorName: 'Claude 1',
    workspaceId: 'ws-cloud-migration',
    taskId: 'TASK-002',
    contentPreview: `export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeoutMs: number;
  halfOpenMaxTrials: number;
}

export class DistributedCircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private nextAttemptTimestamp = 0;

  constructor(private readonly config: CircuitBreakerConfig) {}

  public async execute<T>(action: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    const now = Date.now();
    if (this.state === 'OPEN') {
      if (now < this.nextAttemptTimestamp) {
        return fallback();
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      return fallback();
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttemptTimestamp = Date.now() + this.config.resetTimeoutMs;
    }
  }
}`,
  },
  {
    id: 'att-003',
    name: 'quantum-migration-manifest.json',
    mimeType: 'application/json',
    sizeBytes: 1540,
    formattedSize: '1.5 KB',
    fileType: 'document',
    createdAt: '2026-09-28T08:14:00Z',
    creatorAccountId: 'acc-chatgpt-2',
    creatorName: 'ChatGPT 2',
    workspaceId: 'ws-cloud-migration',
    contentPreview: `{
  "migrationPhase": "PHASE_2_REPLICATION",
  "approvedByManager": "Grok 1",
  "caller": "Claude 1",
  "filter": "ChatGPT 2",
  "backupManager": "Grok 2",
  "targetCutover": "2026-10-15T04:00:00Z",
  "zeroDowntimeGuaranteed": true,
  "telemetryRollup": "active"
}`,
  },
];

export const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'ws-cloud-migration',
    name: 'Quantum Cloud Migration',
    objective:
      'Design, benchmark, and deploy zero-downtime microservices architecture with distributed circuit breaking and live multi-region replication.',
    createdAt: '2026-09-28T06:00:00Z',
    updatedAt: '2026-09-28T08:20:00Z',
    managerAccountId: 'acc-grok-1',
    backupManagerAccountId: 'acc-grok-2',
    callerAccountId: 'acc-claude-1',
    filterAccountId: 'acc-chatgpt-2',
    workerAccountIds: [
      'acc-chatgpt-1',
      'acc-claude-1',
      'acc-gemini-1',
      'acc-aistudio-1',
      'acc-claude-2',
    ],
    currentStatus: 'ACTIVE',
    tags: ['Architecture', 'High-Availability', 'Microservices'],
  },
  {
    id: 'ws-security-audit',
    name: 'Autonomous Security Pentest & Remediation',
    objective:
      'Audit API endpoints for authorization vulnerabilities, synthesize automated security regression suites, and draft remediation pull requests.',
    createdAt: '2026-09-27T14:00:00Z',
    updatedAt: '2026-09-28T05:30:00Z',
    managerAccountId: 'acc-claude-1',
    backupManagerAccountId: 'acc-grok-1',
    callerAccountId: 'acc-claude-1',
    filterAccountId: 'acc-chatgpt-2',
    workerAccountIds: ['acc-chatgpt-1', 'acc-claude-2', 'acc-aistudio-1'],
    currentStatus: 'ACTIVE',
    tags: ['Security', 'Audit', 'Automated QA'],
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'TASK-001',
    workspaceId: 'ws-cloud-migration',
    title: 'Audit Multi-Region Database Replication Lag',
    description: 'Measure read/write latencies across all 5 global replicas and identify threshold boundaries.',
    assignedWorkerId: 'acc-chatgpt-1',
    status: 'COMPLETED',
    priority: 'high',
    createdAt: '2026-09-28T07:30:00Z',
    startedAt: '2026-09-28T07:32:00Z',
    completedAt: '2026-09-28T07:55:00Z',
    resultSummary: 'Identified replication lag spike in Asia-Northeast and Australia regions exceeding 800ms. Recommends local read-cache nodes.',
    producedFileIds: ['att-001'],
  },
  {
    id: 'TASK-002',
    workspaceId: 'ws-cloud-migration',
    title: 'Implement Distributed Circuit Breaker Pattern',
    description: 'Write TypeScript implementation supporting OPEN, HALF-OPEN, and CLOSED transitions with configurable backoff.',
    assignedWorkerId: 'acc-claude-1',
    status: 'COMPLETED',
    priority: 'high',
    createdAt: '2026-09-28T07:35:00Z',
    startedAt: '2026-09-28T07:36:00Z',
    completedAt: '2026-09-28T08:05:00Z',
    resultSummary: 'Implemented DistributedCircuitBreaker with zero-allocation fallback and automatic window recovery.',
    producedFileIds: ['att-002'],
  },
  {
    id: 'TASK-003',
    workspaceId: 'ws-cloud-migration',
    title: 'Benchmark Redis Cluster vs Dragonfly Latencies',
    description: 'Simulate 50,000 req/sec cache hits during simulated failover scenarios.',
    assignedWorkerId: 'acc-gemini-1',
    status: 'WORKING',
    priority: 'medium',
    createdAt: '2026-09-28T08:00:00Z',
    startedAt: '2026-09-28T08:05:00Z',
  },
  {
    id: 'TASK-004',
    workspaceId: 'ws-cloud-migration',
    title: 'Compile Terraform Infrastructure Spec',
    description: 'Prepare automated infrastructure provisioning modules for staging rollout.',
    assignedWorkerId: 'acc-aistudio-1',
    status: 'QUEUED',
    priority: 'medium',
    createdAt: '2026-09-28T08:15:00Z',
  },
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-001',
    workspaceId: 'ws-cloud-migration',
    senderId: 'USER',
    senderName: 'User',
    senderType: 'USER',
    content:
      'We need to guarantee zero downtime during the database and microservices migration. Please assemble the team, audit the replication lag, and set up fallback circuit breakers.',
    attachments: [],
    messageType: 'USER_PROMPT',
    isInternalWorkforce: false,
    timestamp: '2026-09-28T07:25:00Z',
  },
  {
    id: 'msg-002',
    workspaceId: 'ws-cloud-migration',
    senderId: 'acc-grok-1',
    senderName: 'Grok 1',
    senderType: 'MANAGER',
    provider: 'Grok',
    accountIdentity: 'Grok 1',
    content:
      'Objective received. As Manager, I have evaluated our architectural requirements. I have broken this migration into 4 discrete tasks: TASK-001 (Audit Replication), TASK-002 (Circuit Breaker), TASK-003 (Cache Benchmark), and TASK-004 (Terraform Modules). Claude 1 will act as Caller to dispatch these immediately to specialized workers.',
    attachments: [],
    messageType: 'MANAGER_PLAN',
    isInternalWorkforce: false,
    timestamp: '2026-09-28T07:28:00Z',
  },
  {
    id: 'msg-003',
    workspaceId: 'ws-cloud-migration',
    senderId: 'acc-claude-1',
    senderName: 'Claude 1',
    senderType: 'CALLER',
    provider: 'Claude',
    accountIdentity: 'Claude 1',
    recipientId: 'acc-chatgpt-1',
    recipientName: 'ChatGPT 1',
    taskId: 'TASK-001',
    content:
      'Caller Dispatch: ChatGPT 1, Manager Grok 1 has assigned you TASK-001: Audit Multi-Region Database Replication Lag. Report latency distributions across all primary and secondary clusters.',
    attachments: [],
    messageType: 'CALLER_DISPATCH',
    isInternalWorkforce: true,
    timestamp: '2026-09-28T07:31:00Z',
  },
  {
    id: 'msg-004',
    workspaceId: 'ws-cloud-migration',
    senderId: 'acc-chatgpt-1',
    senderName: 'ChatGPT 1',
    senderType: 'WORKER',
    provider: 'ChatGPT',
    accountIdentity: 'ChatGPT 1',
    recipientId: 'acc-claude-1',
    recipientName: 'Claude 1',
    taskId: 'TASK-001',
    content:
      'I completed the replication audit across 5 global regions. Data indicates sub-15ms replication for US regions, but Australia and Tokyo experience transient lag up to 1.25 seconds under peak write load. Attached full benchmark dataset.',
    attachments: [INITIAL_ATTACHMENTS[0]],
    messageType: 'WORKER_RESULT',
    isInternalWorkforce: true,
    timestamp: '2026-09-28T07:55:00Z',
  },
  {
    id: 'msg-005',
    workspaceId: 'ws-cloud-migration',
    senderId: 'acc-claude-1',
    senderName: 'Claude 1',
    senderType: 'WORKER',
    provider: 'Claude',
    accountIdentity: 'Claude 1',
    recipientId: 'acc-claude-1',
    recipientName: 'Caller',
    taskId: 'TASK-002',
    content:
      'I completed TASK-002. Engineered TypeScript distributed circuit breaker with automatic state transitioning and resilient fallback handlers. Attached source code.',
    attachments: [INITIAL_ATTACHMENTS[1]],
    messageType: 'WORKER_RESULT',
    isInternalWorkforce: true,
    timestamp: '2026-09-28T08:05:00Z',
  },
  {
    id: 'msg-006',
    workspaceId: 'ws-cloud-migration',
    senderId: 'acc-chatgpt-2',
    senderName: 'ChatGPT 2',
    senderType: 'FILTER',
    provider: 'ChatGPT',
    accountIdentity: 'ChatGPT 2',
    recipientId: 'acc-grok-1',
    recipientName: 'Grok 1',
    content:
      'WORKFORCE REPORT (Generated by Filter ChatGPT 2):\n\n' +
      'COMPLETED:\n' +
      '· Worker: ChatGPT 1 | Task: TASK-001 | Replication audit complete with benchmark CSV. Identified APAC replication lag.\n' +
      '· Worker: Claude 1 | Task: TASK-002 | Circuit breaker code compiled and verified with zero-allocation fallback.\n\n' +
      'IN PROGRESS:\n' +
      '· Worker: Gemini 1 | Task: TASK-003 | Cache benchmarks executing (currently at 38,000 req/sec).\n\n' +
      'BLOCKED:\n' +
      '· None currently.\n\n' +
      'NEW INFORMATION:\n' +
      '· APAC replica lag demands local read cache before cutover can proceed safely.\n\n' +
      'CONFLICTS:\n' +
      '· No worker contradictions detected.\n\n' +
      'FILES PRODUCED:\n' +
      '· database-replication-benchmark.csv\n' +
      '· circuit-breaker-policy.ts\n\n' +
      'REQUIRES MANAGER DECISION:\n' +
      '· Approve provisioning local caching tier in APAC cluster.',
    attachments: [INITIAL_ATTACHMENTS[2]],
    messageType: 'FILTER_REPORT',
    isInternalWorkforce: true,
    timestamp: '2026-09-28T08:14:00Z',
  },
  {
    id: 'msg-007',
    workspaceId: 'ws-cloud-migration',
    senderId: 'acc-grok-1',
    senderName: 'Grok 1',
    senderType: 'MANAGER',
    provider: 'Grok',
    accountIdentity: 'Grok 1',
    content:
      'Reviewed workforce report from Filter ChatGPT 2. I have approved provisioning the APAC edge caching nodes to eliminate replication latency risks. Circuit breaker implementation from Claude 1 is validated. We are on schedule with zero expected downtime.',
    attachments: [],
    messageType: 'MANAGER_DECISION',
    isInternalWorkforce: false,
    timestamp: '2026-09-28T08:16:00Z',
  },
];

export const INITIAL_FILTER_REPORT: FilterReport = {
  id: 'fr-001',
  workspaceId: 'ws-cloud-migration',
  filterAccountId: 'acc-chatgpt-2',
  filterAccountName: 'ChatGPT 2',
  timestamp: '2026-09-28T08:14:00Z',
  completedTasks: [
    {
      workerId: 'acc-chatgpt-1',
      workerName: 'ChatGPT 1',
      taskId: 'TASK-001',
      taskTitle: 'Audit Multi-Region Database Replication Lag',
      details: 'Audit revealed latency spike in APAC replicas (>800ms) under heavy write operations.',
      files: ['database-replication-benchmark.csv'],
    },
    {
      workerId: 'acc-claude-1',
      workerName: 'Claude 1',
      taskId: 'TASK-002',
      taskTitle: 'Implement Distributed Circuit Breaker Pattern',
      details: 'Engineered TypeScript circuit breaker with automatic state recovery and zero-allocation fallback.',
      files: ['circuit-breaker-policy.ts'],
    },
  ],
  inProgressTasks: [
    {
      workerId: 'acc-gemini-1',
      workerName: 'Gemini 1',
      taskId: 'TASK-003',
      taskTitle: 'Benchmark Redis Cluster vs Dragonfly Latencies',
      currentProgress: 'Simulating high-throughput cache spikes up to 50k req/sec.',
    },
  ],
  blockedTasks: [],
  newInformation: [
    {
      workerId: 'acc-chatgpt-1',
      workerName: 'ChatGPT 1',
      finding: 'Asia-Northeast1 and Australia-Southeast1 lag warrants edge read caches before database cutover.',
    },
  ],
  conflicts: [],
  filesProduced: [
    { fileId: 'att-001', name: 'database-replication-benchmark.csv', size: '4.1 KB', type: 'csv' },
    { fileId: 'att-002', name: 'circuit-breaker-policy.ts', size: '2.8 KB', type: 'code' },
    { fileId: 'att-003', name: 'quantum-migration-manifest.json', size: '1.5 KB', type: 'document' },
  ],
  requiresManagerDecision: [
    'Approve local caching layer deployment for APAC replicas to prevent replica lag cutover failures.',
  ],
};

export const INITIAL_PROJECT_STATE: ProjectState = {
  workspaceId: 'ws-cloud-migration',
  objective:
    'Design, benchmark, and deploy zero-downtime microservices architecture with distributed circuit breaking and live multi-region replication.',
  currentStatus: 'Phase 2 in progress: Benchmarks executing; circuit breaker complete; replication verified.',
  completed: [
    'Audit multi-region database replication latency across 5 global clusters (TASK-001)',
    'Implement distributed circuit breaker with automatic failover recovery (TASK-002)',
    'Synthesize initial quantum migration manifest',
  ],
  inProgress: [
    'Benchmark Redis Cluster vs Dragonfly cache latencies under 50k req/sec (TASK-003)',
  ],
  blocked: [],
  openQuestions: [
    'Should APAC edge read cache use Redis Sentinel or Dragonfly standalone with read-replicas?',
  ],
  activeTasks: ['TASK-003', 'TASK-004'],
  activeWorkers: ['Gemini 1', 'Google AI Studio 1'],
  recentDecisions: [
    {
      timestamp: '2026-09-28T08:16:00Z',
      decision: 'Approved local edge caching node deployment for APAC replicas.',
      deciderId: 'acc-grok-1',
      deciderName: 'Grok 1',
    },
    {
      timestamp: '2026-09-28T07:28:00Z',
      decision: 'Split architectural migration into 4 discrete tasks with Claude 1 as Caller.',
      deciderId: 'acc-grok-1',
      deciderName: 'Grok 1',
    },
  ],
  relevantFiles: [
    'database-replication-benchmark.csv',
    'circuit-breaker-policy.ts',
    'quantum-migration-manifest.json',
  ],
  nextDecision: 'Confirm target cutover maintenance window after cache benchmark completion.',
  updatedAt: '2026-09-28T08:16:00Z',
};

// Storage helper functions
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to load ${key} from localStorage:`, err);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save ${key} to localStorage:`, err);
  }
}

export const StorageService = {
  getProviders(): Provider[] {
    return loadFromStorage<Provider[]>(STORAGE_KEYS.PROVIDERS, INITIAL_PROVIDERS);
  },
  saveProviders(providers: Provider[]): void {
    saveToStorage(STORAGE_KEYS.PROVIDERS, providers);
  },

  getAccounts(): AIAccount[] {
    return loadFromStorage<AIAccount[]>(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);
  },
  saveAccounts(accounts: AIAccount[]): void {
    saveToStorage(STORAGE_KEYS.ACCOUNTS, accounts);
  },

  getWorkspaces(): Workspace[] {
    return loadFromStorage<Workspace[]>(STORAGE_KEYS.WORKSPACES, INITIAL_WORKSPACES);
  },
  saveWorkspaces(workspaces: Workspace[]): void {
    saveToStorage(STORAGE_KEYS.WORKSPACES, workspaces);
  },

  getTasks(): Task[] {
    return loadFromStorage<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  },
  saveTasks(tasks: Task[]): void {
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  },

  getMessages(): Message[] {
    return loadFromStorage<Message[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
  },
  saveMessages(messages: Message[]): void {
    saveToStorage(STORAGE_KEYS.MESSAGES, messages);
  },

  getAttachments(): Attachment[] {
    return loadFromStorage<Attachment[]>(STORAGE_KEYS.ATTACHMENTS, INITIAL_ATTACHMENTS);
  },
  saveAttachments(attachments: Attachment[]): void {
    saveToStorage(STORAGE_KEYS.ATTACHMENTS, attachments);
  },

  getProjectStates(): Record<string, ProjectState> {
    return loadFromStorage<Record<string, ProjectState>>(STORAGE_KEYS.PROJECT_STATES, {
      'ws-cloud-migration': INITIAL_PROJECT_STATE,
    });
  },
  saveProjectStates(states: Record<string, ProjectState>): void {
    saveToStorage(STORAGE_KEYS.PROJECT_STATES, states);
  },

  getFilterReports(): FilterReport[] {
    return loadFromStorage<FilterReport[]>(STORAGE_KEYS.FILTER_REPORTS, [INITIAL_FILTER_REPORT]);
  },
  saveFilterReports(reports: FilterReport[]): void {
    saveToStorage(STORAGE_KEYS.FILTER_REPORTS, reports);
  },

  getAvailabilityChecks(): AvailabilityCheck[] {
    return loadFromStorage<AvailabilityCheck[]>(STORAGE_KEYS.AVAILABILITY_CHECKS, []);
  },
  saveAvailabilityChecks(checks: AvailabilityCheck[]): void {
    saveToStorage(STORAGE_KEYS.AVAILABILITY_CHECKS, checks);
  },

  getManagerHandoffs(): ManagerHandoff[] {
    return loadFromStorage<ManagerHandoff[]>(STORAGE_KEYS.MANAGER_HANDOFFS, []);
  },
  saveManagerHandoffs(handoffs: ManagerHandoff[]): void {
    saveToStorage(STORAGE_KEYS.MANAGER_HANDOFFS, handoffs);
  },

  getInitialBriefings(): InitialBriefing[] {
    return loadFromStorage<InitialBriefing[]>(STORAGE_KEYS.INITIAL_BRIEFINGS, []);
  },
  saveInitialBriefings(briefings: InitialBriefing[]): void {
    saveToStorage(STORAGE_KEYS.INITIAL_BRIEFINGS, briefings);
  },

  getSettings(): AppSettings {
    return loadFromStorage<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },
  saveSettings(settings: AppSettings): void {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  },

  resetAll(): void {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
