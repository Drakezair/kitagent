import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import prompts from 'prompts';
import ora from 'ora';
import { execSync } from 'child_process';
import validateProjectName from 'validate-npm-package-name';
import { generateProject } from '../templates/generators.js';

interface CreateOptions {
  projectDir: string;
  template: string;
  skipGit: boolean;
  skipInstall: boolean;
}

/**
 * Validates the project name for npm package naming rules
 */
function validateNpmName(name: string): { valid: boolean; problems?: string[] } {
  const { validForNewPackages, errors, warnings } = validateProjectName(name);

  if (validForNewPackages) {
    return { valid: true };
  }

  return {
    valid: false,
    problems: [...(errors || []), ...(warnings || [])]
  };
}

/**
 * Creates a new KitAgent project
 */
export async function createProject(options: CreateOptions): Promise<void> {
  // Get absolute path for the project directory
  const targetDir = path.resolve(process.cwd(), options.projectDir);
  const projectName = path.basename(targetDir);

  // Validate project name
  const nameValidation = validateNpmName(projectName);
  if (!nameValidation.valid) {
    console.error(chalk.red(`Invalid project name: ${projectName}`));
    nameValidation.problems?.forEach(problem => {
      console.error(chalk.red(`  - ${problem}`));
    });
    process.exit(1);
  }

  // Check if target directory exists and is not empty
  let dirExists = false;
  try {
    const stats = await fs.stat(targetDir);
    dirExists = stats.isDirectory();
  } catch (error) {
    // Directory doesn't exist, which is fine
  }

  if (dirExists) {
    const files = await fs.readdir(targetDir);
    if (files.length > 0) {
      const { proceed } = await prompts({
        type: 'confirm',
        name: 'proceed',
        message: `Directory "${options.projectDir}" is not empty. Continue?`,
        initial: false
      });

      if (!proceed) {
        console.log(chalk.yellow('Operation cancelled.'));
        process.exit(0);
      }
    }
  }

  console.log();
  console.log(`Creating a new KitAgent project in ${chalk.green(targetDir)}`);
  console.log();

  // Create target directory if it doesn't exist
  await fs.ensureDir(targetDir);

  // Generate project files
  const generatingSpinner = ora('Generating project files...').start();
  try {
    await generateProject(targetDir, projectName);
    generatingSpinner.succeed('Project files generated');
  } catch (error: any) {
    generatingSpinner.fail('Failed to generate project files');
    console.error(chalk.red(error.message));
    process.exit(1);
  }

  // Initialize git repository
  if (!options.skipGit) {
    const gitSpinner = ora('Initializing git repository...').start();
    try {
      process.chdir(targetDir);
      execSync('git init', { stdio: 'ignore' });
      execSync('git add .', { stdio: 'ignore' });
      execSync('git commit -m "Initial commit from create-kitagent"', { stdio: 'ignore' });
      gitSpinner.succeed('Git repository initialized');
    } catch (error) {
      gitSpinner.warn('Failed to initialize git repository');
    }
  }

  // Install dependencies
  if (!options.skipInstall) {
    const installSpinner = ora('Installing dependencies...').start();
    try {
      // Check if yarn, pnpm or npm is available
      let command = 'npm';
      let args = ['install'];

      try {
        execSync('yarn --version', { stdio: 'ignore' });
        command = 'yarn';
        args = [];
      } catch (e) {
        try {
          execSync('pnpm --version', { stdio: 'ignore' });
          command = 'pnpm';
          args = ['install'];
        } catch (e) {
          // npm is the default
        }
      }

      process.chdir(targetDir);
      execSync(`${command} ${args.join(' ')}`, { stdio: 'ignore' });
      installSpinner.succeed(`Dependencies installed with ${command}`);
    } catch (error) {
      installSpinner.fail('Failed to install dependencies');
      console.log(chalk.yellow('You can install them manually by running npm install'));
    }
  }

  // Print success message with next steps
  console.log();
  console.log(chalk.green('Success! Your KitAgent project is ready.'));
  console.log();
  console.log('Inside this directory you can run:');
  console.log();
  console.log(`  ${chalk.cyan('npm run dev:watch')}`);
  console.log('    Starts the development server.');
  console.log();
  console.log(`  ${chalk.cyan('npm run build')}`);
  console.log('    Builds the app for production.');
  console.log();
  console.log('We suggest that you begin by:');
  console.log();
  if (options.projectDir !== '.') {
    console.log(`  ${chalk.cyan('cd')} ${options.projectDir}`);
  }
  console.log(`  ${chalk.cyan('npm run dev')}`);
  console.log();
  console.log('Happy hacking!');
}