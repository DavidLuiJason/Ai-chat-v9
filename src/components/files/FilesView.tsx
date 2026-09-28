import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Attachment } from '../../types/index.ts';
import { AttachmentViewerModal } from '../common/AttachmentViewerModal.tsx';
import { FileCode, Download, Eye, FileText, HardDrive } from 'lucide-react';

export const FilesView: React.FC = () => {
  const { attachments, workspaces } = useApp();
  const [selectedFile, setSelectedFile] = useState<Attachment | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredAttachments = attachments.filter((a) => {
    if (filterType === 'ALL') return true;
    return a.fileType === filterType;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>PROJECT STORAGE</span>
            <span>·</span>
            <span>FILES & ARTIFACTS ARCHIVE</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Generated Artifacts Catalog</h1>
          <p className="text-xs text-slate-600 mt-1">
            All code modules, schemas, benchmark CSVs, and technical manifests generated across workspaces.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 self-start text-xs shadow-2xs">
          {['ALL', 'code', 'csv', 'document'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer uppercase ${
                filterType === type
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredAttachments.map((file) => {
          const associatedWorkspace = workspaces.find((ws) => ws.id === file.workspaceId);

          return (
            <div
              key={file.id}
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {file.fileType}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{file.formattedSize}</span>
                </div>

                <h3 className="font-mono font-bold text-sm text-slate-900 truncate" title={file.name}>
                  {file.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Creator: <strong>{file.creatorName || 'AI Worker'}</strong>
                </p>

                {associatedWorkspace && (
                  <div className="mt-2 text-[11px] text-slate-400 truncate">
                    Workspace: {associatedWorkspace.name}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedFile(file)}
                  className="font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([file.contentPreview || ''], { type: file.mimeType });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = file.name;
                    a.click();
                  }}
                  className="font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <AttachmentViewerModal
        attachment={selectedFile}
        onClose={() => setSelectedFile(null)}
      />
    </div>
  );
};
