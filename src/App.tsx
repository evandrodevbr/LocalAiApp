import "@fontsource/inter";
import React, { useState, useEffect } from "react";
import { 
  Sheet, Box, Textarea, IconButton, Tooltip, Typography, 
  Menu, MenuItem, Dropdown, MenuButton, Badge
} from "@mui/joy";
import { 
  Send, Plus, MessageSquare, Trash2, Command, 
  Copy, RefreshCcw, ThumbsUp, ThumbsDown, 
  Share2, Download, Search, Cpu, Paperclip, Mic, ChevronDown 
} from "lucide-react";

// Componentes de Interface Padronizados
import Header from "./components/interface/Header";
import Footer from "./components/interface/Footer";
import { SettingsModal } from "./components/interface/SettingsModal";

const API_BASE = "http://127.0.0.1:8000";

export default function App() {
  const [selectedModel, setSelectedModel] = useState("Llama-3.1-8B");
  const [stats, setStats] = useState({
    cpu: 0,
    ram_used: 0,
    ram_total: 8,
    gpu: { usage: 0, vram_used: 0, vram_total: 0 },
    disk_free_gb: 0
  });
  const [models, setModels] = useState<any[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);

  // Constantes de Design (Tokens)
  const ICON_SIZE = 18;
  const TOOLBAR_ICON_SIZE = 16;
  const BORDER_STYLE = "border-white/[0.06]";
  const SURFACE_COLOR = "bg-[#121212]";

  // Polling de telemetria
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/telemetry`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Erro ao buscar telemetria:", error);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2000); // Atualiza a cada 2s
    return () => clearInterval(interval);
  }, []);

  // Carregar modelos
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/models`);
        const data = await response.json();
        setModels(data.models || []);
      } catch (error) {
        console.error("Erro ao carregar modelos:", error);
      }
    };

    fetchModels();
  }, []);

  // Função de download com EventSource
  const handleDownload = async (model: any) => {
    if (downloadingModel) return;
    
    setDownloadingModel(model.id);
    
    try {
      const response = await fetch(`${API_BASE}/api/models/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model_id: model.id,
          repo_id: model.repo,
          filename: model.filename
        })
      });

      if (!response.ok) throw new Error("Falha ao iniciar download");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("Stream não disponível");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === "complete") {
              setDownloadingModel(null);
              // Recarrega lista de modelos
              const res = await fetch(`${API_BASE}/api/models`);
              const modelsData = await res.json();
              setModels(modelsData.models || []);
              break;
            } else if (data.type === "error") {
              setDownloadingModel(null);
              console.error("Erro no download:", data.message);
              break;
            }
            // Progresso pode ser usado para atualizar UI se necessário
          }
        }
      }
    } catch (error) {
      console.error("Erro no download:", error);
      setDownloadingModel(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-slate-200 overflow-hidden font-inter selection:bg-cyan-500/30">
      <Header onSettingsClick={() => setSettingsOpen(true)} />

      <main className="flex flex-1 overflow-hidden border-t border-white/[0.05]">
        
        {/* SIDEBAR - Design Homogêneo */}
        <aside className="hidden md:flex flex-col w-72 bg-[#0D0D0D] border-r border-white/[0.05]">
          <div className="p-4">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] transition-all text-sm font-semibold text-white">
              <Plus size={16} /> New Session
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 space-y-1">
            {['Otimização CUDA', 'Script Rust High-Level'].map((chat, i) => (
              <div key={i} className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-all">
                <div className="flex items-center gap-3 truncate">
                  <MessageSquare size={16} className="text-slate-500" />
                  <span className="text-sm truncate text-slate-400 group-hover:text-slate-200">{chat}</span>
                </div>
                <Trash2 size={14} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all" />
              </div>
            ))}
          </div>
        </aside>

        {/* ÁREA DE CHAT */}
        <section className="flex-1 flex flex-col relative bg-[#0A0A0A]">
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10">
            <div className="max-w-3xl mx-auto space-y-10">
              
              {/* MENSAGEM DO USUÁRIO */}
              <div className="flex flex-col items-end animate-in slide-in-from-right-4 duration-300">
                <div className="bg-[#1A1A1A] border border-white/[0.08] px-5 py-3 rounded-[20px] rounded-tr-none max-w-[85%] shadow-lg shadow-black/20">
                  <p className="text-[15px] leading-relaxed text-white">Quais as melhores estratégias de quantização atuais?</p>
                </div>
              </div>

              {/* RESPOSTA DA IA (Baseada na Imagem 1) */}
              <div className="flex gap-4 group animate-in slide-in-from-left-4 duration-500">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 shadow-inner">
                  <Command size={20} className="text-cyan-400" />
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <Typography level="body-xs" sx={{ color: 'rgba(255,255,255,0.25)', fontWeight: 800, letterSpacing: '0.05em' }}>
                      ENGINE: {selectedModel.toUpperCase()}
                    </Typography>
                    <div className="text-[15px] leading-relaxed text-slate-300">
                      Atualmente, as estratégias mais eficientes são:
                      <ul className="list-disc ml-5 mt-2 space-y-1 text-slate-400">
                        <li><strong>GGUF:</strong> Ideal para inferência local em CPU/GPU híbrida.</li>
                        <li><strong>EXL2:</strong> Otimizada para GPUs NVIDIA com alta taxa de tokens/s.</li>
                      </ul>
                    </div>
                  </div>

                  {/* BARRA DE INTERAÇÃO HOMOGÊNEA (IMAGE 1 STYLE) */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                    <div className="flex items-center gap-0.5">
                      {[Share2, Download, Copy].map((Icon, idx) => (
                        <Tooltip key={idx} title="Action" variant="soft">
                          <IconButton size="sm" variant="plain" sx={{ color: '#64748b', '&:hover': { color: 'white', bgcolor: 'white/5' } }}>
                            <Icon size={TOOLBAR_ICON_SIZE} />
                          </IconButton>
                        </Tooltip>
                      ))}
                      
                      {/* DROPDOWN REGENERATE */}
                      <Dropdown>
                        <Tooltip title="Regenerate with..." variant="soft">
                          <MenuButton slots={{ root: IconButton }} slotProps={{ root: { size: 'sm', variant: 'plain', sx: { color: '#64748b', '&:hover': { color: '#06b6d4' } } } }}>
                            <RefreshCcw size={TOOLBAR_ICON_SIZE} />
                            <ChevronDown size={12} className="ml-0.5 opacity-50" />
                          </MenuButton>
                        </Tooltip>
                        <Menu variant="outlined" sx={{ bgcolor: '#141414', borderColor: 'white/10', borderRadius: '12px', boxShadow: 'xl' }}>
                          <MenuItem onClick={() => setSelectedModel("Llama-3.1-8B")}>Llama 3.1 8B</MenuItem>
                          <MenuItem onClick={() => setSelectedModel("Mistral-Small")}>Mistral Small</MenuItem>
                          <MenuItem onClick={() => setSelectedModel("Qwen-2.5-7B")}>Qwen 2.5 7B</MenuItem>
                        </Menu>
                      </Dropdown>
                    </div>

                    <div className="flex items-center gap-0.5">
                      <IconButton size="sm" variant="plain" sx={{ color: '#475569', '&:hover': { color: '#22c55e' } }}><ThumbsUp size={TOOLBAR_ICON_SIZE}/></IconButton>
                      <IconButton size="sm" variant="plain" sx={{ color: '#475569', '&:hover': { color: '#ef4444' } }}><ThumbsDown size={TOOLBAR_ICON_SIZE}/></IconButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ÁREA DE INPUT (Baseada na Imagem 2) */}
          <div className="p-6 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent">
            <div className="max-w-3xl mx-auto">
              <Sheet
                variant="outlined"
                sx={{
                  borderRadius: '24px',
                  bgcolor: '#121212',
                  borderColor: 'rgba(255,255,255,0.08)',
                  p: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  '&:focus-within': { borderColor: 'rgba(6, 182, 212, 0.4)', bgcolor: '#141414' }
                }}
              >
                <Textarea
                  placeholder="Ask a follow-up..."
                  variant="plain"
                  minRows={1}
                  maxRows={8}
                  sx={{ bgcolor: 'transparent', color: 'white', px: 2, fontSize: '15px' }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1 }}>
                  {/* Grupo de Busca/Ferramentas (Estilo Imagem 2) */}
                  <Box sx={{ display: 'flex', gap: 0.5, bgcolor: 'rgba(255,255,255,0.03)', p: 0.5, borderRadius: '14px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <IconButton size="sm" variant="plain" sx={{ color: '#06b6d4', bgcolor: 'rgba(6,182,212,0.12)', borderRadius: '10px' }}>
                      <Search size={18}/>
                    </IconButton>
                    <IconButton size="sm" variant="plain" sx={{ color: '#64748b', '&:hover': { color: 'white' } }}>
                      <Cpu size={18}/>
                    </IconButton>
                    <IconButton size="sm" variant="plain" sx={{ color: '#64748b', '&:hover': { color: 'white' } }}>
                      <MessageSquare size={18}/>
                    </IconButton>
                  </Box>

                  {/* Grupo de Anexos e Envio */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="sm" variant="plain" sx={{ color: '#64748b' }}><Paperclip size={20}/></IconButton>
                    <IconButton size="sm" variant="plain" sx={{ color: '#64748b' }}><Mic size={20}/></IconButton>
                    <IconButton 
                      variant="solid" 
                      sx={{ 
                        borderRadius: '12px', 
                        minHeight: '40px',
                        minWidth: '40px',
                        bgcolor: 'rgba(255,255,255,0.05)', 
                        color: 'rgba(255,255,255,0.2)',
                        transition: 'all 0.3s',
                        '&:hover': { bgcolor: '#06b6d4', color: 'white', transform: 'translateY(-1px)' }
                      }}
                    >
                      <Send size={18} />
                    </IconButton>
                  </Box>
                </Box>
              </Sheet>
            </div>
          </div>
        </section>
      </main>
      <Footer stats={stats} />
      <SettingsModal 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        models={models}
        onDownload={handleDownload}
      />
    </div>
  );
}