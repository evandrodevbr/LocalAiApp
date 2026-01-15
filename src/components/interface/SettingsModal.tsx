import { Modal, ModalDialog, ModalClose, Tabs, TabList, Tab, TabPanel, Sheet, List, ListItem, ListItemButton, ListItemContent, Button, Typography } from "@mui/joy";
import { Download, CheckCircle2, Server } from "lucide-react";

export function SettingsModal({ open, onClose, models, onDownload }: any) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ bgcolor: '#0F0F0F', border: '1px solid rgba(255,255,255,0.1)', minWidth: 600 }}>
        <ModalClose sx={{ color: 'white' }} />
        <Typography level="h4" sx={{ color: 'white', mb: 2 }}>System Configuration</Typography>
        
        <Tabs aria-label="Settings tabs" defaultValue={0} sx={{ bgcolor: 'transparent' }}>
          <TabList sx={{ bgcolor: 'rgba(255,255,255,0.03)', p: 0.5, borderRadius: 'lg' }}>
            <Tab disableIndicator sx={{ color: 'slate.400', '&.Mui-selected': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}>
              Model Manager
            </Tab>
            <Tab disableIndicator sx={{ color: 'slate.400' }}>Inference Engine</Tab>
          </TabList>

          <TabPanel value={0} sx={{ px: 0, py: 2 }}>
            <Sheet sx={{ bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 'md', maxHeight: 400, overflow: 'auto' }}>
              <List>
                {models.map((model: any) => (
                  <ListItem key={model.id} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <ListItemButton sx={{ gap: 2 }}>
                      <Server className="text-cyan-500" />
                      <ListItemContent>
                        <Typography level="title-sm" sx={{ color: 'white' }}>{model.name} <span className="text-[10px] text-slate-500">{model.quant}</span></Typography>
                        <Typography level="body-xs" sx={{ color: 'slate.400' }}>{model.size_gb} GB • {model.repo}</Typography>
                      </ListItemContent>
                      {model.downloaded ? (
                        <Button size="sm" variant="soft" color="success" startDecorator={<CheckCircle2 size={16}/>}>Ready</Button>
                      ) : (
                        <Button size="sm" variant="solid" color="primary" onClick={() => onDownload(model)} startDecorator={<Download size={16}/>}>Download</Button>
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Sheet>
          </TabPanel>

          <TabPanel value={1}>
            <Typography level="body-sm" sx={{ color: 'slate-400' }}>
              Hiperparâmetros de Engenharia (Threads, Context, GPU Offload) em desenvolvimento...
            </Typography>
          </TabPanel>
        </Tabs>
      </ModalDialog>
    </Modal>
  );
}
