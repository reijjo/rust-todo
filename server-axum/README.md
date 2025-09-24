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
	axum::serve(listener, app)
		.with_graceful_shutdown(shutdown_signal())	// Tell the server to wait for a shutdown signal before exiting
		.await.unwrap();
}

// Minimal handler for GET "/" route
// Returns a string literal (`&'static str`):
// - `&str` = string slice (borrowed string)
// - `'static` = this string literal is baked into the binary and exists for the entire program's lifetime
// - Because of that, Axum doesn't have to allocate/copy anything → very efficient
async fn root() -> &'static str {
	"Rust server up and running!"
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

		Config { app_env, host, port }
	}

	// Helper to create a full "host:port" string for binding
	pub fn address(&self) -> String {
		// `format!` is like printf; combines host + port
		format!("{}:{}", self.host, self.port)
	}
}

```

### Request logger (like Morgan in Expressjs)

Add the dependencies `cargo add tower-http --features trace` `cargo add tracing-subscriber http tracing`

- Configure logging in `main.rs`

```rs
...
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]	// Starts the Tokio async runtime
async fn main() {
	// Load configuration from environment / .env
	let config = config::Config::from_env();

	tracing_subscriber::registry()	// Pretty-print logs to stdout
	.with(tracing_subscriber::fmt::layer()
		.compact()
		.with_ansi(true)
		.with_target(false)
	)
	.init();

	let app = Router::new()
		.route("/", get(root))
		.layer(TraceLayer::new_for_http()); // Logs every request/response
	...
}
```

## ACTIX WEB
