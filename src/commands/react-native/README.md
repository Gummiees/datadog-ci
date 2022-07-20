## Overview

To un-minify errors, upload your React Native source maps to Datadog.

## Setup

You need to have `DATADOG_API_KEY` in your environment.

```bash
# Environment setup
export DATADOG_API_KEY="<API KEY>"
```

You can configure the tool to use Datadog EU by defining the `DATADOG_SITE` environment variable as `datadoghq.eu`. By default, the requests are sent to Datadog US.

To override the full URL for the intake endpoint, define the `DATADOG_SOURCEMAP_INTAKE_URL` environment variable.

## Commands

### `upload`

This command uploads your JavaScript source maps and their corresponding bundle file to Datadog in order to un-minify your application's stack traces.

To upload the source maps for iOS, run this command:

```bash
datadog-ci react-native upload --platform ios --service com.company.app --bundle ./main.jsbundle --sourcemap ./main.jsbundle.map --release-version 1.23.4 --build-version 1234
```

To upload the source maps for Android, run this command:

```bash
datadog-ci react-native upload --platform android --service com.company.app --bundle ./index.android.bundle --sourcemap ./index.android.bundle.map --release-version 1.23.4 --build-version 1234
```

| Parameter           | Condition | Description                                                                                                                                                                                                                                                                                                                                                                 |
|---------------------|-----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--platform`        | Required  | Identifies if you are uploading iOS or Android source maps.                                                                                                                                                                                                                                                                                                                 |
| `--service`         | Required  | Set as the service name you are uploading source maps for. Datadog uses this service name to find corresponding source maps based on the `service` tag set on the RUM React Native SDK.<br>By default, the RUM React Native SDK uses your application's bundle identifier as the service.                                                                                   |
| `--bundle`          | Required  | Should be set as the path to your generated JS bundle file, `main.jsbundle` for iOS and `index.android.bundle` for Android.                                                                                                                                                                                                                                                 |
| `--sourcemap`       | Required  | Should be set to the path to your generated source map file, `main.jsbundle.map` for iOS and `index.android.bundle.map` for Android.                                                                                                                                                                                                                                        |
| `--release-version` | Required  | Used to match the `version` tag set on the RUM React Native SDK. This should be the "Version" or "MARKETING_VERSION" in XCode for iOS and the "versionName" in your `android/app/build.gradle` for Android.                                                                                                                                                                 |
| `--build-version`   | Required  | Used to avoid overwriting your source maps by accident. Only one upload is needed for a specific `build-version` and `service` combination. Subsequent uploads are ignored until the `build-version` changes. This should match the "Build" or "CURRENT_PROJECT_VERSION" in XCode for iOS and the "versionCode" in your `android/app/build.gradle` for Android.             |

The following optional parameters are available:

| Parameter          | Default | Description                                                                                                                                                                                                                     |
|--------------------|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--disable-git`    | False   | Prevents the command from invoking git in the current working directory and sending repository-related data to Datadog (such as the hash, remote URL, and paths within the repository of sources referenced in the source map). |
| `--dry-run`        | False   | It runs the command without the final step of uploading. All other checks are performed.                                                                                                                                        |
| `--repository-url` | Empty   | Overrides the remote repository with a custom URL. For example, `https://github.com/my-company/my-project`.                                                                                                                     |

### Link errors with your source code

You can enrich errors in Datadog with context links to GitHub, GitLab, and Bitbucket if the following requirements are met:

- You have installed the `git` executable
- You can run `datadog-ci` in the git repository

When these requirements are met, the upload command reports git information such as:

- the current commit hash
- the repository URL
- the list of file paths that are tracked in the repository. Only tracked file paths related to a source map are gathered.

For example, for a sourcemap referencing `["/Users/myname/path/to/ReactNativeApp/example.ts"]` inside its `sources` attribute, the command gathers all file paths with `example.ts` as the file name.

#### Override repository URL

The repository URL is inferred from the remote named `origin` (if present). Otherwise, it is inferred from the first remote. The value can be overriden with `--repository-url`.

For example, with a remote like `git@github.com:Datadog/example.git`, links pointing to `https://github.com/Datadog/example` are generated.

You can override this behavior with links to `https://gitlab.com/Datadog/example` with the `--repository-url=https://gitlab.com/Datadog/example` flag.

#### Set the project path

By default, paths inside React Native source maps are the absolute paths of files on the machine where they were bundled (for example: `/Users/user/MyProject/App.ts`).

If you are not running the `react-native upload` command from your React Native project root, you need to specify the `--project-path` argument with the absolute path to your React Native project root.

#### Supported repositories

The supported repository URLs are ones whose host contains `github`, `gitlab`, or `bitbucket`. 

This allows Datadog to create proper URLs such as:

| Provider  | URL |
| --- | --- |
| GitHub or GitLab  | https://\<repository-url\>/blob/\<commit-hash\>/\<tracked-file-path\>#L\<line\> |
| Bitbucket | https://\<repository-url\>/src/\<commit-hash\>/\<tracked-file-path\>#lines-\<line\>  |

## End-to-end testing process

To verify this command works as expected, you can trigger a test run and verify that it returns 0:

```bash
export DATADOG_API_KEY='<API key>'

TEMP_DIR=$(mktemp -d)
echo '{}' > $TEMP_DIR/fake.js
echo '{"version":3,"file":"out.js","sourceRoot":"","sources":["fake.js"],"names":["src"],"mappings":"AAgBC"}' > $TEMP_DIR/fake.js.map
yarn launch react-native upload --platform ios --service com.company.app --bundle $TEMP_DIR/fake.js --sourcemap $TEMP_DIR/fake.js.map --release-version 0.0.1 --build-version 000001
rm -rf $TEMP_DIR
```

A successful output should look like this:

```bash
Starting upload.
Upload of /var/folders/34/_7q54_lx4nl1cvkjwr3_k4lw0000gq/T/tmp.x0vecv3yFT/fake.js.map for bundle /var/folders/34/_7q54_lx4nl1cvkjwr3_k4lw0000gq/T/tmp.x0vecv3yFT/fake.js on platform ios with project path /Users/me/datadog-ci
version: 0.0.1 service: com.company.app
⚠️ No tracked files found for sources contained in /var/folders/34/_7q54_lx4nl1cvkjwr3_k4lw0000gq/T/tmp.x0vecv3yFT/fake.js.map
Uploading sourcemap /var/folders/34/_7q54_lx4nl1cvkjwr3_k4lw0000gq/T/tmp.x0vecv3yFT/fake.js.map for JS file available at /var/folders/34/_7q54_lx4nl1cvkjwr3_k4lw0000gq/T/tmp.x0vecv3yFT/fake.js

Command summary:
✅ Uploaded 1 sourcemap in 0.698 seconds.
✨  Done in 2.50s.
```