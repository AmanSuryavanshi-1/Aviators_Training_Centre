#!/usr/bin/env node

/**
 * Script to fix Framer Motion easing string issues across the codebase
 * Replaces string-based easing with proper easing function imports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files to fix with their specific patterns
const filesToFix = [
  'src/components/shared/WhatsAppChat.tsx',
  'src/components/shared/UrgencyCTA.tsx',
  'src/components/shared/ThemeToggle.tsx',
  'src/components/shared/FAQ.tsx',
  'src/components/testimonials/TestimonialsSection.tsx',
  'src/components/testimonials/VideoCardSkeleton.tsx',
  'src/components/testimonials/TextTestimonialsCarousel.tsx',
  'src/components/testimonials/InfiniteVideoCarousel.tsx',
  'src/components/testimonials/EnhancedTestimonialsSection.tsx',
  'src/components/features/contact/ContactMapSection.tsx',
  'src/components/features/contact/ContactFormCard.tsx',
  'src/components/features/contact/ContactDetailsCard.tsx',
  'src/components/features/courses/AboutSection.tsx',
  'src/components/features/courses/HeroSection.tsx',
  'src/components/features/courses/PilotPathway.tsx',
  'src/components/features/courses/WhyChooseUs.tsx',
  'src/components/features/courses/CoursesSection.tsx',
  'src/components/features/blog/BlogCard.tsx'
];

// Easing replacements
const easingReplacements = [
  { from: 'ease: "easeOut"', to: 'ease: easingFunctions.easeOut' },
  { from: 'ease: "easeIn"', to: 'ease: easingFunctions.easeIn' },
  { from: 'ease: "easeInOut"', to: 'ease: easingFunctions.easeInOut' },
  { from: 'ease: "linear"', to: 'ease: easingFunctions.linear' },
  { from: 'ease: "circOut"', to: 'ease: easingFunctions.circOut' },
  { from: 'ease: "backOut"', to: 'ease: easingFunctions.backOut' },
  { from: 'ease: "anticipate"', to: 'ease: easingFunctions.anticipate' }
];

function addImportIfNeeded(content, filePath) {
  // Check if the file already has the import
  if (content.includes("import { easingFunctions }") || content.includes("import { commonVariants }")) {
    return content;
  }

  // Check if the file uses any easing functions
  const needsEasing = easingReplacements.some(replacement => 
    content.includes(replacement.to)
  );

  if (!needsEasing) {
    return content;
  }

  // Find the last import statement
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ') && !lines[i].includes('//')) {
      lastImportIndex = i;
    }
  }

  if (lastImportIndex !== -1) {
    lines.splice(lastImportIndex + 1, 0, "import { easingFunctions } from '@/lib/animations/easing';");
    return lines.join('\n');
  }

  return content;
}

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Apply easing replacements
    easingReplacements.forEach(replacement => {
      if (content.includes(replacement.from)) {
        content = content.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.to);
        modified = true;
      }
    });

    // Add import if needed
    if (modified) {
      content = addImportIfNeeded(content, filePath);
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🔧 Fixing Framer Motion easing issues...\n');

  filesToFix.forEach(fixFile);

  console.log('\n✨ Framer Motion easing fixes completed!');
  console.log('\n📝 Summary:');
  console.log('- Replaced string-based easing with proper easing functions');
  console.log('- Added necessary imports where needed');
  console.log('- All components should now have proper TypeScript types');
  
  console.log('\n🧪 Running TypeScript check...');
  try {
    execSync('npm run type-check', { stdio: 'inherit' });
    console.log('✅ TypeScript check passed!');
  } catch (error) {
    console.log('⚠️  TypeScript check failed. Please review the remaining issues.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixFile, easingReplacements };