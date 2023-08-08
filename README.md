# Road To Pink

The RTP website is composed of three main components: backend, frontend, and infrastructure. It is designed to offer a comprehensive solution to showcase the Road To Pink project.

The website can be accessed at https://www.roadtopink.com.

## Overview
### Backend
The backend of the application is built using Node.js and Express. It includes utilities like TypeORM for database interaction, AWS SDK for working with AWS services, and other packages.

### Frontend
The frontend of the application is built using Next.js, React, Bootstrap, and other related technologies.

### Infrastructure
The infrastructure folder contains outdated AWS CDK code written in TypeScript. 
However, the frontend and backend are hosted on two separate Heroku projects.

Due to relatively small scale of users the website aims to serve, using AWS was not deemed feasible.

## Local Development Setup
### Backend Setup
To set up the backend on your local machine, follow these steps:

```
git clone https://github.com/rasmusskovbo/rtp.git
cd rtp-website/backend
```


#### Build and Run Docker:

Ensure that Docker is installed on your machine. Then run the following command:

```
docker-compose up --build
```

#### Running the Server:

You can start the server using:

```
npm run start
```

For development with auto-reloading, use:


```
npm run nodemon
```

#### Key Technologies:
* Express.js: Web application framework
* TypeORM: Interaction with databases
* AWS SDK: AWS services
* TypeScript: Static typing

### Frontend Setup

To set up the frontend on your local machine, follow these steps:

#### Clone the Repository:

    git clone https://github.com/username/rtp-website.git
    cd rtp-website/frontend

#### Running the Development Server:

    npm run dev

#### Key Technologies:
* Next.js: Server-side rendering
* React: UI Library
* Bootstrap & React-Bootstrap: Styling
* TypeScript: Static typing

## Deployment

Though the infrastructure folder contains AWS CDK code, the actual deployment is done on Heroku:

    Backend Heroku Project
    Frontend Heroku Project

Please refer to the corresponding Heroku documentation for deployment details.

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct, and the process for submitting pull requests.
License

This project is licensed under the ISC License - see the LICENSE.md file for details.

## Acknowledgments

    Author: Rasmus Skovbo