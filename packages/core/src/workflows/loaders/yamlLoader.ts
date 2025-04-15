import fs from 'fs';
import yaml from 'js-yaml';
import {ChatConfig, WorkflowConfig} from '../../types';

export function loadWorkflowFromYaml(path: string): WorkflowConfig {
  const file = fs.readFileSync(path, 'utf-8');
  const data = yaml.load(file);
  return data as WorkflowConfig;
}


export function loadChatFromYaml(path: string): ChatConfig {
  const file = fs.readFileSync(path, 'utf-8');
  const data = yaml.load(file);
  return data as ChatConfig;
}