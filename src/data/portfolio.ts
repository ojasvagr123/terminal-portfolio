export const portfolio = {
  profile: {
    name: "Ojasv Agrawal",
    shortName: "OA",
    eyebrow: "Final-year B.Tech IT student · SGITS Indore",
    headline: "Software engineer building reliable products across web, AI and security.",
    intro:
      "I turn complex technical problems into useful, dependable software - from financial messaging systems and AI research to full-stack platforms used in the real world.",
    location: "Indore, India",
    email: "ojasvagrawal2807@gmail.com",
    phone: "+91 88278 12807",
    github: "https://github.com/ojasvagr123",
    linkedin: "https://www.linkedin.com/in/ojasvagrawal/",
    leetcode: "https://leetcode.com/ojasv_agr123/",
    resume: "/resume/Ojasv-Agrawal-Resume.pdf",
    photo: "/profile/Screenshot 2026-11-24 205357.png",
  },
  metrics: [
    { value: "9.36", label: "CGPA at SGITS" },
    { value: "600+", label: "LeetCode problems" },
    { value: "1959", label: "Peak contest rating" },
    { value: "4", label: "Live products" },
  ],
  projects: [
    {
      title: "CodeQuest",
      eyebrow: "Competitive programming",
      description:
        "A real-time 1v1 competitive programming platform with live code execution, head-to-head challenges and a ranking system.",
      stack: ["React", "Node.js", "WebSockets", "Code execution"],
      github: "https://github.com/ojasvagr123/code-quest",
      demo: "https://code-quest-cwxa.vercel.app/",
      image: "/projects/project1.png",
      theme: "cyan",
    },
    {
      title: "Ahilya RakshaSutra",
      eyebrow: "Cybersecurity · AI/ML",
      description:
        "A citywide cyber-safety platform for reporting scams. It combines a Cowrie honeypot on AWS EC2 with XGBoost and LightGBM models that reached up to 99% accuracy across phishing, malware and deepfake detection tasks.",
      stack: ["FastAPI", "React", "AWS EC2", "XGBoost", "LightGBM"],
      github: "https://github.com/ojasvagr123/ahilya",
      demo: "https://koraview-frontend.vercel.app/",
      image: "/projects/project2.png",
      theme: "orange",
    },
    {
      title: "StudiFy",
      eyebrow: "Full-stack education platform",
      description:
        "A secure academic platform with semester resources, placement and GATE preparation, role-based access, modular dashboards and peer discussion with file sharing.",
      stack: ["Spring Boot", "React", "PostgreSQL", "JWT", "Zustand"],
      github: "https://github.com/ojasvagr123/Student-Study-Portal",
      demo: "https://student-study-portal-frontend.vercel.app/",
      image: "/projects/project3.png",
      theme: "indigo",
    },
    {
      title: "Multi-Model Classification Lab",
      eyebrow: "Applied machine learning",
      description:
        "An interactive Streamlit workspace for experimenting with prediction and classification tasks across structured data, images and audio.",
      stack: ["Python", "Streamlit", "scikit-learn", "Computer vision"],
      github: "https://github.com/ojasvagr123/ml-lab",
      demo: "https://ml-lab-6a5rreufnwbsmkgsjjsnas.streamlit.app/",
      image: "/projects/project4.png",
      theme: "rose",
    },
  ],
  experience: [
    {
      role: "Software Engineering Intern",
      company: "Mastercard",
      location: "Pune",
      period: "May 2026 - Jul 2026",
      summary:
        "Designed and built scalable financial messaging systems, automated cryptographic security services, and streamlined deployment pipelines. Leveraged AI tooling to build developer productivity assistants that provide contextual codebase guidance.",
      tags: ["Java", "ISO 8583", "Bouncy CastleB", "Jenkins", "MCP"],
    },
    {
      role: "Full-stack Developer Intern",
      company: "Vichranshala Lab, IIT Ropar",
      location: "Remote",
      period: "Jan 2026 - Present",
      summary:
        "Contributing to deployed MERN-stack products and building full-stack features across MongoDB, Express, React and Node.js.",
      tags: ["MongoDB", "Express", "React", "Node.js"],
    },
    {
      role: "Research Intern",
      company: "Maulana Azad National Institute of Technology",
      location: "Bhopal",
      period: "Jun 2025",
      summary:
        "Researched cognitive stress detection from EEG and skin-conductance signals using the UNIVERSE dataset, training explainable deep-learning models that achieved 84.5% classification accuracy.",
      tags: ["Python", "Deep learning", "XAI", "EEG", "EDA"],
    },
    {
      role: "Full-stack Developer Intern",
      company: "Ministry of Technical Education, Government of Madhya Pradesh",
      location: "Bhopal",
      period: "Apr 2025 - May 2025",
      summary:
        "Developed a transactional backend with PostgreSQL, Prisma and TypeScript, including real-time WebSocket integrations.",
      tags: ["TypeScript", "PostgreSQL", "Prisma", "WebSockets"],
    },
  ],
  leadership: [
    {
      role: "Central Placement Coordinator",
      organization: "Training & Placement Cell, SGITS",
      period: "Jul 2024 - Present",
      detail:
        "Leading a 50+ member team coordinating recruiters, campus drives, pre-placement talks and interviews.",
    },
    {
      role: "Technical Lead",
      organization: "Prashikshan AI, SAARTHI",
      period: "Oct 2025 - Present",
      detail:
        "Leading an AI interview and career-preparation platform built with Gemini API, parallel prompting and response validation.",
    },
  ],
  skills: [
    { title: "Languages", items: ["Java", "C", "C++", "JavaScript", "TypeScript", "Python"] },
    {
      title: "Product engineering",
      items: ["React", "Next.js", "Node.js", "Spring Boot", "FastAPI", "REST APIs"],
    },
    {
      title: "Data & infrastructure",
      items: ["PostgreSQL", "MongoDB", "AWS EC2", "Jenkins", "Git", "Linux"],
    },
    {
      title: "AI & data science",
      items: ["Pandas", "NumPy", "Matplotlib", "XAI", "Gemini API", "scikit-learn"],
    },
  ],
  education: {
    degree: "B.Tech in Information Technology",
    institution: "Shri G.S. Institute of Technology and Science, Indore",
    period: "2023 - 2027",
    score: "9.36 / 10 CGPA",
    detail:
      "Ranked among the top five students in the academic batch. Coursework includes data structures, operating systems, computer networks, databases, compiler design and machine learning.",
  },
  highlights: [
    "AIR 4637 in GATE 2026",
    "Knight on LeetCode with 600+ problems solved and a 1959 peak rating",
    "Top 5 of 200+ teams at Indore Tech Hackathon 2025",
    "Top 6 of 1,200+ teams at CIIS National CyberShield Hackathon 2025",
    "1st place at Skillathon 2024 AI/ML competition",
    "Five Elite NPTEL machine-learning certifications, consistently in the top 5%",
    "District Merit Rank 1 in the Class XII board examination",
  ],
} as const;
