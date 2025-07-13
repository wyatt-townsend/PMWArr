# PMWArr

PMWArr is a full-stack web application designed for managing and scheduling VOD (Video On Demand) content from an [archive](https://archive.wubby.tv/). The project is structured with a Node.js/TypeScript backend and an Angular frontend.

## Features
- **VOD Management:** Add, edit, and organize VOD items with metadata.
- **Scheduling:** Schedule jobs and automate VOD synching and downloading.
- **User Interface:** Responsive Angular frontend with modular components for calendar, VOD lists, notifications, and more.
- **API:** RESTful backend API for all core operations.
- **Dockerized:** Complete Docker support for easy deployment and development.

## Project Structure
- `src/` — Node.js backend (controllers, services, models, routes, etc.)
- `frontend/` — Angular frontend (components, pages, services, etc.)
- `Dockerfile` & `docker-compose.yml` — For building and running the app in containers

## Development
- **Backend:** Node.js, TypeScript
- **Frontend:** Angular
- **Database:** SQLite

## Build & Run
- **Locally:**
  1. Install dependencies in both `src/` and `frontend/`.
  2. Run backend and frontend separately for development.
- **With Docker:**
  1. Build and run using the provided Dockerfile and docker-compose.

## CI/CD
- GitHub Actions workflow is set up to build and deploy the Docker image to DockerHub on every release.

## Configuration
- Environment variables and settings can be managed in the backend and frontend config files.

---
For more details, see the code and comments throughout the repository.
