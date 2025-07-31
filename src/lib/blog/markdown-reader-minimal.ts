// Minimal version for testing exports
import fs from 'fs';
import path from 'path';

export class MarkdownBlogReader {
  test() {
    return 'minimal reader working';
  }
}

export const markdownBlogReader = new MarkdownBlogReader();
export default markdownBlogReader;
