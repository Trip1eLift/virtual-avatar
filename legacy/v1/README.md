# Virtual-Avatar
A web-based virtual face renderer inspired by the Metaverse.

![demo](./demo.png)

Website is published on aws: https://virtualavatar.trip1elift.com/

Resources: Route53, Certs, CloudFront, S3
Core Technologies: ReactJS, Google Mediapipe, ThreeJS, React-Three-Fiber, Terraform, AWS

## Outlook
The virtual avatar currently only contain a static frontend. The next step is to deploy a streaming backend to support video chat using virtual facemesh. The intent architecture design is shown in the diagram below.

![Architecture Diagram](./Architecture-diagram.jpg)

## Static site setup
```
npm install
npm start
```

## Terraform deployment
Follow [Terraform README](./terraform/README.md) for deployment sequence.

# 2 tier setup using websocket (old)
This project involves a Python Server running Mediapipe with Webcam to 3D scan the face. Then send the facial landmarks to Client using websocket protocol. The Client is built on react with graphics engine @react-three/fiber that render facial landmark into browser. This project requires Python3 and Node.js to run.

```
cd legacy
```

## Docker Start (camera issue, docker doesn't work.)
```console
docker-compose up -d 
```

## Dev Start
### 1. Python Server
To setup python virtual environment
```console
cd server
python3 -m venv ./venv
```

To activate
```console
where.exe python
./venv/Scripts/activate     (Windows)
source ./venv/bin/activate  (Mac)
where.exe python
```

Operations in venv
```console
pip list
pip install -r requirements.txt
```

```console
deactivate
```

### 2. React Client
To setup react environment
```console
cd client
npm install
```

To run
```console
npm start
```

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## License

“Commons Clause” License Condition v1.0

The Software is provided to you by the Licensor under the License, as defined below, subject to the following condition.

Without limiting other conditions in the License, the grant of rights under the License will not include, and the License does not grant to you,  right to Sell the Software.

For purposes of the foregoing, “Sell” means practicing any or all of the rights granted to you under the License to provide to third parties, for a fee or other consideration (including without limitation fees for hosting or consulting/ support services related to the Software), a product or service whose value derives, entirely or substantially, from the functionality of the Software.  Any license notice or attribution required by the License must also include this Commons Cause License Condition notice.

Software: Virtual Avatar
License: Apache 2.0
Licensor: Trip1eLift - Joseph Chang
