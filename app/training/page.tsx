"use client"

import { useState } from "react"
import {
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Mail,
  LinkIcon,
  Shield,
  Trophy,
  Target,
  Brain,
  Globe,
  FileText,
  Network,
  Eye,
  Bug,
  Terminal,
  Database,
  Cloud,
  Cpu,
  Wifi,
  Fingerprint,
  Key,
  Search,
  Code,
  Activity,
  Zap,
  Server,
  HardDrive,
  Smartphone,
  Monitor,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import ContactWidget from "@/components/contact-widget"

interface TrainingModule {
  id: number
  title: string
  description: string
  duration: string
  difficulty: "beginner" | "intermediate" | "advanced"
  completed: boolean
  locked: boolean
  lessons: number
  icon: any
}

interface Lesson {
  id: number
  title: string
  content: string
  duration: string
  objectives: string[]
  key_points: string[]
}

interface Quiz {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export default function TrainingPage() {
  const [selectedModule, setSelectedModule] = useState<number | null>(null)
  const [currentLesson, setCurrentLesson] = useState<number>(0)
  const [currentQuiz, setCurrentQuiz] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [viewMode, setViewMode] = useState<'modules' | 'lesson' | 'quiz'>('modules')
  const [showContactWidget, setShowContactWidget] = useState(false)

  const modules: TrainingModule[] = [
    {
      id: 1,
      title: "Introduction to Phishing",
      description: "Learn the basics of phishing attacks and how to identify them",
      duration: "15 mins",
      difficulty: "beginner",
      completed: false,
      locked: false,
      lessons: 5,
      icon: GraduationCap,
    },
    {
      id: 2,
      title: "Email Security Best Practices",
      description: "Master email security and learn to spot suspicious messages",
      duration: "20 mins",
      difficulty: "beginner",
      completed: false,
      locked: false,
      lessons: 6,
      icon: Mail,
    },
    {
      id: 3,
      title: "URL Analysis Techniques",
      description: "Advanced techniques for analyzing and verifying URLs",
      duration: "25 mins",
      difficulty: "intermediate",
      completed: false,
      locked: false,
      lessons: 7,
      icon: LinkIcon,
    },
    {
      id: 4,
      title: "Social Engineering Tactics",
      description: "Understand psychological manipulation in cyber attacks",
      duration: "30 mins",
      difficulty: "intermediate",
      completed: false,
      locked: false,
      lessons: 8,
      icon: Target,
    },
    {
      id: 5,
      title: "Advanced Threat Detection",
      description: "Enterprise-level security protocols and incident response",
      duration: "40 mins",
      difficulty: "advanced",
      completed: false,
      locked: false,
      lessons: 10,
      icon: Shield,
    },
    {
      id: 6,
      title: "Cryptography & Key Management",
      description: "Learn encryption fundamentals and how to protect data",
      duration: "25 mins",
      difficulty: "intermediate",
      completed: false,
      locked: false,
      lessons: 8,
      icon: Lock,
    },
    {
      id: 7,
      title: "Network Security Fundamentals",
      description: "Deep dive into network protocols, firewalls, and intrusion detection",
      duration: "35 mins",
      difficulty: "intermediate",
      completed: false,
      locked: false,
      lessons: 9,
      icon: Network,
    },
    {
      id: 8,
      title: "Malware Analysis & Reverse Engineering",
      description: "Analyze malicious code, understand attack vectors, and reverse engineer threats",
      duration: "45 mins",
      difficulty: "advanced",
      completed: false,
      locked: false,
      lessons: 12,
      icon: Bug,
    },
    {
      id: 9,
      title: "Penetration Testing Methodologies",
      description: "Learn ethical hacking techniques, vulnerability assessment, and security testing",
      duration: "50 mins",
      difficulty: "advanced",
      completed: false,
      locked: false,
      lessons: 15,
      icon: Terminal,
    },
    {
      id: 10,
      title: "Cloud Security & DevSecOps",
      description: "Master cloud security, container security, and integrating security into DevOps",
      duration: "40 mins",
      difficulty: "advanced",
      completed: false,
      locked: false,
      lessons: 11,
      icon: Cloud,
    },
    {
      id: 11,
      title: "Digital Forensics & Incident Response",
      description: "Learn forensic analysis, evidence collection, and incident response procedures",
      duration: "55 mins",
      difficulty: "advanced",
      completed: false,
      locked: false,
      lessons: 14,
      icon: Search,
    },
    {
      id: 12,
      title: "Zero Trust Architecture",
      description: "Implement zero-trust security models and identity management systems",
      duration: "35 mins",
      difficulty: "advanced",
      completed: false,
      locked: false,
      lessons: 10,
      icon: Fingerprint,
    },
    {
      id: 13,
      title: "Threat Intelligence & OSINT",
      description: "Gather and analyze threat intelligence, perform open-source intelligence gathering",
      duration: "30 mins",
      difficulty: "intermediate",
      completed: false,
      locked: false,
      lessons: 8,
      icon: Eye,
    },
    {
      id: 14,
      title: "Secure Coding & Application Security",
      description: "Learn secure coding practices, OWASP Top 10, and application security testing",
      duration: "40 mins",
      difficulty: "intermediate",
      completed: false,
      locked: false,
      lessons: 11,
      icon: Code,
    },
    {
      id: 15,
      title: "Industrial Control Systems (ICS) Security",
      description: "Protect critical infrastructure, SCADA systems, and industrial networks",
      duration: "45 mins",
      difficulty: "advanced",
      completed: false,
      locked: false,
      lessons: 12,
      icon: Server,
    },
    {
      id: 16,
      title: "Data Privacy & Compliance",
      description: "GDPR, HIPAA, PCI DSS compliance and data protection regulations",
      duration: "30 mins",
      difficulty: "intermediate",
      completed: false,
      locked: false,
      lessons: 8,
      icon: Database,
    },
    {
      id: 17,
      title: "Mobile Security & IoT",
      description: "Securing mobile devices, IoT devices, and wireless networks",
      duration: "35 mins",
      difficulty: "intermediate",
      completed: false,
      locked: false,
      lessons: 10,
      icon: Smartphone,
    },
    {
      id: 18,
      title: "Business Continuity & Disaster Recovery",
      description: "Planning for business continuity and disaster recovery in cybersecurity",
      duration: "40 mins",
      difficulty: "advanced",
      completed: false,
      locked: false,
      lessons: 9,
      icon: Activity,
    }
  ]

  const lessons: Record<number, Lesson[]> = {
    1: [
      {
        id: 1,
        title: "What is Phishing?",
        content: "Phishing is a cybercrime where attackers attempt to obtain sensitive information by disguising themselves as trustworthy entities. Attackers typically send emails or messages that appear to be from legitimate companies, banks, or government agencies.",
        duration: "3 mins",
        objectives: [
          "Define phishing and its purpose",
          "Identify common phishing targets",
          "Understand the impact of phishing attacks"
        ],
        key_points: [
          "Phishing attacks aim to steal personal information",
          "Attackers use social engineering techniques",
          "Email is the most common phishing vector",
          "Phishing can lead to financial loss and identity theft"
        ]
      },
      {
        id: 2,
        title: "Types of Phishing Attacks",
        content: "There are several types of phishing attacks including email phishing, spear phishing, whaling, smishing, and vishing. Each type uses different methods to target victims.",
        duration: "3 mins",
        objectives: [
          "Differentiate between phishing attack types",
          "Identify spear phishing targets",
          "Recognize smishing and vishing attempts"
        ],
        key_points: [
          "Email phishing targets broad audiences",
          "Spear phishing targets specific individuals",
          "Whaling targets high-level executives",
          "Smishing uses SMS messages",
          "Vishing uses voice calls"
        ]
      },
      {
        id: 3,
        title: "Identifying Phishing Emails",
        content: "Learn to identify red flags in phishing emails including suspicious sender addresses, urgent language, grammatical errors, and suspicious links.",
        duration: "3 mins",
        objectives: [
          "Recognize email red flags",
          "Verify sender authenticity",
          "Identify suspicious links and attachments"
        ],
        key_points: [
          "Check sender email address carefully",
          "Look for urgent or threatening language",
          "Beware of grammatical errors and typos",
          "Hover over links to verify destinations",
          "Be cautious with unexpected attachments"
        ]
      },
      {
        id: 4,
        title: "Real-World Examples",
        content: "Examine actual phishing attempts including fake bank emails, lottery scams, and tech support fraud to understand how attackers operate.",
        duration: "3 mins",
        objectives: [
          "Analyze real phishing examples",
          "Identify common phishing patterns",
          "Learn from past phishing campaigns"
        ],
        key_points: [
          "Bank phishing asks for account verification",
          "Lottery scams promise large winnings",
          "Tech support scams create urgency",
          "Government impersonation uses authority",
          "Package delivery scams exploit curiosity"
        ]
      },
      {
        id: 5,
        title: "Protecting Yourself",
        content: "Learn best practices for protecting yourself from phishing attacks including verification, reporting, and security measures.",
        duration: "3 mins",
        objectives: [
          "Implement protective measures",
          "Verify suspicious communications",
          "Report phishing attempts properly"
        ],
        key_points: [
          "Never click suspicious links",
          "Verify requests through official channels",
          "Use two-factor authentication",
          "Keep software updated",
          "Report phishing to appropriate authorities"
        ]
      }
    ],
    2: [
      {
        id: 1,
        title: "Email Authentication",
        content: "Understanding email authentication methods like SPF, DKIM, and DMARC to verify email legitimacy and prevent spoofing.",
        duration: "3 mins",
        objectives: [
          "Explain email authentication protocols",
          "Understand SPF, DKIM, and DMARC",
          "Recognize authenticated vs unauthenticated emails"
        ],
        key_points: [
          "SPF prevents sender spoofing",
          "DKIM verifies message integrity",
          "DMARC provides policy enforcement",
          "Check authentication headers",
          "Unauthenticated emails are suspicious"
        ]
      },
      {
        id: 2,
        title: "Email Header Analysis",
        content: "Learn to analyze email headers to trace message origins and identify suspicious routing patterns.",
        duration: "4 mins",
        objectives: [
          "Read and understand email headers",
          "Identify suspicious routing paths",
          "Trace email origins effectively"
        ],
        key_points: [
          "Headers show email journey",
          "Check Received headers for routing",
          "Look for mismatched origins",
          "Identify suspicious timestamps",
          "Verify authentication results"
        ]
      },
      {
        id: 3,
        title: "Attachment Security",
        content: "Understanding dangerous file types and how to safely handle email attachments.",
        duration: "3 mins",
        objectives: [
          "Identify dangerous file types",
          "Scan attachments safely",
          "Implement attachment policies"
        ],
        key_points: [
          "EXE, SCR, and BAT files are dangerous",
          "Office documents can contain macros",
          "PDF files can have embedded scripts",
          "ZIP files can hide malware",
          "Always scan before opening"
        ]
      },
      {
        id: 4,
        title: "Link Verification",
        content: "Techniques for verifying email links and detecting malicious URLs before clicking.",
        duration: "3 mins",
        objectives: [
          "Verify link destinations safely",
          "Identify URL shortening risks",
          "Use link analysis tools"
        ],
        key_points: [
          "Hover to preview URLs",
          "Check domain spelling carefully",
          "Beware of URL shorteners",
          "Verify HTTPS certificates",
          "Use link scanning tools"
        ]
      },
      {
        id: 5,
        title: "Business Email Compromise",
        content: "Understanding BEC attacks where attackers impersonate executives to authorize fraudulent transactions.",
        duration: "4 mins",
        objectives: [
          "Recognize BEC attack patterns",
          "Verify executive requests",
          "Implement BEC protection measures"
        ],
        key_points: [
          "BEC targets financial transactions",
          "Attackers research targets extensively",
          "Requests often create urgency",
          "Always verify through other channels",
          "Implement transaction verification procedures"
        ]
      },
      {
        id: 6,
        title: "Email Security Configuration",
        content: "Configuring email clients and security settings for maximum protection against phishing.",
        duration: "3 mins",
        objectives: [
          "Configure email security settings",
          "Enable phishing filters",
          "Set up warning systems"
        ],
        key_points: [
          "Enable spam and phishing filters",
          "Configure security warnings",
          "Use email security gateways",
          "Implement quarantine systems",
          "Regular security training updates"
        ]
      }
    ],
    3: [
      {
        id: 1,
        title: "Domain Name Analysis",
        content: "Learn to analyze domain names for suspicious patterns, typosquatting, and malicious subdomains.",
        duration: "4 mins",
        objectives: [
          "Identify domain name spoofing",
          "Detect typosquatting attacks",
          "Analyze subdomain structures"
        ],
        key_points: [
          "Check for common typos in domain names",
          "Look for suspicious subdomains",
          "Verify domain registration details",
          "Check domain age and history",
          "Use domain reputation tools"
        ]
      },
      {
        id: 2,
        title: "SSL/TLS Certificate Verification",
        content: "Understanding SSL/TLS certificates and how to verify their authenticity.",
        duration: "3 mins",
        objectives: [
          "Understand SSL/TLS certificate basics",
          "Verify certificate chain of trust",
          "Identify certificate red flags"
        ],
        key_points: [
          "Check certificate validity dates",
          "Verify certificate authority",
          "Look for certificate revocation",
          "Check certificate subject details",
          "Use certificate transparency logs"
        ]
      },
      {
        id: 3,
        title: "URL Shortening Service Risks",
        content: "Understanding the risks associated with URL shortening services and how to safely expand them.",
        duration: "3 mins",
        objectives: [
          "Identify URL shortening services",
          "Understand the risks they pose",
          "Learn safe expansion methods"
        ],
        key_points: [
          "URL shorteners hide destination URLs",
          "Attackers use them for phishing",
          "Always expand before clicking",
          "Use URL expansion services",
          "Be cautious with unknown shorteners"
        ]
      },
      {
        id: 4,
        title: "Website Spoofing Detection",
        content: "Techniques for detecting fake websites that impersonate legitimate services.",
        duration: "4 mins",
        objectives: [
          "Identify website spoofing techniques",
          "Check website authenticity",
          "Verify website security features"
        ],
        key_points: [
          "Check website design and layout",
          "Verify SSL certificate",
          "Look for contact information",
          "Check website functionality",
          "Use website verification tools"
        ]
      },
      {
        id: 5,
        title: "Internationalized Domain Names (IDN)",
        content: "Understanding IDN attacks where attackers use characters from different alphabets to create deceptive domain names.",
        duration: "3 mins",
        objectives: [
          "Understand IDN concepts",
          "Identify IDN phishing attempts",
          "Learn to decode IDN domains"
        ],
        key_points: [
          "IDN allows Unicode characters in domains",
          "Attackers use similar-looking characters",
          "Check punycode encoding",
          "Use IDN decoding tools",
          "Be cautious with non-ASCII characters"
        ]
      },
      {
        id: 6,
        title: "URL Analysis Tools",
        content: "Overview of tools and services for analyzing suspicious URLs.",
        duration: "3 mins",
        objectives: [
          "Learn about URL analysis tools",
          "Understand how to use them effectively",
          "Choose the right tool for the job"
        ],
        key_points: [
          "Use online URL scanners",
          "Leverage browser security tools",
          "Check multiple sources",
          "Keep tools updated",
          "Document analysis results"
        ]
      },
      {
        id: 7,
        title: "Real-World URL Analysis",
        content: "Practical examples of analyzing suspicious URLs in real-world scenarios.",
        duration: "5 mins",
        objectives: [
          "Apply URL analysis techniques",
          "Learn from real examples",
          "Develop analysis workflows"
        ],
        key_points: [
          "Systematic approach to analysis",
          "Document findings",
          "Share threat intelligence",
          "Learn from each analysis",
          "Improve detection skills"
        ]
      }
    ],
    4: [
      {
        id: 1,
        title: "Psychological Manipulation Principles",
        content: "Understanding the psychological principles that make social engineering attacks effective.",
        duration: "4 mins",
        objectives: [
          "Understand cognitive biases",
          "Recognize manipulation tactics",
          "Learn psychological triggers"
        ],
        key_points: [
          "Authority bias makes people trust authority figures",
          "Urgency creates pressure to act quickly",
          "Fear and greed are powerful motivators",
          "Social proof influences decision making",
          "Reciprocity encourages compliance"
        ]
      },
      {
        id: 2,
        title: "Pretexting and Social Engineering",
        content: "How attackers create believable scenarios to manipulate victims.",
        duration: "4 mins",
        objectives: [
          "Understand pretexting techniques",
          "Identify common pretexts",
          "Learn to verify requests"
        ],
        key_points: [
          "Pretexting creates believable scenarios",
          "Attackers research targets extensively",
          "Common pretexts include IT support, executives",
          "Always verify through separate channels",
          "Document suspicious requests"
        ]
      },
      {
        id: 3,
        title: "Authority and Urgency Tactics",
        content: "How attackers use authority figures and time pressure to manipulate victims.",
        duration: "3 mins",
        objectives: [
          "Recognize authority exploitation",
          "Identify urgency pressure tactics",
          "Learn to resist manipulation"
        ],
        key_points: [
          "Authority figures bypass critical thinking",
          "Urgency prevents proper verification",
          "Common tactics: 'immediate action required'",
          "Always verify urgent requests",
          "Take time to think before acting"
        ]
      },
      {
        id: 4,
        title: "Emotional Manipulation",
        content: "Understanding how attackers use emotions to bypass rational thinking.",
        duration: "4 mins",
        objectives: [
          "Recognize emotional triggers",
          "Identify emotional manipulation",
          "Learn to maintain objectivity"
        ],
        key_points: [
          "Fear creates panic and poor decisions",
          "Greed leads to risky behavior",
          "Sympathy encourages compliance",
          "Anger clouds judgment",
          "Stay calm and analytical"
        ]
      },
      {
        id: 5,
        title: "Social Proof and Consensus",
        content: "How attackers use social proof and consensus to manipulate victims.",
        duration: "3 mins",
        objectives: [
          "Understand social proof principles",
          "Identify consensus manipulation",
          "Learn to think independently"
        ],
        key_points: [
          "Social proof creates false legitimacy",
          "Consensus pressure encourages compliance",
          "Attackers create fake testimonials",
          "Question popular opinions",
          "Make independent decisions"
        ]
      },
      {
        id: 6,
        title: "Insider Threat Detection",
        content: "Identifying social engineering attacks from within an organization.",
        duration: "4 mins",
        objectives: [
          "Recognize insider threat indicators",
          "Identify suspicious behavior patterns",
          "Implement insider threat controls"
        ],
        key_points: [
          "Unusual access patterns",
          "Behavioral changes",
          "Access to sensitive data",
          "Working outside normal hours",
          "Implement monitoring systems"
        ]
      },
      {
        id: 7,
        title: "Physical Security Social Engineering",
        content: "Physical tactics used in social engineering attacks.",
        duration: "3 mins",
        objectives: [
          "Recognize physical security risks",
          "Identify tailgating and surveillance",
          "Implement physical security measures"
        ],
        key_points: [
          "Tailgating follows targets",
          "Shoulder surfing exposes information",
          "Dumpster diving finds sensitive data",
          "Be aware of surroundings",
          "Secure physical access"
        ]
      },
      {
        id: 8,
        title: "Social Engineering Defense Strategies",
        content: "Comprehensive strategies for defending against social engineering attacks.",
        duration: "5 mins",
        objectives: [
          "Implement defense strategies",
          "Create security awareness",
          "Develop critical thinking"
        ],
        key_points: [
          "Verify all requests independently",
          "Question unusual requests",
          "Implement security policies",
          "Regular security training",
          "Report suspicious activity"
        ]
      }
    ],
    5: [
      {
        id: 1,
        title: "Security Information and Event Management (SIEM)",
        content: "Understanding SIEM systems for enterprise-level threat detection and response.",
        duration: "5 mins",
        objectives: [
          "Understand SIEM fundamentals",
          "Learn log collection and analysis",
          "Implement SIEM solutions"
        ],
        key_points: [
          "SIEM aggregates security event data",
          "Real-time threat detection",
          "Log correlation and analysis",
          "Automated alerting systems",
          "Security incident prioritization"
        ]
      },
      {
        id: 2,
        title: "Intrusion Detection Systems (IDS)",
        content: "Network and host-based intrusion detection for identifying security threats.",
        duration: "4 mins",
        objectives: [
          "Understand IDS types and deployment",
          "Configure detection rules",
          "Analyze IDS alerts"
        ],
        key_points: [
          "Network IDS monitors network traffic",
          "Host IDS monitors system activity",
          "Signature-based vs anomaly detection",
          "False positive management",
          "Integration with SIEM systems"
        ]
      },
      {
        id: 3,
        title: "Security Orchestration",
        content: "Automating security response through orchestration platforms.",
        duration: "4 mins",
        objectives: [
          "Understand security orchestration",
          "Implement automated responses",
          "Configure playbooks"
        ],
        key_points: [
          "Automated incident response",
          "Predefined response playbooks",
          "Integration with security tools",
          "Reduced response times",
          "Consistent security responses"
        ]
      },
      {
        id: 4,
        title: "Threat Hunting Methodologies",
        content: "Proactive threat hunting techniques to find hidden threats.",
        duration: "5 mins",
        objectives: [
          "Understand threat hunting concepts",
          "Develop hunting methodologies",
          "Implement hunting programs"
        ],
        key_points: [
          "Proactive threat detection",
          "Hypothesis-driven hunting",
          "Threat intelligence integration",
          "Advanced analytics techniques",
          "Continuous improvement"
        ]
      },
      {
        id: 5,
        title: "Incident Response Frameworks",
        content: "Industry-standard frameworks for incident response and management.",
        duration: "4 mins",
        objectives: [
          "Understand NIST incident response",
          "Implement response frameworks",
          "Create response plans"
        ],
        key_points: [
          "NIST Cybersecurity Framework",
          "Preparation, Detection, Response, Recovery",
          "Incident response team (IRT) structure",
          "Communication protocols",
          "Post-incident analysis"
        ]
      },
      {
        id: 6,
        title: "Advanced Threat Actors",
        content: "Understanding advanced persistent threats and attack groups.",
        duration: "5 mins",
        objectives: [
          "Identify APT characteristics",
          "Understand attack group motivations",
          "Analyze attack techniques"
        ],
        key_points: [
          "Long-term, targeted attacks",
          "Advanced attack techniques",
          "Resourceful and persistent",
          "Multiple attack vectors",
          "Nation-state and criminal groups"
        ]
      },
      {
        id: 7,
        title: "Enterprise Security Architecture",
        content: "Designing comprehensive security architectures for large organizations.",
        duration: "4 mins",
        objectives: [
          "Design security architectures",
          "Implement defense in depth",
          "Create security policies"
        ],
        key_points: [
          "Layered security controls",
          "Security zones and segmentation",
          "Identity and access management",
          "Security monitoring and logging",
          "Regular security assessments"
        ]
      },
      {
        id: 8,
        title: "Security Metrics and KPIs",
        content: "Measuring security program effectiveness through metrics and KPIs.",
        duration: "3 mins",
        objectives: [
          "Define security metrics",
          "Track security KPIs",
          "Measure program effectiveness"
        ],
        key_points: [
          "Mean Time to Detect (MTTD)",
          "Mean Time to Respond (MTTR)",
          "Security posture assessment",
          "Vulnerability management metrics",
          "Security awareness metrics"
        ]
      },
      {
        id: 9,
        title: "Advanced Threat Detection",
        content: "Cutting-edge threat detection technologies and methodologies.",
        duration: "5 mins",
        objectives: [
          "Explore advanced detection technologies",
          "Implement AI/ML in security",
          "Stay current with threats"
        ],
        key_points: [
          "Machine learning for threat detection",
          "Behavioral analytics",
          "Threat intelligence integration",
          "Automated response systems",
          "Continuous improvement"
        ]
      },
      {
        id: 10,
        title: "Security Operations Center (SOC)",
        content: "Managing security operations for enterprise organizations.",
        duration: "5 mins",
        objectives: [
          "Understand SOC operations",
          "Implement SOC processes",
          "Manage security teams"
        ],
        key_points: [
          "24/7 security monitoring",
          "Tiered security response",
          "Security tool management",
          "Analyst training and development",
          "Continuous improvement"
        ]
      }
    ],
    6: [
      {
        id: 1,
        title: "Introduction to Cryptography",
        content: "Understanding the fundamental concepts of cryptography, including encryption, decryption, and the role of cryptographic algorithms in modern cybersecurity.",
        duration: "4 mins",
        objectives: [
          "Understand basic cryptographic concepts",
          "Differentiate between symmetric and asymmetric encryption",
          "Recognize the importance of cryptography in security"
        ],
        key_points: [
          "Cryptography protects data confidentiality and integrity",
          "Symmetric encryption uses the same key for encryption and decryption",
          "Asymmetric encryption uses public and private key pairs",
          "Hash functions ensure data integrity",
          "Digital signatures provide authentication"
        ]
      },
      {
        id: 2,
        title: "Symmetric Encryption Algorithms",
        content: "Deep dive into symmetric encryption algorithms like AES, DES, and 3DES, their strengths, weaknesses, and appropriate use cases.",
        duration: "3 mins",
        objectives: [
          "Understand symmetric encryption principles",
          "Compare different symmetric algorithms",
          "Identify appropriate use cases"
        ],
        key_points: [
          "AES is the current standard for symmetric encryption",
          "DES is considered insecure due to short key length",
          "3DES addresses DES vulnerabilities but is slow",
          "Key management is critical for symmetric encryption",
          "Performance vs security trade-offs"
        ]
      },
      {
        id: 3,
        title: "Asymmetric Encryption and PKI",
        content: "Understanding public key infrastructure, digital certificates, and asymmetric encryption algorithms like RSA and ECC.",
        duration: "4 mins",
        objectives: [
          "Explain asymmetric encryption concepts",
          "Understand PKI components",
          "Recognize digital certificate roles"
        ],
        key_points: [
          "RSA is widely used for secure key exchange",
          "ECC provides similar security with smaller keys",
          "PKI manages digital certificates and trust",
          "Certificate Authorities issue and verify certificates",
          "Certificate revocation lists identify compromised certificates"
        ]
      },
      {
        id: 4,
        title: "Hash Functions and Digital Signatures",
        content: "Understanding cryptographic hash functions, message authentication codes, and digital signatures for data integrity and authentication.",
        duration: "3 mins",
        objectives: [
          "Understand hash function properties",
          "Explain digital signature concepts",
          "Recognize MAC applications"
        ],
        key_points: [
          "SHA-256 is the current standard hash function",
          "Hash functions are one-way functions",
          "Digital signatures provide non-repudiation",
          "MACs provide message authentication",
          "Collision resistance is critical for hash functions"
        ]
      },
      {
        id: 5,
        title: "Key Management Best Practices",
        content: "Comprehensive key management strategies including generation, storage, distribution, and destruction of cryptographic keys.",
        duration: "4 mins",
        objectives: [
          "Implement key lifecycle management",
          "Understand key storage requirements",
          "Develop key distribution strategies"
        ],
        key_points: [
          "Keys must be generated using cryptographically secure methods",
          "Hardware Security Modules (HSMs) provide secure key storage",
          "Key rotation limits exposure from compromised keys",
          "Secure key distribution prevents interception",
          "Proper key destruction ensures data protection"
        ]
      },
      {
        id: 6,
        title: "Cryptographic Protocols",
        content: "Understanding TLS/SSL, IPsec, and other cryptographic protocols used to secure communications over networks.",
        duration: "3 mins",
        objectives: [
          "Explain TLS/SSL protocol operation",
          "Understand IPsec implementation",
          "Compare cryptographic protocols"
        ],
        key_points: [
          "TLS 1.3 is the current secure standard",
          "SSL is deprecated and insecure",
          "IPsec secures network layer communications",
          "Protocol selection depends on use case",
          "Regular protocol updates address vulnerabilities"
        ]
      },
      {
        id: 7,
        title: "Quantum Computing and Cryptography",
        content: "Understanding the impact of quantum computing on current cryptographic algorithms and the development of quantum-resistant cryptography.",
        duration: "3 mins",
        objectives: [
          "Recognize quantum computing threats",
          "Understand post-quantum cryptography",
          "Plan for cryptographic migration"
        ],
        key_points: [
          "Quantum computers can break RSA and ECC",
          "Grover's algorithm affects symmetric encryption",
          "Shor's algorithm breaks asymmetric encryption",
          "Post-quantum algorithms are being standardized",
          "Migration planning should begin now"
        ]
      },
      {
        id: 8,
        title: "Implementing Cryptography in Applications",
        content: "Practical guidance on implementing cryptographic solutions in software applications while avoiding common pitfalls.",
        duration: "4 mins",
        objectives: [
          "Implement secure cryptographic practices",
          "Avoid common implementation mistakes",
          "Choose appropriate cryptographic libraries"
        ],
        key_points: [
          "Never implement your own cryptography",
          "Use well-vetted cryptographic libraries",
          "Proper random number generation is critical",
          "Side-channel attacks can compromise implementations",
          "Regular security audits are essential"
        ]
      }
    ],
    7: [
      {
        id: 1,
        title: "Network Security Fundamentals",
        content: "Introduction to network security concepts, including the CIA triad, network segmentation, and defense-in-depth strategies.",
        duration: "4 mins",
        objectives: [
          "Understand network security principles",
          "Explain the CIA triad",
          "Implement defense-in-depth strategies"
        ],
        key_points: [
          "Confidentiality, Integrity, Availability (CIA) triad",
          "Network segmentation limits attack propagation",
          "Defense-in-depth uses multiple security layers",
          "Security policies guide network protection",
          "Regular security assessments are essential"
        ]
      },
      {
        id: 2,
        title: "Network Protocols and Security",
        content: "Understanding TCP/IP, OSI model, and security considerations for various network protocols.",
        duration: "4 mins",
        objectives: [
          "Explain TCP/IP protocol suite",
          "Understand OSI model layers",
          "Identify protocol vulnerabilities"
        ],
        key_points: [
          "TCP provides reliable, ordered delivery",
          "UDP is faster but less reliable",
          "Application layer protocols have specific vulnerabilities",
          "Protocol analysis helps identify threats",
          "Secure alternatives exist for many protocols"
        ]
      },
      {
        id: 3,
        title: "Firewall Technologies",
        content: "Comprehensive overview of firewall types, configurations, and best practices for network protection.",
        duration: "4 mins",
        objectives: [
          "Differentiate firewall types",
          "Configure firewall rules effectively",
          "Implement firewall best practices"
        ],
        key_points: [
          "Packet filtering firewalls examine packet headers",
          "Stateful firewalls track connection states",
          "Application-layer firewalls inspect content",
          "Next-generation firewalls include advanced features",
          "Default deny policies are more secure"
        ]
      },
      {
        id: 4,
        title: "Intrusion Detection and Prevention Systems",
        content: "Understanding IDS/IPS technologies, deployment strategies, and analysis of security alerts.",
        duration: "4 mins",
        objectives: [
          "Differentiate IDS and IPS",
          "Understand detection methodologies",
          "Implement effective deployment strategies"
        ],
        key_points: [
          "Signature-based detection uses known patterns",
          "Anomaly-based detection identifies unusual behavior",
          "Network IDS monitors network traffic",
          "Host IDS monitors system activity",
          "IPS can automatically block threats"
        ]
      },
      {
        id: 5,
        title: "Virtual Private Networks (VPNs)",
        content: "Understanding VPN technologies, protocols, and implementation for secure remote access and site-to-site connections.",
        duration: "3 mins",
        objectives: [
          "Explain VPN concepts and benefits",
          "Understand VPN protocols",
          "Implement secure VPN solutions"
        ],
        key_points: [
          "VPNs create encrypted tunnels over public networks",
          "IPsec and SSL/TLS are common VPN protocols",
          "Site-to-site VPNs connect entire networks",
          "Remote access VPNs connect individual users",
          "VPN security depends on proper configuration"
        ]
      },
      {
        id: 6,
        title: "Network Access Control (NAC)",
        content: "Implementing NAC solutions to control device access to network resources based on compliance and security policies.",
        duration: "4 mins",
        objectives: [
          "Understand NAC concepts",
          "Implement NAC solutions",
          "Develop network access policies"
        ],
        key_points: [
          "NAC authenticates devices before network access",
          "Posture assessment checks device compliance",
          "Quarantine networks isolate non-compliant devices",
          "802.1X is a standard for network authentication",
          "NAC prevents unauthorized access"
        ]
      },
      {
        id: 7,
        title: "Wireless Network Security",
        content: "Securing Wi-Fi networks, understanding wireless protocols, and protecting against wireless attacks.",
        duration: "4 mins",
        objectives: [
          "Secure wireless network implementations",
          "Understand wireless security protocols",
          "Identify wireless attack vectors"
        ],
        key_points: [
          "WPA3 is the current wireless security standard",
          "WEP and WPA are deprecated and insecure",
          "Strong passwords and encryption are essential",
          "Wireless intrusion detection systems monitor threats",
          "Guest networks should be isolated from internal networks"
        ]
      },
      {
        id: 8,
        title: "Network Segmentation and Microsegmentation",
        content: "Implementing network segmentation strategies to limit lateral movement and contain breaches.",
        duration: "3 mins",
        objectives: [
          "Understand network segmentation benefits",
          "Implement segmentation strategies",
          "Apply microsegmentation concepts"
        ],
        key_points: [
          "Segmentation limits attack propagation",
          "VLANs provide basic network segmentation",
          "Microsegmentation provides granular control",
          "Software-defined networking enables dynamic segmentation",
          "Zero-trust principles apply to network segmentation"
        ]
      },
      {
        id: 9,
        title: "Network Monitoring and Analysis",
        content: "Using network monitoring tools, traffic analysis, and log analysis to detect and investigate security incidents.",
        duration: "5 mins",
        objectives: [
          "Implement network monitoring solutions",
          "Analyze network traffic effectively",
          "Use logs for incident investigation"
        ],
        key_points: [
          "NetFlow and sFlow provide traffic visibility",
          "Packet capture enables deep analysis",
          "SIEM systems correlate network events",
          "Baselines help identify anomalies",
          "Regular monitoring improves threat detection"
        ]
      }
    ],
    8: [
      {
        id: 1,
        title: "Introduction to Malware Analysis",
        content: "Understanding malware types, analysis methodologies, and the importance of malware analysis in cybersecurity.",
        duration: "4 mins",
        objectives: [
          "Define malware and its categories",
          "Understand analysis methodologies",
          "Recognize the importance of malware analysis"
        ],
        key_points: [
          "Malware includes viruses, worms, Trojans, ransomware",
          "Static analysis examines code without execution",
          "Dynamic analysis observes malware behavior",
          "Hybrid analysis combines both approaches",
          "Malware analysis helps develop defenses"
        ]
      },
      {
        id: 2,
        title: "Static Malware Analysis Techniques",
        content: "Deep dive into static analysis techniques including file analysis, string extraction, and code examination.",
        duration: "5 mins",
        objectives: [
          "Perform static malware analysis",
          "Extract useful information from malware",
          "Identify malware characteristics"
        ],
        key_points: [
          "File properties reveal basic information",
          "String analysis finds URLs, IPs, and commands",
          "Hashing identifies known malware samples",
          "Disassembly reveals program logic",
          "Static analysis is safe but limited"
        ]
      },
      {
        id: 3,
        title: "Dynamic Malware Analysis",
        content: "Understanding dynamic analysis in controlled environments, behavior monitoring, and system interaction analysis.",
        duration: "5 mins",
        objectives: [
          "Set up analysis environments",
          "Monitor malware behavior",
          "Analyze system interactions"
        ],
        key_points: [
          "Sandbox environments isolate malware",
          "Process monitoring reveals behavior",
          "Network monitoring shows communications",
          "File system monitoring tracks changes",
          "Registry monitoring tracks system modifications"
        ]
      },
      {
        id: 4,
        title: "Malware Classification and Taxonomy",
        content: "Understanding malware families, classification systems, and threat intelligence sharing.",
        duration: "3 mins",
        objectives: [
          "Classify malware by type and behavior",
          "Understand malware families",
          "Participate in threat intelligence sharing"
        ],
        key_points: [
          "Malware families share code and behavior",
          "MITRE ATT&CK framework classifies techniques",
          "YARA rules identify malware patterns",
          "Threat intelligence sharing improves defenses",
          "Classification helps prioritize responses"
        ]
      },
      {
        id: 5,
        title: "Reverse Engineering Fundamentals",
        content: "Introduction to reverse engineering concepts, tools, and techniques for analyzing compiled code.",
        duration: "4 mins",
        objectives: [
          "Understand reverse engineering concepts",
          "Use reverse engineering tools",
          "Analyze compiled code effectively"
        ],
        key_points: [
          "Disassemblers convert machine code to assembly",
          "Debuggers trace program execution",
          "Decompilers recreate high-level code",
          "Reverse engineering requires deep technical knowledge",
          "Legal considerations are important"
        ]
      },
      {
        id: 6,
        title: "Advanced Reverse Engineering Techniques",
        content: "Advanced techniques including unpacking, deobfuscation, and anti-analysis bypass methods.",
        duration: "5 mins",
        objectives: [
          "Handle packed and obfuscated malware",
          "Bypass anti-analysis techniques",
          "Apply advanced reverse engineering"
        ],
        key_points: [
          "Packing compresses and encrypts malware",
          "Obfuscation hides malicious intent",
          "Anti-analysis techniques detect analysis tools",
          "Unpacking reveals original malware code",
          "Advanced techniques require specialized tools"
        ]
      },
      {
        id: 7,
        title: "Ransomware Analysis",
        content: "Specialized techniques for analyzing ransomware, understanding encryption methods, and recovery options.",
        duration: "4 mins",
        objectives: [
          "Analyze ransomware behavior",
          "Understand ransomware encryption",
          "Identify recovery options"
        ],
        key_points: [
          "Ransomware encrypts files for extortion",
          "Encryption methods vary by ransomware family",
          "Payment doesn't guarantee file recovery",
          "Backup strategies prevent data loss",
          "Decryption tools exist for some variants"
        ]
      },
      {
        id: 8,
        title: "Botnet and C2 Analysis",
        content: "Understanding botnet architectures, command and control communications, and botnet takedown techniques.",
        duration: "4 mins",
        objectives: [
          "Analyze botnet structures",
          "Identify C2 communications",
          "Understand botnet takedown methods"
        ],
        key_points: [
          "Botnets create networks of compromised computers",
          "C2 servers control botnet operations",
          "P2P botnets have decentralized control",
          "DNS monitoring can identify C2 domains",
          "Takedown requires coordination with ISPs"
        ]
      },
      {
        id: 9,
        title: "Fileless Malware Analysis",
        content: "Techniques for analyzing fileless malware that operates in memory without writing to disk.",
        duration: "4 mins",
        objectives: [
          "Understand fileless malware concepts",
          "Analyze memory-based threats",
          "Detect fileless malware techniques"
        ],
        key_points: [
          "Fileless malware avoids traditional detection",
          "Memory analysis is critical for detection",
          "PowerShell and WMI are common vectors",
          "Living off the land techniques use legitimate tools",
          "Advanced EDR solutions detect fileless attacks"
        ]
      },
      {
        id: 10,
        title: "Mobile Malware Analysis",
        content: "Specialized techniques for analyzing Android and iOS malware, including app analysis and system interactions.",
        duration: "4 mins",
        objectives: [
          "Analyze mobile malware effectively",
          "Understand mobile security models",
          "Identify mobile-specific threats"
        ],
        key_points: [
          "Android malware often uses social engineering",
          "iOS malware is rarer but more sophisticated",
          "App permissions indicate suspicious behavior",
          "Static analysis examines app code and resources",
          "Dynamic analysis monitors device interactions"
        ]
      },
      {
        id: 11,
        title: "Malware Analysis Tools and Environments",
        content: "Comprehensive overview of malware analysis tools, sandbox environments, and analysis workflows.",
        duration: "4 mins",
        objectives: [
          "Select appropriate analysis tools",
          "Set up analysis environments",
          "Develop efficient analysis workflows"
        ],
        key_points: [
          "IDA Pro is a powerful disassembler",
          "Wireshark analyzes network traffic",
          "Process Monitor tracks system activity",
          "Virtual machines provide safe analysis environments",
          "Automated tools speed up analysis"
        ]
      },
      {
        id: 12,
        title: "Reporting and Threat Intelligence",
        content: "Creating detailed malware analysis reports and contributing to threat intelligence sharing.",
        duration: "4 mins",
        objectives: [
          "Create comprehensive analysis reports",
          "Share threat intelligence effectively",
          "Contribute to community defense"
        ],
        key_points: [
          "Reports should include IOCs and TTPs",
          "Clear writing helps other analysts",
          "Threat intelligence platforms facilitate sharing",
          "Attribution requires careful analysis",
          "Timely sharing improves community defense"
        ]
      }
    ]
  }

  const quizzes: Quiz[] = [
    {
      question: "Which of the following is a common sign of a phishing email?",
      options: [
        "Professional company logo and branding",
        "Urgent language requesting immediate action",
        "Personalized greeting with your full name",
        "Links to official company domains",
      ],
      correctAnswer: 1,
      explanation:
        "Phishing emails often use urgent or threatening language to pressure victims into acting without thinking carefully.",
    },
    {
      question: "What should you check first when analyzing a suspicious URL?",
      options: [
        "The color scheme of the website",
        "The domain name and SSL certificate",
        "The number of images on the page",
        "The font styles used",
      ],
      correctAnswer: 1,
      explanation:
        "Always verify the domain name matches the legitimate site and check for a valid SSL certificate (HTTPS) as first steps.",
    },
    {
      question:
        "A colleague receives an email from their 'bank' asking them to verify account details. What should they do?",
      options: [
        "Click the link and verify their information",
        "Forward the email to IT security team",
        "Reply to the email asking for confirmation",
        "Delete the email without verification",
      ],
      correctAnswer: 1,
      explanation:
        "Always report suspicious emails to your security team for proper analysis. Never click links in suspicious emails.",
    },
    {
      question: "What is the primary purpose of a Man-in-the-Middle (MITM) attack?",
      options: [
        "To steal passwords directly",
        "To intercept and modify communications between two parties",
        "To crash the target system",
        "To encrypt all data on the network",
      ],
      correctAnswer: 1,
      explanation:
        "MITM attacks involve intercepting communications between two parties, potentially allowing the attacker to read, modify, or steal data.",
    },
    {
      question: "Which encryption algorithm is considered quantum-resistant?",
      options: [
        "RSA-2048",
        "AES-256",
        "Lattice-based cryptography",
        "SHA-256",
      ],
      correctAnswer: 2,
      explanation:
        "Lattice-based cryptography is one of the leading candidates for post-quantum cryptography, resistant to attacks by quantum computers.",
    },
    {
      question: "What is the principle of 'Defense in Depth' in cybersecurity?",
      options: [
        "Using only one strong security control",
        "Layering multiple security controls and strategies",
        "Focusing only on perimeter security",
        "Relying solely on employee training",
      ],
      correctAnswer: 1,
      explanation:
        "Defense in Depth involves using multiple layers of security controls so that if one layer fails, others will still protect the asset.",
    },
    {
      question: "In a Zero Trust architecture, what is the default security posture?",
      options: [
        "Trust but verify",
        "Never trust, always verify",
        "Trust internal network traffic",
        "Trust authenticated users",
      ],
      correctAnswer: 1,
      explanation:
        "Zero Trust operates on the principle of 'never trust, always verify', requiring authentication for every access request regardless of source.",
    },
    {
      question: "What is the primary purpose of a SIEM (Security Information and Event Management) system?",
      options: [
        "To prevent all cyber attacks",
        "To collect, analyze, and correlate security event data",
        "To encrypt all network traffic",
        "To manage user passwords",
      ],
      correctAnswer: 1,
      explanation:
        "SIEM systems collect and analyze log data from across the organization to detect, investigate, and respond to security threats.",
    },
    {
      question: "Which of the following is a key characteristic of Advanced Persistent Threats (APTs)?",
      options: [
        "Quick, opportunistic attacks",
        "Long-term, targeted attacks with specific objectives",
        "Random, scattered attacks across multiple targets",
        "Attacks that only last a few hours",
      ],
      correctAnswer: 1,
      explanation:
        "APTs are characterized by their long-term nature, specific targeting, and persistence in achieving their objectives.",
    },
    {
      question: "What is the primary goal of threat hunting?",
      options: [
        "To respond to known security incidents",
        "To proactively search for undetected threats",
        "To install security software",
        "To train employees on security awareness",
      ],
      correctAnswer: 1,
      explanation:
        "Threat hunting involves proactively searching for threats that have bypassed automated security controls, rather than responding to alerts.",
    },
    {
      question: "Which protocol is most secure for remote access in 2024?",
      options: [
        "Telnet",
        "FTP",
        "SSH with key-based authentication",
        "HTTP Basic Authentication",
      ],
      correctAnswer: 2,
      explanation:
        "SSH with key-based authentication provides strong encryption and multi-factor authentication capabilities, making it the most secure option.",
    },
    {
      question: "What is the primary purpose of a honeypot in cybersecurity?",
      options: [
        "To store sensitive data securely",
        "To attract and study attackers",
        "To block all network traffic",
        "To encrypt communications",
      ],
      correctAnswer: 1,
      explanation:
        "Honeypots are decoy systems designed to attract attackers, allowing security teams to study attack methods and gather threat intelligence.",
    },
    {
      question: "Which of the following is a key principle of secure software development?",
      options: [
        "Security through obscurity",
        "Least privilege",
        "Trust all inputs",
        "Maximum access for convenience",
      ],
      correctAnswer: 1,
      explanation:
        "The principle of least privilege ensures that code and processes have only the minimum permissions necessary to function, reducing attack surface.",
    },
    {
      question: "What is the primary purpose of a Web Application Firewall (WAF)?",
      options: [
        "To block all web traffic",
        "To filter and monitor HTTP traffic between web applications and the internet",
        "To encrypt database connections",
        "To manage user authentication",
      ],
      correctAnswer: 1,
      explanation:
        "WAFs protect web applications by filtering and monitoring HTTP traffic for malicious requests and attacks.",
    },
    {
      question: "Which attack vector specifically targets the supply chain?",
      options: [
        "Phishing",
        "DDoS attack",
        "Supply chain compromise",
        "SQL injection",
      ],
      correctAnswer: 2,
      explanation:
        "Supply chain attacks target trusted third-party software or services to compromise multiple organizations through a single breach.",
    },
    {
      question: "What does GDPR primarily protect?",
      options: [
        "Intellectual property",
        "Personal data and privacy",
        "National security",
        "Financial transactions",
      ],
      correctAnswer: 1,
      explanation:
        "GDPR (General Data Protection Regulation) is designed to protect personal data and privacy of individuals in the European Union.",
    },
    {
      question: "Which of the following is NOT a common IoT security risk?",
      options: [
        "Weak default passwords",
        "Unencrypted communications",
        "Lack of regular updates",
        "End-to-end encryption",
      ],
      correctAnswer: 3,
      explanation:
        "End-to-end encryption is a security measure, not a risk. IoT devices typically suffer from weak passwords, unencrypted communications, and lack of updates.",
    },
    {
      question: "What is the primary goal of a Business Continuity Plan (BCP)?",
      options: [
        "To prevent all cyber attacks",
        "To ensure business operations continue during disruptions",
        "To train employees on security",
        "To monitor network traffic",
      ],
      correctAnswer: 1,
      explanation:
        "The primary goal of a BCP is to ensure that critical business functions can continue during and after a disruption.",
    },
    {
      question: "In asymmetric cryptography, what is the purpose of the private key?",
      options: [
        "To encrypt messages for others",
        "To decrypt messages and create digital signatures",
        "To share with everyone",
        "To generate symmetric keys",
      ],
      correctAnswer: 1,
      explanation:
        "The private key is kept secret and used to decrypt messages encrypted with the public key and to create digital signatures.",
    },
    {
      question: "What type of firewall examines the content of network packets?",
      options: [
        "Packet filtering firewall",
        "Stateful firewall",
        "Application-layer firewall",
        "Circuit-level gateway",
      ],
      correctAnswer: 2,
      explanation:
        "Application-layer firewalls can inspect the actual content of packets, allowing them to understand and filter based on application protocols.",
    },
    {
      question: "What is the primary difference between static and dynamic malware analysis?",
      options: [
        "Static analysis is faster than dynamic analysis",
        "Static analysis executes malware, dynamic analysis doesn't",
        "Static analysis examines code without execution, dynamic analysis observes behavior",
        "Dynamic analysis is always safer than static analysis",
      ],
      correctAnswer: 2,
      explanation:
        "Static analysis examines malware code without running it, while dynamic analysis observes malware behavior in a controlled environment.",
    },
    {
      question: "Which hashing algorithm is currently recommended for security applications?",
      options: [
        "MD5",
        "SHA-1",
        "SHA-256",
        "CRC32",
      ],
      correctAnswer: 2,
      explanation:
        "SHA-256 is currently recommended for security applications. MD5 and SHA-1 are considered insecure due to known vulnerabilities.",
    },
    {
      question: "What is the purpose of a Certificate Authority (CA) in PKI?",
      options: [
        "To encrypt all internet traffic",
        "To issue and verify digital certificates",
        "To monitor network activity",
        "To block malicious websites",
      ],
      correctAnswer: 1,
      explanation:
        "Certificate Authorities issue digital certificates that verify the identity of entities and enable secure communications.",
    },
    {
      question: "Which network segmentation method provides the most granular control?",
      options: [
        "VLAN segmentation",
        "Subnet segmentation",
        "Microsegmentation",
        "Physical network separation",
      ],
      correctAnswer: 2,
      explanation:
        "Microsegmentation provides the most granular control by applying security policies to individual workloads rather than entire network segments.",
    },
    {
      question: "What is the primary purpose of YARA rules in malware analysis?",
      options: [
        "To encrypt malware samples",
        "To identify and classify malware based on patterns",
        "To execute malware safely",
        "To repair infected systems",
      ],
      correctAnswer: 1,
      explanation:
        "YARA rules are used to identify and classify malware based on specific patterns, strings, or behaviors within malware samples.",
    },
    {
      question: "Which wireless security protocol is currently considered most secure?",
      options: [
        "WEP",
        "WPA",
        "WPA2",
        "WPA3",
      ],
      correctAnswer: 3,
      explanation:
        "WPA3 is the most current and secure wireless protocol, offering improved encryption and protection against password-guessing attacks.",
    },
    {
      question: "What is the primary purpose of Network Access Control (NAC)?",
      options: [
        "To block all network traffic",
        "To authenticate and authorize devices before network access",
        "To encrypt network communications",
        "To monitor network performance",
      ],
      correctAnswer: 1,
      explanation:
        "NAC solutions authenticate and authorize devices before granting network access, ensuring only compliant devices can connect.",
    },
    {
      question: "In malware analysis, what does 'unpacking' refer to?",
      options: [
        "Removing malware from a system",
        "Decompressing or decrypting packed malware to reveal the original code",
        "Packaging malware for distribution",
        "Analyzing malware packaging",
      ],
      correctAnswer: 1,
      explanation:
        "Unpacking is the process of decompressing or decrypting packed malware to reveal the original malicious code for analysis.",
    },
    {
      question: "What is the primary benefit of using a Hardware Security Module (HSM)?",
      options: [
        "Faster processing speeds",
        "Secure key generation and storage",
        "Lower cost",
        "Easier key management",
      ],
      correctAnswer: 1,
      explanation:
        "HSMs provide secure key generation and storage in tamper-resistant hardware, protecting cryptographic keys from compromise.",
    },
    {
      question: "Which type of malware operates primarily in memory without writing to disk?",
      options: [
        "Ransomware",
        "Fileless malware",
        "Trojan",
        "Worm",
      ],
      correctAnswer: 1,
      explanation:
        "Fileless malware operates primarily in memory and uses legitimate system tools to carry out attacks, making it harder to detect with traditional antivirus.",
    },
    {
      question: "What is the primary purpose of a sandbox in malware analysis?",
      options: [
        "To block malware from entering a network",
        "To provide a safe, isolated environment for executing malware",
        "To encrypt malware samples",
        "To distribute malware updates",
      ],
      correctAnswer: 1,
      explanation:
        "Sandboxes provide safe, isolated environments where malware can be executed and analyzed without risking the host system or network.",
    },
    {
      question: "Which protocol is commonly used for VPN connections?",
      options: [
        "HTTP",
        "FTP",
        "IPsec",
        "SMTP",
      ],
      correctAnswer: 2,
      explanation:
        "IPsec is commonly used for VPN connections to provide secure, encrypted communication over public networks.",
    },
    {
      question: "What is the primary purpose of a botnet?",
      options: [
        "To protect networks from attacks",
        "To create a network of compromised computers for malicious activities",
        "To encrypt communications",
        "To monitor network traffic",
      ],
      correctAnswer: 1,
      explanation:
        "Botnets are networks of compromised computers controlled by attackers for malicious activities like DDoS attacks, spam distribution, and data theft.",
    },
    {
      question: "Which of the following is a characteristic of ransomware?",
      options: [
        "It spreads automatically to other computers",
        "It encrypts files and demands payment for decryption",
        "It steals personal information",
        "It creates backdoors for future access",
      ],
      correctAnswer: 1,
      explanation:
        "Ransomware is characterized by encrypting victims' files and demanding payment (usually in cryptocurrency) for the decryption key.",
    },
    {
      question: "What is the primary purpose of deobfuscation in malware analysis?",
      options: [
        "To make malware harder to detect",
        "To reveal the original logic and functionality of obfuscated malware",
        "To encrypt malware samples",
        "To distribute malware safely",
      ],
      correctAnswer: 1,
      explanation:
        "Deobfuscation techniques are used to reverse the obfuscation techniques applied by malware authors to reveal the original code and functionality.",
    },
    {
      question: "Which wireless attack technique creates a fake access point to trick users?",
      options: [
        "Wardriving",
        "Evil twin attack",
        "Packet sniffing",
        "MAC spoofing",
      ],
      correctAnswer: 1,
      explanation:
        "Evil twin attacks create fake access points with legitimate-looking names to trick users into connecting and revealing sensitive information.",
    },
    {
      question: "What is the primary purpose of a disassembler in reverse engineering?",
      options: [
        "To execute malware safely",
        "To convert machine code into assembly language",
        "To encrypt executable files",
        "To monitor network traffic",
      ],
      correctAnswer: 1,
      explanation:
        "Disassemblers convert binary machine code into human-readable assembly language, allowing analysts to understand program logic and behavior.",
    },
    {
      question: "Which of the following is a key principle of the CIA triad?",
      options: [
        "Cost, Implementation, Availability",
        "Confidentiality, Integrity, Availability",
        "Complexity, Innovation, Authentication",
        "Compliance, Investigation, Auditing",
      ],
      correctAnswer: 1,
      explanation:
        "The CIA triad consists of Confidentiality, Integrity, and Availability, which are the core principles of information security.",
    },
    {
      question: "What is the primary purpose of a debugger in malware analysis?",
      options: [
        "To compile malware code",
        "To trace and analyze program execution step by step",
        "To encrypt malware samples",
        "To monitor network connections",
      ],
      correctAnswer: 1,
      explanation:
        "Debuggers allow analysts to trace program execution, set breakpoints, and examine memory to understand malware behavior and functionality.",
    }
  ]

  const handleStartModule = (moduleId: number) => {
    setSelectedModule(moduleId)
    setCurrentLesson(0)
    setViewMode('lesson')
  }

  const handleNextLesson = () => {
    const module = modules.find(m => m.id === selectedModule)
    if (module && currentLesson < module.lessons - 1) {
      setCurrentLesson(currentLesson + 1)
    } else {
      setViewMode('quiz')
    }
  }

  const handlePreviousLesson = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1)
    }
  }

  const handleCloseModule = () => {
    setSelectedModule(null)
    setCurrentLesson(0)
    setViewMode('modules')
  }

  const handleAnswerSelect = (index: number) => {
    if (showResult) return
    setSelectedAnswer(index)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    setShowResult(true)
    if (selectedAnswer === quizzes[currentQuiz].correctAnswer) {
      setScore(score + 1)
    }
  }

  const handleNextQuiz = () => {
    if (currentQuiz < quizzes.length - 1) {
      setCurrentQuiz(currentQuiz + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setViewMode('modules')
      setSelectedModule(null)
      setCurrentLesson(0)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500 text-white"
      case "intermediate":
        return "bg-yellow-500 text-white"
      case "advanced":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const currentLessonData = selectedModule ? lessons[selectedModule]?.[currentLesson] : null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="font-bold text-lg text-foreground">Security Training</span>
                  <p className="text-xs text-muted-foreground">Professional Development</p>
                </div>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">
                <Trophy className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Cybersecurity Training</h1>
            <p className="text-lg text-muted-foreground">
              Master advanced security concepts and protect against evolving threats
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">18 Modules</h3>
                  <p className="text-sm text-muted-foreground">Comprehensive curriculum</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">150+ Lessons</h3>
                  <p className="text-sm text-muted-foreground">In-depth learning</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Certification Ready</h3>
                  <p className="text-sm text-muted-foreground">Industry recognized skills</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Module Selection */}
          {viewMode === 'modules' && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">Training Modules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => (
                  <Card key={module.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getDifficultyColor(module.difficulty)}`}>
                        <module.icon className="w-6 h-6" />
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyBadge(module.difficulty)}`}>
                        {module.difficulty}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{module.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>{module.duration}</span>
                      <span>{module.lessons} lessons</span>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => handleStartModule(module.id)}
                    >
                      Start Module
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Lesson View */}
          {viewMode === 'lesson' && currentLessonData && (
            <Card className="p-8 mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {modules.find(m => m.id === selectedModule)?.title}
                  </h2>
                  <p className="text-muted-foreground">Lesson {currentLesson + 1}: {currentLessonData.title}</p>
                </div>
                <Button variant="outline" onClick={handleCloseModule}>
                  Close Module
                </Button>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">
                    Lesson {currentLesson + 1} of {modules.find(m => m.id === selectedModule)?.lessons}
                  </span>
                  <span className="text-sm text-muted-foreground">{currentLessonData.duration}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentLesson + 1) / (modules.find(m => m.id === selectedModule)?.lessons || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Lesson Content</h3>
                  <p className="text-muted-foreground leading-relaxed">{currentLessonData.content}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3">Learning Objectives</h4>
                  <ul className="space-y-2">
                    {currentLessonData.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <span className="text-sm text-foreground">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3">Key Points</h4>
                  <ul className="space-y-2">
                    {currentLessonData.key_points.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <span className="text-sm text-foreground">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline" 
                  onClick={handlePreviousLesson}
                  disabled={currentLesson === 0}
                >
                  Previous Lesson
                </Button>
                <Button onClick={handleNextLesson}>
                  {currentLesson === (modules.find(m => m.id === selectedModule)?.lessons || 1) - 1 ? "Take Quiz" : "Next Lesson"}
                </Button>
              </div>
            </Card>
          )}

          {/* Quiz View */}
          {viewMode === 'quiz' && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Test Your Knowledge</h2>
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">
                      Question {currentQuiz + 1} of {quizzes.length}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Score: {score}/{currentQuiz + (showResult ? 1 : 0)}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuiz + (showResult ? 1 : 0)) / quizzes.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-foreground">
                    {quizzes[currentQuiz].question}
                  </h3>
                  <div className="space-y-3">
                    {quizzes[currentQuiz].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showResult}
                        className={`w-full text-left p-4 rounded-lg border transition-colors ${
                          showResult && index === quizzes[currentQuiz].correctAnswer
                            ? "border-green-500 bg-green-50 text-green-800"
                            : showResult && index === selectedAnswer && index !== quizzes[currentQuiz].correctAnswer
                            ? "border-red-500 bg-red-50 text-red-800"
                            : selectedAnswer === index
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {showResult && index === quizzes[currentQuiz].correctAnswer && (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          )}
                          {showResult && index === selectedAnswer && index !== quizzes[currentQuiz].correctAnswer && (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {showResult && (
                    <div className={`p-4 rounded-lg border ${
                      selectedAnswer === quizzes[currentQuiz].correctAnswer
                        ? "border-green-500 bg-green-50 text-green-800"
                        : "border-red-500 bg-red-50 text-red-800"
                    }`}>
                      <p className="text-sm">{quizzes[currentQuiz].explanation}</p>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedAnswer(null)}
                      disabled={!showResult}
                    >
                      Try Again
                    </Button>
                    {!showResult ? (
                      <Button
                        onClick={handleSubmitAnswer}
                        disabled={selectedAnswer === null}
                      >
                        Submit Answer
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNextQuiz}
                        disabled={currentQuiz === quizzes.length - 1}
                      >
                        {currentQuiz === quizzes.length - 1 ? "Complete" : "Next Question"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Floating Contact Button */}
      <Button
        onClick={() => setShowContactWidget(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40"
        size="icon"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>

      {/* Contact Widget */}
      <ContactWidget 
        isOpen={showContactWidget} 
        onClose={() => setShowContactWidget(false)} 
      />
    </div>
  )
}
