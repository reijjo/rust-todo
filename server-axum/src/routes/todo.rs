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