export type InteractionMode = 'api' | 'web_session' | 'embedded' | 'external' | 'file_exchange';

export type AuthType = 'google_oauth' | 'email_password' | 'api_key' | 'server_environment';

export interface Provider {
  id: string;
  name: string;
  vendor: string;
  description: string;
  supportedModes: InteractionMode[];
  supportedAuth: AuthType[];
  iconKey: 'chatgpt' | 'claude' | 'gemini' | 'grok' | 'google-ai-studio' | 'custom';
  isCustom?: boolean;
}

export type ConnectionStatus =
  | 'CONNECTED'
  | 'NOT_CONNECTED'
  | 'AUTHENTICATION_REQUIRED'
  | 'RATE_LIMITED'
  | 'UNAVAILABLE';

export type WorkerAvailability =
  | 'AVAILABLE'
  | 'WORKING'
  | 'WAITING'
  | 'UNAVAILABLE'
  | 'ERROR';

export interface AIAccount {
  id: string;
  providerId: string;
  canonicalName: string; // e.g. "ChatGPT 1", "Claude 2", "Grok 1"
  identityNumber: number;
  friendlyDescription?: string;
  authType: AuthType;
  connectionStatus: ConnectionStatus;
  capabilities: string[];
  availability: WorkerAvailability;
  currentTaskId?: string;
  currentWorkspaceId?: string;
  totalTasksCompleted: number;
  filesProducedCount: number;
  lastActivityAt: string;
  connectedAt: string;
  notes?: string;
  systemModel?: string;
}

export type TaskStatus =
  | 'QUEUED'
  | 'ASSIGNED'
  | 'WORKING'
  | 'WAITING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface Task {
  id: string; // e.g. "TASK-001"
  workspaceId: string;
  title: string;
  description: string;
  assignedWorkerId: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  resultSummary?: string;
  producedFileIds?: string[];
  blockReason?: string;
}

export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  formattedSize: string;
  url?: string;
  contentPreview?: string; // Text snippet, CSV table, code snippet
  fileType: 'image' | 'video' | 'audio' | 'pdf' | 'document' | 'zip' | 'code' | 'csv' | 'other';
  createdAt: string;
  creatorAccountId?: string;
  creatorName?: string;
  workspaceId?: string;
  taskId?: string;
}

export type MessageType =
  | 'USER_PROMPT'
  | 'MANAGER_PLAN'
  | 'CALLER_DISPATCH'
  | 'WORKER_RESULT'
  | 'FILTER_REPORT'
  | 'MANAGER_DECISION'
  | 'AVAILABILITY_ALERT'
  | 'HANDOFF_EVENT'
  | 'DIRECT_CHAT'
  | 'INITIAL_BRIEFING';

export interface Message {
  id: string;
  workspaceId?: string;
  directChatAccountId?: string;
  senderId: string;
  senderName: string;
  senderType: 'USER' | 'MANAGER' | 'CALLER' | 'WORKER' | 'FILTER' | 'SYSTEM';
  provider?: string;
  accountIdentity?: string; // e.g. "ChatGPT 2"
  recipientId?: string;
  recipientName?: string;
  taskId?: string; // Associated TASK-001
  content: string;
  attachments: Attachment[];
  messageType: MessageType;
  isInternalWorkforce: boolean; // Internal AI-to-AI communication vs User-facing
  timestamp: string;
}

export interface FilterReport {
  id: string;
  workspaceId: string;
  filterAccountId: string;
  filterAccountName: string;
  timestamp: string;
  completedTasks: {
    workerId: string;
    workerName: string;
    taskId: string;
    taskTitle: string;
    details: string;
    files?: string[];
  }[];
  inProgressTasks: {
    workerId: string;
    workerName: string;
    taskId: string;
    taskTitle: string;
    currentProgress: string;
  }[];
  blockedTasks: {
    workerId: string;
    workerName: string;
    taskId: string;
    taskTitle: string;
    reason: string;
  }[];
  newInformation: {
    workerId: string;
    workerName: string;
    finding: string;
  }[];
  conflicts: {
    workerA: string;
    workerB: string;
    description: string;
  }[];
  filesProduced: {
    fileId: string;
    name: string;
    size: string;
    type: string;
  }[];
  requiresManagerDecision: string[];
}

export interface ProjectDecision {
  timestamp: string;
  decision: string;
  deciderId: string;
  deciderName: string;
}

export interface ProjectState {
  workspaceId: string;
  objective: string;
  currentStatus: string;
  completed: string[];
  inProgress: string[];
  blocked: string[];
  openQuestions: string[];
  activeTasks: string[];
  activeWorkers: string[];
  recentDecisions: ProjectDecision[];
  relevantFiles: string[];
  nextDecision: string;
  updatedAt: string;
}

export interface ManagerHandoff {
  id: string;
  workspaceId: string;
  previousManagerId: string;
  previousManagerName: string;
  backupManagerId: string;
  backupManagerName: string;
  timestamp: string;
  reason: string;
  briefing: {
    objective: string;
    projectStateSummary: string;
    completedWork: string[];
    activeWork: string[];
    unfinishedWork: string[];
    blockedWork: string[];
    currentTasks: string[];
    activeWorkers: string[];
    recentDecisions: string[];
    relevantReports: string[];
    relevantFiles: string[];
    importantProjectHistory: string[];
    previousManagerOperatingContext: string;
    previousManagerStyleNote: string;
    nextExpectedDecision: string;
  };
  status: 'PREPARED' | 'ACKNOWLEDGED' | 'COMPLETED';
}

export type StagedCheckStep =
  | 'REQUEST_SENT'
  | 'WAIT'
  | 'CHECK'
  | 'WAIT_LONGER'
  | 'CHECK_AGAIN'
  | 'AVAILABILITY_TEST'
  | 'CONFIRM'
  | 'FINAL_STATUS';

export type AvailabilityStatus =
  | 'RESPONDING'
  | 'WORKING'
  | 'TEMPORARILY_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'AUTHENTICATION_REQUIRED'
  | 'UNRESPONSIVE'
  | 'UNKNOWN';

export interface AvailabilityStageRecord {
  stage: StagedCheckStep;
  label: string;
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED';
  detail: string;
  timestamp?: string;
}

export interface AvailabilityCheck {
  id: string;
  targetAccountId: string;
  targetAccountName: string;
  role: 'MANAGER' | 'WORKER' | 'CALLER' | 'FILTER';
  workspaceId: string;
  stages: AvailabilityStageRecord[];
  currentStageIndex: number;
  finalStatus?: AvailabilityStatus;
  isComplete: boolean;
  handoffTriggered?: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface InitialBriefingContribution {
  accountId: string;
  accountName: string;
  provider: string;
  relevantKnowledge: string;
  capabilities: string[];
  limitations: string[];
  workingStyle: string;
  sourcesAndDates: string;
  readiness: 'READY' | 'STANDBY' | 'SPECIALIZED';
}

export interface InitialBriefing {
  id: string;
  workspaceId: string;
  timestamp: string;
  contributions: InitialBriefingContribution[];
  synthesizedNotes: string;
}

export interface Workspace {
  id: string;
  name: string;
  objective: string;
  createdAt: string;
  updatedAt: string;
  managerAccountId: string;
  backupManagerAccountId: string;
  callerAccountId: string;
  filterAccountId: string;
  workerAccountIds: string[];
  currentStatus: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'WAITING_DECISION' | 'AVAILABILITY_CHECK';
  tags: string[];
}

export type MessagePresentationFormat = 'standard' | 'bracketed' | 'compact' | 'card';

export interface AppSettings {
  messagePresentationFormat: MessagePresentationFormat;
  availabilityCheckDelayMs: number;
  enableRealGeminiCalls: boolean;
  defaultProviderId: string;
  autoDispatchFilter: boolean;
}

export interface ArchiveManifest {
  archiveVersion: string;
  exportedAt: string;
  workspaceId: string;
  workspaceName: string;
  objective: string;
  totalEvents: number;
  totalMessages: number;
  totalTasks: number;
  totalFiles: number;
  participants: {
    id: string;
    name: string;
    role: string;
    provider: string;
  }[];
  fileList: {
    id: string;
    name: string;
    type: string;
    size: string;
  }[];
}
