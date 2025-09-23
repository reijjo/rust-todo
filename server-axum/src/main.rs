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
