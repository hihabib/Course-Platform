import fs from 'fs';
import path from 'path';

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')           
    .replace(/[^\w\-]+/g, '')        
    .replace(/\-\-+/g, '-')          
    .replace(/^-+/, '')              
    .replace(/-+$/, '');             
}

function parseDuration(filename) {
  const match = filename.match(/\((\d+)_(\d+)\)/); 
  if (!match) return '';
  return `${match[1]}:${match[2].padStart(2, '0')}`; 
}

function processSingleCourse(courseFolderPath) {
  const courseTitle = path.basename(courseFolderPath);
  const courseId = slugify(courseTitle);
  const thumbnailUrl = `/courses/${courseTitle}/thumbnail.jpg`;

  const courseContent = [];

  const chapters = fs.readdirSync(courseFolderPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  chapters.forEach(chapterDir => {
    const chapterName = chapterDir.name;
    const chapterPath = path.join(courseFolderPath, chapterName);

    const videos = fs.readdirSync(chapterPath, { withFileTypes: true })
      .filter(dirent => dirent.isFile() && dirent.name.toLowerCase().endsWith('.mp4'))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      .map(file => {
        const idMatch = file.name.match(/^(\d+)\./);
        const id = idMatch ? idMatch[1] : '';

        const titlePart = file.name
          .replace(/^(\d+\.\s*)?/, '') 
          .replace(/\(.*\)\.mp4$/, '') 
          .trim();

        const duration = parseDuration(file.name);

        return {
          id,
          title: titlePart,
          duration,
          completed: false,
          path: `/public/courses/${courseTitle}/${chapterName}/${file.name}`
        };
      });

    courseContent.push({
      chapter: chapterName || '',
      videos
    });
  });

  return {
    id: courseId,
    title: courseTitle,
    thumbnailUrl,
    courseContent
  };
}

// ================================
// Main
// ================================

const coursesBasePath = './public/courses'; // Root directory containing multiple courses

if (!fs.existsSync(coursesBasePath)) {
  console.error('❌ Base courses folder not found!');
  process.exit(1);
}

const courseFolders = fs.readdirSync(coursesBasePath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory());

const allCourses = courseFolders.map(courseDir => {
  const courseFolderPath = path.join(coursesBasePath, courseDir.name);
  return processSingleCourse(courseFolderPath);
});

fs.writeFileSync('./src/allCourses.json', JSON.stringify(allCourses, null, 2), 'utf8');
console.log('✅ Saved allCourses.json!');
