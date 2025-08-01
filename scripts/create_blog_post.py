import os
import json
def create_blog_post(data, output_folder):
    """
    Create a blog post file from JSON data.

    :param data: JSON object containing blog post fields.
    :param output_folder: The folder to save the markdown file.
    """
    # Ensure output folder exists
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Construct the blog post filename
    slug = data.get('slug', {}).get('current', 'untitled')
    filename = os.path.join(output_folder, f"{slug}.md")

    # Prepare the blog content from the JSON data
    content_lines = [
        f"---",
        f"title: "{data.get('title', 'Untitled')}"",
        f"date: "{data.get('publishedAt', '2025-01-01T00:00:00Z')}"",
        f"excerpt: "{data.get('excerpt', '')}"",
        f"category: "{data.get('category', '')}"",
        f"coverImage: "{data.get('coverImage', '')}"",
        f"author:",
        f"  name: "{data.get('author', {}).get('name', '')}"",
        f"  image: "{data.get('author', {}).get('image', '')}"",
        f"featured: {str(data.get('featured', False)).lower()}"
        f"---",
        '"
    ]

    # Add body content
    if 'body' in data:
        for block in data['body']:
            if block['_type'] == 'block':
                if block['style'] == 'h1':
                    content_lines.append(f"# {block['children'][0]['text']}")
                elif block['style'] == 'h2':
                    content_lines.append(f"## {block['children'][0]['text']}")
                elif block['style'] == 'normal':
                    content_lines.append(block['children'][0]['text'])
                content_lines.append('')

    # Write to markdown file
    with open(filename, 'w', encoding='utf-8') as file:
        file.write('\n'.join(content_lines))

    print(f"Blog post created: {filename}")

# Example of using the function
data = {
  "title": "Airline Industry Career Opportunities: Beyond Pilot Jobs in 2024",
  "slug": {
    "current": "airline-industry-career-opportunities-beyond-pilot-jobs"
  },
  "excerpt": "While pilot careers often capture the spotlight in aviation, the airline industry offers...",
  "category": "Aviation Careers",
  "coverImage": "/images/cover.jpg",
  "author": {
    "name": "Aman Suryavanshi",
    "image": "/images/aman.jpg"
  },
  "featured": True,
  "publishedAt": "2025-07-25T03:49:16.932Z",
  "body": [
    {
      "_type": "block",
      "style": "h1",
      "children": [
        {
          "_type": "span",
          "text": "Airline Industry Career Opportunities: Beyond Pilot Jobs in 2024"
        }
      ]
    },
    {
      "_type": "block",
      "style": "normal",
      "children": [
        {
          "_type": "span",
          "text": "While pilot careers often capture the spotlight in aviation, ..."
        }
      ]
    }
  ]
}

directory = 'A:\\_Coding_Notes_Projects_IMP_\\MAJOR PROJECTS\\Aviators_Training_Centre\\content\\blog'
create_blog_post(data, directory)

