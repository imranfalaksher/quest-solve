import { SampleDoc } from '../types/quiz';

export const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    id: 'neuroscience_cellular',
    title: 'Foundations of Cognitive Neuroscience & Neural Plasticity',
    category: 'Biomedical Science',
    summary: 'Synaptic transmission, long-term potentiation (LTP), dendritic spine remodeling, and neural circuits governing executive function.',
    estimatedPages: 38,
    sampleQuestions: [
      {
        id: 'neuro_1',
        questionNumber: 1,
        question: 'Which molecular mechanism is primarily responsible for the early phase of Long-Term Potentiation (LTP) in hippocampal CA1 neurons?',
        options: [
          { id: 'A', text: 'De novo synthesis of nuclear transcription factors and mRNA translocation' },
          { id: 'B', text: 'Insertion of AMPA receptors into the postsynaptic membrane via CaMKII activation' },
          { id: 'C', text: 'Inhibition of retrograde nitric oxide signaling across the synaptic cleft' },
          { id: 'D', text: 'Endocytosis and degradation of NMDA receptor subunits NR2B' }
        ],
        correctAnswer: 'B',
        explanation: 'In the early phase of LTP, high-frequency stimulation triggers calcium influx through NMDA receptors, activating calcium/calmodulin-dependent protein kinase II (CaMKII). CaMKII phosphorylates existing AMPA receptors and drives the translocation/insertion of reserve AMPA receptors into the postsynaptic density, increasing synaptic sensitivity.',
        topicTag: 'Synaptic Plasticity',
        difficulty: 'medium'
      },
      {
        id: 'neuro_2',
        questionNumber: 2,
        question: 'A patient with localized damage to the ventromedial prefrontal cortex (vmPFC) is evaluated on the Iowa Gambling Task. Which deficit would be most typically observed?',
        options: [
          { id: 'A', text: 'Inability to comprehend verbal instructions regarding probability pay-offs' },
          { id: 'B', text: 'Loss of retrograde autobiographical episodic memory older than three years' },
          { id: 'C', text: 'Continued selection of high-risk decks with immediate large gains despite severe cumulative net losses' },
          { id: 'D', text: 'Intact anticipatory skin conductance responses (SCR) before drawing from risky decks' }
        ],
        correctAnswer: 'C',
        explanation: 'According to Antonio Damasio’s somatic marker hypothesis, patients with bilateral vmPFC damage fail to generate anticipatory somatic markers (e.g. skin conductance elevations) signaling risk. Consequently, they remain insensitive to future consequences and persistently choose advantageous immediate reward decks that carry catastrophic long-term penalties.',
        topicTag: 'Executive Function & Decision Making',
        difficulty: 'hard'
      },
      {
        id: 'neuro_3',
        questionNumber: 3,
        question: 'Why does magnesium (Mg2+) act as a voltage-dependent gatekeeper for the NMDA receptor at resting membrane potential?',
        options: [
          { id: 'A', text: 'Magnesium competitively binds the glutamate co-agonist glycine site' },
          { id: 'B', text: 'Electrostatic attraction draws hydrated Mg2+ ions deep into the channel pore, physically occluding ion flux until depolarization' },
          { id: 'C', text: 'Magnesium stimulates presynaptic GABA synthesis, keeping the neuron hyperpolarized' },
          { id: 'D', text: 'Magnesium irreversibly cleaves the extracellular ligand-binding domain' }
        ],
        correctAnswer: 'B',
        explanation: 'At negative resting potentials (around -70 mV), extracellular Mg2+ ions are drawn into the outer vestibule of the NMDA channel pore by the electrical gradient, lodging tightly and blocking ion passage even if glutamate is bound. Only when the postsynaptic cell is depolarized (e.g., via AMPA receptor activation to around -30 mV) is Mg2+ electrostatically expelled, permitting Ca2+ and Na+ entry.',
        topicTag: 'Neurotransmission',
        difficulty: 'medium'
      },
      {
        id: 'neuro_4',
        questionNumber: 4,
        question: 'Which glial cell type is primarily responsible for forming myelin sheaths around axons in the Central Nervous System (CNS)?',
        options: [
          { id: 'A', text: 'Schwann cells' },
          { id: 'B', text: 'Microglia' },
          { id: 'C', text: 'Oligodendrocytes' },
          { id: 'D', text: 'Protoplasmic astrocytes' }
        ],
        correctAnswer: 'C',
        explanation: 'Oligodendrocytes extend multiple cytoplasmic processes that wrap around several distinct axons to form myelin sheaths in the Central Nervous System. In contrast, Schwann cells myelinate axons exclusively in the Peripheral Nervous System (PNS), typically myelinating only a single axon segment per cell.',
        topicTag: 'Neuroanatomy',
        difficulty: 'easy'
      },
      {
        id: 'neuro_5',
        questionNumber: 5,
        question: 'In long-term depression (LTD) at cerebellar parallel fiber-Purkinje cell synapses, what is the crucial trigger?',
        options: [
          { id: 'A', text: 'Coincident activation of climbing fibers and parallel fibers triggering IP3-mediated calcium release and PKC activation' },
          { id: 'B', text: 'Selective blockade of metabotropic glutamate receptors (mGluR1)' },
          { id: 'C', text: 'Overexpression of tyrosine hydroxylase in Purkinje cell dendrites' },
          { id: 'D', text: 'Massive presynaptic depletion of acetylcholine vesicles' }
        ],
        correctAnswer: 'A',
        explanation: 'Cerebellar LTD requires simultaneous input from parallel fibers (activating mGluR1 and generating DAG/IP3) and climbing fibers (causing strong depolarization and calcium influx through voltage-gated channels). The combined calcium spike and DAG activate protein kinase C (PKC), leading to clathrin-mediated internalization of AMPA receptors.',
        topicTag: 'Synaptic Plasticity',
        difficulty: 'hard'
      },
      {
        id: 'neuro_6',
        questionNumber: 6,
        question: 'Which neurotransmitter is synthesized directly from dopamine by the enzyme dopamine beta-hydroxylase?',
        options: [
          { id: 'A', text: 'Serotonin (5-HT)' },
          { id: 'B', text: 'Norepinephrine (Noradrenaline)' },
          { id: 'C', text: 'Gamma-aminobutyric acid (GABA)' },
          { id: 'D', text: 'Acetylcholine' }
        ],
        correctAnswer: 'B',
        explanation: 'In the catecholamine biosynthetic pathway: Tyrosine is converted to L-DOPA by tyrosine hydroxylase, which is decarboxylated to Dopamine. Dopamine is then converted into Norepinephrine inside synaptic vesicles by dopamine beta-hydroxylase.',
        topicTag: 'Neurochemistry',
        difficulty: 'easy'
      },
      {
        id: 'neuro_7',
        questionNumber: 7,
        question: 'What is the functional role of the arcuate fasciculus connecting Wernicke’s and Broca’s areas?',
        options: [
          { id: 'A', text: 'Inhibiting emotional prosody generated in the right temporal lobe' },
          { id: 'B', text: 'Transmitting phonetic and linguistic representations from posterior comprehension centers to frontal motor speech output' },
          { id: 'C', text: 'Relaying primary visual input from the lateral geniculate nucleus to the primary visual cortex' },
          { id: 'D', text: 'Modulating voluntary saccadic eye movements during reading' }
        ],
        correctAnswer: 'B',
        explanation: 'The arcuate fasciculus is a prominent white matter tract that links Wernicke’s area (auditory comprehension) to Broca’s area (speech planning/articulation). Lesions to this bundle classically produce conduction aphasia, characterized by fluent speech and good comprehension but marked difficulty with repetition.',
        topicTag: 'Language & Cognitive Systems',
        difficulty: 'medium'
      },
      {
        id: 'neuro_8',
        questionNumber: 8,
        question: 'During the absolute refractory period of a neuronal action potential, why is it physiologically impossible to initiate a subsequent action potential?',
        options: [
          { id: 'A', text: 'Voltage-gated potassium channels are irreversibly blocked by intracellular ATP' },
          { id: 'B', text: 'Voltage-gated sodium channel inactivation gates (h-gates) remain closed and cannot reopen until membrane repolarization' },
          { id: 'C', text: 'The sodium-potassium ATPase pump runs in reverse, flooding the cytoplasm with extracellular Na+' },
          { id: 'D', text: 'Extracellular calcium concentrations drop to zero within the synaptic cleft' }
        ],
        correctAnswer: 'B',
        explanation: 'Following opening at threshold, voltage-gated Na+ channels rapidly inactivate via their intracellular inactivation loop (ball-and-chain mechanism). In this inactivated state, no stimulus magnitude can reopen the channel until the membrane repolarizes sufficiently for the channel to reset into its closed resting configuration.',
        topicTag: 'Cellular Neurophysiology',
        difficulty: 'medium'
      },
      {
        id: 'neuro_9',
        questionNumber: 9,
        question: 'Which brain region exhibits adult neurogenesis that is functionally implicated in pattern separation and memory consolidation?',
        options: [
          { id: 'A', text: 'Dentate gyrus of the hippocampus' },
          { id: 'B', text: 'Globus pallidus internus' },
          { id: 'C', text: 'Purkinje cell layer of the cerebellum' },
          { id: 'D', text: 'Primary motor cortex layer V' }
        ],
        correctAnswer: 'A',
        explanation: 'The subgranular zone (SGZ) of the hippocampal dentate gyrus is one of the verified neurogenic niches in the mammalian adult brain. Newly generated granule cells integrate into existing circuits and play a vital role in fine discrimination between similar contexts (pattern separation).',
        topicTag: 'Neural Plasticity & Learning',
        difficulty: 'medium'
      },
      {
        id: 'neuro_10',
        questionNumber: 10,
        question: 'Which intracellular messenger cascade is activated by beta-adrenergic receptor stimulation in hippocampal neurons during emotional memory arousal?',
        options: [
          { id: 'A', text: 'Gs protein activation -> Adenylyl cyclase -> cyclic AMP (cAMP) -> Protein Kinase A (PKA)' },
          { id: 'B', text: 'Gi protein stimulation -> Phospholipase C beta -> IP3 down-regulation' },
          { id: 'C', text: 'Guanylyl cyclase stimulation -> cGMP -> Protein Kinase G (PKG) inhibition' },
          { id: 'D', text: 'Direct binding to potassium leak channels causing immediate hyperpolarization' }
        ],
        correctAnswer: 'A',
        explanation: 'Beta-adrenergic receptors couple to the heterotrimeric G-protein subunit Gs, which stimulates adenylyl cyclase to convert ATP to cyclic AMP (cAMP). Elevated cAMP binds the regulatory subunits of PKA, freeing catalytic subunits to phosphorylate AMPA receptors (e.g. GluA1 at Ser845) and CREB, enhancing synaptic efficacy and memory storage.',
        topicTag: 'Cellular Signaling',
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'distributed_systems',
    title: 'Distributed Systems, Cloud Architecture & Fault Tolerance',
    category: 'Computer Science',
    summary: 'Consensus protocols (Raft, Paxos), CAP theorem trade-offs, vector clocks, distributed transactions, and partition recovery.',
    estimatedPages: 44,
    sampleQuestions: [
      {
        id: 'ds_1',
        questionNumber: 1,
        question: 'Under the CAP Theorem, when an unavoidable network partition (P) occurs between two data centers, what fundamental trade-off must a distributed database make?',
        options: [
          { id: 'A', text: 'Trade off partition tolerance for cryptographic durability' },
          { id: 'B', text: 'Choose between Availability (answering stale data) and Consistency (returning an error or blocking writes)' },
          { id: 'C', text: 'Convert from asynchronous replication to multi-threaded SQLite storage' },
          { id: 'D', text: 'Guarantee zero latency while sacrificing disk persistence' }
        ],
        correctAnswer: 'B',
        explanation: 'Since network partitions in real-world distributed networks are inevitable physical occurrences (P cannot be dropped), the system must choose between: CP (rejecting writes or blocking until partition heals to maintain strict linearizability) or AP (allowing writes/reads on both sides to remain available, accepting temporary inconsistency).',
        topicTag: 'CAP Theorem & Consistency Models',
        difficulty: 'medium'
      },
      {
        id: 'ds_2',
        questionNumber: 2,
        question: 'In the Raft consensus algorithm, how does a candidate node prevent split-vote deadlocks during leader elections?',
        options: [
          { id: 'A', text: 'By utilizing randomized election timeouts (e.g., between 150ms and 300ms) for each node' },
          { id: 'B', text: 'By delegating leader selection to an external hardware atomic clock' },
          { id: 'C', text: 'By forcing the candidate with the highest IP address to automatically win' },
          { id: 'D', text: 'By requiring unanimous approval from all cluster nodes including failed nodes' }
        ],
        correctAnswer: 'A',
        explanation: 'Raft uses randomized election timeouts (typically 150–300 ms). This ensures that in almost all cases, a single follower’s timer will expire first, allowing it to transition to candidate and broadcast RequestVote RPCs before other nodes time out, minimizing simultaneous split votes.',
        topicTag: 'Consensus Protocols (Raft)',
        difficulty: 'medium'
      },
      {
        id: 'ds_3',
        questionNumber: 3,
        question: 'Why are Lamport logical timestamps alone insufficient to detect whether two events are causally dependent or concurrent?',
        options: [
          { id: 'A', text: 'Lamport timestamps do not handle clock drift in physical crystal oscillators' },
          { id: 'B', text: 'If L(a) < L(b), event a did not necessarily cause b; they may be concurrent. Vector clocks are required to establish true partial ordering' },
          { id: 'C', text: 'Lamport timestamps only work on single-core CPU architectures' },
          { id: 'D', text: 'Lamport clocks require an active GPS satellite lock for synchronization' }
        ],
        correctAnswer: 'B',
        explanation: 'With Lamport clocks, if event a causally precedes b (a -> b), then L(a) < L(b). However, the converse is not true: L(a) < L(b) does NOT imply that a caused b; they might be completely independent concurrent events. Vector clocks store a vector of clocks across all nodes, enabling exact causal order and concurrency detection.',
        topicTag: 'Logical Clocks & Concurrency',
        difficulty: 'hard'
      },
      {
        id: 'ds_4',
        questionNumber: 4,
        question: 'What is the primary vulnerability of the classic Two-Phase Commit (2PC) protocol in distributed databases?',
        options: [
          { id: 'A', text: 'It cannot serialize read operations across secondary replicas' },
          { id: 'B', text: 'It is a blocking protocol: if the Coordinator crashes during the prepare phase after participants vote YES, participants remain blocked indefinitely holding locks' },
          { id: 'C', text: 'It only supports single-node in-memory hash tables' },
          { id: 'D', text: 'It violates the ACID durability property upon successful commit' }
        ],
        correctAnswer: 'B',
        explanation: '2PC is notorious for blocking. Once participants respond "YES" in Phase 1, they surrender autonomy and must wait for the Coordinator’s Phase 2 "COMMIT" or "ABORT" directive. If the coordinator crashes before sending this message, participants are left hanging indefinitely with acquired row locks, causing cascading resource starvation.',
        topicTag: 'Distributed Transactions',
        difficulty: 'medium'
      },
      {
        id: 'ds_5',
        questionNumber: 5,
        question: 'In a distributed hash ring (Consistent Hashing), what occurs when a single storage node fails or is removed from an N-node cluster?',
        options: [
          { id: 'A', text: 'All keys in the entire cluster must be rehashed across the remaining nodes' },
          { id: 'B', text: 'Only roughly K/N keys (where K is total keys) must be relocated to the immediate clockwise successor node' },
          { id: 'C', text: 'The entire hash ring collapses and requires a master node reboot' },
          { id: 'D', text: 'Keys stored on other nodes are automatically converted into binary trees' }
        ],
        correctAnswer: 'B',
        explanation: 'In consistent hashing, the keys and nodes are mapped to points on a circular ring. When a node leaves the system, only the keys that were assigned to that specific node are re-assigned to its next clockwise neighbor. The vast majority of keys residing on other nodes remain completely undisturbed.',
        topicTag: 'Distributed Caching & Sharding',
        difficulty: 'easy'
      }
    ]
  },
  {
    id: 'macroeconomics_policy',
    title: 'Macroeconomic Dynamics, Inflation & Central Bank Policy',
    category: 'Economics & Finance',
    summary: 'Monetary policy transmission mechanisms, Taylor rule formulation, Phillips curve shifts, and sovereign debt dynamics.',
    estimatedPages: 32,
    sampleQuestions: [
      {
        id: 'econ_1',
        questionNumber: 1,
        question: 'According to Milton Friedman and Edmund Phelps’ expectations-augmented Phillips Curve, what happens in the long run if a central bank attempts to maintain unemployment below the natural rate (NAIRU)?',
        options: [
          { id: 'A', text: 'Unemployment remains permanently lower with stable zero inflation' },
          { id: 'B', text: 'Inflation continuously accelerates as workers and firms revise upward their inflation expectations, returning unemployment to NAIRU' },
          { id: 'C', text: 'Real wages permanently surge, expanding aggregate supply indefinitely' },
          { id: 'D', text: 'The velocity of money drops to zero, causing immediate deflationary depression' }
        ],
        correctAnswer: 'B',
        explanation: 'In the long run, the Phillips curve is vertical at the Natural Rate of Unemployment (NAIRU). If monetary policy attempts to force unemployment below NAIRU through expansionary stimulus, workers recognize the decline in real purchasing power and demand higher nominal wages, causing an upward shift in the short-run Phillips curve and spiraling inflation without lasting employment gains.',
        topicTag: 'Phillips Curve & Inflation Dynamics',
        difficulty: 'medium'
      },
      {
        id: 'econ_2',
        questionNumber: 2,
        question: 'Under the standard Taylor Rule, what does the "Taylor Principle" require central banks to do when inflation rises by 1 percentage point above target?',
        options: [
          { id: 'A', text: 'Increase the nominal policy interest rate by more than 1 percentage point (coefficient > 1.0) to raise the real interest rate' },
          { id: 'B', text: 'Decrease nominal interest rates to stimulate corporate capital expenditures' },
          { id: 'C', text: 'Expand the monetary base through quantitative easing' },
          { id: 'D', text: 'Maintain nominal rates unchanged and rely solely on statutory reserve requirements' }
        ],
        correctAnswer: 'A',
        explanation: 'The Taylor Principle states that the monetary authority must adjust nominal interest rates more than one-for-one with changes in inflation (typically with a coefficient of 1.5). This ensures that the REAL interest rate (r = i - pi) rises, dampening aggregate demand and stabilizing inflationary pressures.',
        topicTag: 'Monetary Policy Rules',
        difficulty: 'medium'
      },
      {
        id: 'econ_3',
        questionNumber: 3,
        question: 'In the Mundell-Fleming model with perfect capital mobility and a flexible exchange rate, why is expansionary fiscal policy ineffective at raising domestic output (Y)?',
        options: [
          { id: 'A', text: 'Higher government borrowing reduces the money supply through the discount window' },
          { id: 'B', text: 'Increased government spending puts upward pressure on domestic interest rates, attracting capital inflows, appreciating the currency, and crowding out net exports dollar-for-dollar' },
          { id: 'C', text: 'Flexible exchange rates mandate automatic fiscal budget balancing' },
          { id: 'D', text: 'Foreign investors refuse to purchase domestic sovereign bonds' }
        ],
        correctAnswer: 'B',
        explanation: 'In a small open economy with floating exchange rates and mobile capital, fiscal expansion shifts IS outward, putting upward pressure on domestic interest rates. Capital flows into the country seeking higher returns, driving up demand for domestic currency. The resultant currency appreciation makes exports more expensive and imports cheaper, completely crowding out net exports (NX) until income returns to initial levels.',
        topicTag: 'Open Economy Macroeconomics',
        difficulty: 'hard'
      },
      {
        id: 'econ_4',
        questionNumber: 4,
        question: 'What is a "Liquidity Trap" in Keynesian macroeconomic theory?',
        options: [
          { id: 'A', text: 'A condition where commercial banks are legally prohibited from lending reserves to the private sector' },
          { id: 'B', text: 'A situation where short-term nominal interest rates approach the zero lower bound, and money demand becomes virtually infinitely elastic, rendering standard monetary expansion ineffective' },
          { id: 'C', text: 'A sudden freeze in short-term commercial paper markets during sovereign debt crises' },
          { id: 'D', text: 'A scenario where high hyperinflation makes physical cash worthless' }
        ],
        correctAnswer: 'B',
        explanation: 'In a liquidity trap, nominal interest rates hit or approach zero. At this point, holding money carries essentially zero opportunity cost compared to bonds. Any additional liquidity injected by the central bank is absorbed into idle balances rather than stimulating investment or lowering borrowing costs, rendering conventional open market operations powerless.',
        topicTag: 'Keynesian Economics & Monetary Policy',
        difficulty: 'medium'
      },
      {
        id: 'econ_5',
        questionNumber: 5,
        question: 'Under Ricardian Equivalence, how do forward-looking rational households react to a deficit-financed tax cut?',
        options: [
          { id: 'A', text: 'They immediately spend the entire tax cut on consumer durables, creating a massive multiplier effect' },
          { id: 'B', text: 'They save the entire tax cut because they anticipate future higher taxes will be levied to repay the accumulated government debt' },
          { id: 'C', text: 'They convert their domestic currency holdings into foreign equities' },
          { id: 'D', text: 'They withdraw from the formal labor market to avoid future bracket creep' }
        ],
        correctAnswer: 'B',
        explanation: 'Proposed by David Ricardo and formalized by Robert Barro, Ricardian Equivalence posits that if agents are rational and forward-looking, they realize that government debt issued today to finance tax cuts must be serviced with higher taxes in the future. Consequently, permanent income is unchanged, and households save the windfall to offset future liabilities rather than increasing consumption.',
        topicTag: 'Fiscal Policy & Debt Dynamics',
        difficulty: 'hard'
      }
    ]
  }
];
