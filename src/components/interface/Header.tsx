import "@fontsource/inter";
import { Button, IconButton, Tooltip, Badge } from "@mui/joy";
// Ícones são cruciais para um visual profissional.
// Se não tiver, instale: npm install lucide-react
import { Home, Settings, Cpu, Sparkles } from "lucide-react";

const appName = import.meta.env.VITE_APPNAME || "LocalMind AI";

export default function Header() {
  // Simulando um estado da IA (você conectaria isso ao seu backend real depois)
  const isModelLoaded = true;

  return (
    <header
      className="
        sticky top-0 z-50
        flex items-center justify-between
        px-6 py-3
        /* Fundo escuro profundo com efeito de vidro fosco */
        bg-[#0A0A0A]/80 backdrop-blur-md
        /* Borda inferior sutil para definição */
        border-b border-white/[0.08]
      "
    >
      {/* --- ZONA DA MARCA --- */}
      <div className="flex items-center gap-3 group cursor-default">
        {/* Ícone da Marca com Gradiente Sutil */}
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-white/10 group-hover:border-cyan-500/50 transition-colors">
           <Sparkles size={20} className="text-cyan-400" />
        </div>

        {/* Nome do App com Tipografia Inter Refinada */}
        <h1 className="font-inter font-bold text-xl tracking-tight text-white">
          {appName}
          {/* Um ponto sutil para indicar 'versão beta' ou 'local' */}
          <span className="text-cyan-500 text-xs ml-1 align-top">.local</span>
        </h1>
      </div>

      {/* --- ZONA DE AÇÕES E STATUS --- */}
      <nav className="flex items-center gap-1">
        {/* Indicador de Status da IA (Vital para apps locais) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 mr-4 rounded-full bg-white/[0.03] border border-white/[0.05]">
            <Badge color={isModelLoaded ? "success" : "warning"} variant="solid" size="sm" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                sx={{
                    '& .MuiBadge-badge': {
                        boxShadow: '0 0 0 2px #0A0A0A', // Borda escura para separar o badge
                        minWidth: '8px', height: '8px', p: 0 // Badge minimalista
                    }
                }}
            >
                <Cpu size={16} className="text-slate-400" />
            </Badge>
            <span className="font-inter text-xs font-medium text-slate-300">
                {isModelLoaded ? "Model Ready" : "Loading Weights..."}
            </span>
        </div>


        {/* Navegação Principal - Estilo "Ghost Button" elegante */}
        <Button
          variant="plain"
          color="neutral"
          startDecorator={<Home size={18} />}
          sx={{
             fontFamily: 'Inter, sans-serif',
             fontWeight: 600,
             color: '#94a3b8', // slate-400
             paddingX: '16px',
             transition: 'all 0.2s',
             '&:hover': {
                 color: 'white',
                 backgroundColor: 'rgba(255,255,255, 0.05)'
             }
          }}
        >
          Home
        </Button>

        {/* Separador vertical sutil */}
        <div className="h-6 w-[1px] bg-white/[0.1] mx-2"></div>

        {/* Ícone de Configurações */}
        <Tooltip title="Settings" variant="soft" placement="bottom-end">
          <IconButton
            variant="plain"
            color="neutral"
            sx={{
                color: '#94a3b8',
                '&:hover': { color: 'white', backgroundColor: 'rgba(255,255,255, 0.05)' }
            }}
          >
            <Settings size={20} />
          </IconButton>
        </Tooltip>
      </nav>
    </header>
  );
}