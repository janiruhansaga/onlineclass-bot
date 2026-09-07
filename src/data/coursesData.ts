import { Course } from '../types';

export const INITIAL_COURSES: Course[] = [
  {
    id: 'CRS-DEV-001',
    code: 'WEB-101',
    title: 'Full Stack Web Development (React & Node.js)',
    instructor: 'Dr. Aris Thorne',
    schedule: 'Mon, Wed, Fri (7:00 PM - 9:00 PM IST)',
    duration: '16 Weeks',
    fee: 499,
    enrolledStudents: 28,
    status: 'active',
    category: 'Software Engineering',
    syllabus: [
      'HTML5, CSS3, Tailwind CSS & Responsive Layouts',
      'JavaScript ES6+, TypeScript Fundamentals',
      'React 19 Hooks, Context & State Management',
      'Node.js, Express & RESTful API Architecture',
      'MongoDB & PostgreSQL Database Integration',
      'Deployment on Vercel & Render with CI/CD',
      'Final Industry Capstone E-Commerce App'
    ]
  },
  {
    id: 'CRS-AI-002',
    code: 'AI-202',
    title: 'Data Science & Applied Artificial Intelligence',
    instructor: 'Prof. Maya Lin',
    schedule: 'Tue, Thu (6:30 PM - 8:30 PM IST) & Sat (10 AM - 12 PM)',
    duration: '20 Weeks',
    fee: 649,
    enrolledStudents: 32,
    status: 'active',
    category: 'Artificial Intelligence',
    syllabus: [
      'Python for Data Science, NumPy & Pandas',
      'Data Visualization with Matplotlib & Seaborn',
      'Statistical Modeling & Hypothesis Testing',
      'Scikit-Learn Machine Learning Algorithms',
      'Deep Learning with PyTorch & Neural Networks',
      'Large Language Models (LLMs) & RAG Systems',
      'Capstone: Predictive Analytics Dashboard'
    ]
  },
  {
    id: 'CRS-PY-003',
    code: 'PY-100',
    title: 'Python Programming Masterclass (Beginner to Pro)',
    instructor: 'Alex Mercer',
    schedule: 'Sat & Sun (9:00 AM - 1:00 PM IST)',
    duration: '8 Weeks',
    fee: 299,
    enrolledStudents: 30,
    status: 'active',
    category: 'Programming',
    syllabus: [
      'Python Syntax, Variables & Control Flow',
      'Functions, Modules & Object-Oriented Programming',
      'File I/O, JSON Processing & Web Scraping with BeautifulSoup',
      'FastAPI & Microservices Basics',
      'Automated Testing with PyTest',
      'Final Project: Automated WhatsApp Bot Service'
    ]
  },
  {
    id: 'CRS-UIX-004',
    code: 'UIX-301',
    title: 'UI/UX Design Systems & Product Strategy',
    instructor: 'Sophia Chen',
    schedule: 'Mon & Thu (8:00 PM - 10:00 PM IST)',
    duration: '10 Weeks',
    fee: 399,
    enrolledStudents: 24,
    status: 'upcoming',
    category: 'Design & Product',
    syllabus: [
      'Design Thinking & User Research Methods',
      'Wireframing & Information Architecture',
      'Figma Masterclass: Components, Auto-Layout & Variants',
      'Prototyping & Interactive User Flows',
      'Design System Tokens & Accessibility (WCAG)',
      'Design Handoff to Web Developers'
    ]
  },
  {
    id: 'CRS-AWS-005',
    code: 'AWS-401',
    title: 'Cloud Engineering & DevOps with AWS',
    instructor: 'David Vance',
    schedule: 'Wed & Fri (6:00 PM - 8:00 PM IST)',
    duration: '12 Weeks',
    fee: 549,
    enrolledStudents: 19,
    status: 'upcoming',
    category: 'Cloud & Infrastructure',
    syllabus: [
      'AWS Core Services (EC2, S3, RDS, Lambda)',
      'Docker Containerization & Multi-stage Builds',
      'Kubernetes Cluster Orchestration',
      'Infrastructure as Code (Terraform)',
      'GitHub Actions CI/CD Pipeline Setup',
      'Cloud Security & Monitoring with CloudWatch'
    ]
  }
];
