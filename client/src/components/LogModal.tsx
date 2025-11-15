import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

type LogModalProps = {
  onClose: () => void;
  type: "merge" | "model";
};

export default function LogModal({ onClose, type }: LogModalProps) {
  // states
  const [log, setLog] = useState("");

  async function load() {
    const r = await fetch(
      type === "merge" ? "/api/logs/merge" : "/api/logs/inspect"
    );
    setLog(await r.text());
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const el = document.getElementById("log-container");
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="flex flex-1 flex-col max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Logs</DialogTitle>
        </DialogHeader>
        <pre
          id="log-container"
          className="whitespace-pre-wrap text-sm bg-black text-green-400 p-4 rounded-lg h-[600px] w-[750px] overflow-y-scroll overflow-x-scroll"
        >
          {log}
        </pre>
        <Button
          type="button"
          onClick={() => {
            onClose();
          }}
        >
          {"Close"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
