# Config

The vast majority of the customization should be done by changing values in `config`, which should be a `config.yml` file located in the main project repo (not this repo). This repo should try to be flexible to a range of configuration options (within reason).

## Custom Config

**Not functioning yet**

`config.yml` is commited with the project and shared between members of the team; however individuals can create a file called `config--custom.yml` and override specific values there – that file is ignored by git so it can be customized per person (for example, some people like to set `openBrowserAtStart` to false).

## Conventions

- Relative links instead of root relative links for paths (where possible) i.e. use `../images/logo.png` instead of `/images/logo.png`
- All directory variables have trailing slash like this: `../path/to/dir/`