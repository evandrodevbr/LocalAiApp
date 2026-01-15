// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;
use std::sync::{Arc, Mutex};

struct AppState {
    child_process: Arc<Mutex<Option<tauri_plugin_shell::process::CommandChild>>>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let child_process = Arc::new(Mutex::new(Option::<tauri_plugin_shell::process::CommandChild>::None));
    let child_process_clone = Arc::clone(&child_process);

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet])
        .manage(AppState { child_process })
        .setup(move |app| {
            // Inicia o Sidecar Python (usado em dev e produção)
            let shell = app.shell();
            match shell.sidecar("engine-backend") {
                Ok(sidecar) => {
                    match sidecar.spawn() {
                        Ok((mut rx, child)) => {
                            // Armazena a referência do processo para controle
                            let mut process_store = child_process_clone.lock().unwrap();
                            *process_store = Some(child);

                            // Monitoramento de logs em thread assíncrona
                            tauri::async_runtime::spawn(async move {
                                while let Some(event) = rx.recv().await {
                                    if let CommandEvent::Stdout(line) = event {
                                        println!("Backend Log: {}", String::from_utf8_lossy(&line));
                                    }
                                }
                            });
                            
                            println!("[System] Sidecar Python iniciado com sucesso");
                        }
                        Err(e) => {
                            eprintln!("[Erro] Falha ao iniciar sidecar: {}", e);
                            eprintln!("[Erro] Verifique se o binário está em src-tauri/binaries/");
                            eprintln!("[Erro] Execute: pnpm compile:sidecar");
                        }
                    }
                }
                Err(e) => {
                    eprintln!("[Erro] Falha ao configurar sidecar: {}", e);
                    eprintln!("[Erro] Verifique se o binário está em src-tauri/binaries/");
                    eprintln!("[Erro] Execute: pnpm compile:sidecar");
                }
            }

            Ok(())
        })
        .on_window_event(|_window, event| {
            // Garante o encerramento quando a janela fecha
            if let tauri::WindowEvent::Destroyed = event {
                println!("[System]: Encerrando Backend...");
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
