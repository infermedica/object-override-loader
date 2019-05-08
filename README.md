# Infermedica Object Override Loader

This Webpack loader aims to override parts of YAML or JSON files with values from corresponding files in a specified
directory.

## Installation

```bash
$ npm install --save-dev @infermedica/object-override-loader
```

## Usage

To use this loader, include it in your Webpack configuration file and provide a `objectsDir` path, e.g.:

```js
{
  test: /\.ya?ml$/,
  use: [
    'js-yaml-loader',
    {
      loader: '@infermedica/object-override-loader',
      options: {
        objectsDir: 'path/to/directory'
      }
    }
  ]
},
```

## Package purpose

This loader has been created specifically to allow overriding of translations in vue-i18n `<i18>` blocks. If you have
a core library that is later included in other applications, you can use this loader to override only selected
translations from the core library in other applications.

Let's say you have following Vue file with `<i18n>` translation block in your core library:
```yaml
<i18n>
  en:
    SegmentFeedback:
      question: "Is the information on this site helpful?"
      commentLabel: "Comment"
      commentLabelOptionl: "(optional)"
      sendButtonText: "Send feedback"
</i18n>
```

Other translations can also be loaded globally:
```javascript
import en from './en.yaml';
import pl from './pl.yaml';

Vue.use(VueI18n);

const i18n = new VueI18n({
  messages: {
    en,
    pl
  }
});

new Vue({
  i18n,
  render: (h) => h(App)
}).$mount('#app');
```

```yaml
# pl.yaml
SegmentFeedback:
  question: "Czy infomacje na tej stornie są pomocne?"
  commentLabel: "Komentarz"
  commentLabelOptionl: "(opcjonalnie)"
  sendButtonText: "Wyślij opinię"
```

To override some of the above translation in other project, include this loader in your Webpack configuration file:

```js
{
  resourceQuery: /blockType=i18n/,
  type: 'javascript/auto',
  use: [
    '@kazupon/vue-i18n-loader',
    'js-yaml-loader',
    {
      loader: '@infermedica/object-override-loader',
      options: {
        objectsDir: 'path/to/directory'
      }
    }
  ]
},
{
  test: /\.ya?ml$/,
  use: [
    'js-yaml-loader',
    {
      loader: '@infermedica/object-override-loader',
      options: {
        objectsDir: 'path/to/directory'
      }
    }
  ]
},
```

The loader looks for overrides in `path/to/directory` directory:

```yaml
$ ls path/to/directory
en.yaml  pl.yaml
```

```yaml
# path/to/directory/en.yaml
SegmentFeedback:
  question: "How would you rate us?"
  sendButtonText: "Send rating"
```
```yaml
# path/to/directory/pl.yaml
SegmentFeedback:
  question: "Jak byś nas ocenił?"
  sendButtonText: "Wyślij ocenę"
```

After running Webpack, the loader will replace "Is the information on this site helpful?" with
"How would you rate us?" and "Send feedback" with "Send rating" (similarly for Polish translations),
leaving other translations untouched. The final build will contain the merge of core and overridden translations 🎉.

#### Note

Although the loader was created to override vue-i18n translations it can be used to update any YAML or JSON file.
Also, even though examples above use YAML files to store translations, it should work the same with JSON objects.

## Contribution

Feel free to raise an issue if you have any questions or a similar use case. We're happy to accept pull requests too.

## License

MIT Copyright (c) Infermedica
