/**
 * @fileoverview Central registry for all built-in VersaCode extensions.
 * This file imports all extension modules and exports them as a single array.
 * In a real-world scenario, this might be dynamically populated by scanning
 * a directory or reading a configuration file.
 */

import type { VersaCodeExtension } from './extensions-api';
import { coreFeaturesExtension } from '../extensions/core-features';
import { prettierFormatterExtension } from '../extensions/prettier-formatter';

// The main list of all extensions to be loaded by the IDE.
export const extensions: VersaCodeExtension[] = [
    coreFeaturesExtension,
    prettierFormatterExtension,
];
