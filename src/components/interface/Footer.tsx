import "@fontsource/inter";
import { Typography, Divider, Link, Box } from "@mui/joy";
import { Github, Database, Cpu, ShieldCheck, Terminal } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const modelName = "Llama-3.1-8B-Q4_K_M.gguf"; // Exemplo técnico

  return (
    <footer className="w-full bg-[#0A0A0A] border-t border-white/[0.05] px-6 py-4">
      {/* Container Principal */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Lado Esquerdo: Metadados do App */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <Typography level="body-xs" sx={{ color: 'white', fontWeight: 600, fontFamily: 'Inter' }}>
              SYSTEM SECURE
            </Typography>
          </div>
          <Divider orientation="vertical" sx={{ height: '14px', bgcolor: 'white/10' }} />
          <Typography level="body-xs" sx={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter' }}>
            &copy; {currentYear} Evandro Fonseca Jr.
          </Typography>
        </div>

        {/* Centro: Telemetria da IA (Onde o engenheiro foca) */}
        <div className="flex items-center gap-6 px-4 py-1.5 bg-white/[0.02] border border-white/[0.05] rounded-lg">
          <div className="flex items-center gap-2">
            <Database size={14} className="text-cyan-500" />
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Model:</span>
            <span className="text-[11px] font-mono text-slate-200">{modelName}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-purple-500" />
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">VRAM:</span>
            <span className="text-[11px] font-mono text-slate-200">5.2 GB / 8.0 GB</span>
          </div>
        </div>

        {/* Lado Direito: Links Técnicos e Segurança */}
        <div className="flex items-center gap-5">
          <Link
            href="#"
            startDecorator={<Terminal size={14} />}
            sx={{ 
              fontSize: '12px', 
              color: 'rgba(255,255,255,0.5)', 
              textDecoration: 'none',
              '&:hover': { color: 'white' } 
            }}
          >
            API Logs
          </Link>
          
          <Link
            href="https://github.com"
            target="_blank"
            sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'white' } }}
          >
            <Github size={18} />
          </Link>

          <Tooltip title="End-to-End Encrypted Local Session" variant="soft">
             <ShieldCheck size={18} className="text-slate-500 cursor-help" />
          </Tooltip>
        </div>
      </div>
    </footer>
  );
}

// Tooltip auxiliar (MUI Joy precisa do import)
import { Tooltip } from "@mui/joy";