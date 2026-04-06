# React Client

React frontend for OnesToManys.

## Features

- CRUD UI for dealerships
- CRUD UI for cars
- Relationship view for `/dealerships/{id}/cars`

## Run Locally

1. Start the Flask API from the project root:

```bash
python app.py
```

1. Start the React dev server from this folder:

```bash
npm run dev
```

The Vite dev server proxies API requests to `http://127.0.0.1:8000`.

## Build

```bash
npm run build
```
