# Sales Tracking System
This repository provides a systematic way for Sales Agents to track their Sales and Commissions for different products sold. It provides a secure way to authenticate, manage products, record sales and track commissions. It also implements an Email Service which notifies Agents on certain actions depending on their activities. This include providing monthly updates on their sales and commission. At the backbone, it utilizes [MongoDB Atlas](https://www.mongodb.com/atlas) and [NestJs](https://nestjs.com/).

## Getting Started
To get started on running the app, we need to configure our local enviroment. Let's first start by setting up our prerequisites.

## Prerequisites
- NodeJs:
For starters, make sure you have nodeJs installed in your machine. We recommend node v18 or higher. To install nodeJs in your system you can utilize nvm. Check out this repo to install [nvm](https://github.com/nvm-sh/nvm) in your system.

- MongoDb Atlas:
To set up the DB visit [MongoDB Atlas](https://www.mongodb.com/atlas) to set up a free account. The service is free and is easy to set up.

- RabbitMQ:
RabbitMQ is an open source message broker that helps in working with asynchronous tasks. In this project we utilize RabbitMQ in managing asynchronous tasks for our Email Service. Here is a link to install on ubuntu and Debian Systems [RabbitMQ](https://www.rabbitmq.com/docs/install-debian).



## Installation
With the prerequisites installed. We can look to Clone the repo.

```bash
$ git clone git@github.com:Tintin72/sales-tracking-system.git
```

```bash
$ cd sales-tracking-system
```

Set up the enviroment by copying env variables. Change the relevant variables like the MONGODB_URI with your mongodb connection string. Update the 

```bash
$ cp .env.example .env
```
Install the required dependencies.

```bash
$ npm install
```

## Running the app

Run the app locally in watch mode.

```bash

#run development in watch mode
$ npm run start:dev
```

To run in Production

```bash
# production mode
$ npm run start:prod
```

## Test

To test the app run the following commands.

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

