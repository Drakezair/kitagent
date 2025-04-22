import fg from 'fast-glob';

export async function loadAllMCP(projectDir: string) {
  const toolFiles = await fg(['**/*.mcp.{ts,js}'], {
    cwd: projectDir,
    absolute: true,
  });

  for (const file of toolFiles) {
    try {
      await import(file);
      console.log(`📋 MCP loaded: ${file}`);
    } catch (err) {
      console.error(`❌ Failed to load tool from ${file}:`, err);
    }
  }
}
