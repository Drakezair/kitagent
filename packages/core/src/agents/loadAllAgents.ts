import fg from 'fast-glob';

export async function loadAllAgents(projectDir: string) {
  const toolFiles = await fg(['**/*.agent.{ts,js}'], {
    cwd: projectDir,
    absolute: true,
  });

  for (const file of toolFiles) {
    try {
      await import(file);
      console.log(`🤖 Agent loaded: ${file}`);
    } catch (err) {
      console.error(`❌ Failed to load agent from ${file}:`, err);
    }
  }
}
