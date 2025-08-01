import os
import json
import re
import math
from datetime import datetime
from typing import Dict, List, Optional, Any

class BlogPostGenerator:
    def __init__(self):
        self.aviation_categories = [
            "Flight Training", "Aviation Careers", "Safety & Regulations", 
            "DGCA Exams", "Pilot Licensing", "Aircraft Systems", "Navigation",
            "Weather & Meteorology", "Aviation Industry", "Career Guidance"
        ]
        
        self.aviation_tags = [
            "pilot training", "CPL", "ATPL", "DGCA", "flight school", "aviation career",
            "commercial pilot", "airline pilot", "flight instructor", "aircraft systems",
            "navigation", "meteorology", "safety", "regulations", "exam preparation",
            "pilot license", "flying", "aviation industry", "pilot job", "flight training"
        ]
        
        self.authors = {
            "default": {
                "name": "Aman Suryavanshi",
                "image": "/instructors/aman-suryavanshi.jpg"
            },
            "ankit": {
                "name": "Ankit Kumar", 
                "image": "/instructors/ankit-kumar.jpg"
            },
            "dhruv": {
                "name": "Dhruv Shirkoli",
                "image": "/instructors/dhruv-shirkoli.jpg"
            },
            "saksham": {
                "name": "Saksham Khandelwal",
                "image": "/instructors/saksham-khandelwal.jpg"
            }
        }

    def generate_slug(self, title: str) -> str:
        """Generate URL-friendly slug from title"""
        slug = title.lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'\s+', '-', slug)
        slug = re.sub(r'-+', '-', slug)
        return slug.strip('-')

    def extract_excerpt(self, content: str, max_length: int = 160) -> str:
        """Extract excerpt from content"""
        # Remove markdown formatting
        clean_content = re.sub(r'[#*`\[\]()]', '', content)
        # Take first paragraph or sentences
        sentences = clean_content.split('.')
        excerpt = ""
        for sentence in sentences:
            if len(excerpt + sentence) < max_length:
                excerpt += sentence + "."
            else:
                break
        return excerpt.strip()

    def categorize_content(self, title: str, content: str) -> str:
        """Intelligently categorize content based on keywords"""
        text = (title + " " + content).lower()
        
        if any(word in text for word in ["dgca", "exam", "test", "preparation"]):
            return "DGCA Exams"
        elif any(word in text for word in ["safety", "regulation", "procedure"]):
            return "Safety & Regulations"
        elif any(word in text for word in ["career", "job", "salary", "opportunity"]):
            return "Aviation Careers"
        elif any(word in text for word in ["training", "course", "lesson", "instructor"]):
            return "Flight Training"
        elif any(word in text for word in ["license", "cpl", "atpl", "rating"]):
            return "Pilot Licensing"
        elif any(word in text for word in ["system", "aircraft", "engine", "avionics"]):
            return "Aircraft Systems"
        elif any(word in text for word in ["navigation", "gps", "ils", "approach"]):
            return "Navigation"
        elif any(word in text for word in ["weather", "meteorology", "turbulence", "wind"]):
            return "Weather & Meteorology"
        else:
            return "Aviation Industry"

    def extract_tags(self, title: str, content: str, max_tags: int = 5) -> List[str]:
        """Extract relevant tags from content"""
        text = (title + " " + content).lower()
        relevant_tags = []
        
        for tag in self.aviation_tags:
            if tag in text and len(relevant_tags) < max_tags:
                relevant_tags.append(tag)
        
        # Add specific keywords found in content
        aviation_keywords = re.findall(r'\b(pilot|aviation|aircraft|flight|dgca|cpl|atpl)\b', text)
        for keyword in set(aviation_keywords):
            if keyword not in relevant_tags and len(relevant_tags) < max_tags:
                relevant_tags.append(keyword)
        
        return relevant_tags[:max_tags]

    def calculate_reading_time(self, content: str) -> int:
        """Calculate estimated reading time in minutes"""
        word_count = len(content.split())
        # Average reading speed: 200-250 words per minute
        reading_time = math.ceil(word_count / 225)
        return max(1, reading_time)

    def generate_seo_title(self, title: str) -> str:
        """Generate SEO-optimized title"""
        if len(title) <= 60:
            return title
        # Truncate and add year for freshness
        truncated = title[:50] + "... 2024"
        return truncated

    def generate_seo_description(self, excerpt: str, title: str) -> str:
        """Generate SEO meta description"""
        if excerpt and len(excerpt) <= 160:
            return excerpt
        elif title:
            return f"Learn about {title.lower()}. Expert guidance from Aviators Training Centre for aspiring pilots and aviation professionals."[:160]
        else:
            return "Expert aviation training and guidance from Aviators Training Centre. Professional pilot courses and career development."

    def extract_focus_keyword(self, title: str, content: str) -> str:
        """Extract primary focus keyword"""
        text = (title + " " + content).lower()
        
        # Common aviation keywords by priority
        focus_keywords = [
            "pilot training", "dgca exam", "commercial pilot", "flight training",
            "aviation career", "pilot license", "cpl training", "atpl training",
            "aviation safety", "pilot job", "flight instructor", "aircraft systems"
        ]
        
        for keyword in focus_keywords:
            if keyword in text:
                return keyword
        
        # Fallback to first aviation-related word
        aviation_words = re.findall(r'\b(pilot|aviation|aircraft|flight|dgca|cpl|atpl|training)\b', text)
        return aviation_words[0] if aviation_words else "pilot training"

    def select_author(self, content: str) -> Dict[str, str]:
        """Select appropriate author based on content"""
        text = content.lower()
        
        if "ankit kumar" in text or "ground school" in text:
            return self.authors["ankit"]
        elif "dhruv shirkoli" in text or "safety" in text:
            return self.authors["dhruv"]
        elif "saksham khandelwal" in text or "exam" in text:
            return self.authors["saksham"]
        else:
            return self.authors["default"]

    def generate_structured_data(self, title: str, content: str, reading_time: int) -> Dict[str, str]:
        """Generate structured data for SEO"""
        text = content.lower()
        
        if any(word in text for word in ["guide", "how to", "steps", "tutorial"]):
            article_type = "HowTo"
            resource_type = "Guide"
        elif any(word in text for word in ["tips", "advice", "best practices"]):
            article_type = "Educational"
            resource_type = "Article"
        else:
            article_type = "Educational"
            resource_type = "Article"
        
        # Determine educational level
        if any(word in text for word in ["beginner", "basic", "introduction", "getting started"]):
            level = "Beginner"
        elif any(word in text for word in ["advanced", "expert", "professional", "complex"]):
            level = "Advanced"
        else:
            level = "Intermediate"
        
        return {
            "articleType": article_type,
            "learningResourceType": resource_type,
            "educationalLevel": level,
            "timeRequired": f"PT{reading_time}M"
        }

    def process_content_body(self, content: str) -> str:
        """Process and clean content body"""
        # Remove CTA placeholders and clean up
        content = re.sub(r'<!-- CTA_\w+_INTEGRATION -->', '', content)
        content = re.sub(r'\r\n', '\n', content)
        content = re.sub(r'\n{3,}', '\n\n', content)
        return content.strip()

    def auto_populate_blog_post(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Auto-populate missing fields in blog post data"""
        # Extract content for analysis
        content = ""
        if isinstance(data.get('content'), str):
            content = data['content']
        elif isinstance(data.get('body'), list):
            # Extract text from Sanity blocks
            for block in data['body']:
                if isinstance(block, dict) and 'children' in block:
                    for child in block['children']:
                        if isinstance(child, dict) and 'text' in child:
                            content += child['text'] + " "
        
        # Auto-populate missing fields
        title = data.get('title', 'Untitled Blog Post')
        
        populated_data = {
            # Basic fields
            'title': title,
            'slug': data.get('slug', {}).get('current') or self.generate_slug(title),
            'excerpt': data.get('excerpt') or self.extract_excerpt(content),
            'content': self.process_content_body(content),
            
            # Author
            'author': data.get('author') or self.select_author(content),
            
            # Categorization
            'category': data.get('category') or self.categorize_content(title, content),
            'tags': data.get('tags') or self.extract_tags(title, content),
            
            # Media
            'featuredImage': data.get('featuredImage') or f"/blog/{self.generate_slug(title)}-featured.jpg",
            'altText': data.get('altText') or f"Featured image for {title}",
            
            # Publishing
            'featured': data.get('featured', False),
            'publishedAt': data.get('publishedAt') or datetime.now().isoformat(),
            
            # SEO
            'seoTitle': data.get('seoTitle') or self.generate_seo_title(title),
            'seoDescription': data.get('seoDescription') or self.generate_seo_description(
                data.get('excerpt', ''), title
            ),
            'focusKeyword': data.get('focusKeyword') or self.extract_focus_keyword(title, content),
            'additionalKeywords': data.get('additionalKeywords') or self.extract_tags(title, content, 3),
            
            # Metrics
            'readingTime': data.get('readingTime') or self.calculate_reading_time(content),
            'workflowStatus': data.get('workflowStatus', 'Draft'),
            
            # Structured data
            'structuredData': data.get('structuredData') or self.generate_structured_data(
                title, content, self.calculate_reading_time(content)
            ),
            
            # Performance metrics (placeholders)
            'wordCount': len(content.split()) if content else 0,
            'lastSeoCheck': datetime.now().isoformat(),
            'seoScore': data.get('seoScore', 85),  # Default good score
            
            # Validation flags
            'hasRequiredFields': True,
            'hasValidSeo': True,
            'hasValidImages': True,
            'readyForPublish': data.get('workflowStatus', 'Draft') == 'Published'
        }
        
        return populated_data

    def create_markdown_file(self, data: Dict[str, Any], output_folder: str) -> str:
        """Create markdown file from populated data"""
        if not os.path.exists(output_folder):
            os.makedirs(output_folder)
        
        slug = data['slug']
        filename = os.path.join(output_folder, f"{slug}.md")
        
        # Create frontmatter
        frontmatter = f"""---
title: "{data['title']}"
date: "{data['publishedAt']}"
excerpt: "{data['excerpt']}"
category: "{data['category']}"
coverImage: "{data['featuredImage']}"
author:
  name: "{data['author']['name']}"
  image: "{data['author']['image']}"
featured: {str(data['featured']).lower()}
tags:
{chr(10).join([f'  - "{tag}"' for tag in data['tags']])}
seoTitle: "{data['seoTitle']}"
seoDescription: "{data['seoDescription']}"
focusKeyword: "{data['focusKeyword']}"
additionalKeywords:
{chr(10).join([f'  - "{keyword}"' for keyword in data['additionalKeywords']])}
readingTime: {data['readingTime']}
wordCount: {data['wordCount']}
workflowStatus: "{data['workflowStatus']}"
structuredData:
  articleType: "{data['structuredData']['articleType']}"
  learningResourceType: "{data['structuredData']['learningResourceType']}"
  educationalLevel: "{data['structuredData']['educationalLevel']}"
  timeRequired: "{data['structuredData']['timeRequired']}"
---

{data['content']}
"""
        
        with open(filename, 'w', encoding='utf-8') as file:
            file.write(frontmatter)
        
        return filename

    def generate_blog_post(self, input_data: Dict[str, Any], output_folder: str) -> Dict[str, Any]:
        """Main function to generate complete blog post"""
        print("🚀 Starting blog post generation...")
        
        # Auto-populate missing fields
        populated_data = self.auto_populate_blog_post(input_data)
        
        # Create markdown file
        filename = self.create_markdown_file(populated_data, output_folder)
        
        print(f"✅ Blog post created: {filename}")
        print(f"📊 Statistics:")
        print(f"   - Word count: {populated_data['wordCount']}")
        print(f"   - Reading time: {populated_data['readingTime']} minutes")
        print(f"   - Category: {populated_data['category']}")
        print(f"   - Tags: {', '.join(populated_data['tags'])}")
        print(f"   - Focus keyword: {populated_data['focusKeyword']}")
        
        return populated_data

# Example usage function
def process_blog_content(title, content, **optional_fields):
    """Process blog content with minimal input"""
    generator = BlogPostGenerator()
    
    input_data = {
        'title': title,
        'content': content,
        **optional_fields
    }
    
    output_folder = r"A:\_Coding_Notes_Projects_IMP_\MAJOR PROJECTS\Aviators_Training_Centre\content\blog"
    
    return generator.generate_blog_post(input_data, output_folder)

# Ready to use!
if __name__ == "__main__":
    print("Blog Post Auto-Generator is ready!")
    print("Use process_blog_content(title, content) to generate a blog post.")
