# run-of-the-mill
## Scope

This repo is consist of the following pieces:

- API: A graphql endpoint powdered by appSync
- Frontend: A react app, deployed to s3 and interfaced by cloudfront.
- Backend: A lambda function that interacts with dynamodb.
- Pubsub: An SNS service that receives events from the BE (no consumers)
- Pipeline: A CI/CD tool that tests the above parts and deploys the new versions.
- IAC: Some terraform modules that know how to create or modify the underlying resources.

The goal is to develop this repository to a state that it can be spun up using terraform in AWS with CI/CD also working.

## Function of the app

The purpose of this app is to get the infrastructure set up so the app itself is very simple. 
- You need to be able to sign up (or sign in) using aws cognito using your email.
- You need to be able to create a message.
- You need to be able to see all your messages. No pagination required.

## General considerations

- The code must be in github and CI/CD should be in github actions if possible.
- Typescript should only be used as a programming language.
- We need a way to automatically create typescript types from `api/schema.graphql` and use them in the BE and the FE. (it needs to be a npm script, see: https://www.the-guild.dev/graphql/codegen & https://www.the-guild.dev/graphql/codegen/plugins/typescript/typescript-react-apollo)
- Frontend, backend and api are all separate npm apps, they all have one sample test that needs to run in the CI before it gets deployed.
- You can assume the cli has the permission to assume the role `deployer` in the provided organization id.
- All the secrets for deployment, the organization and the region needs to be inside the `.env` file for local development.
- All the secrets for deployment, the organization and the region needs to be inside github actions secrets for CI/CD deployment.
- The latest possible version of each library need to be used.
- All the parts need to be in terraform so an identical app should be able to be created at any point just by directing aws to another organization.
- `api/schema.graphql` is final and does not need to change. 

## API 

The schema in the `api/schema.graphql` should be implemented and wired to the lambda resolvers.
There should be a script that transforms graphql to typescript types. The file should not be tracked by git and the script needs to run before the test.
This folder itself doesn't need any test.
The type file needs to be pulled in directly from Backend and Frontend.

## Frontend

This needs to built on top of auto generated types from graphql schema and apollo client library. It also needs to use cognito.
There needs to be a simple test that runs before the deployment. e.g. render a presentational component with a set prop.

## Backend

The proper resolvers need to be created and tied into dynamodb. Each new message should have a UUID as an id.
After a message is saved there should be a new event of type `MessageCreatedEvent` (in `backend/events.ts`) pushed to the sns.
The sns should be created via terraform and called `run-of-the-mill-events`
There needs to be a simple test that runs before the deployment. e.g. the function that transforms the graphql type to dynamo type.

## IAC

The terraform code for deploying each part of the app needs to sit inside that folder.

Here are the steps for the CI/CD:

- Run the script to transform the graphql to types.
- Run the BE test
- Run the FE test
- Run the FE build
- Deploy the infrastructure and the app

## Delivery

The delivery can be broken down into these steps and they need to be in separate PRs:

- Step 0: Read this document and create a PR if you have any comments/questions/suggestions. Add to the readme file how you think one can deploy this in a brand new AWS organization. e.g. where to put the credentials what commands to run etc.
- Step 1: Add the script to transform the graphql into types
- Step 2: Create and empty AppSync, dynamo and resolver using terraform
- Step 3: Create the BE without the events or authentication. (with tests and auto deploy)
- Step 4: Create the FE without authentication. (with tests and auto deploy)
- Step 5: Add authentication to the BE and FE. a user should not see another user's messages.
- Step 6: Add events.

