# Identity Vault Training Starter

This application shows a typical structure for applications that require authentication in order to get data. The base application uses `@ionic/storage` to store the login token between sessions.

## Getting Started

- clone this repo
- cd iv-training-starter
- npm i
- npm run build
- npx cap update - this may take a while
- npm run build
- npm start - to run in the browser
- npx cap open ios

## General Architecture

### Services

Two services and two HTTP interceptors are related to authentication within the application.

#### `IdentityService`

The `IdentityService` defines the identity of the currently logged in user including the authentication token associated with the user. This service also persists the token so it is available between sessions.

#### `AuthenticationService`

The `AuthenticationService` handles the POSTs to the login and logout endpoints. If these operations are successful it registers this fact with the `IdentityService`.

#### HTTP Interceptors

Two HTTP interceptors are used by the code. One adds the token to outgoing requests, the other redirects the application to the login page

### Application Workflow

Upon starting up, the application attempts to load the `TeaCategoriesPage`. The `TeaCategoriesPage` uses the `TeaCategoriesService` to get information about various categories of tea. If this API call fails with a 401 error, then either the user is not logged in or the stored token is not valid. In either case, the application navigates to the login page.

## Misc Notes

### `xcodebuild` Error

On one machine, I kept getting the following error:

```
xcode-select: error: tool 'xcodebuild' requires Xcode, but active developer directory '/Library/Developer/CommandLineTools' is a command line tools instance
```

See the solution here: https://stackoverflow.com/questions/17980759/xcode-select-active-developer-directory-error