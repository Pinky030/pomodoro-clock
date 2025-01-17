// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod todo;
use std::sync::Mutex;
use todo::{Todo, TodoApp};

struct AppState {
    app: Mutex<TodoApp>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!yy", name)
}

#[tauri::command]
fn get_todos(state: tauri::State<AppState>) -> Vec<Todo> {
    let app = state.app.lock().unwrap();
    let todos = app.get_todos().unwrap();
    return todos;
}

#[tauri::command]
fn add_todo(name: String) -> Result<String, String> {
    let app = TodoApp::new().unwrap();
    let result = app.add_todo(name);
    app.connect.close().ok();
    return result;
}

#[tauri::command]
fn mark_finish(todo_id: i32) -> bool {
    let app = TodoApp::new().unwrap();
    let result = app.mark_finish(todo_id);
    app.connect.close().ok();
    return result;
}

#[tauri::command]
fn remove_todo(todo_id: i32) -> Result<String, String> {
    let app = TodoApp::new().unwrap();
    let result = app.remove_todo(todo_id);
    app.connect.close().ok();
    return result;
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = TodoApp::new().unwrap();
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_todos ,add_todo, mark_finish, remove_todo])
        .manage(AppState {
            app: Mutex::from(app),
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
} 
