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

		let mongodb_uri = env::var("MONGODB_URI")
			.expect("MONGODB_URI must be set in environment or .env");

		Config { app_env, host, port, mongodb_uri }
	}

	// Helper to create a full "host:port" string for binding
	pub fn address(&self) -> String {
		// `format!` is like printf; combines host + port
		format!("{}:{}", self.host, self.port)
	}
}
