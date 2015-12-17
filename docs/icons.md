# Icons

Uses [`gulp-iconfont`](https://github.com/nfroidure/gulp-iconfont). Grabs a folder of SVG icons and turns them into font icons, creates a Sass mixin and class for each based on filename, adds all to a demo page.

## Usage

Given a file named `facebook.svg`, you can use this Sass mixin:

```scss
@include icon('facebook');
```

Or this HTML class:

```html
<span class="icon--facebook"></span>
```

## Commands

- `gulp icons` - Compile Icons
- `gulp watch:icons` - Watch for icons and compile

## Config

- `config.icons.src` - Array or String of globbed SVG files
- `config.icons.dest` - Destination directory