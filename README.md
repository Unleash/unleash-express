# unleash-express

[![Build Status](https://travis-ci.org/Unleash/unleash-express.svg?branch=master)](https://travis-ci.org/Unleash/unleash-express)

unleash-client that helps persisting feature toggle results over Express.js

## Prerequisite
You will need express and [cookie-parser](https://github.com/expressjs/cookie-parser):

```js
const express = require('express');
const app = express();
app.use(cookieParser());
```

## Configuration

```js
const { initialize } = require('unleash-client');
const unleash = initialize(...);
const { UnleashExpress } = require('unleash-express');
const unleashExpress = new UnleashExpress(unleash, options);
```

Available options:
* `cookieName` (string): The name of the cookie to persist the result values of each feature toggle. Defaults to 'unleash'
* `cookieOptions` (object): Additionl options for the cookie like `expires` or `maxAge`. No default.

## Usage

### 1. Use the middleware

```js
app.use(cookieParser());
app.use(unleashExpress.middleware()); // This will allow reading/setting the cookies
```

### 2. Flip the coin

Ask `unleash-client` for the value of a feature as usual by using `getVariant`.

```js
// In your feature.controller.js
req.unleash.getVariant('feature', ...);
```

You can also check alternatives or features that are enabled by using `isEnabled`.

```js
// In your controller
req.unleash.isEnabled('alternative');
```

### 3. Reuse the result along the pipeline

Peek the persisted results:
```js
req.unleash.results['feature']; // Variant object or null
```

## Acknowledgment

Inspired by fflip-express
