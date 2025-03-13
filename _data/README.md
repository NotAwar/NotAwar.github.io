# LinkedIn Sync Data

This directory contains data files that are automatically updated from your LinkedIn profile.

## Files

- `cv.yml`: Contains your professional experience, education, skills, and certifications
- `about.yml`: Contains your profile summary and current position
- `linkedin_last_updated.txt`: Contains the timestamp of the last successful sync
- `linkedin_raw_data.json`: Contains the raw data from your LinkedIn profile (backup)

## Updating Process

This data is automatically updated by the GitHub Action workflow in `.github/workflows/linkedin-sync.yml`, which runs daily. The workflow:

1. Fetches your LinkedIn profile data
2. Parses the data into structured YAML files
3. Commits any changes to the repository

## Manual Update

You can also trigger the sync manually by running the GitHub Action workflow from the Actions tab in your repository.
