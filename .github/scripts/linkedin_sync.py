#!/usr/bin/env python3
"""
Enhanced LinkedIn Profile Scraper for GitHub Pages

This script fetches data from LinkedIn and updates data files for a GitHub Pages site.
"""

import os
import re
import yaml
import json
import time
import glob
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('linkedin_sync')

# Configuration
LINKEDIN_URL = "https://www.linkedin.com/in/notawar/"
DATA_DIR = "_data"
CV_FILE_PATH = f"{DATA_DIR}/cv.yml"
ABOUT_FILE_PATH = f"{DATA_DIR}/about.yml"
LAST_UPDATED_FILE = f"{DATA_DIR}/linkedin_last_updated.txt"
LINKEDIN_BACKUP_PATH = f"{DATA_DIR}/linkedin_raw_data.json"
CATEGORIES_FILE_PATH = f"{DATA_DIR}/categories.yml"
POSTS_DIR = "_posts"
LINKEDIN_EXTENDED_DIR = "_linkedin_extended"
SITE_URL = "https://NotAwar.github.io"

def fetch_linkedin_data() -> Dict[str, Any]:
    """
    Simplified mock function to fetch LinkedIn data.
    In a real environment, replace with actual API calls or web scraping.
    
    For testing purposes, we'll use hardcoded sample data.
    """
    logger.info("Fetching LinkedIn data from %s", LINKEDIN_URL)
    
    # In a real implementation, fetch from LinkedIn API or web scrape
    # For now, return sample data
    sample_data = {
        "basic_info": {
            "name": "Awar",
            "headline": "Senior Engineer",
            "location": "Your City, Country",
            "summary": "Experienced Senior Engineer specializing in cloud architecture and distributed systems."
        },
        "experience": [
            {
                "title": "Senior Engineer",
                "company": "Current Company", 
                "date_range": "January 2021 - Present",
                "description": "Leading cloud-native platform development and optimization."
            },
            {
                "title": "Software Engineer",
                "company": "Previous Company",
                "date_range": "June 2018 - December 2020",
                "description": "Developed and maintained high-performance APIs and services."
            }
        ],
        "education": [
            {
                "degree": "Master's in Computer Science",
                "school": "University Name",
                "date_range": "2018 - 2020",
                "description": "Focused on distributed systems and machine learning."
            }
        ],
        "skills": [
            "Cloud Architecture", 
            "AWS", 
            "Kubernetes", 
            "Python", 
            "Leadership",
            "System Design",
            "CI/CD",
            "DevOps"
        ],
        "certifications": [
            "AWS Certified Solutions Architect - Professional",
            "Google Cloud Professional Engineer"
        ]
    }
    
    return sample_data

def format_date(date_str: str) -> str:
    """Convert date formats to DD/MM/YYYY format"""
    if not date_str:
        return ""
    
    # Handle "Present" in date ranges
    date_parts = date_str.split(" - ")
    result = []
    
    for part in date_parts:
        if part.lower() == "present":
            result.append("Present")
        else:
            # Try various date formats
            for fmt in ["%b %Y", "%B %Y", "%m/%Y", "%Y"]:
                try:
                    date_obj = datetime.strptime(part, fmt)
                    result.append(date_obj.strftime("%d/%m/%Y"))
                    break
                except ValueError:
                    continue
            else:
                # If no format matched, keep original
                result.append(part)
    
    return " - ".join(result)

def update_cv_file(data: Dict[str, Any]) -> None:
    """Update the CV data file with LinkedIn information"""
    logger.info("Updating CV data file")
    
    cv_data = {
        "basics": {
            "name": data["basic_info"]["name"],
            "label": data["basic_info"]["headline"],
            "summary": data["basic_info"]["summary"],
            "location": data["basic_info"]["location"],
            "website": SITE_URL,
            "profiles": [
                {
                    "network": "LinkedIn",
                    "url": LINKEDIN_URL
                }
            ]
        },
        "work": [],
        "education": [],
        "skills": data["skills"],
        "certifications": data["certifications"]
    }
    
    # Add work experience
    for job in data["experience"]:
        cv_data["work"].append({
            "position": job["title"],
            "company": job["company"],
            "date": format_date(job["date_range"]),
            "summary": job["description"]
        })
    
    # Add education
    for edu in data["education"]:
        cv_data["education"].append({
            "degree": edu["degree"],
            "institution": edu["school"],
            "date": format_date(edu["date_range"]),
            "description": edu["description"]
        })
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(CV_FILE_PATH), exist_ok=True)
    
    # Write YAML file
    with open(CV_FILE_PATH, 'w') as file:
        yaml.dump(cv_data, file, default_flow_style=False)

def update_about_file(data: Dict[str, Any]) -> None:
    """Update the About page data file with LinkedIn information"""
    logger.info("Updating About page data file")
    
    # Create about data structure
    about_data = {
        "name": data["basic_info"]["name"],
        "tagline": data["basic_info"]["headline"],
        "summary": data["basic_info"]["summary"],
        "location": data["basic_info"]["location"],
        "linkedin_url": LINKEDIN_URL,
        "current_position": {
            "title": data["experience"][0]["title"] if data["experience"] else "",
            "company": data["experience"][0]["company"] if data["experience"] else ""
        },
        "skills": data["skills"][:8] if len(data["skills"]) >= 8 else data["skills"]
    }
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(ABOUT_FILE_PATH), exist_ok=True)
    
    # Write YAML file
    with open(ABOUT_FILE_PATH, 'w') as file:
        yaml.dump(about_data, file, default_flow_style=False)

def update_categories(data: Dict[str, Any]) -> None:
    """Create categories based on LinkedIn skills and experience"""
    logger.info("Updating categories from LinkedIn data")
    
    categories = {
        "companies": [],
        "skills": []
    }
    
    # Add companies
    for job in data["experience"]:
        company = job["company"].strip()
        if company and company not in categories["companies"]:
            categories["companies"].append(company)
    
    # Add skills
    for skill in data["skills"]:
        categories["skills"].append(skill.strip())
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(CATEGORIES_FILE_PATH), exist_ok=True)
    
    # Write YAML file
    with open(CATEGORIES_FILE_PATH, 'w') as file:
        yaml.dump(categories, file, default_flow_style=False)

def update_linkedin_urls(data: Dict[str, Any]) -> None:
    """Update all references to LinkedIn URLs to ensure consistency"""
    logger.info("Updating LinkedIn URLs in files")
    
    # Update in all markdown files
    md_files = list(Path(".").glob("**/*.md")) + list(Path(".").glob("**/*.html"))
    
    for file_path in md_files:
        if "_site" in str(file_path) or ".git" in str(file_path):
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Replace different variations of LinkedIn URLs with the canonical one
            content = re.sub(
                r'https?://(?:www\.)?linkedin\.com/in/notawar/?(?:\?.*)?',
                LINKEDIN_URL,
                content
            )
            
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(content)
                
        except Exception as e:
            logger.error(f"Error updating LinkedIn URL in {file_path}: {e}")

def update_last_updated_file() -> None:
    """Update the last updated timestamp file"""
    os.makedirs(os.path.dirname(LAST_UPDATED_FILE), exist_ok=True)
    with open(LAST_UPDATED_FILE, 'w') as file:
        file.write(datetime.now().strftime("%d/%m/%Y %H:%M:%S"))

def main() -> None:
    """Main function to coordinate the LinkedIn data sync process"""
    logger.info("Starting LinkedIn profile sync")
    
    try:
        # Fetch LinkedIn data
        linkedin_data = fetch_linkedin_data()
        
        # Save raw data for backup/debugging
        os.makedirs(os.path.dirname(LINKEDIN_BACKUP_PATH), exist_ok=True)
        with open(LINKEDIN_BACKUP_PATH, 'w') as f:
            json.dump(linkedin_data, f, indent=2)
        
        # Update files
        update_cv_file(linkedin_data)
        update_about_file(linkedin_data)
        update_categories(linkedin_data)
        update_linkedin_urls(linkedin_data)
        update_last_updated_file()
        
        logger.info("LinkedIn profile sync completed successfully")
        
    except Exception as e:
        logger.error(f"Error during LinkedIn sync: {e}", exc_info=True)
        exit(1)

if __name__ == "__main__":
    main()
