# Threat Intelligence Graph Frontend

This repository is for the frontend of the single page web-app for the `ti-graph` project.

The page is built using `create-react-app`.

### How to run

```bash
$ npm install
$ npm start
```

### How to build

```bash
$ npm run build
```

Then follow the steps specified in [the server documentation](https://github.com/CYBEX-P/ti-graph/blob/master/README.md)
:)

# Readings/References

Useful reading for getting up to speed with the codebase

- [React Docs](https://reactjs.org/docs/getting-started.html)
  - [Hooks API Reference](https://reactjs.org/docs/hooks-reference.html) (also take a look at the entire section)
  - [HOCs](https://reactjs.org/docs/higher-order-components.html)
  - [Context](https://reactjs.org/docs/context.html) (used for global state management)
- [Vis.js Network Docs](http://visjs.org/docs/network/) used for Graph.jsx extensively
- [styled-components docs](https://www.styled-components.com/docs)
- [List of ReactStrap components](https://reactstrap.github.io/components/)
- [Fontawesome Icons](https://fontawesome.com/icons?d=gallery&s=solid&m=free) for design and implementation
- [Formik](https://jaredpalmer.com/formik/docs/api/formik) docs for form building

Most of the components in the application are functional components. A good understanding
of [Functional Programming in JavaScript](https://www.youtube.com/watch?v=BMUiFMZr7vk&list=PL0zVEGEvSaeEd9hlmCXrk5yUyqUag-n84)
is very helpful. In particular,
[filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) and
[map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).

[Axios](https://www.npmjs.com/package/axios) utilizes
[promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
so a good understanding of Promises and then
[async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
will be useful.
