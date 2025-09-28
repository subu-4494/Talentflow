import { db } from "./db";
import { v4 as uuidv4 } from "uuid";

const jobTitles = [
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Product Manager",
  "UI/UX Designer",
  "QA Engineer",
  "Mobile Developer",
  "Embedded Systems Engineer",
  "Cloud Architect",
  "Security Engineer",
  "Blockchain Developer",
  "AI Researcher",
  "Systems Analyst",
  "Database Administrator",
  "Software Architect",
  "Game Developer",
  "Support Engineer",
  "SDET",
  "Control Systems Engineer",
  "Power Electronics Engineer",
  "Network Engineer",
  "Site Reliability Engineer",
];

const stages = ["applied", "screen", "tech", "offer", "hired", "rejected"];

export async function seedIfEmpty() {
  const jobsCount = await db.jobs.count();
  if (jobsCount > 0) return;

  console.log(" Seeding DB with jobs, candidates, and assessments...");

 
  const jobs = jobTitles.map((title, i) => ({
    id: i + 1,
    title,
    slug: title.toLowerCase().replace(/\s+/g, "-"),
    status: i % 5 === 0 ? "archived" : "active",
    tags: [i % 2 === 0 ? "Engineering" : "Product"],
    order: i,
  }));
  await db.jobs.bulkAdd(jobs);

 
  const candidates = [];
  for (let i = 1; i <= 1000; i++) {
    candidates.push({
      id: i,
      name: `Candidate ${i}`,
      email: `candidate${i}@example.com`,
      jobId: (i % jobs.length) + 1,
      stage: stages[i % stages.length],
    });
  }
  await db.candidates.bulkAdd(candidates);

 
  const assessments = [1, 2, 3].map((jobId) => ({
    jobId,
    sections: [
      {
        title: "General Knowledge",
        questions: Array.from({ length: 10 }).map((_, i) => ({
          id: uuidv4(),
          type: i % 2 === 0 ? "short_text" : "single_choice",
          text: `Question ${i + 1} for Job ${jobId}`,
          options: i % 2 === 0 ? [] : ["Option A", "Option B", "Option C"],
          required: true,
        })),
      },
    ],
  }));
  await db.assessments.bulkAdd(assessments);

  console.log("DB seeded successfully");
}
