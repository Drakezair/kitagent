import express from 'express';
import fg from 'fast-glob';
import { loadChatFromYaml } from '../workflows/loaders/yamlLoader';
import { runChat } from './runner';
import multer from 'multer';
import crypto from 'crypto'; // Para generar sessionId

const upload = multer({ storage: multer.memoryStorage() });

export async function registerAllHttpChats(app: express.Express, projectDir: string) {
  const chatFiles = await fg(['**/*.chat.yml'], {
    cwd: projectDir,
    absolute: true,
  });

  for (const file of chatFiles) {
    try {
      const config = await loadChatFromYaml(file);
      if (!config.http) continue;

      const method = (config.http.method || 'post').toLowerCase();
      const route = config.http.path || `/chat/${config.name}`;

      (app as any)[method](route, upload.any(), async (req: any, res: any) => {
        try {
          const sessionId = req.headers['x-session-id'] || crypto.randomUUID(); // ⚠️ Aquí se genera si no viene

          const context = {
            ...config.globals,
            workflowConfig: config,
            body: req.body,
            queryParams: req.query,
            files: req.files,
            headers: req.headers,
          };


          const result = await runChat({
            sessionId,
            message: req.body.message,
            client: config.client,
            role: req.body.role,
            tools: config.tools as string[],
            context,
          });

          res.json({
            sessionId, // 💡 Devolvemos sessionId en la respuesta
            response: result,
          });
        } catch (err) {
          console.error(`❌ Error in chat "${config.name}":`, err);
          res.status(500).json({ error: 'Failed to execute chat' });
        }
      });

      console.log(`💬 Chat registered: [${method.toUpperCase()}] ${route}`);
    } catch (err) {
      console.error(`❌ Failed to load chat ${file}:`, err);
    }
  }
}
