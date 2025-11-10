import { useState, useRef } from 'react'
import { Button } from '@components/common'
import styles from './FileUpload.module.css'

const FileUpload = ({ onFileSelect, accept = '.xlsx,.csv', maxSize = 5 * 1024 * 1024 }) => {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const handleFile = (selectedFile) => {
    setError(null)
    if (selectedFile.size > maxSize) {
      setError(`Файл слишком большой. Максимум ${maxSize / 1024 / 1024}MB`)
      return
    }
    setFile(selectedFile)
    onFileSelect(selectedFile)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className={styles.container}>
      <div 
        className={`${styles.dropzone} ${dragActive ? styles.active : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          style={{ display: 'none' }}
        />
        {file ? (
          <div className={styles.fileInfo}>
            <span className={styles.fileName}>📄 {file.name}</span>
            <span className={styles.fileSize}>{(file.size / 1024).toFixed(2)} KB</span>
          </div>
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.icon}>📁</span>
            <p className={styles.text}>Перетащите файл сюда или нажмите для выбора</p>
            <p className={styles.hint}>Поддерживаемые форматы: {accept}</p>
          </div>
        )}
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {file && (
        <Button variant="secondary" onClick={() => { setFile(null); onFileSelect(null) }}>
          Удалить файл
        </Button>
      )}
    </div>
  )
}

export default FileUpload