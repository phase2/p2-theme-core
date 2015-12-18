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

