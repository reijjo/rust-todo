use axum::{routing::get, extract::State, response::IntoResponse, Json, Router};
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
pub async fn get_todos(State(db): State<Collection<Todo>>) -> impl IntoResponse {
	// Run the query → returns a `Cursor<Todo>`
  // Cursor = a pointer/iterator to the results in MongoDB
  // Naming it `cursor` is common in MongoDB docs because it makes it
  // clear this is not the final data yet, but a handle to the result stream.
	let cursor = db.find(doc! {}).await.unwrap();

	// Collect all documents from the cursor into a Vec<Todo>
	// `try_collect` comes from `futures::TryStreamExt`:
	// - It pulls all items out of the async stream
	// - Stops if any item fails (`Result::Err`)
	// - Otherwise builds a Vec of results
	let todos: Vec<Todo> = cursor.try_collect().await.unwrap();

	Json(todos)
}