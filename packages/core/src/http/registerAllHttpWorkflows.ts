import express from 'express';
import fg from 'fast-glob';
import {loadWorkflowFromYaml} from '../workflows/loaders/yamlLoader';
import {runWorkflow} from '../workflows/engine/runner';
import multer from "multer";

const upload = multer({storage: multer.memoryStorage()});


export async function registerAllHttpWorkflows(app: express.Express, projectDir: string) {
  const workflowFiles = await fg(['**/*.wf.yml'], {
    cwd: projectDir,
    absolute: true,
  });

  for (const file of workflowFiles) {
    try {
      const config = loadWorkflowFromYaml(file);
      if (!config.http) continue;

      const method = (config.http.method || 'post').toLowerCase();
      const route = config.http.path;

      (app as any)[method](route, upload.any(), async (req: any, res: any) => {
        try {
          const context = {...config.globals, body: req.body, queryParams: {...req.query}, files: req.files, headers: req.headers};
          console.log("🏃‍♂️‍➡️ Running Workflow: ", JSON.stringify(config, null, 2));
          const result = await runWorkflow({...config, globals: context}, {...req.body, ...req.query, ...req.params});
          res.json(result);
        } catch (err: any) {
          console.error(`❌ Error in workflow "${config.name}":`, err);
          res.status(500).json({error: 'Failed to execute workflow', message: err.message});
        }
      });

      console.log(`🔗 Workflow registered: [${method.toUpperCase()}] ${route}`);
    } catch (err) {
      console.error(`❌ Failed to load workflow ${file}:`, err);
    }
  }
}
