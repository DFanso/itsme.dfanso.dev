// ─── Shared Portfolio Data ────────────────────────────────────────────────────
// Single source of truth used by site components AND the auto-generated resume.

export const profile = {
    name: "Leo Felcianas",
    title: "DevOps Engineer | Software Engineer | Freelancer",
    location: "Colombo, Western Province, Sri Lanka",
    email: "leogavin123@outlook.com",
    linkedin: "https://www.linkedin.com/in/leogavin/",
    linkedinHandle: "linkedin.com/in/leogavin",
    github: "https://github.com/dfanso",
    githubHandle: "github.com/dfanso",
    portfolio: "https://itsme.dfanso.dev/",
    portfolioHandle: "itsme.dfanso.dev",
    summary: "DevOps Engineer at Empite, holding a first-class honours degree from the University of Plymouth. Experienced across DevOps pipelines, backend development, cloud infrastructure, and AI-driven automation. Co-Founder & CTO of CodeXeed and KlexD, building scalable cloud-native applications and intelligent systems for global clients.",
};

export interface Role {
    type: string;
    typeColor: string;
    title: string;
    period: string;
    responsibilities: string[];
    tech: { name: string; icon: string }[];
}

export interface Company {
    company: string;
    totalPeriod: string;
    icon: string;
    roles: Role[];
}

export const companies: Company[] = [
    {
        company: "Fun Extreme Technology LLC",
        totalPeriod: "March 2026 - Present",
        icon: "lucide:gamepad-2",
        roles: [
            {
                type: "SWE",
                typeColor: "text-[#7aa2f7]",
                title: "Senior Software Engineer",
                period: "March 2026 - Present",
                responsibilities: [
                    "Developing and maintaining high-performance applications using .NET Core and Clean Architecture principles",
                    "Integrating Azure DevOps pipelines for CI/CD and leveraging Azure Web Services for cloud deployments",
                    "Applying architectural patterns including Mediator, CQRS, and Domain-Driven Design (DDD)",
                    "Working with Entity Framework Core and PostgreSQL for robust, scalable data access layers",
                    "Delivering innovative software solutions and game-related applications for a global audience",
                ],
                tech: [
                    { name: ".NET Core", icon: "simple-icons:dotnet" },
                    { name: "C#", icon: "simple-icons:csharp" },
                    { name: "Azure DevOps", icon: "simple-icons:azuredevops" },
                    { name: "Azure", icon: "mdi:microsoft-azure" },
                    { name: "EF Core", icon: "simple-icons:dotnet" },
                    { name: "PostgreSQL", icon: "simple-icons:postgresql" },
                    { name: "Clean Arch", icon: "lucide:layers" },
                    { name: "Mediator", icon: "lucide:share-2" },
                ],
            },
        ],
    },
    {
        company: "Empite",
        totalPeriod: "July 2024 - Present · 1 yr 10 mos",
        icon: "lucide:building-2",
        roles: [
            {
                type: "DEV",
                typeColor: "text-[#e0af68]",
                title: "DevOps Engineer",
                period: "August 2025 - Present",
                responsibilities: [
                    "Implemented auto-scaling solutions, achieving a 20% cost reduction while maintaining high availability",
                    "Executed disaster recovery plans and led migrations to immutable infrastructure using Terraform",
                    "Conducted load testing using Artillery, improving infrastructure scalability by 70%",
                    "Collaborated with developers to optimize codebases, ensuring systems handled increased traffic",
                    "Enhanced CI/CD pipelines and containerized services, accelerating deployments",
                ],
                tech: [
                    { name: "AWS", icon: "simple-icons:amazonaws" },
                    { name: "Azure", icon: "mdi:microsoft-azure" },
                    { name: "Linux", icon: "simple-icons:linux" },
                    { name: "Terraform", icon: "simple-icons:terraform" },
                    { name: "Packer", icon: "simple-icons:packer" },
                    { name: "Go", icon: "simple-icons:go" },
                    { name: "K8s", icon: "simple-icons:kubernetes" },
                    { name: "Docker", icon: "simple-icons:docker" },
                    { name: "Artillery", icon: "lucide:crosshair" },
                    { name: "Rapid7", icon: "lucide:shield-check" },
                ],
            },
            {
                type: "DEV",
                typeColor: "text-[#e0af68]",
                title: "Associate DevOps Engineer",
                period: "November 2024 - July 2025",
                responsibilities: [
                    "Migrated legacy project to modern Docker/ECS, reducing costs by 3x and enhancing maintainability",
                    "Built Azure IaC with Terraform, reducing provisioning time by 60% and standardizing deployments",
                    "Recovered an abandoned project, designing the infrastructure charter and deploying to production",
                    "Refactored legacy Terraform scripts to integrate with modern services for easier scaling",
                    "Designed and executed artillery-based load testing and auto-scaling improvements",
                ],
                tech: [
                    { name: "AWS", icon: "simple-icons:amazonaws" },
                    { name: "Nest.js", icon: "simple-icons:nestjs" },
                    { name: "Go", icon: "simple-icons:go" },
                    { name: "Linux", icon: "simple-icons:linux" },
                    { name: "TypeScript", icon: "simple-icons:typescript" },
                    { name: "Azure DevOps", icon: "simple-icons:azuredevops" },
                    { name: "Terraform", icon: "simple-icons:terraform" },
                    { name: "Artillery", icon: "lucide:crosshair" },
                ],
            },
            {
                type: "INT",
                typeColor: "text-[#9ece6a]",
                title: "Software Engineer Intern",
                period: "July 2024 - October 2024",
                responsibilities: [
                    "Developed NestJS microservices backends and integrated Next.js frontends",
                    "Optimized code performance by refactoring core services, reducing latency",
                    "Contributed to microservices-based architecture, enhancing modularity",
                    "Assisted in CI/CD pipeline improvements and containerization of services",
                ],
                tech: [
                    { name: "AWS", icon: "simple-icons:amazonaws" },
                    { name: "React", icon: "simple-icons:react" },
                    { name: "Nest.js", icon: "simple-icons:nestjs" },
                    { name: "Node.js", icon: "simple-icons:nodedotjs" },
                    { name: "Linux", icon: "simple-icons:linux" },
                    { name: "Git", icon: "simple-icons:git" },
                ],
            },
        ],
    },
    {
        company: "CodeXeed",
        totalPeriod: "June 2025 - Present · 11 mos",
        icon: "lucide:code-2",
        roles: [
            {
                type: "CTO",
                typeColor: "text-[#f7768e]",
                title: "Co-Founder & CTO",
                period: "June 2025 - Present",
                responsibilities: [
                    "Defining the tech stack and architectural patterns for client projects, from discovery to deployment",
                    "Driving development of enterprise-grade web applications using Next.js, NestJS, and PostgreSQL",
                    "Implementing high-performance SEO-optimized structures and robust security measures",
                    "Leading legacy system revamps, migrating Angular/PHP monoliths to Next.js microservices",
                ],
                tech: [
                    { name: "Next.js", icon: "simple-icons:nextdotjs" },
                    { name: "Nest.js", icon: "simple-icons:nestjs" },
                    { name: "PostgreSQL", icon: "simple-icons:postgresql" },
                    { name: "Docker", icon: "simple-icons:docker" },
                    { name: "AWS", icon: "simple-icons:amazonaws" },
                    { name: "Terraform", icon: "simple-icons:terraform" },
                ],
            },
        ],
    },
    {
        company: "KlexD",
        totalPeriod: "October 2024 - Present · 1 yr 7 mos",
        icon: "lucide:cpu",
        roles: [
            {
                type: "CTO",
                typeColor: "text-[#f7768e]",
                title: "Co-Founder & CTO",
                period: "October 2024 - Present",
                responsibilities: [
                    "Architecting intelligent systems and smart assistants using Python, OpenAI, and LangChain",
                    "Steering development of mobile and web platforms using React Native and Next.js",
                    "Building robust REST/GraphQL API pipelines and ETL processes to connect business tools",
                    "Establishing high-quality code culture through QA testing, Docker, and CI/CD pipelines",
                ],
                tech: [
                    { name: "Python", icon: "simple-icons:python" },
                    { name: "OpenAI", icon: "simple-icons:openai" },
                    { name: "LangChain", icon: "simple-icons:langchain" },
                    { name: "React Native", icon: "simple-icons:react" },
                    { name: "Next.js", icon: "simple-icons:nextdotjs" },
                    { name: "Docker", icon: "simple-icons:docker" },
                ],
            },
        ],
    },
    {
        company: "Fiverr",
        totalPeriod: "January 2020 - May 2025 · 5 yrs 5 mos",
        icon: "simple-icons:fiverr",
        roles: [
            {
                type: "FRL",
                typeColor: "text-[#bb9af7]",
                title: "Software Engineer",
                period: "May 2023 - May 2025",
                responsibilities: [
                    "Delivering custom web and mobile solutions for diverse client requirements",
                    "Implementing secure, scalable full-stack architectures with Go and Node.js",
                    "Managing end-to-end project lifecycle from requirements to deployment",
                ],
                tech: [
                    { name: "AWS", icon: "simple-icons:amazonaws" },
                    { name: "Next.js", icon: "simple-icons:nextdotjs" },
                    { name: "Nest.js", icon: "simple-icons:nestjs" },
                    { name: "Go", icon: "simple-icons:go" },
                    { name: "Linux", icon: "simple-icons:linux" },
                    { name: "Prisma", icon: "simple-icons:prisma" },
                    { name: "Tailwind", icon: "simple-icons:tailwindcss" },
                    { name: "Firebase", icon: "simple-icons:firebase" },
                ],
            },
            {
                type: "VID",
                typeColor: "text-[#ff9e64]",
                title: "Video Editor",
                period: "January 2020 - May 2021",
                responsibilities: [
                    "Produced and edited professional video content for international clients",
                    "Managed end-to-end video production workflow from raw footage to final delivery",
                ],
                tech: [
                    { name: "Premiere Pro", icon: "simple-icons:adobepremierepro" },
                    { name: "After Effects", icon: "simple-icons:adobeaftereffects" },
                ],
            },
        ],
    },
    {
        company: "Melstasoft",
        totalPeriod: "June 2022 - August 2022 · 3 mos",
        icon: "lucide:building",
        roles: [
            {
                type: "INT",
                typeColor: "text-[#9ece6a]",
                title: "Software Engineer Intern",
                period: "June 2022 - August 2022",
                responsibilities: [
                    "Developed and maintained enterprise applications using ASP.NET and the .NET framework",
                    "Worked with MSSQL databases, writing queries and managing data models",
                    "Collaborated with senior engineers to deliver production-ready features",
                ],
                tech: [
                    { name: ".NET", icon: "simple-icons:dotnet" },
                    { name: "ASP.NET", icon: "simple-icons:dotnet" },
                    { name: "MSSQL", icon: "simple-icons:microsoftsqlserver" },
                    { name: "C#", icon: "simple-icons:csharp" },
                    { name: "Git", icon: "simple-icons:git" },
                ],
            },
        ],
    },
    {
        company: "FOSS Community - NSBM",
        totalPeriod: "June 2020 - March 2023 · 2 yrs 10 mos",
        icon: "simple-icons:opensourceinitiative",
        roles: [
            {
                type: "VOL",
                typeColor: "text-[#73daca]",
                title: "Digital Marketing Team Lead",
                period: "February 2022 - March 2023",
                responsibilities: [
                    "Led the digital marketing team, managing campaigns and community outreach",
                    "Coordinated with council members to align marketing with community events",
                ],
                tech: [
                    { name: "Social Media", icon: "lucide:share-2" },
                    { name: "Design", icon: "lucide:palette" },
                ],
            },
            {
                type: "VOL",
                typeColor: "text-[#73daca]",
                title: "Council Member",
                period: "June 2021 - March 2023",
                responsibilities: [
                    "Served as an active council member, driving open-source initiatives and community growth",
                    "Organized and participated in FOSS events, workshops, and hackathons",
                ],
                tech: [
                    { name: "Open Source", icon: "simple-icons:opensourceinitiative" },
                    { name: "Linux", icon: "simple-icons:linux" },
                ],
            },
            {
                type: "VOL",
                typeColor: "text-[#73daca]",
                title: "Volunteer",
                period: "June 2020 - June 2021",
                responsibilities: [
                    "Volunteered in community activities, supporting FOSS events and initiatives",
                ],
                tech: [
                    { name: "Open Source", icon: "simple-icons:opensourceinitiative" },
                ],
            },
        ],
    },
];

export const education = [
    {
        degree: "BSc in Computer Software Engineering",
        institution: "University of Plymouth",
        grade: "First Class Honours",
        period: "June 2021 - December 2024",
        location: "Plymouth, United Kingdom",
    },
    {
        degree: "Foundation Programme for Bachelor's Degree",
        institution: "NSBM Green University",
        grade: "",
        period: "March 2020 - April 2021",
        location: "Sri Lanka",
    },
];

export const certifications = [
    {
        name: "Multicloud Network Associate",
        issuer: "Aviatrix",
        date: "Issued Sep 2025",
        expiry: "Expires Sep 2028",
        id: "Credential ID 2025-27675",
    },
    {
        name: "AWS Cloud Practitioner Essentials",
        issuer: "Amazon Web Services (AWS)",
        date: "Issued May 2025",
        expiry: "",
        id: "",
    },
];

export const topSkills = [
    "Application Programming Interfaces (API)",
    "Prisma ORM",
    "Technical Product Management",
];

export const skillGroups = [
    { name: "Cloud", skills: ["AWS", "GCP", "Azure", "Cloudflare"] },
    { name: "Containers", skills: ["Docker", "Kubernetes", "K3s", "ECS", "ELK"] },
    { name: "IaC & CI/CD", skills: ["Terraform", "Packer", "Ansible", "Jenkins", "GitHub Actions", "ArgoCD", "Artillery"] },
    { name: "Languages", skills: ["Go", "Rust", "Python", "TypeScript", "JavaScript", "Node.js", "C#"] },
    { name: "Frameworks", skills: ["Next.js", "Nest.js", "FastAPI", "Fiber", "HTMX", "GraphQL", "React Native", ".NET Core", "EF Core"] },
    { name: "AI", skills: ["OpenAI", "LangChain", "AI Automation"] },
    { name: "Databases", skills: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Firebase", "Prisma", "GORM", "MSSQL"] },
    { name: "Architecture", skills: ["Microservices", "System Design", "Clean Architecture", "CQRS / Mediator", "REST / GraphQL APIs", "Technical Product Management"] },
    { name: "Monitoring", skills: ["Prometheus", "Grafana", "Loki", "Tempo", "ELK Stack", "Rapid7"] },
];
