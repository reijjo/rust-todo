mod config;	// include the config module
mod models;
mod app;
mod routes;


use tokio::{net::TcpListener};	// Async TCP listener
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
