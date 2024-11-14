# Cargo Features Actions

Determine feature combinations from `Cargo.toml`.


## Example

Here's an example workflow that tests all feature combinations of a Rust project:

```yaml
name: Build
on: [push, pull_request]

jobs:
    cargo-toml-features:
        name: Generate Feature Combinations
        runs-on: ubuntu-latest
        outputs:
            feature-combinations: ${{ steps.cargo-toml-features.outputs.feature-combinations }}
        steps:
            - name: Check out repository
              uses: actions/checkout@v4
            - name: Determine Cargo Features
              id: cargo-toml-features
              uses: Holzhaus/cargo-toml-features-action@daed80e52cba9fefe0f605b58e74d95b4056942e

    build:
        needs: cargo-toml-features
        runs-on: ubuntu-latest
        strategy:
            matrix:
                features: ${{ fromJson(needs.cargo-toml-features.outputs.feature-combinations) }}
        steps:
            - name: Check out repository
              uses: actions/checkout@v4
            - name: Print Rust version
              run: rustc -vV
            - name: Run tests
              run: cargo test --no-default-features --features "${{ join(matrix.features, ',') }}" --verbose
            - name: Run bench
              run: cargo bench --no-default-features --features "${{ join(matrix.features, ',') }}" --verbose
            - name: Run doc
              run: cargo doc --no-default-features --features "${{ join(matrix.features, ',') }}" --verbose
```


## Inputs

| Name         | Description                | Default      |
| ------------ | -------------------------- | ------------ |
| `cargo-toml` | Path of `Cargo.toml` file. | `Cargo.toml` |


## Outputs

| Name                    | Description                                                        | Example                                              |
| ----------------------- | ------------------------------------------------------------------ | ---------------------------------------------------- |
| `features`              | A JSON array for features found in `Cargo.toml`.                   | `["feat-a", "feat-b"]`                               |
| `feature-combinationss` | A JSON array of all possible feature combinations in `Cargo.toml`. | `[[], ["feat-a"], ["feat-b"], ["feat-a", "feat-b"]]` |
