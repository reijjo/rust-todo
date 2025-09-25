use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Todo {
	#[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
	pub id: Option<String>,
	pub title: String,
	pub done: bool
}
