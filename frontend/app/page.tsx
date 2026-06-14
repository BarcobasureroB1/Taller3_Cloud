'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './page.module.css';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type FileItem = {
  key: string;
  name: string;
  size: number;
  lastModified: string | null;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(1)} ${units[i]}`;
}

export default function Home() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selected, setSelected] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch(`${API}/files`);
      if (!res.ok) throw new Error();
      setFiles(await res.json());
    } catch {
      setStatus('No se pudo conectar con el backend');
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const uploadFiles = useCallback(
    async (list: File[]) => {
      if (list.length === 0) return;
      setUploading(true);
      setStatus('Subiendo...');

      const formData = new FormData();
      list.forEach((f) => formData.append('files', f));

      try {
        const res = await fetch(`${API}/files/upload`, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error();
        setStatus('Archivo(s) subido(s) correctamente');
        setSelected([]);
        await fetchFiles();
      } catch {
        setStatus('Error al subir el archivo');
      } finally {
        setUploading(false);
      }
    },
    [fetchFiles],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) setSelected(dropped);
  };

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelected(Array.from(e.target.files));
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <h1 className={styles.title}>Drive Clone</h1>
          <p className={styles.subtitle}>
            Arrastra un archivo, súbelo y descárgalo.
          </p>
        </header>

        <div className={styles.grid}>
          <section className={styles.panel}>
            <p className={styles.panelLabel}>Carga de documentos</p>

            <div
              className={`${styles.dropzone} ${
                dragOver ? styles.dropzoneActive : ''
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
            >
              <div className={styles.dropIcon}>⬆</div>
              <p className={styles.dropText}>
                {selected.length > 0
                  ? `${selected.length} archivo(s) listo(s)`
                  : 'Arrastra y suelta aquí'}
              </p>
              <p className={styles.dropHint}>o haz clic para seleccionar</p>
              <input
                ref={inputRef}
                type="file"
                multiple
                className={styles.hiddenInput}
                onChange={onSelect}
              />
            </div>

            <div className={styles.actions}>
              <button
                className={styles.button}
                disabled={uploading || selected.length === 0}
                onClick={() => uploadFiles(selected)}
              >
                {uploading ? 'Cargando...' : 'Cargar'}
              </button>
              {status && <span className={styles.status}>{status}</span>}
            </div>
          </section>

          <section className={styles.panel}>
            <p className={styles.panelLabel}>Archivos recientes</p>

            {files.length === 0 ? (
              <p className={styles.empty}>Aún no hay archivos.</p>
            ) : (
              <div className={styles.fileList}>
                {files.map((file) => (
                  <div className={styles.fileItem} key={file.key}>
                    <div className={styles.fileMeta}>
                      <p className={styles.fileName}>{file.name}</p>
                      <p className={styles.fileSize}>{formatSize(file.size)}</p>
                    </div>
                    <a
                      className={styles.downloadBtn}
                      href={`${API}/files/download?key=${encodeURIComponent(
                        file.key,
                      )}`}
                    >
                      Descargar
                    </a>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
