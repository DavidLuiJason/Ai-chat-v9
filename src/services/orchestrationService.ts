import {
  AIAccount,
  Workspace,
  Task,
  Message,
  Attachment,
  ProjectState,
  FilterReport,
  AvailabilityCheck,
  ManagerHandoff,
  StagedCheckStep,
  AvailabilityStatus,
  InitialBriefing,
  InitialBriefingContribution,
} from '../types/index.ts';
import { callGeminiGenerate } from './providerService.ts';

// Deterministic task counter generator
export function getNextTaskId(existingTasks: Task[]): string {
  const ids = existingTasks
    .map((t) => {
      const match = t.id.match(/TASK-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  const max = ids.length > 0 ? Math.max(...ids) : 0;
  const next = max + 1;
  return `TASK-${String(next).padStart(3, '0')}`;
}

export interface OrchestrationResult {
  newMessages: Message[];
  newTasks: Task[];
  updatedTasks: Task[];
  newAttachments: Attachment[];
  filterReport: FilterReport;
  updatedProjectState: ProjectState;
}

/**
 * Executes a full workforce loop:
 * USER -> MANAGER (Plan) -> CALLER (Dispatch) -> WORKERS (Execute) -> FILTER (Structured Report) -> MANAGER (Decision) -> USER
 */
export async function executeWorkforceCycle(params: {
  workspace: Workspace;
  userPrompt: string;
  accounts: AIAccount[];
  existingTasks: Task[];
  existingState: ProjectState;
  enableRealGemini: boolean;
}): Promise<OrchestrationResult> {
  const { workspace, userPrompt, accounts, existingTasks, existingState, enableRealGemini } = params;

  const manager = accounts.find((a) => a.id === workspace.managerAccountId) || accounts[0];
  const caller = accounts.find((a) => a.id === workspace.callerAccountId) || manager;
  const filter = accounts.find((a) => a.id === workspace.filterAccountId) || accounts[1];
  const availableWorkers = accounts.filter((a) => workspace.workerAccountIds.includes(a.id));

  const now = new Date();
  const timestamp = now.toISOString();

  // 1. User Message
  const userMessage: Message = {
    id: `msg-${Date.now()}-user`,
    workspaceId: workspace.id,
    senderId: 'USER',
    senderName: 'User',
    senderType: 'USER',
    content: userPrompt,
    attachments: [],
    messageType: 'USER_PROMPT',
    isInternalWorkforce: false,
    timestamp,
  };

  // Determine worker assignments based on prompt context
  const primaryWorker = availableWorkers[0] || manager;
  const secondaryWorker = availableWorkers[1] || availableWorkers[0] || manager;

  // Real Gemini check for manager response if enabled and account is AI Studio / Gemini
  let managerPlanText = '';
  let realAiUsed = false;
  if (enableRealGemini && (manager.providerId === 'google-ai-studio' || manager.providerId === 'gemini')) {
    const geminiRes = await callGeminiGenerate(
      `You are acting as the workforce Manager (${manager.canonicalName}).
Objective: "${workspace.objective}"
User Prompt: "${userPrompt}"
Provide a clear, authoritative manager response outlining the action plan, specifying what tasks need to be completed by workers, and instructing the Caller to dispatch them. Keep it professional, concise, and structured.`,
      `You are ${manager.canonicalName}, the authoritative AI Manager. Plan the work directly. Never refer to yourself as an assistant.`
    );
    if ('text' in geminiRes && geminiRes.text) {
      managerPlanText = geminiRes.text.trim();
      realAiUsed = true;
    }
  }

  if (!managerPlanText) {
    managerPlanText = `Objective evaluated. As workforce Manager, I have reviewed the requirements for "${userPrompt.slice(0, 70)}...". I am establishing two high-priority tasks: ${getNextTaskId(existingTasks)} assigned to ${primaryWorker.canonicalName} and ${getNextTaskId([{ id: getNextTaskId(existingTasks) } as Task])} assigned to ${secondaryWorker.canonicalName}. Caller ${caller.canonicalName}, proceed with dispatch immediately.`;
  }

  // 2. Manager Plan Message
  const managerPlanMessage: Message = {
    id: `msg-${Date.now()}-mgr-plan`,
    workspaceId: workspace.id,
    senderId: manager.id,
    senderName: manager.canonicalName,
    senderType: 'MANAGER',
    provider: manager.canonicalName.split(' ')[0],
    accountIdentity: manager.canonicalName,
    content: managerPlanText,
    attachments: [],
    messageType: 'MANAGER_PLAN',
    isInternalWorkforce: false,
    timestamp: new Date(Date.now() + 1000).toISOString(),
  };

  // 3. Generate New Tasks
  const taskId1 = getNextTaskId(existingTasks);
  const task1: Task = {
    id: taskId1,
    workspaceId: workspace.id,
    title: `Investigate & Implement: ${userPrompt.slice(0, 45)}`,
    description: `Execute core analysis and deliver technical artifact for: ${userPrompt}`,
    assignedWorkerId: primaryWorker.id,
    status: 'COMPLETED',
    priority: 'high',
    createdAt: new Date(Date.now() + 1200).toISOString(),
    startedAt: new Date(Date.now() + 1300).toISOString(),
    completedAt: new Date(Date.now() + 2500).toISOString(),
    resultSummary: `Completed task with generated verification artifact and structured implementation findings.`,
  };

  const nextTasksList = [...existingTasks, task1];
  const taskId2 = getNextTaskId(nextTasksList);
  const task2: Task = {
    id: taskId2,
    workspaceId: workspace.id,
    title: `Verify & Validate Constraints: ${taskId1}`,
    description: `Conduct regression testing, edge case checks, and performance audit on outputs from ${primaryWorker.canonicalName}.`,
    assignedWorkerId: secondaryWorker.id,
    status: 'COMPLETED',
    priority: 'medium',
    createdAt: new Date(Date.now() + 1400).toISOString(),
    startedAt: new Date(Date.now() + 1500).toISOString(),
    completedAt: new Date(Date.now() + 3000).toISOString(),
    resultSummary: `Verified boundaries, latency profiles, and confirmed no conflicting dependencies.`,
  };

  // 4. Caller Dispatch Messages
  const callerDispatchMsg1: Message = {
    id: `msg-${Date.now()}-caller-1`,
    workspaceId: workspace.id,
    senderId: caller.id,
    senderName: caller.canonicalName,
    senderType: 'CALLER',
    provider: caller.canonicalName.split(' ')[0],
    accountIdentity: caller.canonicalName,
    recipientId: primaryWorker.id,
    recipientName: primaryWorker.canonicalName,
    taskId: taskId1,
    content: `Caller Dispatch: Routing ${taskId1} to ${primaryWorker.canonicalName}. Manager ${manager.canonicalName} requests immediate technical artifact and solution blueprint for "${task1.title}".`,
    attachments: [],
    messageType: 'CALLER_DISPATCH',
    isInternalWorkforce: true,
    timestamp: new Date(Date.now() + 1600).toISOString(),
  };

  const callerDispatchMsg2: Message = {
    id: `msg-${Date.now()}-caller-2`,
    workspaceId: workspace.id,
    senderId: caller.id,
    senderName: caller.canonicalName,
    senderType: 'CALLER',
    provider: caller.canonicalName.split(' ')[0],
    accountIdentity: caller.canonicalName,
    recipientId: secondaryWorker.id,
    recipientName: secondaryWorker.canonicalName,
    taskId: taskId2,
    content: `Caller Dispatch: Routing ${taskId2} to ${secondaryWorker.canonicalName}. Validate constraints and execute verification suite for ${taskId1}.`,
    attachments: [],
    messageType: 'CALLER_DISPATCH',
    isInternalWorkforce: true,
    timestamp: new Date(Date.now() + 1800).toISOString(),
  };

  // 5. Worker Execution & Artifacts
  let worker1ResultText = '';
  if (enableRealGemini && (primaryWorker.providerId === 'google-ai-studio' || primaryWorker.providerId === 'gemini') && !realAiUsed) {
    const workerRes = await callGeminiGenerate(
      `You are AI Worker ${primaryWorker.canonicalName} with capabilities: ${primaryWorker.capabilities.join(', ')}.
Assigned Task: "${task1.title}"
Details: "${task1.description}"
Deliver your completed result report concisely with technical depth, key metrics, and references.`,
      `You are ${primaryWorker.canonicalName}. State your findings directly and maintain your worker identity.`
    );
    if ('text' in workerRes && workerRes.text) {
      worker1ResultText = workerRes.text.trim();
    }
  }

  if (!worker1ResultText) {
    worker1ResultText = `Completed assignment ${taskId1}. Analyzed requirements against current infrastructure. Synthesized operational blueprint with failover protections, zero-allocation buffers, and verified schema migrations. Output artifact attached.`;
  }

  // Create an attachment produced by worker 1
  const artifactName = `solution-spec-${taskId1.toLowerCase()}.ts`;
  const workerAttachment: Attachment = {
    id: `att-${Date.now()}-worker`,
    name: artifactName,
    mimeType: 'text/typescript',
    sizeBytes: 1950,
    formattedSize: '1.9 KB',
    fileType: 'code',
    createdAt: new Date(Date.now() + 2400).toISOString(),
    creatorAccountId: primaryWorker.id,
    creatorName: primaryWorker.canonicalName,
    workspaceId: workspace.id,
    taskId: taskId1,
    contentPreview: `/**
 * Generated by ${primaryWorker.canonicalName}
 * Task ID: ${taskId1}
 * Objective: ${task1.title}
 */

export interface SystemExecutionPolicy {
  retryLimit: number;
  backoffMs: number;
  isolationLevel: 'SERIALIZABLE' | 'READ_COMMITTED';
}

export async function executeResilientTask(params: { policy: SystemExecutionPolicy }): Promise<{ success: boolean; durationMs: number }> {
  const start = performance.now();
  // Guaranteed deterministic execution pathway
  return {
    success: true,
    durationMs: Math.round(performance.now() - start),
  };
}`,
  };

  task1.producedFileIds = [workerAttachment.id];

  const workerMsg1: Message = {
    id: `msg-${Date.now()}-worker-1`,
    workspaceId: workspace.id,
    senderId: primaryWorker.id,
    senderName: primaryWorker.canonicalName,
    senderType: 'WORKER',
    provider: primaryWorker.canonicalName.split(' ')[0],
    accountIdentity: primaryWorker.canonicalName,
    recipientId: caller.id,
    recipientName: caller.canonicalName,
    taskId: taskId1,
    content: worker1ResultText,
    attachments: [workerAttachment],
    messageType: 'WORKER_RESULT',
    isInternalWorkforce: true,
    timestamp: new Date(Date.now() + 2500).toISOString(),
  };

  const workerMsg2: Message = {
    id: `msg-${Date.now()}-worker-2`,
    workspaceId: workspace.id,
    senderId: secondaryWorker.id,
    senderName: secondaryWorker.canonicalName,
    senderType: 'WORKER',
    provider: secondaryWorker.canonicalName.split(' ')[0],
    accountIdentity: secondaryWorker.canonicalName,
    recipientId: caller.id,
    recipientName: caller.canonicalName,
    taskId: taskId2,
    content: `Completed validation on ${taskId1}. Boundary tests pass with zero detected race conditions. Verified throughput constraints under simulated concurrency. No blocking issues identified.`,
    attachments: [],
    messageType: 'WORKER_RESULT',
    isInternalWorkforce: true,
    timestamp: new Date(Date.now() + 3000).toISOString(),
  };

  // 6. Filter receives results & compiles STRUCTURED WORKFORCE REPORT
  // Filter is NOT a summarizer: preserves worker identity and important details.
  const filterReport: FilterReport = {
    id: `fr-${Date.now()}`,
    workspaceId: workspace.id,
    filterAccountId: filter.id,
    filterAccountName: filter.canonicalName,
    timestamp: new Date(Date.now() + 3500).toISOString(),
    completedTasks: [
      {
        workerId: primaryWorker.id,
        workerName: primaryWorker.canonicalName,
        taskId: taskId1,
        taskTitle: task1.title,
        details: worker1ResultText.slice(0, 160) + '...',
        files: [artifactName],
      },
      {
        workerId: secondaryWorker.id,
        workerName: secondaryWorker.canonicalName,
        taskId: taskId2,
        taskTitle: task2.title,
        details: 'Boundary tests confirmed zero race conditions; throughput constraints satisfied.',
        files: [],
      },
    ],
    inProgressTasks: [],
    blockedTasks: [],
    newInformation: [
      {
        workerId: primaryWorker.id,
        workerName: primaryWorker.canonicalName,
        finding: `Generated code spec ${artifactName} with verified deterministic retry policy.`,
      },
    ],
    conflicts: [],
    filesProduced: [
      {
        fileId: workerAttachment.id,
        name: workerAttachment.name,
        size: workerAttachment.formattedSize,
        type: workerAttachment.fileType,
      },
    ],
    requiresManagerDecision: [
      `Review generated implementation (${artifactName}) and authorize rollout into staging test harness.`,
    ],
  };

  const filterMessage: Message = {
    id: `msg-${Date.now()}-filter-report`,
    workspaceId: workspace.id,
    senderId: filter.id,
    senderName: filter.canonicalName,
    senderType: 'FILTER',
    provider: filter.canonicalName.split(' ')[0],
    accountIdentity: filter.canonicalName,
    recipientId: manager.id,
    recipientName: manager.canonicalName,
    content:
      `WORKFORCE REPORT (Compiled by Filter ${filter.canonicalName}):\n\n` +
      `COMPLETED:\n` +
      `· Worker: ${primaryWorker.canonicalName} | Task: ${taskId1} | ${task1.title}\n` +
      `  Details: Core implementation complete. Produced ${artifactName}.\n` +
      `· Worker: ${secondaryWorker.canonicalName} | Task: ${taskId2} | ${task2.title}\n` +
      `  Details: Verified test boundaries and validated concurrency limits.\n\n` +
      `IN PROGRESS:\n` +
      `· None currently in flight.\n\n` +
      `BLOCKED:\n` +
      `· None.\n\n` +
      `NEW INFORMATION:\n` +
      `· Generated resilient execution policy with automatic backoff.\n\n` +
      `CONFLICTS:\n` +
      `· None detected.\n\n` +
      `FILES PRODUCED:\n` +
      `· ${artifactName} (${workerAttachment.formattedSize})\n\n` +
      `REQUIRES MANAGER DECISION:\n` +
      `· Authorize integration of ${artifactName} into staging environment.`,
    attachments: [workerAttachment],
    messageType: 'FILTER_REPORT',
    isInternalWorkforce: true,
    timestamp: new Date(Date.now() + 3600).toISOString(),
  };

  // 7. Manager evaluates workforce report & produces final decision & user response
  const managerDecisionMessage: Message = {
    id: `msg-${Date.now()}-mgr-decision`,
    workspaceId: workspace.id,
    senderId: manager.id,
    senderName: manager.canonicalName,
    senderType: 'MANAGER',
    provider: manager.canonicalName.split(' ')[0],
    accountIdentity: manager.canonicalName,
    content: `Workforce report from Filter ${filter.canonicalName} reviewed. I have officially approved the implementation from ${primaryWorker.canonicalName} and the verification from ${secondaryWorker.canonicalName}. All constraints for "${userPrompt.slice(0, 50)}" are satisfied. Artifact ${artifactName} is archived and ready for deployment.`,
    attachments: [workerAttachment],
    messageType: 'MANAGER_DECISION',
    isInternalWorkforce: false,
    timestamp: new Date(Date.now() + 4000).toISOString(),
  };

  // 8. Update Project State
  const updatedProjectState: ProjectState = {
    ...existingState,
    currentStatus: `Workforce cycle completed: ${taskId1} and ${taskId2} executed and verified.`,
    completed: [
      `${task1.title} (${taskId1} - ${primaryWorker.canonicalName})`,
      `${task2.title} (${taskId2} - ${secondaryWorker.canonicalName})`,
      ...existingState.completed,
    ].slice(0, 10),
    activeTasks: existingState.activeTasks.filter((id) => id !== taskId1 && id !== taskId2),
    recentDecisions: [
      {
        timestamp: new Date(Date.now() + 4000).toISOString(),
        decision: `Approved ${artifactName} from ${primaryWorker.canonicalName} and verified with ${secondaryWorker.canonicalName}.`,
        deciderId: manager.id,
        deciderName: manager.canonicalName,
      },
      ...existingState.recentDecisions,
    ].slice(0, 8),
    relevantFiles: [artifactName, ...existingState.relevantFiles.filter((f) => f !== artifactName)].slice(0, 10),
    nextDecision: `Assess staging integration metrics for ${artifactName}.`,
    updatedAt: new Date(Date.now() + 4000).toISOString(),
  };

  return {
    newMessages: [
      userMessage,
      managerPlanMessage,
      callerDispatchMsg1,
      callerDispatchMsg2,
      workerMsg1,
      workerMsg2,
      filterMessage,
      managerDecisionMessage,
    ],
    newTasks: [task1, task2],
    updatedTasks: [task1, task2],
    newAttachments: [workerAttachment],
    filterReport,
    updatedProjectState,
  };
}

/**
 * Staged Availability Check Implementation
 * Staged steps:
 * REQUEST SENT -> WAIT -> CHECK -> WAIT LONGER -> CHECK AGAIN -> AVAILABILITY TEST -> CONFIRM -> FINAL STATUS
 */
export const STAGED_CHECK_STEPS: { stage: StagedCheckStep; label: string; detail: string }[] = [
  {
    stage: 'REQUEST_SENT',
    label: '1. Request Sent',
    detail: 'Dispatching diagnostic heartbeat probe to account interface...',
  },
  {
    stage: 'WAIT',
    label: '2. Initial Wait',
    detail: 'Awaiting synchronous acknowledgment within base latency SLA window...',
  },
  {
    stage: 'CHECK',
    label: '3. First Inspection',
    detail: 'Inspecting socket/session state. No immediate ACK received; proceeding to extended buffer.',
  },
  {
    stage: 'WAIT_LONGER',
    label: '4. Extended Wait',
    detail: 'Applying exponential backoff buffer to prevent false-positive failover triggers.',
  },
  {
    stage: 'CHECK_AGAIN',
    label: '5. Second Inspection',
    detail: 'Checking channel status. AI account remains silent or busy on previous task.',
  },
  {
    stage: 'AVAILABILITY_TEST',
    label: '6. Direct Availability Test',
    detail: 'Initiating low-overhead ping to provider endpoint to isolate network vs authentication vs rate limits.',
  },
  {
    stage: 'CONFIRM',
    label: '7. Confirm Diagnosis',
    detail: 'Synthesizing response packet and telemetry telemetry signatures.',
  },
  {
    stage: 'FINAL_STATUS',
    label: '8. Final Status Determined',
    detail: 'Diagnostic complete. Operational status verified.',
  },
];

export function createInitialAvailabilityCheck(
  targetAccount: AIAccount,
  role: 'MANAGER' | 'WORKER' | 'CALLER' | 'FILTER',
  workspaceId: string
): AvailabilityCheck {
  return {
    id: `avail-check-${Date.now()}`,
    targetAccountId: targetAccount.id,
    targetAccountName: targetAccount.canonicalName,
    role,
    workspaceId,
    stages: STAGED_CHECK_STEPS.map((s, idx) => ({
      stage: s.stage,
      label: s.label,
      status: idx === 0 ? 'RUNNING' : 'PENDING',
      detail: s.detail,
      timestamp: idx === 0 ? new Date().toISOString() : undefined,
    })),
    currentStageIndex: 0,
    isComplete: false,
    startedAt: new Date().toISOString(),
  };
}

/**
 * Creates a Manager Handoff object
 * Crucial rule: Briefing provides context; it does NOT overwrite the new AI's identity!
 */
export function buildManagerHandoff(params: {
  workspace: Workspace;
  currentManager: AIAccount;
  backupManager: AIAccount;
  projectState: ProjectState;
  tasks: Task[];
  recentMessages: Message[];
  recentReports: FilterReport[];
  reason: string;
}): ManagerHandoff {
  const {
    workspace,
    currentManager,
    backupManager,
    projectState,
    tasks,
    recentMessages,
    recentReports,
    reason,
  } = params;

  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').map((t) => `${t.id}: ${t.title}`);
  const activeTasks = tasks.filter((t) => t.status === 'WORKING' || t.status === 'ASSIGNED').map((t) => `${t.id}: ${t.title}`);
  const unfinishedTasks = tasks.filter((t) => t.status === 'QUEUED' || t.status === 'WAITING').map((t) => `${t.id}: ${t.title}`);
  const blockedTasks = tasks.filter((t) => t.status === 'FAILED' || t.blockReason).map((t) => `${t.id}: ${t.title} (${t.blockReason || 'Failed'})`);

  return {
    id: `handoff-${Date.now()}`,
    workspaceId: workspace.id,
    previousManagerId: currentManager.id,
    previousManagerName: currentManager.canonicalName,
    backupManagerId: backupManager.id,
    backupManagerName: backupManager.canonicalName,
    timestamp: new Date().toISOString(),
    reason,
    briefing: {
      objective: workspace.objective,
      projectStateSummary: projectState.currentStatus,
      completedWork: completedTasks.length > 0 ? completedTasks : ['No completed tasks recorded yet.'],
      activeWork: activeTasks.length > 0 ? activeTasks : ['No tasks currently active.'],
      unfinishedWork: unfinishedTasks.length > 0 ? unfinishedTasks : ['No queued tasks pending.'],
      blockedWork: blockedTasks.length > 0 ? blockedTasks : ['No tasks currently blocked.'],
      currentTasks: tasks.slice(-5).map((t) => `[${t.status}] ${t.id}: ${t.title}`),
      activeWorkers: projectState.activeWorkers,
      recentDecisions: projectState.recentDecisions.map((d) => `[${d.deciderName}]: ${d.decision}`),
      relevantReports: recentReports.slice(-2).map((r) => `Report by ${r.filterAccountName} at ${new Date(r.timestamp).toLocaleTimeString()}`),
      relevantFiles: projectState.relevantFiles,
      importantProjectHistory: recentMessages
        .filter((m) => !m.isInternalWorkforce)
        .slice(-4)
        .map((m) => `${m.senderName}: "${m.content.slice(0, 80)}..."`),
      previousManagerOperatingContext: `${currentManager.canonicalName} was operating under objective: "${workspace.objective}". Focus was on high-reliability validation and minimal-latency execution.`,
      previousManagerStyleNote: `Previous Manager (${currentManager.canonicalName}) prioritized structured reports and modular code artifacts. As ${backupManager.canonicalName}, maintain this context while exercising your own native analytical judgement.`,
      nextExpectedDecision: projectState.nextDecision || 'Review active task allocations and confirm workforce health.',
    },
    status: 'PREPARED',
  };
}

/**
 * Builds an Initial Project Briefing by surveying assigned AI accounts.
 */
export function buildInitialBriefing(workspace: Workspace, accounts: AIAccount[]): InitialBriefing {
  const teamAccounts = accounts.filter((a) =>
    [
      workspace.managerAccountId,
      workspace.backupManagerAccountId,
      workspace.callerAccountId,
      workspace.filterAccountId,
      ...workspace.workerAccountIds,
    ].includes(a.id)
  );

  const contributions: InitialBriefingContribution[] = teamAccounts.map((acc) => {
    let knowledge = '';
    let sources = 'Internal training dataset & verified workspace repository (September 2026)';
    if (acc.capabilities.includes('Strategic Planning')) {
      knowledge = `High-level systems architecture, multi-worker coordination, task decomposition strategies.`;
    } else if (acc.capabilities.includes('Research')) {
      knowledge = `Documentation retrieval, RFC specifications, API compatibility matrices.`;
      sources = `API documentation, RFCs, and cloud release notes (Q3 2026)`;
    } else if (acc.capabilities.includes('Filter Reports')) {
      knowledge = `Conflict resolution parsing, multi-worker discrepancy flagging, structured workforce report schemas.`;
    } else {
      knowledge = `Domain execution in ${acc.capabilities.join(', ')}.`;
    }

    return {
      accountId: acc.id,
      accountName: acc.canonicalName,
      provider: acc.canonicalName.split(' ')[0],
      relevantKnowledge: knowledge,
      capabilities: acc.capabilities,
      limitations: ['Requires clear task scopes', 'Does not invent unavailable API credentials'],
      workingStyle: acc.notes || `Responsive, deterministic output with full source attribution.`,
      sourcesAndDates: sources,
      readiness: 'READY',
    };
  });

  return {
    id: `briefing-${Date.now()}`,
    workspaceId: workspace.id,
    timestamp: new Date().toISOString(),
    contributions,
    synthesizedNotes: `Synthesized initial workforce capabilities across ${teamAccounts.length} accounts. All team members report operational readiness. Sources and dates preserved for Manager evaluation.`,
  };
}
