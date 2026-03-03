// src/lib/config/constants.js

// Common path prefixes to strip when matching pasted file paths
export const COMMON_PREFIXES = [
  'src/lib/',
  'src/',
  'lib/',
  'app/',
  'client/',
  'server/',
  'components/',
  'utils/',
  './',
  '/'
];

// Regex for extracting file path from first-line comments
// Supports: //, <!-- -->, #, /* */
export const COMMENT_REGEX = /^(?:\/\/|<!--|#|\/\*)\s*(.+?)\s*(?:-->|\*\/)?$/;

// File size formatting
export const SIZE_UNITS = ['Bytes', 'KB', 'MB', 'GB'];

// Toast message durations (ms)
export const TOAST_DURATION = 3000;

// ZIP export defaults
export const ZIP_CONFIG = {
  compression: 'DEFLATE',
  compressionLevel: 6,
  filename: 'project.zip'
};

// Default folder structure if none pasted (optional)
export const DEFAULT_EMPTY_MESSAGE = 'Paste your folder structure to begin.';