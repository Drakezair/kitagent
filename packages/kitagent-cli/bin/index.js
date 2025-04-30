#!/usr/bin/env node

import { fileURLToPath } from 'url';
import path from 'path';

// ESM-friendly __dirname equivalent
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Dynamic import for ESM compatibility
import('../dist/index.js')
    .catch(error => {
        console.error('Error starting CLI:', error);
        process.exit(1);
    });