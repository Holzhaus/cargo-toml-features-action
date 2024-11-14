// Copyright (c) 2024 Jan Holthuis <jan.holthuis@rub.de>
//
// This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy
// of the MPL was not distributed with this file, You can obtain one at
// http://mozilla.org/MPL/2.0/.
//
// SPDX-License-Identifier: MPL-2.0

const core = require("@actions/core");
const toml = require("toml");
const fs = require("node:fs");

let cargo_toml_path;
try {
  cargo_toml_path = core.getInput("cargo-toml");
} catch (error) {
  let message = `Failed get input 'cargo-toml': ${error.message}`;
  core.setFailed(message);
  throw new Error(message);
}

let cargo_toml_content;
try {
  cargo_toml_content = fs.readFileSync(cargo_toml_path, "utf8");
} catch (error) {
  let message = `Failed to open file '${cargo_toml_path}': ${error.message}`;
  core.setFailed(message);
  throw new Error(message);
}

let cargo_toml;
try {
  cargo_toml = toml.parse(cargo_toml_content);
} catch (error) {
  let message = `Failed to parse '${cargo_toml_path}', line ${error.line}, column ${error.column}: ${error.message}`;
  core.setFailed(message);
  throw new Error(message);
}

let features = Object.getOwnPropertyNames(cargo_toml.features ?? {}).filter(
  (feature) => feature != "default",
);
core.setOutput("features", JSON.stringify(features));

const combinations = function* (pool, r) {
  let n = pool.length;
  if (r > n) {
    return;
  }

  let indices = [...Array(r).keys()];

  yield indices.map((i) => pool[i]);

  while (true) {
    let i = -1;
    for (let k = r - 1; k >= 0; k--) {
      if (indices[k] != k + n - r) {
        i = k;
        break;
      }
    }

    if (i < 0) {
      return;
    }

    indices[i] += 1;

    for (let j = i + 1; j < r; j++) {
      indices[j] = indices[j - 1] + 1;
    }

    yield indices.map((i) => pool[i]);
  }
};

const combinations_all_lengths = function* (pool) {
  for (let i = 0; i <= pool.length; i++) {
    yield* combinations(pool, i);
  }
};

let feature_combinations = Array.from(combinations_all_lengths(features));
core.setOutput("feature-combinations", JSON.stringify(feature_combinations));
