use axum::{extract::{Path, State}, http::StatusCode, routing::{get, post, patch}, Json, Router};
use mongodb::{Collection, bson::{doc, oid::ObjectId}};
use futures::TryStreamExt;

use crate::models::todo::{ Todo, UpdateTodo };

// uses every route from from this file
pub fn todo_routes(collection: Collection<Todo>) -> Router {
	Router::new()
		.route("/", get(get_todos))
		.route("/", post(add_todo))
		.route("/{id}", patch(update_todo))
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

// POST add todo
// /todos
pub async fn add_todo(
	State(db): State<Collection<Todo>>,
	Json(title): Json<String>,
) -> Result<Json<Todo>, (StatusCode, String)> {
	let new_todo = Todo {
		id: None,
		title: title,
		done: false
	};

	let insert_result = db
		.insert_one(&new_todo)
		.await
		.map_err(|err| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to insert todo: {err}")))?;

	let created_todo = Todo {
		id: Some(insert_result.inserted_id.as_object_id().unwrap()), // MongoDB generated ID
		title: new_todo.title,
		done: new_todo.done,
	};

	Ok(Json(created_todo))
}

// PATCH update todo
// /todos/id
pub async fn update_todo(
    State(db): State<Collection<Todo>>,
    Path(id): Path<String>,
    Json(update_data): Json<UpdateTodo>,
) -> Result<Json<Todo>, (StatusCode, String)> {
    // Parse ObjectId
    let object_id = ObjectId::parse_str(&id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid ObjectId format".to_string()))?;

    // Build the update document
    let mut update_doc = doc! {};
    if let Some(done) = update_data.done {
        update_doc.insert("done", done);
    }
    if let Some(title) = update_data.title {
        update_doc.insert("title", title);
    }

    if update_doc.is_empty() {
        return Err((StatusCode::BAD_REQUEST, "No valid fields to update".to_string()));
    }

    // Update only the specified fields
    let update_result = db
        .update_one(
            doc! { "_id": &object_id },
            doc! { "$set": update_doc },
         
        )
        .await
        .map_err(|err| (StatusCode::INTERNAL_SERVER_ERROR, format!("Update failed: {err}")))?;

    // Check if a document was actually updated
    if update_result.matched_count == 0 {
        return Err((StatusCode::NOT_FOUND, "Todo not found".to_string()));
    }

    // Fetch the updated document to return
    let updated_todo = db
        .find_one(doc! { "_id": &object_id })
        .await
        .map_err(|err| (StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {err}")))?
        .ok_or((StatusCode::NOT_FOUND, "Todo disappeared after update".to_string()))?;

    Ok(Json(updated_todo))
}