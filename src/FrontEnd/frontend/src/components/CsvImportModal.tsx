import { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { Modal } from './Modal';
import { protabApi, ApiError } from '../services/api';
import { useToast } from '../hooks/useToast';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (createdIds: string[]) => void;
}

const CSV_SAMPLE = `name,knowledge_base_id,official_main,official_backup
Périmètre Recouvrement,KB-RECOUVREMENT-01,Julien Moreau,Nathalie Roux
Périmètre Infrastructure,KB-INFRA-SYS-002,Alexandre Blanc,Émilie Martin`;

export function CsvImportModal({ isOpen, onClose, onSuccess }: CsvImportModalProps) {
  const { success, error: toastError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleReset = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    const validExtensions = ['.csv', '.txt'];
    const hasValidExt = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExt && file.type && !file.type.includes('csv') && !file.type.includes('text')) {
      setErrorMessage('Veuillez sélectionner un fichier au format CSV (.csv).');
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDownloadSample = () => {
    const blob = new Blob([CSV_SAMPLE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'modele_perimetres.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Veuillez sélectionner un fichier CSV à importer.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await protabApi.importCsv(selectedFile);
      success(
        'Importation CSV réussie !',
        `${res.ids.length} périmètre(s) de supervision importé(s) avec succès.`
      );
      handleReset();
      onSuccess(res.ids);
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 400) {
          setErrorMessage(`Erreur CSV (400) : ${err.message}`);
        } else {
          setErrorMessage(err.message);
        }
      } else {
        setErrorMessage((err as Error)?.message || 'Échec de l\'importation CSV.');
      }
      toastError('Échec de l\'importation', (err as Error)?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importer des périmètres via CSV"
      subtitle="Import en masse de périmètres de supervision (POST /scope-monitorings/import-csv)"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-nord-11/15 border border-rose-200 dark:border-nord-11/30 text-rose-800 dark:text-nord-11 rounded-xl text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-nord-11 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Erreur d'import :</span> {errorMessage}
            </div>
          </div>
        )}

        {/* Zone de drop de fichier */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 dark:border-nord-8 bg-blue-50/50 dark:bg-nord-9/20'
              : selectedFile
              ? 'border-emerald-300 dark:border-nord-14/50 bg-emerald-50/20 dark:bg-nord-14/10'
              : 'border-slate-300 dark:border-nord-2 hover:border-slate-400 dark:hover:border-nord-3 bg-slate-50/50 dark:bg-nord-0/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv,text/plain"
            onChange={handleFileChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-nord-14/20 text-emerald-600 dark:text-nord-14 flex items-center justify-center mb-2">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-nord-6">{selectedFile.name}</p>
              <p className="text-xs text-slate-500 dark:text-nord-4 mt-1">
                {(selectedFile.size / 1024).toFixed(1)} Ko • Cliquez pour remplacer
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-nord-10/25 text-blue-600 dark:text-nord-8 flex items-center justify-center mb-2">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-nord-6">
                Glissez-déposez votre fichier CSV ici
              </p>
              <p className="text-xs text-slate-500 dark:text-nord-4 mt-1">ou cliquez pour parcourir vos dossiers</p>
            </div>
          )}
        </div>

        {/* Format attendu et modèle */}
        <div className="bg-slate-50 dark:bg-nord-0 rounded-xl p-4 border border-slate-200 dark:border-nord-2 text-xs text-slate-600 dark:text-nord-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-nord-5">Format d'en-tête CSV attendu :</span>
            <button
              type="button"
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-1 text-blue-600 dark:text-nord-8 hover:text-blue-700 dark:hover:text-nord-7 hover:underline font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              Télécharger un modèle
            </button>
          </div>
          <code className="block bg-white dark:bg-nord-1 p-2 rounded border border-slate-200 dark:border-nord-2 text-[11px] font-mono text-slate-800 dark:text-nord-5 overflow-x-auto">
            name,knowledge_base_id,official_main,official_backup
          </code>
          <ul className="list-disc pl-4 space-y-1 text-slate-500 dark:text-nord-4">
            <li>L'identifiant de base de connaissances doit comporter au moins 10 caractères.</li>
            <li>Tous les champs sont requis sur chaque ligne.</li>
            <li>Séparateur pris en charge : virgule (,) ou point-virgule (;).</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-nord-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-nord-5 bg-slate-100 dark:bg-nord-2 hover:bg-slate-200 dark:hover:bg-nord-3 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!selectedFile || isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-nord-10 dark:hover:bg-nord-9 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Importation en cours...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Importer le fichier</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
