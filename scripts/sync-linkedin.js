const axios = require('axios');
const fs = require('fs');
const yaml = require('js-yaml');

/**
 * LinkedIn Profile Sync Script
 * Fetches LinkedIn profile data and updates _data/profile.yml
 */

const PROXYCURL_API_KEY = process.env.PROXYCURL_API_KEY;
const LINKEDIN_PROFILE_URL = process.env.LINKEDIN_PROFILE_URL || 'https://www.linkedin.com/in/notawar';

async function fetchLinkedInProfile() {
  if (!PROXYCURL_API_KEY) {
    console.log('⚠️  No PROXYCURL_API_KEY found. Using existing profile data.');
    console.log('📝 To enable auto-sync, add PROXYCURL_API_KEY to GitHub Secrets.');
    console.log('   Get your API key at: https://nubela.co/proxycurl/');
    return null;
  }

  try {
    console.log('🔄 Fetching LinkedIn profile data...');
    
    const response = await axios.get('https://nubela.co/proxycurl/api/v2/linkedin', {
      params: {
        url: LINKEDIN_PROFILE_URL,
        fallback_to_cache: 'on-error',
        use_cache: 'if-present',
        skills: 'include',
        inferred_salary: 'include',
        personal_email: 'include',
        personal_contact_number: 'include',
        twitter_profile_id: 'include',
        facebook_profile_id: 'include',
        github_profile_id: 'include',
        extra: 'include'
      },
      headers: {
        'Authorization': `Bearer ${PROXYCURL_API_KEY}`
      },
      timeout: 30000
    });

    console.log('✅ LinkedIn profile fetched successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching LinkedIn profile:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return null;
  }
}

function transformLinkedInData(linkedinData) {
  if (!linkedinData) return null;

  console.log('🔄 Transforming LinkedIn data to profile format...');

  const profile = {
    name: linkedinData.full_name || 'Awar Abdulkarim',
    title: linkedinData.headline || 'Senior Cloud Engineer & Cloud Native Competency Lead',
    headline: linkedinData.headline || 'Senior Cloud Engineer & Cloud Native Competency Lead',
    summary: linkedinData.summary || '',
    bio: linkedinData.summary ? linkedinData.summary.substring(0, 200) + '...' : '',
    experience: [],
    education: [],
    skills: {
      primary: [],
      technical: []
    },
    current_focus: [],
    contact: {
      github: linkedinData.github_profile_id 
        ? `https://github.com/${linkedinData.github_profile_id.split('/').pop()}`
        : 'https://github.com/NotAwar',
      linkedin: LINKEDIN_PROFILE_URL,
      twitter: linkedinData.twitter_profile_id || null
    }
  };

  // Transform experiences
  if (linkedinData.experiences && linkedinData.experiences.length > 0) {
    profile.experience = linkedinData.experiences.map(exp => {
      const startDate = exp.starts_at 
        ? `${getMonthName(exp.starts_at.month)} ${exp.starts_at.year}`
        : '';
      const endDate = exp.ends_at 
        ? `${getMonthName(exp.ends_at.month)} ${exp.ends_at.year}`
        : 'Present';

      return {
        position: exp.title || '',
        company: exp.company || '',
        period: `${startDate} - ${endDate}`,
        location: exp.location || '',
        description: exp.description || '',
        achievements: [], // Keep empty for manual addition if needed
        technologies: [] // Keep empty for manual addition if needed
      };
    });
  }

  // Transform education
  if (linkedinData.education && linkedinData.education.length > 0) {
    profile.education = linkedinData.education.map(edu => {
      const year = edu.starts_at && edu.ends_at
        ? `${edu.starts_at.year} - ${edu.ends_at.year || 'Present'}`
        : edu.starts_at?.year || '';

      return {
        degree: edu.degree_name || edu.field_of_study || '',
        school: edu.school || '',
        year: year,
        location: edu.location || '',
        description: edu.description || ''
      };
    });
  }

  // Extract skills - split into primary and technical
  if (linkedinData.skills && linkedinData.skills.length > 0) {
    const allSkills = linkedinData.skills.map(s => s.name || s);
    // First 10 as primary, rest as technical
    profile.skills.primary = allSkills.slice(0, 10);
    profile.skills.technical = allSkills.slice(10, 30);
  }

  // Add current focus based on most recent position
  if (profile.experience.length > 0) {
    const currentRole = profile.experience[0];
    profile.current_focus = [
      `${currentRole.position} at ${currentRole.company}`,
      'Cloud-native technologies and Kubernetes',
      'DevOps automation and best practices',
      'Mentoring and technical leadership'
    ];
  }

  console.log('✅ Data transformation complete');
  return profile;
}

function getMonthName(month) {
  if (!month) return '';
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1] || '';
}

function mergeWithExistingProfile(newProfile, existingProfile) {
  console.log('🔄 Merging with existing profile data...');
  
  // Preserve manually added data like achievements and technologies
  if (existingProfile.experience && newProfile.experience) {
    newProfile.experience = newProfile.experience.map((newExp, index) => {
      const existingExp = existingProfile.experience[index];
      if (existingExp && existingExp.company === newExp.company) {
        return {
          ...newExp,
          achievements: existingExp.achievements || [],
          technologies: existingExp.technologies || []
        };
      }
      return newExp;
    });
  }

  return newProfile;
}

async function main() {
  try {
    console.log('🚀 Starting LinkedIn profile sync...\n');

    // Read existing profile
    let existingProfile = {};
    try {
      const existingData = fs.readFileSync('_data/profile.yml', 'utf8');
      existingProfile = yaml.load(existingData);
      console.log('📖 Loaded existing profile data');
    } catch (error) {
      console.log('📝 No existing profile found, creating new one');
    }

    // Fetch LinkedIn data
    const linkedinData = await fetchLinkedInProfile();
    
    if (linkedinData) {
      // Transform and merge data
      let newProfile = transformLinkedInData(linkedinData);
      newProfile = mergeWithExistingProfile(newProfile, existingProfile);

      // Add metadata
      newProfile._last_synced = new Date().toISOString();
      newProfile._sync_source = 'LinkedIn (Proxycurl API)';

      // Write updated profile
      const yamlString = yaml.dump(newProfile, {
        lineWidth: -1,
        noRefs: true,
        quotingType: '"'
      });

      fs.writeFileSync('_data/profile.yml', yamlString, 'utf8');
      console.log('✅ Profile updated successfully!\n');
      console.log(`📅 Last synced: ${newProfile._last_synced}`);
    } else {
      console.log('\n⚠️  Skipping profile update - using existing data');
      console.log('   To enable auto-sync:');
      console.log('   1. Sign up at https://nubela.co/proxycurl/');
      console.log('   2. Get your API key');
      console.log('   3. Add it to GitHub Secrets as PROXYCURL_API_KEY');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
