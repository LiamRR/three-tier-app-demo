# Hedgehog Lab Docker Compose Demo

### Candidate
- Name: Liam Robson
- Email: 90liam@gmail.com
- Phone: +44 7588 522277
- LinkedIn: [Liam Robson](https://www.linkedin.com/in/liam-robson-a1990/)

### Project Objectives

Create a docker compose file with three-tier architecture where frontend talks to backend and update results in the database.

1. Frontend can be any web application - preferably React
2. Any middleware API - preferably python
3. Any Database - preferably Postgres
   
_Note: Data to be persistent in volumes in case of container crashes_

### Project Structure

```bash
.
├── ./README.md
├── ./backend
│   ├── ./backend/Dockerfile
│   ├── ./backend/main.py
│   └── ./backend/requirements.txt
├── ./docker-compose.yml
└── ./frontend
    ├── ./frontend/Dockerfile
    ├── ./frontend/node_modules
    ├── ./frontend/package-lock.json
    ├── ./frontend/package.json
    ├── ./frontend/public
    └── ./frontend/src
```

### Frontend Setup

The requirement for the frontend was to use React so I started by creating the react-app.  This gives us the basic structure we need to start building the frontend: -

```bash
npx create-react-app hedgehoglab-demo
```

I decided to use `App.js` for the code I used, not best practice by all means but for a PoC, it's just fine.  Typically, you'd want a dedicate file for the element and then consume it within `index.js`.

### Backend Setup

For the backend and middleware, I decided to use FastAPI as I've used this before and of course, Postgres since it was a requirement for this project.  A quick break down of the compoents: -

- Since we're using a `JS` frontend that communicates with a Postgres backend, I've implemented CORS that only allows `POST`.  Using `*` for this project would have worked too, just wanted to lock it down to only what I needed.  Read more [here](https://fastapi.tiangolo.com/tutorial/cors/#use-corsmiddleware).
- I've create a minimal Postgres model for `items` which we can post into.  Again, I've used `main.py` for both the database connection and the models but in a production environment, I'd like to see both the database and models split into their own files.
- We can test that backend is working but issuing a `POST` to our API: -

```bash
curl -X 'POST' \
  'http://localhost:8000/submit' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "dunder",
  "description": "mifflin"
}'
```

- Verify that our post was successful: -

```bash
docker exec -it hedgehoglab-demo-postgres-1 psql -U postgres -d appdb \
--pset expanded=auto -c "SELECT * FROM items;"
 id |  name  | description 
----+--------+-------------
  1 | liam   | staff       
  2 | hello  | world       
  3 | dunder | mifflin <<<< SUCCESS
```

### Docker Compose

- There is no need to add a top level `version:` no longer, this is now [obselete](https://docs.docker.com/reference/compose-file/version-and-name/).
- I broke the services into `frontend`, `backend` and `postgres` to follow best practice methods.  With this setup, I'm able to build the `frontend`, `backend` and `postgres` services: -

```bash
 docker-compose build && docker-compose up -d
...
[+] Running 4/4
 ✔ Network hedgehoglab-demo_default       Created  0.1s
 ✔ Container hedgehoglab-demo-frontend-1  Started  2.3s
 ✔ Container hedgehoglab-demo-postgres-1  Started  2.3s
 ✔ Container hedgehoglab-demo-backend-1   Started  2.4s
```

- I've added labels to each service so that in future iterations, we could handle the build process with bash scripts and we can target resources, like volumes based off labels, like: -

```bash
docker image prune --filter "label=project=hedgehoglabs-demo" -f
```

- Using this approach adds an extra layer of protection when it comes to both dev and production envs.
- I've used a `.env` file to keep database credentails out of the `docker-compose.yml` file.  In production, we could add the credentails as Github secrets and pass those into to our CI/CD workflow for best practice also.

### Verification

- Check the frontend has loaded, visit http://localhost:3000, you should see a sleek, modern, state-of-the art front end ;)
- Check the backend has loaded, visit http://localhost:8000/docs and we should see the FastAPI UI which we can interact with.
- Test submit from the UI, enter and name and description and check the database to see our record: -


```bash
docker exec -it hedgehoglab-demo-postgres-1 psql -U postgres -d \
appdb --pset expanded=auto -c "SELECT * FROM items;"
```

- Verify data persisted by bringing down the `backend` and starting it again, checking the database after:

```bash
docker ps
CONTAINER ID   IMAGE                       COMMAND                  CREATED          STATUS          PORTS                    NAMES
6fe11cf7d2a6   hedgehoglab-demo-backend    "uvicorn main:app --…"   43 minutes ago   Up 43 minutes   0.0.0.0:8000->8000/tcp   hedgehoglab-demo-backend-1
...
```

- Bring down the backend and bring it back up: -

```bash
docker ps
CONTAINER ID   IMAGE                       COMMAND                  CREATED          STATUS          PORTS                    NAMES
f7f7be533b8f   hedgehoglab-demo-backend    "uvicorn main:app --…"   5 seconds ago    Up 4 seconds    0.0.0.0:8000->8000/tcp   hedgehoglab-demo-backend-1
38f0af27634c   postgres:15                 "docker-entrypoint.s…"   6 seconds ago    Up 5 seconds    0.0.0.0:5432->5432/tcp   hedgehoglab-demo-postgres-1
...
```

- Verify that we can see our data: -

```bash
docker exec -it hedgehoglab-demo-postgres-1 psql -U postgres -d appdb \
set expa∙ --pset expanded=auto -c "SELECT * FROM items;"
 id |  name  | description 
----+--------+-------------
  1 | liam   | staff
  2 | hello  | world
  3 | dunder | mifflin
(3 rows)
```

### Troubleshooting

- Check the backend logs to make sure the process has started correctly and if we're able to see successful `POST` requests when using the UI or cURL: -

```bash
docker compose logs backend
backend-1  | INFO:     Will watch for changes in these directories: ['/app']
backend-1  | INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
backend-1  | INFO:     Started reloader process [1] using StatReload
backend-1  | INFO:     Started server process [8]
backend-1  | INFO:     Waiting for application startup.
backend-1  | INFO:     Application startup complete.
backend-1  | INFO:     172.19.0.1:36702 - "OPTIONS /submit HTTP/1.1" 200 OK
backend-1  | INFO:     172.19.0.1:36702 - "POST /submit HTTP/1.1" 200 OK
backend-1  | INFO:     172.19.0.1:57492 - "GET /docs HTTP/1.1" 200 OK
backend-1  | INFO:     172.19.0.1:57492 - "GET /openapi.json HTTP/1.1" 200 OK
backend-1  | INFO:     172.19.0.1:45366 - "POST /submit HTTP/1.1" 200 OK
backend-1  | INFO:     172.19.0.1:56966 - "POST /submit HTTP/1.1" 200 OK
```

- Check the Postgres logs to verify it's listening on the correct port and we see writes to the DB following a `POST`: -

```bash
docker compose logs postgres
postgres-1  | 
postgres-1  | PostgreSQL Database directory appears to contain a database; Skipping initialization
postgres-1  | 
postgres-1  | 2025-04-23 08:21:41.655 UTC [1] LOG:  starting PostgreSQL 15.12 (Debian 15.12-1.pgdg120+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14) 12.2.0, 64-bit
postgres-1  | 2025-04-23 08:21:41.656 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
postgres-1  | 2025-04-23 08:21:41.656 UTC [1] LOG:  listening on IPv6 address "::", port 5432
postgres-1  | 2025-04-23 08:21:41.687 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
postgres-1  | 2025-04-23 08:21:41.749 UTC [29] LOG:  database system was shut down at 2025-04-23 08:14:05 UTC
postgres-1  | 2025-04-23 08:21:41.787 UTC [1] LOG:  database system is ready to accept connections
postgres-1  | 2025-04-23 08:26:41.702 UTC [27] LOG:  checkpoint starting: time
postgres-1  | 2025-04-23 08:26:41.874 UTC [27] LOG:  checkpoint complete: wrote 4 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.124 s, sync=0.015 s, total=0.172 s; sync files=3, longest=0.008 s, average=0.005 s; distance=0 kB, estimate=0 kB
postgres-1  | 2025-04-23 08:36:41.899 UTC [27] LOG:  checkpoint starting: time
postgres-1  | 2025-04-23 08:36:42.519 UTC [27] LOG:  checkpoint complete: wrote 6 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.531 s, sync=0.018 s, total=0.620 s; sync files=6, longest=0.010 s, average=0.003 s; distance=1 kB, estimate=1 kB
```
