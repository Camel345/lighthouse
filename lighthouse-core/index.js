/**
 * @license Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const Runner = require('./runner');
const log = require('lighthouse-logger');
const ChromeProtocol = require('./gather/connections/cri.js');
const Config = require('./config/config');

/*
 * The relationship between these root modules:
 *
 *   index.js  - the require('lighthouse') hook for Node modules (including the CLI)
 *
 *   runner.js - marshalls the actions that must be taken (Gather / Audit)
 *               config file is used to determine which of these actions are needed
 *
 *   lighthouse-cli \
 *                   -- index.js  \
 *                                 ----- runner.js ----> [Gather / Audit]
 *           lighthouse-extension /
 *
 */

/**
 * @param {string=} url
 * @param {LH.Flags=} flags
 * @param {LH.Config.Json=} configJSON
 * @return {Promise<LH.RunnerResult|undefined>}
 */
async function lighthouse(url, flags, configJSON) {
  // TODO(bckenny): figure out Flags types.
  flags = flags || /** @type {LH.Flags} */ ({});

  // set logging preferences, assume quiet
  flags.logLevel = flags.logLevel || 'error';
  log.setLevel(flags.logLevel);

  // Use ConfigParser to generate a valid config file
  const config = new Config(configJSON, flags);
  const connection = new ChromeProtocol(flags.port, flags.hostname);

  // kick off a lighthouse run
  return Runner.run(connection, {url, config});
}

lighthouse.getAuditList = Runner.getAuditList;
lighthouse.traceCategories = require('./gather/driver').traceCategories;
lighthouse.Audit = require('./audits/audit');
lighthouse.Gatherer = require('./gather/gatherers/gatherer');

module.exports = lighthouse;
