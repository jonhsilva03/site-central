'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Star, AlertCircle, Loader2 } from 'lucide-react';
import { uploadImagemProduto, deleteImagemProduto } from '@/lib/supabase/data-service';

export interface UploadedImage {
  url: string;
  caminho: string;
  is_capa: boolean;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
}

export function ImageUploader({
  images,
  onChange,
  maxImages = 5,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      setError(`Limite de ${maxImages} imagens atingido.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploading(true);

    try {
      const newUploads: UploadedImage[] = [];

      for (const file of filesToUpload) {
        // Validações
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`Arquivo "${file.name}" inválido. Permitidos: JPG, PNG, WEBP.`);
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`Arquivo "${file.name}" excede 5MB.`);
        }

        const res = await uploadImagemProduto(file);
        newUploads.push({
          url: res.url,
          caminho: res.caminho,
          is_capa: images.length === 0 && newUploads.length === 0, // se primeira foto, vira capa
        });
      }

      onChange([...images, ...newUploads]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer upload da imagem.';
      setError(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async (index: number) => {
    const target = images[index];
    try {
      await deleteImagemProduto(target.caminho);
    } catch (e) {
      console.warn('Erro ao remover do storage', e);
    }

    const updated = images.filter((_, i) => i !== index);
    // Se removeu a capa e ainda restam fotos, define a primeira como capa
    if (target.is_capa && updated.length > 0) {
      updated[0].is_capa = true;
    }
    onChange(updated);
  };

  const handleSetCover = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      is_capa: i === index,
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[#171717]">
          Galeria de Fotos ({images.length}/{maxImages})
        </label>
        <span className="text-xs text-[#666666]">
          JPG, PNG ou WEBP até 5MB
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ÁREA DE DRAG & DROP / BOTÃO */}
      {images.length < maxImages && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E2DED4] bg-[#FAF9F6] p-6 text-center transition duration-200 hover:border-[#D4AF37] hover:bg-white"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
              <p className="text-xs text-[#666666]">Enviando imagens...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#B99122] transition group-hover:scale-110">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-[#171717]">
                Clique ou arraste as fotos aqui
              </p>
              <p className="text-xs text-[#666666]">
                Máximo de {maxImages} fotos por produto
              </p>
            </div>
          )}
        </div>
      )}

      {/* GRID DE PRÉ-VISUALIZAÇÃO */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {images.map((img, idx) => (
            <div
              key={img.caminho || idx}
              className={`group relative aspect-square overflow-hidden rounded-2xl border bg-[#FAF9F6] transition ${
                img.is_capa ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30' : 'border-[#E2DED4]'
              }`}
            >
              <Image
                src={img.url}
                alt={`Imagem ${idx + 1}`}
                fill
                sizes="200px"
                className="object-cover"
                referrerPolicy="no-referrer"
              />

              {/* BADGE DE CAPA */}
              {img.is_capa && (
                <div className="absolute left-2 top-2 rounded-md bg-[#D4AF37] px-2 py-0.5 text-[10px] font-bold uppercase text-[#171717] shadow-xs">
                  Capa
                </div>
              )}

              {/* AÇÕES NO HOVER */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition duration-200 group-hover:opacity-100">
                {!img.is_capa && (
                  <button
                    type="button"
                    onClick={() => handleSetCover(idx)}
                    title="Definir como foto principal"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#B99122] hover:bg-[#D4AF37] hover:text-[#171717]"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  title="Excluir imagem"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
