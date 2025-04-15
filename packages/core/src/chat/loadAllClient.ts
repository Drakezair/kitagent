import fg from 'fast-glob';

export async function loadAllClients(projectDir: string) {
  const toolFiles = await fg(['**/*.client.{ts,js}'], {
    cwd: projectDir,
    absolute: true,
  });

  for (const file of toolFiles) {
    try {
      const mod = await import(file);
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
