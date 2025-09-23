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
