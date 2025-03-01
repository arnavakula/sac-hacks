"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileUp, X, File, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFilesSelected?: (files: File[]) => void
  maxFiles?: number
  acceptedFileTypes?: string
  className?: string
}

export function FileUpload({ onFilesSelected, maxFiles = 1, acceptedFileTypes = "*", className }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const updatedFiles = [...files, ...newFiles].slice(0, maxFiles)
      setFiles(updatedFiles)
      if (onFilesSelected) {
        onFilesSelected(updatedFiles)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files)
      const updatedFiles = [...files, ...newFiles].slice(0, maxFiles)
      setFiles(updatedFiles)
      if (onFilesSelected) {
        onFilesSelected(updatedFiles)
      }
    }
  }

  const removeFile = (index: number) => {
    const updatedFiles = [...files]
    updatedFiles.splice(index, 1)
    setFiles(updatedFiles)
    if (onFilesSelected) {
      onFilesSelected(updatedFiles)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple={maxFiles > 1}
        accept={acceptedFileTypes}
      />

      <Card
        className={cn(
          "border-2 border-dashed transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          files.length > 0 && "border-muted-foreground/25",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
          {files.length === 0 ? (
            <>
              <FileUp className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Drag and drop your file{maxFiles > 1 ? "s" : ""} here</p>
                <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
              </div>
              <Button variant="outline" onClick={triggerFileInput}>
                Select File{maxFiles > 1 ? "s" : ""}
              </Button>
            </>
          ) : (
            <div className="w-full">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm font-medium">
                  {files.length} file{files.length > 1 ? "s" : ""} selected
                </p>
                {maxFiles > files.length && (
                  <Button variant="outline" size="sm" onClick={triggerFileInput}>
                    Add More
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(index)}>
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button className="gap-2">
                  <Check className="h-4 w-4" />
                  Upload {files.length > 1 ? "Files" : "File"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

