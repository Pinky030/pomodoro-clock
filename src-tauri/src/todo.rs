use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Todo {
    pub id: i32,
    pub name: String,
    pub done: bool,
}

pub struct TodoApp {
    pub connect: Connection,
}

impl TodoApp {
    pub fn new() -> Result<TodoApp> {
        let db_path = "db.sqlite";
        let connect = Connection::open(db_path)?;
        connect.execute(
            "CREATE TABLE IF NOT EXISTS Todo (
            id          INTEGER PRIMARY KEY   AUTOINCREMENT,
            name       text            NOT NULL,
            done        numeric         DEFAULT 0
        )",
            [],
        )?;
        Ok(TodoApp { connect })
    }

    pub fn get_todos(&self) -> Result<Vec<Todo>> {
        let mut query = self.connect.prepare("SELECT * FROM Todo WHERE done = 0").unwrap();
        let temp = query.query_map([], |row| {
            let done = row.get::<usize, i32>(2).unwrap() == 1;

            Ok(Todo {
                id: row.get(0)?,
                name: row.get(1)?,
                done,
            })
        })?;

        let mut todos: Vec<Todo> = Vec::new();

        for item in temp {
            todos.push(item?)
        }
        Ok(todos)
    }

    pub fn add_todo(&self, name: String) -> Result<String, String> {
        // match self
        //     .connect
        //     .execute("INSERT INTO Todo (name) VALUES (?)", [name])
        // {
        //     Ok(data) => Ok(format!("{} inserted", data)),
        //     Err(err) => Err(format!("Insert Error: {}", err)),
        // }
        self.connect
            .execute("INSERT INTO Todo (name) VALUES (?)", &[&name])
            .map(|data| {
                println!("Task inserted successfully: {}", data);
                format!("{} inserted", data)
            })
            .map_err(|err| {
                eprintln!("Error inserting task: {}", err);
                format!("Insert Error: {}", err)
            })
    }

    pub fn mark_finish(&self, todo_id: i32) -> bool {
        match self.connect.execute(
            "UPDATE Todo SET done=1 WHERE id=$todo_id AND done=0",
            [todo_id],
        ) {
            Ok(result) => {
                println!("{}", result);
                true
            }
            Err(err) => {
                println!("{}", err);
                false
            }
        }
    }

    pub fn remove_todo(&self, todo_id: i32) -> Result<String, String> {
        self.connect
        .execute("DELETE FROM Todo WHERE id=$todo_id", [&todo_id])
        .map(|data| {
            format!("{} remove", data)
        })
        .map_err(|err| {
            format!("Remove Error: {}", err)
        })
    }

}
