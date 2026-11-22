import { Subject, StudyLog, Supplement, DailySupplementLog, SubjectNote, StudyReminder, LifeField, FieldLog } from '../types';
import { formatDateStr } from './dateUtils';

const STORAGE_KEYS = {
  SUBJECTS: 'gpt_subjects_v1',
  STUDY_LOGS: 'gpt_study_logs_v2', // clean slate, no demo data
  SUPPLEMENTS: 'gpt_supplements_v2', // updated to B12, D3, Calcium, Magnesium, Zinc, B-Plex Forte, Iron
  SUPPLEMENT_LOGS: 'gpt_supplement_logs_v2',
  NOTES: 'gpt_notes_v1',
  REMINDERS: 'gpt_reminders_v1',
  DARK_MODE: 'gpt_dark_mode_v1',
  LIFE_FIELDS: 'gpt_life_fields_v1',
  FIELD_LOGS: 'gpt_field_logs_v1',
};

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-dsa',
    name: 'Data Structures & Algorithms',
    category: 'Placement',
    color: '#10b981', // emerald
    description: 'LeetCode, Arrays, Trees, Dynamic Programming, Graphs',
    targetDailyHours: 2.0,
    createdAt: '2026-09-01',
    syllabus: ['Dynamic Programming', 'Binary Trees & BST', 'Graph Traversals (BFS/DFS)', 'Tries & Disjoint Sets', 'Two Pointers & Sliding Window'],
  },
  {
    id: 'sub-os',
    name: 'Operating Systems',
    category: 'GATE',
    color: '#3b82f6', // blue
    description: 'Process Synchronization, Deadlocks, Virtual Memory, CPU Scheduling',
    targetDailyHours: 1.5,
    createdAt: '2026-09-01',
    syllabus: ['Semaphores & Classical IPC', 'Paging & TLB Hit Ratios', 'Banker Algorithm', 'Disk Scheduling Algorithms'],
  },
  {
    id: 'sub-dbms',
    name: 'DBMS & SQL',
    category: 'Core CS',
    color: '#06b6d4', // cyan
    description: 'Normalization, Transactions, Serializability, SQL Queries & Indexing',
    targetDailyHours: 1.5,
    createdAt: '2026-09-05',
    syllabus: ['B+ Trees', 'Serializability & Concurrency Control', 'Normal Forms (3NF, BCNF)', 'SQL Joins & Group By'],
  },
  {
    id: 'sub-cn',
    name: 'Computer Networks',
    category: 'GATE',
    color: '#8b5cf6', // violet
    description: 'TCP/IP, Flow & Error Control, Subnetting, Routing Algorithms',
    targetDailyHours: 1.5,
    createdAt: '2026-09-10',
    syllabus: ['CIDR Subnetting & Supernetting', 'TCP Congestion Control', 'Sliding Window Protocols', 'DNS, HTTP & Transport Protocols'],
  },
  {
    id: 'sub-toc',
    name: 'Theory of Computation',
    category: 'GATE',
    color: '#f59e0b', // amber
    description: 'Regular Languages, DFA/NFA, Context-Free Grammars, Turing Machines',
    targetDailyHours: 1.0,
    createdAt: '2026-09-15',
    syllabus: ['Pumping Lemma', 'Closure Properties', 'Decidability & Undecidability', 'Chomsky Hierarchy'],
  },
  {
    id: 'sub-sysdesign',
    name: 'System Design (LLD / HLD)',
    category: 'Placement',
    color: '#f43f5e', // rose
    description: 'Design Patterns, Scalability, Caching, Microservices, DB Sharding',
    targetDailyHours: 1.5,
    createdAt: '2026-09-20',
    syllabus: ['Factory & Singleton Patterns', 'Rate Limiter Design', 'Caching Strategies (Redis)', 'Message Queues (Kafka)'],
  },
  {
    id: 'sub-aptitude',
    name: 'Aptitude & Logical Reasoning',
    category: 'Aptitude',
    color: '#ec4899', // pink
    description: 'Quantitative Aptitude, Time & Work, Permutations, Data Interpretation',
    targetDailyHours: 1.0,
    createdAt: '2026-09-25',
    syllabus: ['Time, Speed & Distance', 'Permutations & Combinations', 'Probability', 'Syllogisms & Seating Arrangement'],
  },
  {
    id: 'sub-math',
    name: 'Engineering & Discrete Math',
    category: 'GATE',
    color: '#14b8a6', // teal
    description: 'Linear Algebra, Calculus, Graph Theory, Combinatorics',
    targetDailyHours: 1.5,
    createdAt: '2026-10-01',
    syllabus: ['Eigenvalues & Eigenvectors', 'Partial Derivatives & Maxima/Minima', 'Graph Planarity & Coloring', 'Generating Functions'],
  },
];

export const INITIAL_SUPPLEMENTS: Supplement[] = [
  {
    id: 'sup-b12',
    name: 'Vitamin B12',
    dosage: '1500 mcg',
    timing: 'Morning',
    icon: '⚡',
    description: 'Essential for neural conduction, memory consolidation, mental alertness & energy',
    category: 'Vitamins',
  },
  {
    id: 'sup-d3',
    name: 'Vitamin D3',
    dosage: '2000 - 60000 IU',
    timing: 'Morning',
    icon: '☀️',
    description: 'Crucial for cognitive stamina, dopamine regulation & immunity during long study hours',
    category: 'Vitamins',
  },
  {
    id: 'sup-calcium',
    name: 'Calcium',
    dosage: '500 mg',
    timing: 'Afternoon',
    icon: '🦴',
    description: 'Bone density, neurotransmission & muscle contraction; best taken post lunch',
    category: 'Vitamins',
  },
  {
    id: 'sup-magnesium',
    name: 'Magnesium',
    dosage: '250 - 400 mg (Glycinate)',
    timing: 'Night',
    icon: '🌙',
    description: 'Calms nervous system, promotes deep restorative REM sleep & memory retention',
    category: 'Recovery',
  },
  {
    id: 'sup-zinc',
    name: 'Zinc',
    dosage: '25 - 50 mg',
    timing: 'Afternoon',
    icon: '🛡️',
    description: 'Immune support, neuroplasticity, DNA repair & enzyme activity; take with meals',
    category: 'Cognitive',
  },
  {
    id: 'sup-bplex',
    name: 'B-Plex Forte',
    dosage: '1 Capsule',
    timing: 'Morning',
    icon: '💊',
    description: 'High-potency B-complex with Vitamin C for brain ATP cellular energy & fighting fatigue',
    category: 'Vitamins',
  },
  {
    id: 'sup-iron',
    name: 'Iron',
    dosage: '100 mg elemental',
    timing: 'Morning',
    icon: '🩸',
    description: 'Optimal hemoglobin, cerebral oxygenation & preventing study brain fog',
    category: 'Vitamins',
  },
];

export const INITIAL_REMINDERS: StudyReminder[] = [
  {
    id: 'rem-1',
    time: '08:00',
    label: '🌅 Morning GATE Focus Session',
    enabled: true,
    days: [1, 2, 3, 4, 5, 6], // Mon-Sat
  },
  {
    id: 'rem-2',
    time: '14:30',
    label: '💻 Afternoon Placement LeetCode Grind',
    enabled: true,
    days: [1, 2, 3, 4, 5, 6, 0], // Every day
  },
  {
    id: 'rem-3',
    time: '20:00',
    label: '📝 Evening Core CS & Notes Revision',
    enabled: true,
    days: [1, 2, 3, 4, 5, 6, 0],
  },
  {
    id: 'rem-4',
    time: '22:30',
    label: '💊 Log Today Study & Night Supplements',
    enabled: true,
    days: [1, 2, 3, 4, 5, 6, 0],
  },
];

export const INITIAL_NOTES: SubjectNote[] = [
  {
    id: 'note-1',
    subjectId: 'sub-dsa',
    title: 'Dynamic Programming Patterns Cheatsheet',
    content: `### Core Patterns:
1. **0/1 Knapsack Pattern**: Subset sum, Target sum, Equal partition.
   - Recurrence: \`dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]])\`
2. **Longest Common Subsequence (LCS)**:
   - If \`s1[i-1] == s2[j-1]\`: \`dp[i][j] = 1 + dp[i-1][j-1]\`
   - Else: \`dp[i][j] = max(dp[i-1][j], dp[i][j-1])\`
3. **Kadane's Algorithm**: Maximum contiguous subarray sum in O(n).
   - \`max_ending_here = max(arr[i], max_ending_here + arr[i])\`

*Tip for placements*: Always explain brute-force first, then optimize space from O(n^2) to O(n) array rolling.*`,
    category: 'Formula',
    tags: ['DP', 'Knapsack', 'LCS', 'Optimization'],
    updatedAt: '2026-11-20',
  },
  {
    id: 'note-2',
    subjectId: 'sub-os',
    title: 'GATE OS Formula & Trap Alert: Paging & TLB',
    content: `### Effective Memory Access Time (EMAT):
- **Single-level Paging**:
  $$EMAT = h \\times (t_{TLB} + t_{mem}) + (1 - h) \\times (t_{TLB} + 2 \\times t_{mem})$$
  *(Where $h$ is TLB hit ratio, $t_{TLB}$ is TLB access time, $t_{mem}$ is Main Memory access time).*
- **Two-level Paging**:
  $$EMAT = h \\times (t_{TLB} + t_{mem}) + (1 - h) \\times (t_{TLB} + 3 \\times t_{mem})$$

### Common GATE Trap:
- Check if TLB search is done **in parallel** or **serially** with page table cache!
- Check if page fault rate ($p$) is given. If page fault occurs, add $p \\times \\text{Page Fault Service Time}$.`,
    category: 'Formula',
    tags: ['EMAT', 'TLB', 'Virtual Memory', 'GATE Traps'],
    updatedAt: '2026-11-21',
  },
  {
    id: 'note-3',
    subjectId: 'sub-dbms',
    title: 'Testing Serializability & Normal Forms',
    content: `### Conflict Serializability:
1. Construct Precedence Graph (Serialization Graph).
2. Vertices = Committed Transactions ($T_1, T_2, \\dots$).
3. Directed edge $T_i \\to T_j$ if both access item $Q$, at least one writes $Q$, and $T_i$ executed before $T_j$.
4. **Graph is acyclic $\\iff$ Conflict Serializable**. Topological sort gives equivalent serial schedule!

### Normalization Quick Rule:
- **1NF**: Atomic attributes.
- **2NF**: 1NF + No partial dependency (non-prime on proper subset of candidate key).
- **3NF**: 2NF + No transitive dependency ($X \\to Y$: either $X$ is super key OR $Y$ is prime).
- **BCNF**: For every FD $X \\to Y$, $X$ must be super key.`,
    category: 'Concept',
    tags: ['Serializability', 'BCNF', '3NF', 'Transactions'],
    updatedAt: '2026-11-18',
  },
];

/**
 * Generate 60 days of realistic study logs so the user sees a rich LeetCode heatmap immediately
 */
export function generateDemoStudyLogs(): StudyLog[] {
  const logs: StudyLog[] = [];
  const today = new Date();
  const subjects = ['sub-dsa', 'sub-os', 'sub-dbms', 'sub-cn', 'sub-toc', 'sub-sysdesign', 'sub-aptitude', 'sub-math'];
  
  const sampleTopics: Record<string, string[]> = {
    'sub-dsa': ['Solved 3 LeetCode Mediums on Graphs (Dijkstra)', 'Binary Tree lowest common ancestor', 'DP on trees problem set', 'Sliding Window maximum optimization'],
    'sub-os': ['Revised Semaphore mutex implementation', 'Page replacement algorithms (LRU & Optimal)', 'Solved 5 GATE PYQs on Disk Scheduling'],
    'sub-dbms': ['Indexed B+ tree height calculation', 'SQL nested queries & Correlated subqueries', 'Conflict serializability PYQ practice'],
    'sub-cn': ['Subnet mask calculations & CIDR classless routing', 'TCP slow start & congestion avoidance formulas', 'CRC error detection polynomial division'],
    'sub-toc': ['Closure properties under homomorphism', 'DFA state minimization algorithm', 'Undecidability of Post Correspondence Problem'],
    'sub-sysdesign': ['Designed URL Shortener (TinyURL) with Redis caching', 'Studied consistent hashing & DB sharding strategies'],
    'sub-aptitude': ['Speed math tricks & ratios', 'Solved 15 problems on Permutation & Combinations'],
    'sub-math': ['Eigenvalues and Cayley-Hamilton theorem PYQs', 'Graph coloring and Euler circuit criteria'],
  };

  // Generate logs for the last 60 days
  for (let i = 59; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = formatDateStr(d);
    
    // Simulate consistent student behavior (skips ~15% days like Sundays or rest days)
    const isRestDay = (i % 7 === 0 && i !== 0) || (i % 13 === 0);
    if (isRestDay) continue;

    // Pick 1 to 3 subjects for that day
    const numSessions = (i % 3 === 0) ? 3 : (i % 2 === 0) ? 2 : 1;
    const shuffled = [...subjects].sort(() => 0.5 - Math.sin(i * 123 + 45));
    const picked = shuffled.slice(0, numSessions);

    picked.forEach((subId, idx) => {
      // Hours in 0.5 to 3.0 range
      const hourOptions = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0];
      const hourChoice = hourOptions[(i + idx * 2) % hourOptions.length];
      const topics = sampleTopics[subId] || ['Revised subject concepts & solved practice problems'];
      const topic = topics[(i + idx) % topics.length];

      logs.push({
        id: `demo-log-${dateStr}-${subId}`,
        subjectId: subId,
        date: dateStr,
        hours: hourChoice,
        notes: topic,
        timestamp: d.getTime() + idx * 3600000,
      });
    });
  }

  return logs;
}

// Local Storage helpers
export function loadSubjects(): Subject[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (!data) {
      saveSubjects(INITIAL_SUBJECTS);
      return INITIAL_SUBJECTS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_SUBJECTS;
  }
}

export function saveSubjects(subjects: Subject[]): void {
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
}

export function loadStudyLogs(): StudyLog[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STUDY_LOGS);
    if (!data) {
      // Default to empty array - clean start, no demo logs
      saveStudyLogs([]);
      return [];
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function clearStudyLogs(): void {
  saveStudyLogs([]);
}

export function saveStudyLogs(logs: StudyLog[]): void {
  localStorage.setItem(STORAGE_KEYS.STUDY_LOGS, JSON.stringify(logs));
}

export function loadSupplements(): Supplement[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SUPPLEMENTS);
    if (!data) {
      saveSupplements(INITIAL_SUPPLEMENTS);
      return INITIAL_SUPPLEMENTS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_SUPPLEMENTS;
  }
}

export function saveSupplements(supplements: Supplement[]): void {
  localStorage.setItem(STORAGE_KEYS.SUPPLEMENTS, JSON.stringify(supplements));
}

export function loadSupplementLogs(): Record<string, DailySupplementLog> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SUPPLEMENT_LOGS);
    if (!data) return {};
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export function saveSupplementLogs(logs: Record<string, DailySupplementLog>): void {
  localStorage.setItem(STORAGE_KEYS.SUPPLEMENT_LOGS, JSON.stringify(logs));
}

export function loadNotes(): SubjectNote[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!data) {
      saveNotes(INITIAL_NOTES);
      return INITIAL_NOTES;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_NOTES;
  }
}

export function saveNotes(notes: SubjectNote[]): void {
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
}

export function loadReminders(): StudyReminder[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (!data) {
      saveReminders(INITIAL_REMINDERS);
      return INITIAL_REMINDERS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_REMINDERS;
  }
}

export function saveReminders(reminders: StudyReminder[]): void {
  localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
}

export const INITIAL_LIFE_FIELDS: LifeField[] = [
  {
    id: 'field-neuroscience',
    name: 'Neuroscience',
    category: 'Cognitive & Mind',
    icon: '🧠',
    color: '#8b5cf6', // violet
    description: 'Brain neuroplasticity, dopamine baseline & reward circuits, sleep architecture & cognitive endurance',
    coreTopics: [
      'Neuroplasticity & Synaptic Pruning',
      'Dopamine Baseline vs Peak Dynamics',
      'Adenosine & Sleep Architecture (REM/Deep)',
      'Prefrontal Cortex & Executive Focus',
      'Anterior Mid-Cingulate Cortex & Willpower',
    ],
    recommendedResources: [
      'Huberman Lab Podcast (Dr. Andrew Huberman)',
      'Behave: The Biology of Humans by Robert Sapolsky',
      'The Brain That Changes Itself by Norman Doidge',
    ],
    targetWeeklyMinutes: 90,
    createdAt: '2026-11-20',
  },
  {
    id: 'field-geopolitics',
    name: 'Geopolitics',
    category: 'World & Systems',
    icon: '🌍',
    color: '#0284c7', // sky
    description: 'Maritime chokepoints, semiconductor supply chains, energy transition & multipolar balance of power',
    coreTopics: [
      'Strategic Maritime Chokepoints (Malacca, Hormuz, Suez)',
      'Semiconductor & Advanced Tech Supply Chains',
      'Petrodollar Dynamics & Energy Transition',
      'Demographic Inversion & Industrial Reshoring',
      'Multipolar Trade Alliances & Currency Hegemony',
    ],
    recommendedResources: [
      'Prisoners of Geography by Tim Marshall',
      'The Accidental Superpower by Peter Zeihan',
      'CaspianReport & The Red Line Podcasts',
    ],
    targetWeeklyMinutes: 90,
    createdAt: '2026-11-20',
  },
  {
    id: 'field-psychology',
    name: 'Psychology',
    category: 'Cognitive & Mind',
    icon: '💭',
    color: '#ec4899', // pink
    description: 'Behavioral economics, cognitive biases, System 1/2 thinking, Jungian archetypes & mental resilience',
    coreTopics: [
      'Dual Process Theory (System 1 Fast vs System 2 Slow)',
      'Cognitive Biases (Confirmation, Sunk Cost, Availability)',
      'Cognitive Behavioral Therapy (CBT) Thought Loops',
      'Locus of Control & Learned Optimism',
      'Jungian Shadow Integration & Persona Dynamics',
    ],
    recommendedResources: [
      'Thinking, Fast and Slow by Daniel Kahneman',
      'Influence: The Psychology of Persuasion by Robert Cialdini',
      'Man\'s Search for Meaning by Viktor Frankl',
    ],
    targetWeeklyMinutes: 90,
    createdAt: '2026-11-20',
  },
  {
    id: 'field-communication',
    name: 'Communication Skills',
    category: 'Human Dynamics',
    icon: '🗣️',
    color: '#f59e0b', // amber
    description: 'High-stakes dialogue, the Minto pyramid principle, tactical empathy, active listening & storytelling',
    coreTopics: [
      'The Minto Pyramid Principle (Lead with the answer)',
      'Tactical Empathy & Calibrated "How/What" Questions',
      'Vocal Tonality, Pacing & Strategic Silence',
      'Crucial Conversations in High-Conflict Moments',
      'Narrative Arc & Persuasive Storytelling',
    ],
    recommendedResources: [
      'Never Split the Difference by Chris Voss',
      'Crucial Conversations by Kerry Patterson',
      'Made to Stick by Chip & Dan Heath',
    ],
    targetWeeklyMinutes: 60,
    createdAt: '2026-11-20',
  },
  {
    id: 'field-relationships',
    name: 'Relationship Knowledge',
    category: 'Human Dynamics',
    icon: '❤️',
    color: '#f43f5e', // rose
    description: 'Attachment theory, nonviolent communication, healthy boundaries & interpersonal emotional intelligence',
    coreTopics: [
      'Adult Attachment Styles (Secure, Anxious, Avoidant)',
      'Nonviolent Communication (Observations, Feelings, Needs, Requests)',
      'The Gottman 4 Horsemen & Antidotes',
      'Differentiating Boundaries from Ultimatums',
      'Emotional Bids & Micro-Attunement',
    ],
    recommendedResources: [
      'Attached by Amir Levine & Rachel Heller',
      'Nonviolent Communication by Marshall Rosenberg',
      'The Seven Principles for Making Marriage Work by John Gottman',
    ],
    targetWeeklyMinutes: 60,
    createdAt: '2026-11-20',
  },
  {
    id: 'field-breathwork',
    name: 'Breathwork & Pranayama',
    category: 'Body & Vitality',
    icon: '🫁',
    color: '#14b8a6', // teal
    description: 'Autonomic nervous system regulation, physiological sigh, box breathing & CO2 tolerance for calm focus',
    coreTopics: [
      'Physiological Sigh (Double inhale + long exhale for instant reset)',
      'Box Breathing (4-4-4-4 Navy SEAL Focus)',
      'Coherence Resonant Breathing (5.5s Inhale / 5.5s Exhale)',
      '4-7-8 Parasympathetic Vagal Nerve Activation',
      'Nasal vs Mouth Breathing & Nitric Oxide Production',
    ],
    recommendedResources: [
      'Breath: The New Science of a Lost Art by James Nestor',
      'The Oxygen Advantage by Patrick McKeown',
      'Huberman Lab: Optimal Breathing Tools',
    ],
    targetWeeklyMinutes: 60,
    createdAt: '2026-11-20',
  },
  {
    id: 'field-gametheory',
    name: 'Game Theory',
    category: 'Strategic Thinking',
    icon: '♟️',
    color: '#6366f1', // indigo
    description: 'Mathematical strategic interaction, Nash equilibrium, Prisoner\'s dilemma & positive-sum cooperation',
    coreTopics: [
      'Prisoner\'s Dilemma & Repeated Tit-for-Tat Strategy',
      'Nash Equilibrium in Pure & Mixed Strategies',
      'Zero-Sum vs Positive-Sum (Win-Win) Frameworks',
      'Credible Threats, Commitments & Burning Bridges',
      'Signaling Theory & Information Asymmetry',
    ],
    recommendedResources: [
      'The Evolution of Cooperation by Robert Axelrod',
      'Thinking Strategically by Avinash Dixit & Barry Nalebuff',
      'The Art of Strategy by Dixit & Nalebuff',
    ],
    targetWeeklyMinutes: 90,
    createdAt: '2026-11-20',
  },
];

export function loadLifeFields(): LifeField[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LIFE_FIELDS);
    if (!data) {
      saveLifeFields(INITIAL_LIFE_FIELDS);
      return INITIAL_LIFE_FIELDS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_LIFE_FIELDS;
  }
}

export function saveLifeFields(fields: LifeField[]): void {
  localStorage.setItem(STORAGE_KEYS.LIFE_FIELDS, JSON.stringify(fields));
}

export function loadFieldLogs(): FieldLog[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FIELD_LOGS);
    if (!data) {
      saveFieldLogs([]);
      return [];
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveFieldLogs(logs: FieldLog[]): void {
  localStorage.setItem(STORAGE_KEYS.FIELD_LOGS, JSON.stringify(logs));
}

export function exportBackupJSON(): string {
  const data = {
    version: '1.1',
    exportedAt: new Date().toISOString(),
    subjects: loadSubjects(),
    studyLogs: loadStudyLogs(),
    supplements: loadSupplements(),
    supplementLogs: loadSupplementLogs(),
    notes: loadNotes(),
    reminders: loadReminders(),
    lifeFields: loadLifeFields(),
    fieldLogs: loadFieldLogs(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupJSON(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.subjects) saveSubjects(parsed.subjects);
    if (parsed.studyLogs) saveStudyLogs(parsed.studyLogs);
    if (parsed.supplements) saveSupplements(parsed.supplements);
    if (parsed.supplementLogs) saveSupplementLogs(parsed.supplementLogs);
    if (parsed.notes) saveNotes(parsed.notes);
    if (parsed.reminders) saveReminders(parsed.reminders);
    if (parsed.lifeFields) saveLifeFields(parsed.lifeFields);
    if (parsed.fieldLogs) saveFieldLogs(parsed.fieldLogs);
    return true;
  } catch (err) {
    console.error('Import failed', err);
    return false;
  }
}
