import fs from "node:fs";
import path from "node:path";

export type Experience = {
  position: string;
  company: string;
  period: string;
  description: string;
  achievements?: string[];
  technologies?: string[];
};

export type Education = {
  degree: string;
  school: string;
  location?: string;
  year: string;
  description?: string;
};

export type Profile = {
  name: string;
  title: string;
  headline: string;
  summary: string;
  bio: string;
  experience: Experience[];
  education: Education[];
  skills: {
    primary: string[];
    technical: string[];
  };
  current_focus: string[];
  contact: {
    github: string;
    linkedin: string;
    sessionize: string;
    email?: string;
  };
  linkedin_posts?: Array<{
    id: string;
    text: string;
    url: string;
    published_at?: string;
  }>;
  buffer_posts?: Array<{
    id: string;
    text: string;
    url: string;
    service?: string;
    published_at?: string;
  }>;
  metrics?: {
    years_experience?: number;
    github_repos?: number;
    linkedin_posts?: number;
    buffer_posts?: number;
    github_contributions?: number;
  };
  avatar_url?: string;
};

const emergencyProfile: Profile = {
  name: "Awar Abdulkarim",
  title: "Cloud Engineer",
  headline: "Cloud Engineer & Tech Speaker",
  summary: "Run npm run sync-linkedin to load profile content from LinkedIn.",
  bio: "Cloud engineer passionate about Kubernetes, Azure, and building innovative tech solutions.",
  experience: [],
  education: [],
  skills: {
    primary: [],
    technical: [],
  },
  current_focus: [],
  contact: {
    github: "https://github.com/NotAwar",
    linkedin: "https://www.linkedin.com/in/notawar",
    sessionize: "https://sessionize.com/awar",
  },
  linkedin_posts: [],
  buffer_posts: [],
  metrics: {
    years_experience: 0,
    github_repos: 0,
    linkedin_posts: 0,
    buffer_posts: 0,
    github_contributions: 0,
  },
  avatar_url: "https://avatars.githubusercontent.com/u/48431495?s=400&u=725a6511898ed4b014f4100dac2dfce25b701055&v=4",
};

const generatedPath = path.resolve(process.cwd(), "src", "data", "generated-profile.json");

function validateProfile(profile: any): Profile {
  // Ensure all required fields exist with proper types
  return {
    name: String(profile.name ?? emergencyProfile.name),
    title: String(profile.title ?? emergencyProfile.title),
    headline: String(profile.headline ?? emergencyProfile.headline),
    summary: String(profile.summary ?? emergencyProfile.summary),
    bio: String(profile.bio ?? emergencyProfile.bio),
    experience: Array.isArray(profile.experience) ? profile.experience : emergencyProfile.experience,
    education: Array.isArray(profile.education) ? profile.education : emergencyProfile.education,
    skills: {
      primary: Array.isArray(profile.skills?.primary) ? profile.skills.primary : emergencyProfile.skills.primary,
      technical: Array.isArray(profile.skills?.technical) ? profile.skills.technical : emergencyProfile.skills.technical,
    },
    current_focus: Array.isArray(profile.current_focus) ? profile.current_focus : emergencyProfile.current_focus,
    contact: {
      github: String(profile.contact?.github ?? emergencyProfile.contact.github),
      linkedin: String(profile.contact?.linkedin ?? emergencyProfile.contact.linkedin),
      sessionize: String(profile.contact?.sessionize ?? emergencyProfile.contact.sessionize),
      email: profile.contact?.email ? String(profile.contact.email) : undefined,
    },
    linkedin_posts: Array.isArray(profile.linkedin_posts) ? profile.linkedin_posts : emergencyProfile.linkedin_posts,
    buffer_posts: Array.isArray(profile.buffer_posts) ? profile.buffer_posts : emergencyProfile.buffer_posts,
    metrics: {
      years_experience: typeof profile.metrics?.years_experience === 'number' ? profile.metrics.years_experience : emergencyProfile.metrics?.years_experience,
      github_repos: typeof profile.metrics?.github_repos === 'number' ? profile.metrics.github_repos : emergencyProfile.metrics?.github_repos,
      linkedin_posts: typeof profile.metrics?.linkedin_posts === 'number' ? profile.metrics.linkedin_posts : emergencyProfile.metrics?.linkedin_posts,
      buffer_posts: typeof profile.metrics?.buffer_posts === 'number' ? profile.metrics.buffer_posts : emergencyProfile.metrics?.buffer_posts,
      github_contributions: typeof profile.metrics?.github_contributions === 'number' ? profile.metrics.github_contributions : emergencyProfile.metrics?.github_contributions,
    },
    avatar_url: profile.avatar_url ? String(profile.avatar_url) : emergencyProfile.avatar_url,
  };
}

function loadDynamicProfile(): Profile {
  if (fs.existsSync(generatedPath)) {
    try {
      const raw = fs.readFileSync(generatedPath, "utf8");
      const parsed = JSON.parse(raw);
      return validateProfile(parsed);
    } catch (error) {
      console.warn(`Failed to load profile from ${generatedPath}:`, error);
      return emergencyProfile;
    }
  }

  return emergencyProfile;
}

export const activeProfile = loadDynamicProfile();

export const navigation = [
  { name: "Home", link: "/" },
  { name: "Speaking", link: "/speaking/" },
  { name: "CV", link: "/cv/" },
  { name: "Socials", link: "/socials/" },
];

