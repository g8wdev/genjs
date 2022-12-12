# G8WGENJS

## Executive summary

This repository contains JS libraries and components that can be published on NPM registry and used by other projects.
The development and delivery workflow of the code of this repository is specific:

1. develop
2. publish a version

No deployment is done from this repository. The publishing of a version of one or several components is done on the developer local environment (not on GitLab, GitHub or other CI).

This repository can be used without any other repository or requirement.

## Requirements

To use this repository locally, you will need:

- [Git](https://git-scm.com/) (`git` command)
- [Make](https://en.wikipedia.org/wiki/Make_(software)) (`make` command)
- [NodeJS](https://nodejs.org/en/) 12+ (`node` command)
- a browser, preferrably Google Chrome or Firefox

Additionnally, if you need to do develop on that repository, you will need:

- a Javascript and Typescript compatible IDE or editor (ex: [WebStorm](https://www.jetbrains.com/webstorm/))

## Get the project

    git clone git@github.com:g8wdev/genjs.git

Then:

    cd g8wGenjs


## Installation


    make


## Development

### Directory structure

The repository is composed of multiple autonomous packages that follow the same development conventions and have tooling in common.
All the files located directly at the root of this repository are common to all packages.
The packages are located in the `./packages/` directory.

The repository contains only Javascript and Typescript (a Superset of Javascript language) code.

* The files with `.js` extension are pure Javascript files.
* The files with `.ts` extension are Typescript files.
* The files with `.json` extension are JSON files (data/config).
* The files with `.md` extension are Markdown document files.
* The files with `.lock` extension are generated lock files (used mainly by Yarn tool).
* The files located in the `lib/` directories (sub-directories of each package), are generated code that will be published, mainly pure JS code, result of the transpiling of Typescript code. Some `.map` files are also present and are useful for IDE/Editors only, you do not need to open/change these files.

### Package development

When developing a package, you do not need to go in that particular directory, you have, at the root of the repository, all the tools needed to manage that particular package:

##### Install dependencies (Yarn/Lerna)

To install/refresh the dependencies of a package:

    make package-install p=<package-name>

ex:

    make package-install p=xyz

We are using the [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/) feature, so all the dependencies of all the packages are merged and deduplicated inside the root `/node_modules/` directory.

##### Build production-ready code (Typescript compiler)

To generate the transpiled (pure JS) code of that particular package, saved in the `lib/` subdirectory of that package:

    make package-build p=<package-name>

ex:

    make package-build p=xyz

##### Execute unit tests (Jest)

To execute the unit-tests (Jest-compatible) located inside the `__tests__/` subdirectory of that particular package:

    make package-test p=<package-name>

ex:

    make package-test p=xyz

### Publish a version

When you made some changes to the source code of some package (one or more), you need to publish the new version(s) of this/these package(s) in order to be able to use them inside an other project.
Before publishing, you need to make sure all the tests passes and that you have re-generated the `lib/` directories of each updated packages:

    make build test changed

If any errors occured, please fix them before publishing.
The last target above, `changed`, will help list all the changed packages. It won't publish anything but provide you with the list of changed packages since the last publishing.
Under the hood, we use [LernaJS](https://lerna.js.org/) to help manage the hard work of publish scripting.
Lerna detects the list of git commits that have occured since the last tagging of a version.

To publish a new version for each changed-packages, do:

    make publish

You will be asked to confirm by selecting the strategy of version bumping for each package (major version bump, minor version bump, patch, ...).
Confirm and you will then publish remotely the new versions of packages. Lerna will also update all the `package.json` files of each impacted packages, and commit these changes and then push them automatically.



