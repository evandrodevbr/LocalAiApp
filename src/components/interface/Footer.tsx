import { LinearProgress, Typography, Box, Tooltip } from "@mui/joy";
import { Cpu, Database, HardDrive, Activity } from "lucide-react";

// Componente de Telemetria Interno
const StatMonitor = ({ icon: Icon, label, value, percent, color }: any) => (
  <Box sx={{ width: 120 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
      <Typography level="body-xs" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'slate.400' }}>
        <Icon size={12} /> {label}
      </Typography>
      <Typography level="body-xs" sx={{ color: 'white', fontWeight: 'bold' }}>{value}</Typography>
    </Box>
    <LinearProgress 
      determinate 
      value={percent} 
      size="sm" 
      color={color}
      sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
    />
  </Box>
);

export default function EnhancedFooter({ stats }: { stats: any }) {
  return (
    <footer className="w-full bg-[#0A0A0A] border-t border-white/[0.05] px-6 py-3 flex items-center justify-between">
      <div className="flex gap-8">
        <StatMonitor 
          icon={Cpu} label="CPU" 
          value={`${stats.cpu}%`} 
          percent={stats.cpu} 
          color={stats.cpu > 80 ? "danger" : "primary"} 
        />
        <StatMonitor 
          icon={Activity} label="GPU" 
          value={`${stats.gpu.usage}%`} 
          percent={stats.gpu.usage} 
          color="success" 
        />
        <StatMonitor 
          icon={Database} label="RAM" 
          value={`${stats.ram_used.toFixed(1)}GB`} 
          percent={(stats.ram_used / stats.ram_total) * 100} 
          color="warning" 
        />
        <StatMonitor 
          icon={HardDrive} label="DISK FREE" 
          value={`${stats.disk_free_gb.toFixed(0)}GB`} 
          percent={100} 
          color="neutral" 
        />
      </div>

      <Typography level="body-xs" sx={{ color: 'white/30', fontAlpha: 0.5 }}>
        ENG_MODE: ACTIVE | OS: {window.navigator.platform}
      </Typography>
    </footer>
  );
}