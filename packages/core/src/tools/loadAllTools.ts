import fg from 'fast-glob';

export async function loadAllTools(projectDir: string) {
  const toolFiles = await fg(['**/*.tool.{ts,js}'], {
    cwd: projectDir,
    absolute: true,
  });

  for (const file of toolFiles) {
    try {
      await import(file);
      console.log(`🔧 Tool loaded: ${file}`);
    } catch (err) {
      console.error(`❌ Failed to load tool from ${file}:`, err);
    }
  }
}
