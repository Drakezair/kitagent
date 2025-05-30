import fg from 'fast-glob';
import { pathToFileURL } from 'url';

export async function loadAllTools(projectDir: string) {
  const toolFiles = await fg(['**/*.tool.{ts,js}'], {
    cwd: projectDir,
    absolute: true,
  });

  for (const file of toolFiles) {
    try {
      // Convert Windows paths to proper file:// URLs for ESM
      const fileUrl = pathToFileURL(file).href;
      await import(fileUrl);
      console.log(`🔧 Tool loaded: ${file}`);
    } catch (err) {
      console.error(`❌ Failed to load tool from ${file}:`, err);
    }
  }
}