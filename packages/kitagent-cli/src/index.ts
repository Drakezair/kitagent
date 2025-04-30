import {cac} from 'cac';
import chalk from 'chalk';
import { createProject } from './commands/create.js';

const cli = cac('create-kitagent');

cli.command('[project-directory]', 'Create a new KitAgent project')
  .option('-t, --template <template>', 'Template to use (default: ticket-manager)')
  .option('--skip-git', 'Skip git initialization')
  .option('--skip-install', 'Skip package installation')
  .action(async (projectDir: any, options: any) => {
    try {
      await createProject({
        projectDir: projectDir || '.',
        template: options.template || 'ticket-manager',
        skipGit: options.skipGit || false,
        skipInstall: options.skipInstall || false
      });
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

cli.help();
cli.version(process.env.npm_package_version || '0.1.0');

// Parse CLI arguments
cli.parse();

// Show help if no args provided
if (!process.argv.slice(2).length) {
  cli.outputHelp();
}