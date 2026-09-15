"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FileText, Download, Printer, ExternalLink } from "lucide-react";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  filePath?: string;
  mimeType?: string;
  recordType?: string;
}

export function DocumentViewerModal({
  isOpen,
  onClose,
  title,
  filePath = "/uploads/samples/sample_lab_report.pdf",
  mimeType = "application/pdf",
  recordType = "LAB_REPORT",
}: DocumentViewerModalProps) {
  const isImage = mimeType.startsWith("image/") || filePath.endsWith(".png") || filePath.endsWith(".svg") || filePath.endsWith(".jpg");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-medical-500/15 text-medical-400 rounded-xl border border-medical-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-400 font-normal">
              Clinical Document Viewer &bull; {recordType.replace("_", " ")}
            </p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Actions bar */}
        <div className="flex items-center justify-between bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400">
            Encrypted Healthfile Document Vault
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => window.print()}
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              Print
            </Button>
            <a
              href={filePath}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              <Button size="sm" variant="primary">
                <Download className="w-3.5 h-3.5 mr-1" />
                Download Original
              </Button>
            </a>
          </div>
        </div>

        {/* Viewer frame */}
        <div className="w-full h-[520px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center relative">
          {isImage ? (
            <div className="w-full h-full p-4 flex items-center justify-center bg-slate-950/90 overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={filePath}
                alt={title}
                className="max-h-full max-w-full object-contain rounded-lg shadow-xl"
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900/50">
              <div className="w-16 h-16 rounded-2xl bg-medical-500/10 border border-medical-500/20 flex items-center justify-center text-medical-400 mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-base font-semibold text-white mb-1">
                {title}
              </h4>
              <p className="text-xs text-slate-400 max-w-md mb-6">
                This document is securely stored on Healthfile&apos;s encrypted electronic health storage node.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-medical-600 hover:bg-medical-500 text-white rounded-xl text-sm font-medium transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Document in New Tab
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
