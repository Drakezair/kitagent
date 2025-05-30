import fg from 'fast-glob';
import { pathToFileURL } from 'url';

export async function loadAllClients(projectDir: string) {
  const toolFiles = await fg(['**/*.client.{ts,js}'], {
    cwd: projectDir,
    absolute: true,
  });

  for (const file of toolFiles) {
    try {
      // Convert Windows paths to proper file:// URLs for ESM
      const fileUrl = pathToFileURL(file).href;
      const mod = await import(fileUrl);
      if (typeof mod.default === 'function') {
        mod.default();
        console.log(`🌐 Client loaded: ${file}`);
      }
      else {
        console.error(`❌ client in ${file} does not export a default function`);
      }
    } catch (err) {
      console.error(`❌ Failed to load client from ${file}:`, err);
    }
  }
}