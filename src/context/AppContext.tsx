import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Provider,
  AIAccount,
  Workspace,
  Task,
  Message,
  Attachment,
  ProjectState,
  FilterReport,
  AvailabilityCheck,
  ManagerHandoff,
  InitialBriefing,
  AppSettings,
  AuthType,
  TaskStatus,
  AvailabilityStatus,
} from '../types/index.ts';
import {
  StorageService,
  DEFAULT_SETTINGS,
} from '../services/storageService.ts';
import {
  getNextAccountNumber,
  generateCanonicalName,
  checkServerProvidersStatus,
  ServerStatusResponse,
} from '../services/providerService.ts';
import {
  executeWorkforceCycle,
  createInitialAvailabilityCheck,
  buildManagerHandoff,
  buildInitialBriefing,
  STAGED_CHECK_STEPS,
  getNextTaskId,
} from '../services/orchestrationService.ts';
import { exportProjectArchiveZip, downloadBlobAsFile } from '../services/archiveService.ts';

export type NavView =
  | 'home'
  | 'workspaces'
  | 'ai-tools'
  | 'workers'
  | 'managers'
  | 'direct-chats'
  | 'files'
  | 'settings';

interface AppContextType {
  activeNav: NavView;
  setActiveNav: (nav: NavView) => void;
  providers: Provider[];
  accounts: AIAccount[];
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string | null) => void;
  tasks: Task[];
  messages: Message[];
  attachments: Attachment[];
  projectStates: Record<string, ProjectState>;
  filterReports: FilterReport[];
  availabilityChecks: AvailabilityCheck[];
  managerHandoffs: ManagerHandoff[];
  initialBriefings: InitialBriefing[];
  settings: AppSettings;
  directChatSelectedAccountId: string | null;
  setDirectChatSelectedAccountId: (id: string | null) => void;
  serverStatus: ServerStatusResponse | null;
  isProcessingWorkforce: boolean;
  activeStagedCheck: AvailabilityCheck | null;
  setActiveStagedCheck: (check: AvailabilityCheck | null) => void;
  activeHandoffModal: ManagerHandoff | null;
  setActiveHandoffModal: (handoff: ManagerHandoff | null) => void;
  activeBriefingModal: InitialBriefing | null;
  setActiveBriefingModal: (briefing: InitialBriefing | null) => void;

  // Actions
  addProvider: (provider: Omit<Provider, 'id'>) => Provider;
  addAccount: (params: {
    providerId: string;
    authType: AuthType;
    friendlyDescription?: string;
    capabilities?: string[];
    notes?: string;
  }) => AIAccount;
  updateAccount: (accountId: string, updates: Partial<AIAccount>) => void;
  createWorkspace: (params: {
    name: string;
    objective: string;
    managerAccountId: string;
    backupManagerAccountId: string;
    callerAccountId: string;
    filterAccountId: string;
    workerAccountIds: string[];
    tags?: string[];
  }) => Workspace;
  updateWorkspace: (workspaceId: string, updates: Partial<Workspace>) => void;
  createTask: (params: {
    workspaceId: string;
    title: string;
    description: string;
    assignedWorkerId: string;
    priority?: 'low' | 'medium' | 'high';
  }) => Task;
  updateTaskStatus: (taskId: string, status: TaskStatus, resultSummary?: string) => void;
  sendWorkspaceMessage: (workspaceId: string, content: string) => Promise<void>;
  sendDirectChatMessage: (accountId: string, content: string) => Promise<void>;
  startAvailabilityCheck: (targetAccountId: string, workspaceId: string) => Promise<void>;
  performManagerHandoff: (workspaceId: string, reason: string) => void;
  confirmManagerHandoff: (handoffId: string) => void;
  triggerInitialBriefing: (workspaceId: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  downloadArchiveZip: (workspaceId: string) => Promise<void>;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeNav, setActiveNav] = useState<NavView>('home');
  const [providers, setProviders] = useState<Provider[]>(() => StorageService.getProviders());
  const [accounts, setAccounts] = useState<AIAccount[]>(() => StorageService.getAccounts());
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => StorageService.getWorkspaces());
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(() => {
    const list = StorageService.getWorkspaces();
    return list.length > 0 ? list[0].id : null;
  });
  const [tasks, setTasks] = useState<Task[]>(() => StorageService.getTasks());
  const [messages, setMessages] = useState<Message[]>(() => StorageService.getMessages());
  const [attachments, setAttachments] = useState<Attachment[]>(() => StorageService.getAttachments());
  const [projectStates, setProjectStates] = useState<Record<string, ProjectState>>(() =>
    StorageService.getProjectStates()
  );
  const [filterReports, setFilterReports] = useState<FilterReport[]>(() =>
    StorageService.getFilterReports()
  );
  const [availabilityChecks, setAvailabilityChecks] = useState<AvailabilityCheck[]>(() =>
    StorageService.getAvailabilityChecks()
  );
  const [managerHandoffs, setManagerHandoffs] = useState<ManagerHandoff[]>(() =>
    StorageService.getManagerHandoffs()
  );
  const [initialBriefings, setInitialBriefings] = useState<InitialBriefing[]>(() =>
    StorageService.getInitialBriefings()
  );
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [directChatSelectedAccountId, setDirectChatSelectedAccountId] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<ServerStatusResponse | null>(null);
  const [isProcessingWorkforce, setIsProcessingWorkforce] = useState(false);

  const [activeStagedCheck, setActiveStagedCheck] = useState<AvailabilityCheck | null>(null);
  const [activeHandoffModal, setActiveHandoffModal] = useState<ManagerHandoff | null>(null);
  const [activeBriefingModal, setActiveBriefingModal] = useState<InitialBriefing | null>(null);

  // Sync with localStorage on state changes
  useEffect(() => StorageService.saveProviders(providers), [providers]);
  useEffect(() => StorageService.saveAccounts(accounts), [accounts]);
  useEffect(() => StorageService.saveWorkspaces(workspaces), [workspaces]);
  useEffect(() => StorageService.saveTasks(tasks), [tasks]);
  useEffect(() => StorageService.saveMessages(messages), [messages]);
  useEffect(() => StorageService.saveAttachments(attachments), [attachments]);
  useEffect(() => StorageService.saveProjectStates(projectStates), [projectStates]);
  useEffect(() => StorageService.saveFilterReports(filterReports), [filterReports]);
  useEffect(() => StorageService.saveAvailabilityChecks(availabilityChecks), [availabilityChecks]);
  useEffect(() => StorageService.saveManagerHandoffs(managerHandoffs), [managerHandoffs]);
  useEffect(() => StorageService.saveInitialBriefings(initialBriefings), [initialBriefings]);
  useEffect(() => StorageService.saveSettings(settings), [settings]);

  // Check server status on mount
  useEffect(() => {
    checkServerProvidersStatus().then((status) => {
      if (status) setServerStatus(status);
    });
  }, []);

  // 1. Add Provider
  const addProvider = useCallback(
    (providerData: Omit<Provider, 'id'>) => {
      const newId = `prov-${Date.now()}`;
      const newProvider: Provider = { ...providerData, id: newId, isCustom: true };
      setProviders((prev) => [...prev, newProvider]);
      return newProvider;
    },
    []
  );

  // 2. Add Account with automatic numbering (ChatGPT 1, ChatGPT 2, etc.)
  const addAccount = useCallback(
    (params: {
      providerId: string;
      authType: AuthType;
      friendlyDescription?: string;
      capabilities?: string[];
      notes?: string;
    }) => {
      const provider = providers.find((p) => p.id === params.providerId) || providers[0];
      const identityNumber = getNextAccountNumber(provider.id, accounts);
      const canonicalName = generateCanonicalName(provider, identityNumber);

      const newAccount: AIAccount = {
        id: `acc-${provider.id}-${identityNumber}-${Date.now()}`,
        providerId: provider.id,
        canonicalName,
        identityNumber,
        friendlyDescription: params.friendlyDescription || `${canonicalName} Specialist`,
        authType: params.authType,
        connectionStatus: 'CONNECTED',
        capabilities: params.capabilities && params.capabilities.length > 0
          ? params.capabilities
          : ['Reasoning', 'Code Analysis', 'Workflow Execution'],
        availability: 'AVAILABLE',
        totalTasksCompleted: 0,
        filesProducedCount: 0,
        lastActivityAt: new Date().toISOString(),
        connectedAt: new Date().toISOString(),
        notes: params.notes,
      };

      setAccounts((prev) => [...prev, newAccount]);
      return newAccount;
    },
    [providers, accounts]
  );

  // 3. Update Account
  const updateAccount = useCallback((accountId: string, updates: Partial<AIAccount>) => {
    setAccounts((prev) => prev.map((a) => (a.id === accountId ? { ...a, ...updates } : a)));
  }, []);

  // 4. Create Workspace
  const createWorkspace = useCallback(
    (params: {
      name: string;
      objective: string;
      managerAccountId: string;
      backupManagerAccountId: string;
      callerAccountId: string;
      filterAccountId: string;
      workerAccountIds: string[];
      tags?: string[];
    }) => {
      const newWsId = `ws-${Date.now()}`;
      const newWorkspace: Workspace = {
        id: newWsId,
        name: params.name,
        objective: params.objective,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        managerAccountId: params.managerAccountId,
        backupManagerAccountId: params.backupManagerAccountId,
        callerAccountId: params.callerAccountId,
        filterAccountId: params.filterAccountId,
        workerAccountIds: params.workerAccountIds,
        currentStatus: 'ACTIVE',
        tags: params.tags || ['Workforce', 'Multi-AI'],
      };

      const initialState: ProjectState = {
        workspaceId: newWsId,
        objective: params.objective,
        currentStatus: 'Workspace initialized. Manager standing by for instructions.',
        completed: [],
        inProgress: [],
        blocked: [],
        openQuestions: [],
        activeTasks: [],
        activeWorkers: [],
        recentDecisions: [
          {
            timestamp: new Date().toISOString(),
            decision: `Initialized workforce team with Manager, Backup, Caller, and ${params.workerAccountIds.length} workers.`,
            deciderId: params.managerAccountId,
            deciderName: accounts.find((a) => a.id === params.managerAccountId)?.canonicalName || 'Manager',
          },
        ],
        relevantFiles: [],
        nextDecision: 'Define initial milestones and assign investigative tasks.',
        updatedAt: new Date().toISOString(),
      };

      setWorkspaces((prev) => [newWorkspace, ...prev]);
      setProjectStates((prev) => ({ ...prev, [newWsId]: initialState }));
      setActiveWorkspaceId(newWsId);
      return newWorkspace;
    },
    [accounts]
  );

  const updateWorkspace = useCallback((workspaceId: string, updates: Partial<Workspace>) => {
    setWorkspaces((prev) =>
      prev.map((ws) => (ws.id === workspaceId ? { ...ws, ...updates, updatedAt: new Date().toISOString() } : ws))
    );
  }, []);

  // 5. Create Task
  const createTask = useCallback(
    (params: {
      workspaceId: string;
      title: string;
      description: string;
      assignedWorkerId: string;
      priority?: 'low' | 'medium' | 'high';
    }) => {
      const newTaskId = getNextTaskId(tasks);
      const newTask: Task = {
        id: newTaskId,
        workspaceId: params.workspaceId,
        title: params.title,
        description: params.description,
        assignedWorkerId: params.assignedWorkerId,
        status: 'ASSIGNED',
        priority: params.priority || 'medium',
        createdAt: new Date().toISOString(),
      };

      setTasks((prev) => [...prev, newTask]);
      return newTask;
    },
    [tasks]
  );

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus, resultSummary?: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status,
            resultSummary: resultSummary || t.resultSummary,
            completedAt: status === 'COMPLETED' ? new Date().toISOString() : t.completedAt,
          };
        }
        return t;
      })
    );
  }, []);

  // 6. Send Workspace Message & Run Multi-AI Loop
  const sendWorkspaceMessage = useCallback(
    async (workspaceId: string, content: string) => {
      const workspace = workspaces.find((w) => w.id === workspaceId);
      if (!workspace) return;

      const wsTasks = tasks.filter((t) => t.workspaceId === workspaceId);
      const wsState = projectStates[workspaceId] || {
        workspaceId,
        objective: workspace.objective,
        currentStatus: 'Active',
        completed: [],
        inProgress: [],
        blocked: [],
        openQuestions: [],
        activeTasks: [],
        activeWorkers: [],
        recentDecisions: [],
        relevantFiles: [],
        nextDecision: '',
        updatedAt: new Date().toISOString(),
      };

      setIsProcessingWorkforce(true);

      try {
        const result = await executeWorkforceCycle({
          workspace,
          userPrompt: content,
          accounts,
          existingTasks: wsTasks,
          existingState: wsState,
          enableRealGemini: settings.enableRealGeminiCalls,
        });

        setMessages((prev) => [...prev, ...result.newMessages]);
        setTasks((prev) => [...prev, ...result.newTasks]);
        setAttachments((prev) => [...prev, ...result.newAttachments]);
        setFilterReports((prev) => [result.filterReport, ...prev]);
        setProjectStates((prev) => ({
          ...prev,
          [workspaceId]: result.updatedProjectState,
        }));
      } catch (err) {
        console.error('Error executing workforce cycle:', err);
      } finally {
        setIsProcessingWorkforce(false);
      }
    },
    [workspaces, tasks, projectStates, accounts, settings]
  );

  // 7. Direct Chat (One-on-One with an AI account)
  const sendDirectChatMessage = useCallback(
    async (accountId: string, content: string) => {
      const targetAccount = accounts.find((a) => a.id === accountId);
      if (!targetAccount) return;

      const userMsg: Message = {
        id: `msg-${Date.now()}-dc-user`,
        directChatAccountId: accountId,
        senderId: 'USER',
        senderName: 'User',
        senderType: 'USER',
        content,
        attachments: [],
        messageType: 'DIRECT_CHAT',
        isInternalWorkforce: false,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);

      // Generate response from target AI account
      let replyText = '';
      if (
        settings.enableRealGeminiCalls &&
        (targetAccount.providerId === 'google-ai-studio' || targetAccount.providerId === 'gemini')
      ) {
        const res = await checkServerProvidersStatus();
        if (res?.googleAiStudio?.hasKey) {
          const aiRes = await (await import('../services/providerService.ts')).callGeminiGenerate(
            content,
            `You are ${targetAccount.canonicalName}. Capabilities: ${targetAccount.capabilities.join(', ')}. Friendly persona: ${targetAccount.friendlyDescription || 'AI Specialist'}. Respond in direct 1-on-1 chat to the user directly, concisely and accurately.`
          );
          if ('text' in aiRes && aiRes.text) {
            replyText = aiRes.text;
          }
        }
      }

      if (!replyText) {
        replyText = `Hello, I am ${targetAccount.canonicalName}. Received your direct inquiry: "${content}". With my capabilities in ${targetAccount.capabilities.join(', ')}, I am directly analyzing this without workforce orchestration. How else may I assist you directly?`;
      }

      const aiMsg: Message = {
        id: `msg-${Date.now()}-dc-ai`,
        directChatAccountId: accountId,
        senderId: targetAccount.id,
        senderName: targetAccount.canonicalName,
        senderType: 'WORKER',
        provider: targetAccount.canonicalName.split(' ')[0],
        accountIdentity: targetAccount.canonicalName,
        content: replyText,
        attachments: [],
        messageType: 'DIRECT_CHAT',
        isInternalWorkforce: false,
        timestamp: new Date(Date.now() + 800).toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    },
    [accounts, settings]
  );

  // 8. Staged Availability Checking
  const startAvailabilityCheck = useCallback(
    async (targetAccountId: string, workspaceId: string) => {
      const target = accounts.find((a) => a.id === targetAccountId);
      if (!target) return;

      const workspace = workspaces.find((w) => w.id === workspaceId);
      let role: 'MANAGER' | 'WORKER' | 'CALLER' | 'FILTER' = 'WORKER';
      if (workspace) {
        if (target.id === workspace.managerAccountId) role = 'MANAGER';
        else if (target.id === workspace.callerAccountId) role = 'CALLER';
        else if (target.id === workspace.filterAccountId) role = 'FILTER';
      }

      const check = createInitialAvailabilityCheck(target, role, workspaceId);
      setActiveStagedCheck(check);
      setAvailabilityChecks((prev) => [check, ...prev]);

      // Progress through stages with smooth asynchronous steps
      const delayMs = settings.availabilityCheckDelayMs / 3;

      for (let i = 0; i < STAGED_CHECK_STEPS.length; i++) {
        await new Promise((res) => setTimeout(res, delayMs));

        setActiveStagedCheck((curr) => {
          if (!curr) return null;
          const updatedStages = curr.stages.map((stage, sIdx) => {
            if (sIdx < i) {
              return { ...stage, status: 'PASSED' as const };
            }
            if (sIdx === i) {
              return {
                ...stage,
                status: (i === STAGED_CHECK_STEPS.length - 1 ? 'PASSED' : 'RUNNING') as any,
                timestamp: new Date().toISOString(),
              };
            }
            return stage;
          });

          const isFinal = i === STAGED_CHECK_STEPS.length - 1;
          const finalStatus: AvailabilityStatus = isFinal ? 'RESPONDING' : undefined as any;

          return {
            ...curr,
            stages: updatedStages,
            currentStageIndex: i,
            isComplete: isFinal,
            finalStatus: isFinal ? finalStatus : curr.finalStatus,
            completedAt: isFinal ? new Date().toISOString() : undefined,
          };
        });
      }

      // Also record an availability alert message in workspace
      const completedStageMsg: Message = {
        id: `msg-${Date.now()}-avail-check`,
        workspaceId,
        senderId: 'SYSTEM',
        senderName: 'Availability Monitor',
        senderType: 'SYSTEM',
        content: `Staged Availability Check complete for ${target.canonicalName} (${role}). All 8 diagnostic stages passed. Operational status confirmed: RESPONDING.`,
        attachments: [],
        messageType: 'AVAILABILITY_ALERT',
        isInternalWorkforce: true,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, completedStageMsg]);
    },
    [accounts, workspaces, settings]
  );

  // 9. Manager Handoff
  const performManagerHandoff = useCallback(
    (workspaceId: string, reason: string) => {
      const workspace = workspaces.find((w) => w.id === workspaceId);
      if (!workspace) return;

      const currentMgr = accounts.find((a) => a.id === workspace.managerAccountId) || accounts[0];
      const backupMgr = accounts.find((a) => a.id === workspace.backupManagerAccountId) || accounts[1];
      const wsTasks = tasks.filter((t) => t.workspaceId === workspaceId);
      const wsState = projectStates[workspaceId] || {
        workspaceId,
        objective: workspace.objective,
        currentStatus: 'Active',
        completed: [],
        inProgress: [],
        blocked: [],
        openQuestions: [],
        activeTasks: [],
        activeWorkers: [],
        recentDecisions: [],
        relevantFiles: [],
        nextDecision: '',
        updatedAt: new Date().toISOString(),
      };
      const wsMessages = messages.filter((m) => m.workspaceId === workspaceId);
      const wsReports = filterReports.filter((r) => r.workspaceId === workspaceId);

      const handoff = buildManagerHandoff({
        workspace,
        currentManager: currentMgr,
        backupManager: backupMgr,
        projectState: wsState,
        tasks: wsTasks,
        recentMessages: wsMessages,
        recentReports: wsReports,
        reason,
      });

      setActiveHandoffModal(handoff);
      setManagerHandoffs((prev) => [handoff, ...prev]);
    },
    [workspaces, accounts, tasks, projectStates, messages, filterReports]
  );

  const confirmManagerHandoff = useCallback(
    (handoffId: string) => {
      const handoff = managerHandoffs.find((h) => h.id === handoffId) || activeHandoffModal;
      if (!handoff) return;

      const workspace = workspaces.find((w) => w.id === handoff.workspaceId);
      if (!workspace) return;

      // Swap Primary Manager to Backup Manager
      // Crucial rule: Backup AI keeps its identity!
      const previousManagerId = workspace.managerAccountId;
      const newManagerId = handoff.backupManagerId;

      updateWorkspace(workspace.id, {
        managerAccountId: newManagerId,
        backupManagerAccountId: previousManagerId, // Old manager becomes backup
      });

      // Append handoff event to history
      const handoffEventMsg: Message = {
        id: `msg-${Date.now()}-handoff`,
        workspaceId: workspace.id,
        senderId: 'SYSTEM',
        senderName: 'System Handoff Engine',
        senderType: 'SYSTEM',
        content: `MANAGER HANDOFF EXECUTED: ${handoff.previousManagerName} replaced by ${handoff.backupManagerName}.\nReason: ${handoff.reason}.\nFull briefing delivered. ${handoff.backupManagerName} has assumed active managerial authority while retaining canonical identity.`,
        attachments: [],
        messageType: 'HANDOFF_EVENT',
        isInternalWorkforce: false,
        timestamp: new Date().toISOString(),
      };

      const newManagerAckMsg: Message = {
        id: `msg-${Date.now()}-new-mgr-ack`,
        workspaceId: workspace.id,
        senderId: newManagerId,
        senderName: handoff.backupManagerName,
        senderType: 'MANAGER',
        provider: handoff.backupManagerName.split(' ')[0],
        accountIdentity: handoff.backupManagerName,
        content: `I have received the complete Manager Briefing from ${handoff.previousManagerName}. Objective "${handoff.briefing.objective}" and ${handoff.briefing.completedWork.length} completed tasks verified. I am now active Manager for this workspace. Workforce, standby for next directives.`,
        attachments: [],
        messageType: 'MANAGER_PLAN',
        isInternalWorkforce: false,
        timestamp: new Date(Date.now() + 1000).toISOString(),
      };

      setMessages((prev) => [...prev, handoffEventMsg, newManagerAckMsg]);

      // Update handoff record status
      setManagerHandoffs((prev) =>
        prev.map((h) => (h.id === handoffId ? { ...h, status: 'COMPLETED' } : h))
      );
      setActiveHandoffModal(null);
    },
    [managerHandoffs, activeHandoffModal, workspaces, updateWorkspace]
  );

  // 10. Initial Project Briefing
  const triggerInitialBriefing = useCallback(
    (workspaceId: string) => {
      const workspace = workspaces.find((w) => w.id === workspaceId);
      if (!workspace) return;

      const briefing = buildInitialBriefing(workspace, accounts);
      setInitialBriefings((prev) => [briefing, ...prev]);
      setActiveBriefingModal(briefing);

      const briefingMsg: Message = {
        id: `msg-${Date.now()}-init-brief`,
        workspaceId,
        senderId: 'SYSTEM',
        senderName: 'Initial Briefing Coordinator',
        senderType: 'SYSTEM',
        content: `INITIAL PROJECT BRIEFING COMPLETED: Surveyed ${briefing.contributions.length} workforce accounts. Context, capabilities, limitations, and historical sources recorded and attached to Project State.`,
        attachments: [],
        messageType: 'INITIAL_BRIEFING',
        isInternalWorkforce: false,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, briefingMsg]);
    },
    [workspaces, accounts]
  );

  // 11. Download Project Archive as ZIP
  const downloadArchiveZip = useCallback(
    async (workspaceId: string) => {
      const workspace = workspaces.find((w) => w.id === workspaceId);
      if (!workspace) return;

      const wsMessages = messages.filter((m) => m.workspaceId === workspaceId);
      const wsTasks = tasks.filter((t) => t.workspaceId === workspaceId);
      const wsAttachments = attachments.filter((a) => a.workspaceId === workspaceId);
      const wsState = projectStates[workspaceId];
      const wsReports = filterReports.filter((r) => r.workspaceId === workspaceId);

      const zipBlob = await exportProjectArchiveZip({
        workspace,
        messages: wsMessages,
        tasks: wsTasks,
        attachments: wsAttachments,
        projectState: wsState,
        filterReports: wsReports,
        accounts,
      });

      const sanitizedName = workspace.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      downloadBlobAsFile(zipBlob, `${sanitizedName}-archive.zip`);
    },
    [workspaces, messages, tasks, attachments, projectStates, filterReports, accounts]
  );

  // 12. Settings and Reset
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetAllData = useCallback(() => {
    StorageService.resetAll();
    setProviders(StorageService.getProviders());
    setAccounts(StorageService.getAccounts());
    setWorkspaces(StorageService.getWorkspaces());
    setTasks(StorageService.getTasks());
    setMessages(StorageService.getMessages());
    setAttachments(StorageService.getAttachments());
    setProjectStates(StorageService.getProjectStates());
    setFilterReports(StorageService.getFilterReports());
    setAvailabilityChecks([]);
    setManagerHandoffs([]);
    setInitialBriefings([]);
    setSettings(DEFAULT_SETTINGS);
    setActiveWorkspaceId('ws-cloud-migration');
  }, []);

  return (
    <AppContext.Provider
      value={{
        activeNav,
        setActiveNav,
        providers,
        accounts,
        workspaces,
        activeWorkspaceId,
        setActiveWorkspaceId,
        tasks,
        messages,
        attachments,
        projectStates,
        filterReports,
        availabilityChecks,
        managerHandoffs,
        initialBriefings,
        settings,
        directChatSelectedAccountId,
        setDirectChatSelectedAccountId,
        serverStatus,
        isProcessingWorkforce,
        activeStagedCheck,
        setActiveStagedCheck,
        activeHandoffModal,
        setActiveHandoffModal,
        activeBriefingModal,
        setActiveBriefingModal,

        addProvider,
        addAccount,
        updateAccount,
        createWorkspace,
        updateWorkspace,
        createTask,
        updateTaskStatus,
        sendWorkspaceMessage,
        sendDirectChatMessage,
        startAvailabilityCheck,
        performManagerHandoff,
        confirmManagerHandoff,
        triggerInitialBriefing,
        updateSettings,
        downloadArchiveZip,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
