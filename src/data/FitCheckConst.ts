export interface WeightVector {
  tech: number;       
  vision: number;     
  velocity: number;   
  experience: number; 
  affinity: number;   
}

export interface WeightedOption {
  text: string;
  weight: WeightVector;
}

export interface Question {
  id: string;
  text: string;
  options: WeightedOption[];
}

export type UserBucket = 'MOBILE' | 'CREATIVE' | 'TESTING' | 'INFRA' | 'EXPERIMENTAL';

export const ROUTER_QUESTION: Question = {
  id: 'router',
  text: "What technical problem needs attention?",
  options: [
    { 
      text: "Mobile Development", 
      weight: { tech: 10, vision: 8, velocity: 6, experience: 9, affinity: 8 } 
    }, 
    { 
      text: "Creative Web Experiences", 
      weight: { tech: 9, vision: 10, velocity: 7, experience: 7, affinity: 10 } 
    },
    { 
      text: "Testing and Delivery", 
      weight: { tech: 8, vision: 5, velocity: 10, experience: 10, affinity: 7 } 
    },
    { 
      text: "Digital Infrastructure", 
      weight: { tech: 9, vision: 6, velocity: 7, experience: 10, affinity: 8 } 
    },
    { 
      text: "Experimental Prototypes", 
      weight: { tech: 8, vision: 10, velocity: 9, experience: 8, affinity: 9 } 
    }
  ]
};

export const QUESTION_BANK: Record<UserBucket, Question[]> = {
  MOBILE: [
    { 
      id: 'mob_env', 
      text: "Operating environment & architecture:", 
      options: [
        { text: "Native Android & Field Hardware / ATAK", weight: { tech: 10, vision: 8, velocity: 6, experience: 10, affinity: 10 } },
        { text: "Cross-Platform Frameworks (React Native, Ionic)", weight: { tech: 8, vision: 6, velocity: 9, experience: 8, affinity: 7 } }, 
        { text: "IoT Hardware & Peripheral Communication", weight: { tech: 9, vision: 9, velocity: 7, experience: 9, affinity: 9 } }
      ]
    },
    { 
      id: 'mob_connectivity', 
      text: "Data synchronization requirements:", 
      options: [
        { text: "Offline-First / Tactical Mesh / UDP", weight: { tech: 10, vision: 9, velocity: 5, experience: 10, affinity: 10 } },
        { text: "Real-time WebSockets / Push Notifications", weight: { tech: 7, vision: 7, velocity: 8, experience: 8, affinity: 7 } },
        { text: "Standard REST / OpenAPI Integration", weight: { tech: 6, vision: 5, velocity: 10, experience: 9, affinity: 6 } }
      ]
    }
  ],
  CREATIVE: [
    { 
      id: 'cr_engine', 
      text: "Visual presentation architecture:", 
      options: [
        { text: "Spatial 3D / WebGL / Three.js / R3F", weight: { tech: 10, vision: 10, velocity: 7, experience: 6, affinity: 10 } },
        { text: "Data-Dense Dashboards & Reactive UI", weight: { tech: 8, vision: 7, velocity: 9, experience: 7, affinity: 6 } },
        { text: "Procedural Shaders & Animation Pipelines", weight: { tech: 7, vision: 10, velocity: 6, experience: 4, affinity: 9 } }
      ]
    },
    { 
      id: 'cr_state', 
      text: "Client state execution layer:", 
      options: [
        { text: "In-Browser WebAssembly / Local-First Database", weight: { tech: 10, vision: 10, velocity: 7, experience: 6, affinity: 10 } },
        { text: "Reactive Client State (Zustand, Redux)", weight: { tech: 7, vision: 6, velocity: 9, experience: 7, affinity: 6 } },
        { text: "Direct Server-Rendered UI", weight: { tech: 6, vision: 4, velocity: 8, experience: 8, affinity: 5 } }
      ]
    }
  ],
  TESTING: [
    { 
      id: 'qa_focus', 
      text: "Primary quality bottleneck:", 
      options: [
        { text: "Test automation pipeline needs architecture (0 to 1)", weight: { tech: 10, vision: 8, velocity: 7, experience: 10, affinity: 9 } },
        { text: "CI/CD builds & execution cycles are too slow", weight: { tech: 8, vision: 6, velocity: 10, experience: 10, affinity: 8 } },
        { text: "Security, compliance & vulnerability auditing (SAST/DAST)", weight: { tech: 9, vision: 7, velocity: 6, experience: 9, affinity: 8 } }
      ]
    },
    { 
      id: 'qa_cadence', 
      text: "Deployment model and release risk:", 
      options: [
        { text: "Multi-team coordination across frequent release trains", weight: { tech: 10, vision: 10, velocity: 9, experience: 10, affinity: 5 } },
        { text: "Flaky integration testing causing production rollbacks", weight: { tech: 9, vision: 10, velocity: 10, experience: 10, affinity: 6 } },
        { text: "Legacy system regression verification", weight: { tech: 8, vision: 3, velocity: 8, experience: 10, affinity: 4 } }
      ]
    }
  ],
  INFRA: [
    { 
      id: 'inf_domain', 
      text: "Infrastructure domain context:", 
      options: [
        { text: "Physical/Digital Interoperability (Robotics / Warehousing)", weight: { tech: 10, vision: 9, velocity: 6, experience: 10, affinity: 5 } },
        { text: "High-Availability Distributed Systems (99.9%+ target)", weight: { tech: 10, vision: 7, velocity: 6, experience: 10, affinity: 7 } },
        { text: "Enterprise Integration & API Orchestration", weight: { tech: 8, vision: 6, velocity: 10, experience: 10, affinity: 5 } }
      ]
    },
    { 
      id: 'inf_deployment', 
      text: "Deployment target & environment:", 
      options: [
        { text: "Embedded Linux & Edge Hardware", weight: { tech: 10, vision: 8, velocity: 6, experience: 9, affinity: 10 } },
        { text: "Cloud Systems & CI/CD Pipelines (AWS, Azure)", weight: { tech: 8, vision: 7, velocity: 7, experience: 9, affinity: 6 } },
        { text: "Multi-Facility On-Premise Network Infrastructure", weight: { tech: 9, vision: 10, velocity: 10, experience: 10, affinity: 8 } }
      ]
    }
  ],
  EXPERIMENTAL: [
    { 
      id: 'exp_nature', 
      text: "Nature of the exploratory project:", 
      options: [
        { text: "Novel architecture with unproven technical feasibility", weight: { tech: 10, vision: 10, velocity: 7, experience: 9, affinity: 10 } },
        { text: "Rapid proof-of-concept prototype to prove value", weight: { tech: 8, vision: 9, velocity: 10, experience: 9, affinity: 9 } },
        { text: "Porting complex legacy systems into modern runtimes", weight: { tech: 9, vision: 7, velocity: 6, experience: 9, affinity: 10 } }
      ]
    },
    { 
      id: 'exp_governance', 
      text: "Working constraints:", 
      options: [
        { text: "Direct R&D with high ambiguity and autonomous direction", weight: { tech: 9, vision: 10, velocity: 8, experience: 9, affinity: 10 } },
        { text: "Cross-functional bridge between software and hardware teams", weight: { tech: 9, vision: 8, velocity: 8, experience: 10, affinity: 9 } },
        { text: "Tight timeline requiring immediate initial output", weight: { tech: 8, vision: 7, velocity: 10, experience: 8, affinity: 6 } }
      ]
    }
  ]
};

export const RESULT_MATRIX: Record<UserBucket | 'DEFAULT', Record<keyof WeightVector, string>> = {
  MOBILE: {
    tech: "Ported Mobile Applications from React Native to Native Android and engineered ATAK plugins connecting field IoT devices.",
    vision: "Architected interfaces for edge hardware where real-time situational awareness is non-negotiable.",
    velocity: "Built automated GitHub Actions pipelines to turn multi-repo mobile builds into fast release artifacts.",
    experience: "Track record spans native Android, React Native, and embedded Linux field hardware deployments.",
    affinity: "Belief that edge devices should function reliably under zero-connectivity conditions."
  },
  CREATIVE: {
    tech: "Delivers production WebGL, Three.js, and client-side WASM architectures with zero-dependency backends.",
    vision: "Builds spatial interfaces and interactive graphics that communicate technical data intuitively.",
    velocity: "Iterates rapidly from shader and geometry prototypes to production React applications.",
    experience: "Combines 10+ years of backend engineering discipline with modern 3D browser graphics.",
    affinity: "Treats the web browser as an interactive graphics runtime rather than a static document viewer."
  },
  TESTING: {
    tech: "Architected frameworks with Selenium, Appium, and AWS CodePipe that improved test efficiency by 40%.",
    vision: "Implemented CodeQL, ZAP, and Burp Suite scanning to reduce compliance audit cycles by 20%.",
    velocity: "Engineered automated component testing pipelines that cut testing execution time by 30%.",
    experience: "Managed over 200 releases across 3 agile teams and reduced release failures by 10% through churn tracking.",
    affinity: "Treats automated verification as a core system deliverable, not an afterthought."
  },
  INFRA: {
    tech: "Maintained 99.9% uptime across 20 production sites and deployed networking for 100,000 end users.",
    vision: "Managed system integrations for automated retrieval systems, reducing warehousing execution cycles by 20%.",
    velocity: "Spearheaded Factory Acceptance Testing (F.A.T.) events across 8 automated warehousing facilities.",
    experience: "Proven systems delivery across data centers, robotics integrations, and enterprise cloud networks.",
    affinity: "Focuses on the durable foundation: stability, observability, and deterministic behavior under load."
  },
  EXPERIMENTAL: {
    tech: "Engineers working prototypes across WASM, embedded Linux, and local-first peer-to-peer protocols.",
    vision: "Deconstructs ambiguous technical briefs into testable, production-ready system architectures.",
    velocity: "Built working proof-of-concepts for enterprise clients reducing delivery schedules by 25%.",
    experience: "Career-long history of stepping into undefined problems and shipping durable software.",
    affinity: "Operates comfortably at the boundary of unproven technology and real-world deployment."
  },
  DEFAULT: {
    tech: "Combines systems programming (Java, C++, SQL) with modern web and mobile platforms.",
    vision: "Translates complex system telemetry into actionable software solutions.",
    velocity: "Focuses on continuous delivery pipelines that minimize cycle time to production.",
    experience: "Experience leading system integrations, test automation frameworks, and infrastructure.",
    affinity: "Committed to delivering reliable software within budget and on schedule."
  }
};