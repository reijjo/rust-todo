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

use axum::{
	routing::{get},
	Router
};	// Axum web framework
use tokio::{
	net::TcpListener
};	// Async TCP listener

#[tokio::main]	// Starts the Tokio async runtime
async fn main() {
	// Load configuration from environment / .env
	let config = config::Config::from_env();

	// Create a router with a single GET "/" route
  // `root` is the handler function for this route
  let app = Router::new().route("/", get(root));

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
	axum::serve(listener, app).await.unwrap();
}

// Minimal handler for GET "/" route
// Returns a string literal (`&'static str`)
// - `static` means it lives for the whole program lifetime
// - Simple & fast for tiny examples
async fn root() -> &'static str {
	"Rust server up and running!"
}

```

Create `src/config.rs` file:

```rs
use std::env;

// Config struct holds all your app configuration
// like environtment host and port.
#[derive(Debug)]
pub struct Config {
	pub app_env: String,	// 'development' or 'production'
	pub host: String,			// IP or hostname to bind to
	pub port: u16,				// port number
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

		// Read PORT from env, default to 3000
    // parse() converts String -> u16
    // unwrap() panics if not a valid number; fine for now
		let port = env::var("PORT").unwrap_or("3000".to_string()).parse().unwrap();

		Config { app_env, host, port }
	}

	// Helper to create a full "host:port" string for binding
	pub fn address(&self) -> String {
		// `format!` is like printf; combines host + port
		format!("{}:{}", self.host, self.port)
	}
}

```

## ACTIX WEB
