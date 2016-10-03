First you'll want to clone this repo next to the repo you are working on.

```
my-project/ (repo)
    - package.json
    - node_modules/
        - p2-theme-core/
p2-theme-core/ (repo)
```

While in `my-project/`, symlink the `p2-theme-core/` that is a repo into your `node_modules/` directory with `npm link` like so:

    npm link ../p2-theme-core/

This will replace `node_modules/p2-theme-core/` with a symlink to the `p2-theme-core` repo.

Now you can make changes and contribute!

## Acceptance Criteria

- Passes `npm test` - Travis runs this and will report it on your PR
- Branch off `master` and into a `feature/name-of-it` - no `develop` branch going 
- If you add new config, add it to `config.default.yml`

### Bonus Points 

Adding a new test. See `tests/css/css.test.js`

# Testing

To test: `npm test`

To start watches for tests: `npm start`
