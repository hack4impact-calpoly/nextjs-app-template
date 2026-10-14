# Coffee Shop platform

A coffee shop website where customers can browse the menu, order drinks, and view or cancel their orders, built for the H4I 2026 bootcamp.

**Live site:** https://h4i-mock-coffeeshop.vercel.app

## Table of Contents

- [Overview](#overview)
  - [Purpose](#purpose)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Team](#team)
- [Getting Started And Contributing](#getting-started-and-contributing)
  - [Setup](#setup)
  - [Helpful Commands](#helpful-commands)

## Overview

### Purpose

This project is a mock website for an unnamed coffee shop, and it was built as the team project for the Hack4Impact Cal Poly 2026 bootcamp. The goal was to practice building and deploying a full-stack web application as a team: a frontend that customers use, API routes that validate what they send, and a database that keeps the data after a refresh.

### Features

- **Home:** the shop name, logo, and the current bestselling drink
- **Menu:** every drink grouped by category, with a search box and a category filter
- **Drink detail:** the sizes, prices, and milk options for one drink, with a form to place an order
- **Orders:** every order that has been placed, newest first, with a button to cancel an order
- **About and Contact:** information about the shop and a contact form (the form is not connected to a backend yet)

Drinks and orders are stored in MongoDB. The server checks every order before it is saved (the drink must exist, and the size and milk must be ones that drink offers), and it sets the price itself instead of trusting the browser.

### Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router) and [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose](https://mongoosejs.com/)
- [Vitest](https://vitest.dev/) for unit tests
- [ESLint](https://eslint.org/), [Prettier](https://prettier.io/), and [Husky](https://typicode.github.io/husky/) for code quality
- [Vercel](https://vercel.com/) for hosting

### Team

The Coffee shop team consists of 6 Cal Poly students. Over the course of about 4 weeks, we worked as a team to deploy this web application. The team members are listed below:

- [Rebecca Gee](https://www.linkedin.com/) - Developer
- [Aaron Caratay](https://www.linkedin.com/) - Developer
- [River Seeber](https://www.linkedin.com/) - Developer
- [Preston Silva](https://www.linkedin.com/) - Developer
- [Cole Edmonston](https://www.linkedin.com/) - Developer
- [Tyler Kim](https://www.linkedin.com/) - Tech Lead

## Getting Started And Contributing

### Setup

You need [Node.js](https://nodejs.org/) 18 or later and a MongoDB connection string.

1. Clone this repository: `git clone https://github.com/tjsook/group3-h4i-bootcamp.git`
2. Install the dependencies: `npm i`
3. Create your environment file: `cp .env.local.example .env.local`
4. Open `.env.local` and set `MONGO_URI` to your MongoDB connection string (team members get this from the tech lead). Never commit this file
5. Start the app: `npm run dev`
6. Open http://localhost:3000

If the menu is empty, the database has no drinks yet. See [seeding.md](docs/seeding.md) for how to load them.

### Helpful Commands

| Command            | What it does                     |
| ------------------ | -------------------------------- |
| `npm run dev`      | Starts the app at localhost:3000 |
| `npm run build`    | Builds the app for production    |
| `npm run lint`     | Checks code style                |
| `npx tsc --noEmit` | Checks for type errors           |
| `npm test`         | Runs the unit tests              |

Visit [getting-started.md](docs/getting-started.md) for more on how to set up this repo.

Visit [contributing.md](docs/contributing.md) for how to contribute to this repo.
