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
