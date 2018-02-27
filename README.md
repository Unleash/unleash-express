# unleash-express

unleash-client that helps persisting feature toggle results over Express.js

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

Ask `unleash-client` for the value of a feature as usual by using `experiment`.

```js
// In your feature.controller.js
req.unleash.experiment('feature', ...);
```

### 3. Reuse the result along the pipeline

Peek the persisted results:
```js
req.unleash.results['feature'].variant.name; // 'hope-is-a-winner'
```

## Acknowledgment

Inspired by fflip-express