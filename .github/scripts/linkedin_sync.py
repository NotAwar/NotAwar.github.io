#!/usr/bin/env python3
"""
LinkedIn Data Sync Script

This script fetches both LinkedIn profile data and recent posts
and saves them to data files for use in the Jekyll site.

Requires the following environment variables:
- LINKEDIN_CLIENT_ID
- LINKEDIN_CLIENT_SECRET
- LINKEDIN_ACCESS_TOKEN
"""

import os
import yaml
import requests
import json
from datetime import datetime
import sys

# LinkedIn API Configuration
CLIENT_ID = os.getenv('LINKEDIN_CLIENT_ID')
CLIENT_SECRET = os.getenv('LINKEDIN_CLIENT_SECRET')
ACCESS_TOKEN = os.getenv('LINKEDIN_ACCESS_TOKEN')

if not all([CLIENT_ID, CLIENT_SECRET, ACCESS_TOKEN]):
    print("Warning: LinkedIn API credentials are missing. Using sample data instead.")
    USE_SAMPLE_DATA = True
else:
    USE_SAMPLE_DATA = False

def fetch_linkedin_profile():
    """Fetch LinkedIn profile data"""
    
    if USE_SAMPLE_DATA:
        return generate_sample_profile()
    
    # URL for LinkedIn Profile API
    url = "https://api.linkedin.com/v2/me"
    
    # Headers for authentication
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json"
    }
    
    # Fields to request
    params = {
        "projection": "(id,firstName,lastName,headline,profilePicture(displayImage~:playableStreams),vanityName)"
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        profile_data = response.json()
        
        # Format the profile data
        formatted_profile = {
            "id": profile_data.get("id", ""),
            "firstName": profile_data.get("firstName", {}).get("localized", {}).get("en_US", ""),
            "lastName": profile_data.get("lastName", {}).get("localized", {}).get("en_US", ""),
            "headline": profile_data.get("headline", {}).get("localized", {}).get("en_US", ""),
            "vanityName": profile_data.get("vanityName", ""),
            "profileUrl": f"https://www.linkedin.com/in/{profile_data.get('vanityName', '')}"
        }
        
        # Try to get profile picture if available
        try:
            picture_elements = profile_data.get("profilePicture", {}).get("displayImage~", {}).get("elements", [])
            if picture_elements:
                # Get the highest resolution image
                formatted_profile["profilePicture"] = picture_elements[-1].get("identifiers", [])[0].get("identifier", "")
        except Exception as e:
            print(f"Error extracting profile picture: {e}")
        
        return formatted_profile
        
    except Exception as e:
        print(f"Error fetching LinkedIn profile: {e}")
        return generate_sample_profile()

def fetch_linkedin_cv():
    """Fetch LinkedIn CV data (positions, education, skills)"""
    
    if USE_SAMPLE_DATA:
        return generate_sample_cv()
    
    cv_data = {
        "positions": [],
        "education": [],
        "skills": []
    }
    
    # Headers for authentication
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json"
    }
    
    # 1. Fetch positions
    try:
        positions_url = "https://api.linkedin.com/v2/positions"
        params = {"q": "members", "members": "urn:li:person:{PERSON_ID}"}  # Replace with your LinkedIn ID
        
        response = requests.get(positions_url, headers=headers, params=params)
        response.raise_for_status()
        
        positions_data = response.json()
        
        for position in positions_data.get("elements", []):
            cv_data["positions"].append({
                "title": position.get("title", {}).get("localized", {}).get("en_US", ""),
                "company": position.get("name", {}).get("localized", {}).get("en_US", ""),
                "startDate": format_date(position.get("startDate", {})),
                "endDate": format_date(position.get("endDate", {})) if position.get("endDate") else "Present",
                "description": position.get("description", {}).get("localized", {}).get("en_US", "")
            })
    
    except Exception as e:
        print(f"Error fetching positions: {e}")
    
    # 2. Fetch education (similar approach)
    # 3. Fetch skills (similar approach)
    
    # If any section is empty, use sample data
    if not cv_data["positions"]:
        return generate_sample_cv()
    
    return cv_data

def format_date(date_obj):
    """Format LinkedIn date object (year, month)"""
    if not date_obj:
        return ""
    
    year = date_obj.get("year", "")
    month = date_obj.get("month", "")
    
    if month and year:
        return f"{month}/{year}"
    elif year:
        return str(year)
    else:
        return ""

def fetch_linkedin_posts():
    """Fetch recent posts from LinkedIn"""
    
    if USE_SAMPLE_DATA:
        return generate_sample_posts()
    
    # URL for LinkedIn Posts API (using v2 API)
    url = "https://api.linkedin.com/v2/ugcPosts"
    
    # Headers for authentication
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json"
    }
    
    # Parameters for the request
    params = {
        "q": "authors",
        "authors": "urn:li:person:{PERSON_ID}",  # Replace with your LinkedIn person ID
        "count": 10  # Number of posts to retrieve
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        data = response.json()
        
        # Process and format the posts
        posts = []
        for item in data.get("elements", []):
            # Example structure - adjust based on actual API response
            post = {
                "id": item.get("id", ""),
                "date": item.get("created", {}).get("time", ""),
                "title": extract_title(item),
                "excerpt": extract_excerpt(item),
                "url": f"https://www.linkedin.com/feed/update/{item.get('id', '')}"
            }
            posts.append(post)
        
        return posts
    
    except Exception as e:
        print(f"Error fetching LinkedIn posts: {e}")
        return generate_sample_posts()

def extract_title(post_data):
    """Extract a title from the LinkedIn post data"""
    # LinkedIn posts don't have explicit titles, so we extract from content
    content = post_data.get("specificContent", {}).get("com.linkedin.ugc.ShareContent", {}).get("text", "")
    title = content.split('\n')[0][:60]  # First line, truncated to 60 chars
    
    if len(title) < len(content) and len(title) == 60:
        title += "..."
    
    return title

def extract_excerpt(post_data):
    """Extract an excerpt from the LinkedIn post data"""
    content = post_data.get("specificContent", {}).get("com.linkedin.ugc.ShareContent", {}).get("text", "")
    # Skip first line if we're using it as title
    if '\n' in content:
        content = '\n'.join(content.split('\n')[1:])
    
    excerpt = content[:200]  # First 200 chars
    
    if len(excerpt) < len(content):
        excerpt += "..."
    
    return excerpt

def generate_sample_profile():
    """Generate sample LinkedIn profile data for testing"""
    return {
        "id": "sample-id",
        "firstName": "Awar",
        "lastName": "Abdulkarim",
        "headline": "Senior Cloud Engineer | Cloud Native Competency Lead",
        "vanityName": "notawar",
        "profileUrl": "https://www.linkedin.com/in/notawar",
        "profilePicture": "https://media.licdn.com/dms/image/sample-profile-pic.jpg"
    }

def generate_sample_cv():
    """Generate sample LinkedIn CV data for testing"""
    return {
        "positions": [
            {
                "title": "Senior Cloud Engineer",
                "company": "Tech Company Inc.",
                "startDate": "01/2021",
                "endDate": "Present",
                "description": "Leading cloud-native initiatives and infrastructure modernization."
            },
            {
                "title": "DevOps Engineer",
                "company": "Digital Solutions Ltd",
                "startDate": "03/2018",
                "endDate": "12/2020",
                "description": "Implemented CI/CD pipelines and container orchestration."
            }
        ],
        "education": [
            {
                "school": "University of Technology",
                "degree": "Master's Degree, Computer Science",
                "startDate": "2016",
                "endDate": "2018"
            },
            {
                "school": "Technical College",
                "degree": "Bachelor's Degree, Computer Engineering",
                "startDate": "2012",
                "endDate": "2016"
            }
        ],
        "skills": [
            "Cloud Architecture", 
            "Kubernetes",
            "Docker",
            "CI/CD",
            "Infrastructure as Code",
            "AWS",
            "Azure",
            "Python",
            "DevOps"
        ]
    }

def generate_sample_posts():
    """Generate sample LinkedIn post data for testing"""
    return [
        {
            "id": "sample1",
            "date": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "title": "Cloud Native Architecture Patterns",
            "excerpt": "Recently I've been exploring interesting patterns in cloud-native architectures. Here are 3 key takeaways that can help improve scalability and resilience...",
            "url": "https://www.linkedin.com/in/notawar/"
        },
        {
            "id": "sample2",
            "date": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "title": "Kubernetes Tips and Tricks",
            "excerpt": "After working with Kubernetes for several years, I've compiled these best practices that can save your team significant debugging time...",
            "url": "https://www.linkedin.com/in/notawar/"
        },
        {
            "id": "sample3", 
            "date": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "title": "DevOps Culture: Beyond the Tools",
            "excerpt": "Tools are important, but the real power of DevOps comes from cultural transformation. Here's how we implemented DevOps principles across our organization...",
            "url": "https://www.linkedin.com/in/notawar/"
        }
    ]

def save_to_yml(data, output_path):
    """Save data to YAML file"""
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Write data to YAML file
    with open(output_path, 'w') as file:
        yaml.dump(data, file, default_flow_style=False)
    
    print(f"Successfully saved data to {output_path}")

if __name__ == "__main__":
    # Define output paths
    profile_file = "_data/linkedin_profile.yml"
    cv_file = "_data/linkedin_cv.yml"
    posts_file = "_data/linkedin_posts.yml"
    
    # Fetch and save LinkedIn profile data
    profile_data = fetch_linkedin_profile()
    save_to_yml(profile_data, profile_file)
    
    # Fetch and save LinkedIn CV data
    cv_data = fetch_linkedin_cv()
    save_to_yml(cv_data, cv_file)
    
    # Fetch and save LinkedIn posts
    posts_data = fetch_linkedin_posts()
    save_to_yml(posts_data, posts_file)
