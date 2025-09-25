
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
		.allow_methods(Any)
		.allow_headers(Any);

	Router::new()
		.route("/", get(routes::root))
		.nest("/todos", routes::todo::todo_routes(collection))
		.layer(TraceLayer::new_for_http())
		.layer(cors)
}
