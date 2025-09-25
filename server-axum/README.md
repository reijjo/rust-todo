# Rust backend

## How to start

Run `cargo new BACKEND-NAME` to create backend

- Compile and run the project -> `cargo run`
- Check that program is executable -> `cargo check` (use this often)
- For releases `cargo build --release` (makes `./target/release/filename` with all the optimizations)

### Hot reload

Install `cargo-watch` -> `cargo install cargo-watch`

- Run server with hot reload `cargo watch -x run` (like nodemon in Expressjs)

## AXUM

### Add dependencies

Run `cargo add axum` add then you should see the added axum in `Cargo.toml` file.

- Add Tokio too `cargo add tokio --features full`
- Add `dotenvy` to read variables in `.env` file -> `cargo add dotenvy`

### Example

Create `.env` file and add `.env` to `.gitignore`

- `.env` file example:

```.env
APP_ENV=development
HOST=localhost
PORT=3000
```

Modify `src/main.rs` file:

```rs
mod config;	// include the config module

use tokio::{net::TcpListener};	// Async TCP listener
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]	// Starts the Tokio async runtime
async fn main() {
	// Load configuration from environment / .env
	let config = config::Config::from_env();

	let app = app::create_app(&config).await;

	// Get address string like "127.0.0.1:3000"
	let addr = config.address();

	// Bind async TCP listener to host:port
  // `.await` because it's async
  // `.unwrap()` will panic if port is already in use
	let listener = TcpListener::bind(&addr).await.unwrap();

	// Log info to console (like Express's "Server running at ...")
	println!("\nServer at http://{addr}");
	println!("Environment: '{}'\n", config.app_env.to_uppercase());

	// Start serving HTTP requests
	// `axum::serve` takes a listener and a Router
  // `.await` keeps it running
	axum::serve(listener, app)
		.with_graceful_shutdown(shutdown_signal())	// Tell the server to wait for a shutdown signal before exiting
		.await.unwrap()
}

// This async function waits for a shutdown signal
// - `tokio::signal::ctrl_c()` listens for CTRL+C (SIGINT) in the terminal
// - `.await` suspends the task until the signal arrives
// - When triggered, the function prints a message and returns
async fn shutdown_signal() {
  let _ = tokio::signal::ctrl_c().await;
  println!("\nShutting down…\n");
}

```

Create `src/config.rs` file:

```rs
use std::env;

// Config struct holds all your app configuration
// like environment host and port.
#[derive(Debug)]
pub struct Config {
	pub app_env: String,	// 'development' or 'production'
	pub host: String,			// IP or hostname to bind to
	pub port: u16,				// port number
	pub mongodb_uri: String
}

impl Config {
	// Loads config from environment variables
	// and '.env' file if present.
	pub fn from_env() -> Self {
		// Load environment variables from `.env` file if it exists.
    // `.ok()` ignores errors (like file missing), so dev/prod still work.
		dotenvy::dotenv().ok();

		// Read APP_ENV from env, default to "development"
		let app_env = env::var("APP_ENV").unwrap_or("development".to_string());

		// Read HOST from env, default to "127.0.0.1"
		let host = env::var("HOST").unwrap_or("127.0.0.1".to_string());

		// Try to read the PORT environment variable → Result<String, VarError>
    // Convert Result into Option.
    //   - Ok("3000") → Some("3000")
		//   - Err(_)     → None
		// If we got Some("3000"), try parsing it into a u16 number
		// |s| is a closure (like a small inline function).
		//   - If parsing succeeds (e.g., "3000" → 3000), we get Some(3000).
		//   - If parsing fails (e.g., "abc"), we get None.
		// If everything above failed (no PORT env var, or parsing failed),
		// fall back to the default value: 3000.
		let port = env::var("PORT")
			.ok()
			.and_then(|s| s.parse::<u16>().ok())
			.unwrap_or(3000);

		let mongodb_uri = env::var("MONGODB")
			.expect("MONGODB_URI must be set in environment or .env");

		Config { app_env, host, port, mongodb_uri }
	}

	// Helper to create a full "host:port" string for binding
	pub fn address(&self) -> String {
		// `format!` is like printf; combines host + port
		format!("{}:{}", self.host, self.port)
	}
}

```

### Request logger (like Morgan in Expressjs)

Add the dependencies:
`cargo add tower-http --features trace`
`cargo add tracing-subscriber --features "env-filter,fmt"`
`cargo add http tracing`

- Configure logging in `main.rs`

```rs
...
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]	// Starts the Tokio async runtime
async fn main() {
	// Load configuration from environment / .env
	let config = config::Config::from_env();

	tracing_subscriber::registry()	// Pretty-print logs to stdout
		.with(tracing_subscriber::fmt::layer()
			.with_level(true)
			.with_target(false)
			.with_ansi(true)
			.compact()
		)
		.init();
	...
}
```

### Mongo DB

- Install dependencies

  - `cargo add mongodb`, the Rust driver crate
  - `cargo add serde`, the serialization crate
  - `cargo add futures`, the asynchronous runtime crate that provides core abstractions

- Create free cluster in MongoDB Atlas

  - Get the connection string for the database (Connect button in your cluster page)
  - Add that string to `.env` file:

  ```.env
  MONGODB=mongodb+srv://<db_username>:<db_password>@cluster0.z1acviy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

  ```

  - Update the password to that string

### app.rs

Create `src/app.rs` file

```rs

use axum::{routing::{get}, Router};
use mongodb::{Client, Collection};
use tower_http::{cors::{Any, CorsLayer}, trace::TraceLayer};

use crate::models::todo::Todo;
use crate::routes;

pub async fn create_app(config: &crate::config::Config) -> Router {
	let client = Client::with_uri_str(&config.mongodb_uri)
		.await
		.expect("Database connection failed.");

	let collection: Collection<Todo> = client
		.database("rust-todo")
		.collection("todos");

	let cors = CorsLayer::new()
		.allow_origin(Any)
		.allow_methods(Any);

	Router::new()
		.route("/", get(routes::root))
		.nest("/todos", routes::todo::todo_routes(collection))
		.layer(TraceLayer::new_for_http())
		.layer(cors)
}

```

Make sure that you have all the necessary dependies installed

### Database model

Create `src/models/todo.rs` and `src/models.mod.rs` files

- `todo.rs`:

```rs
use serde::{Deserialize, Serialize};
use bson::oid:ObjectId;

#[derive(Debug, Serialize, Deserialize)]
pub struct Todo {
	#[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
	pub id: Option<ObjectId>,
	pub title: String,
	pub done: bool
}

```

- `mod.rs` exports eveything from the routes folder

```rs
pub mod todo;
```

And remember to add in the top of the `main.rs` file:

```rs
mod models;
mod app;
mod routes;
```

### Todo route

Create files `todo.rs` and `mod.rs` in `src/routes` folder

- `todo.rs`:

```rs
use axum::{routing::get, extract::State, Json, Router, http::StatusCode};
use mongodb::{Collection, bson::doc};
use futures::TryStreamExt;

use crate::models::todo::Todo;

// uses every route from from this file
pub fn todo_routes(collection: Collection<Todo>) -> Router {
	Router::new()
		.route("/", get(get_todos))
		.with_state(collection)
}

// GET all todos
// /todos
pub async fn get_todos(
	State(db): State<Collection<Todo>>,
) -> Result<Json<Vec<Todo>>, (StatusCode, String)> {
	let cursor = db
		.find(doc! {})// Empty doc means find all
		.await
		.map_err(|err| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to fetch todos: {err}")))?;

	let todos: Vec<Todo> = cursor
		.try_collect()// Collect all tems from the async stream
		.await
		.map_err(|err| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to collect todos: {err}")))?;

	Ok(Json(todos))
}
```

- `mod.rs`:

```rs
pub mod todo;

// use axum::response::IntoResponse;

// Minimal handler for GET "/" route
// Returns a string literal (`&'static str`):
// - `&str` = string slice (borrowed string)
// - `'static` = this string literal is baked into the binary and exists for the entire program's lifetime
// - Because of that, Axum doesn't have to allocate/copy anything → very efficient
pub async fn root() -> &'static str {
	"Rust server up and running!"
}

```

Add create todo function in `src/routes/todo.rs`

```rs
...

pub fn todo_routes(collection: Collection<Todo>) -> Router {
	Router::new()
		.route("/", get(get_todos))
		.route("/", post(add_todo))	// add this
		.with_state(collection)
}

...
// POST add todo
// /todos
pub async fn add_todo(
	State(db): State<Collection<Todo>>,
	Json(title): Json<String>,
) -> Result<Json<Todo>, (StatusCode, String)> {
	let new_todo = Todo {
		id: None,
		title: title,
		done: false
	};

	let insert_result = db
		.insert_one(&new_todo)
		.await
		.map_err(|err| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to insert todo: {err}")))?;

	let created_todo = Todo {
		id: Some(insert_result.inserted_id.as_object_id().unwrap()), // MongoDB generated ID
		title: new_todo.title,
		done: new_todo.done,
	};

	Ok(Json(created_todo))
}
```

### Checking that everything works

Go to <http://localhost:3000/todos> and you should see an empty array there

## ACTIX WEB
