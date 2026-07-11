import { Experience } from "@/lib/types";

export const experienceData: Experience[] = [
  {
    id: "exp-1",
    company: "Tech Company A",
    role: "Senior Full-Stack Developer",
    startDate: "2023",
    endDate: "Present",
    description:
      "Leading development of cloud-native applications and mentoring junior developers.",
    highlights: [
      "Architected microservices handling 10K+ requests/min",
      "Reduced deployment time by 60% with CI/CD automation",
      "Mentored team of 4 junior developers",
    ],
  },
  {
    id: "exp-2",
    company: "Startup B",
    role: "Full-Stack Developer",
    startDate: "2021",
    endDate: "2023",
    description:
      "Built and shipped customer-facing products from concept to production.",
    highlights: [
      "Developed MVP that secured $2M in seed funding",
      "Implemented real-time collaboration features using WebSockets",
      "Optimized database queries reducing load times by 40%",
    ],
  },
  {
    id: "exp-3",
    company: "Agency C",
    role: "Frontend Developer",
    startDate: "2019",
    endDate: "2021",
    description:
      "Crafted responsive web experiences for diverse client projects.",
    highlights: [
      "Delivered 15+ client projects on time and within budget",
      "Introduced component library reducing development time by 30%",
      "Achieved 95+ Lighthouse scores across all projects",
    ],
  },
];
