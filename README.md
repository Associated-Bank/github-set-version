# github-set-version
Updates IAC env variables to a specific given version.


## Example

```yaml
name: Generate
jobs:
  generate:
    steps:
      - name: 'Get Next Version'
        id: semver
        uses: "Associated-Bank/github-next-version@main"
        with:
          message: "${{github.event.head_commit.message}}"
        env:
          GITHUB_TOKEN: "${{ github.token }}"
      - name: 'Set Version'
        uses: "Associated-Bank//github-set-version@main"
        with:
          version: ${{steps.semver.outputs.version}}
          files: /env/dev.version.json
          modules: core,risk,pops
```

If the version file looked like this:
```
{
    "core": "1.45.0",
    "risk": "1.45.0",
    "pops": "1.45.0",
    "corn": "1.0.0"
}
```
And the new version (steps.semver.outputs.version) was determined to be 1.5.0  The new version file would look like:
```
{
    "core": "1.5.0",
    "risk": "1.5.0",
    "pops": "1.5.0",
    "corn": "1.0.0"
}
```
