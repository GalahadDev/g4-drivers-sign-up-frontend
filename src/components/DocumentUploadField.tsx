import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Upload, CheckCircle, XCircle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { visionService } from "@/services/vision.service";

const DOC_QUESTIONS = [
  'driverLicense', 'tlcLicense', 'carRegistration',
  'vehicleInspection', 'tlcDiamond', 'insuranceFiles',
] as const;
export type DocQuestionId = typeof DOC_QUESTIONS[number];

export interface DocumentUploadFieldProps {
  questionId: DocQuestionId;
  accept: string;
  multiple?: boolean;
  driverType: "regular" | "luxury";
  fullName: string;
  expectedPlate: string;
  onFilesChange: (questionId: DocQuestionId, files: File[]) => void;
  onClear: (questionId: DocQuestionId) => void;
  onPlateExtracted: (plate: string) => void;
}

type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
};

export function DocumentUploadField({
  questionId,
  accept,
  multiple = false,
  driverType,
  fullName,
  expectedPlate,
  onFilesChange,
  onClear,
  onPlateExtracted,
}: DocumentUploadFieldProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [validations, setValidations] = useState<ValidationState[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop stream tracks on unmount
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [stream]);

  // Attach stream to video element via callback ref (avoids timing issues)
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && stream) {
      node.srcObject = stream;
      node.play().catch(() => {});
    }
  }, [stream]);

  const isLuxury = driverType === 'luxury';
  const accentBorder = isLuxury ? 'border-accent/30' : 'border-blue-500/30';
  const accentBg = isLuxury
    ? 'bg-accent hover:bg-accent/90 text-black'
    : 'bg-blue-600 hover:bg-blue-500 text-white';
  const outlineBtn = isLuxury
    ? 'bg-transparent border-accent text-accent hover:bg-accent/10'
    : 'bg-transparent border-blue-500/35 text-blue-400 hover:bg-blue-500/10';
  const addMoreBtn = isLuxury
    ? 'border-accent/30 text-accent hover:bg-accent/5'
    : 'border-blue-500/30 text-blue-400 hover:bg-blue-500/5';

  const validateFile = async (file: File, index: number) => {
    setValidations(prev => { const n = [...prev]; n[index] = 'validating'; return n; });
    setValidationErrors(prev => { const n = [...prev]; n[index] = ''; return n; });
    try {
      const base64 = await fileToBase64(file);
      const result = await visionService.validateDocument({
        docType: questionId,
        file: base64,
        mimeType: file.type || 'image/jpeg',
        expectedName: fullName,
        expectedPlate,
      });
      if (result.valid) {
        setValidations(prev => { const n = [...prev]; n[index] = 'valid'; return n; });
        if (result.extractedPlate) onPlateExtracted(result.extractedPlate);
      } else {
        setValidations(prev => { const n = [...prev]; n[index] = 'invalid'; return n; });
        setValidationErrors(prev => { const n = [...prev]; n[index] = result.errorMessage; return n; });
      }
    } catch (err: unknown) {
      const msg = (err instanceof Error && err.message === 'RATE_LIMIT_EXCEEDED')
        ? 'Too many attempts. Please wait before retrying.'
        : 'Could not verify document. Please try again.';
      setValidations(prev => { const n = [...prev]; n[index] = 'invalid'; return n; });
      setValidationErrors(prev => { const n = [...prev]; n[index] = msg; return n; });
    }
  };

  const addFile = (file: File) => {
    if (!multiple) {
      // Replace: revoke old preview URL if any, then set single file
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => { prev.forEach(u => URL.revokeObjectURL(u)); return [url]; });
      setFiles([file]);
      setValidations(['idle']);
      setValidationErrors(['']);
      onFilesChange(questionId, [file]);
      validateFile(file, 0);
      return;
    }
    if (files.length >= 4) {
      toast.error('Maximum 4 files allowed per field');
      return;
    }
    const url = URL.createObjectURL(file);
    const newFiles = [...files, file];
    setFiles(newFiles);
    setPreviewUrls(prev => [...prev, url]);
    setValidations(prev => [...prev, 'idle']);
    setValidationErrors(prev => [...prev, '']);
    onFilesChange(questionId, newFiles);
    validateFile(file, newFiles.length - 1);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setValidations(prev => prev.filter((_, i) => i !== index));
    setValidationErrors(prev => prev.filter((_, i) => i !== index));
    if (newFiles.length === 0) {
      onClear(questionId);
    } else {
      onFilesChange(questionId, newFiles);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    if (selected.length > 4) {
      toast.error('Maximum 4 files allowed per field');
      e.target.value = '';
      return;
    }
    Array.from(selected).forEach(f => addFile(f));
    e.target.value = '';
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      setCapturedPreview(null);
    } catch {
      toast.error('Could not access camera. Please allow permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCapturedPreview(canvas.toDataURL('image/jpeg'));
    stopCamera();
  };

  const confirmCapture = () => {
    if (!capturedPreview) return;
    const file = dataURLtoFile(capturedPreview, `${questionId}_${Date.now()}.jpg`);
    setCapturedPreview(null);
    addFile(file);
  };

  const canAddMore = multiple && files.length < 4 && !isCameraOpen && !capturedPreview;
  const isEmpty = files.length === 0 && !isCameraOpen && !capturedPreview;

  return (
    <div className="space-y-4">
      {/* ── Estado vacío: dos CTAs ── */}
      {isEmpty && (
        <>
          <div className="flex gap-3">
            <Button type="button" size="lg" className={`flex-1 ${accentBg}`} onClick={startCamera}>
              <Camera className="mr-2 w-5 h-5" /> Open Camera
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className={`flex-1 ${outlineBtn}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 w-5 h-5" /> Upload File
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={handleFileInput}
          />
          <p className={`text-xs text-center ${isLuxury ? 'text-muted' : 'text-slate-500'}`}>
            {multiple
              ? 'Image or PDF · Max 4 files · 10MB each'
              : 'Image or PDF · Max 10MB'}
          </p>
        </>
      )}

      {/* ── Cámara en vivo ── */}
      {isCameraOpen && (
        <div className="space-y-3">
          <div className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden border-2 ${accentBorder}`}>
            <video ref={setVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex gap-2">
            <Button onClick={capturePhoto} size="lg" className="flex-1 bg-white text-black hover:bg-gray-200">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2 animate-pulse" /> Capture
            </Button>
            <Button onClick={stopCamera} size="lg" variant="destructive" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ── Preview de captura: confirmar o reintentar ── */}
      {capturedPreview && (
        <div className="space-y-3">
          <div className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden border-2 ${accentBorder}`}>
            <img src={capturedPreview} alt="Captured document" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2">
            <Button onClick={confirmCapture} size="lg" className={`flex-1 ${accentBg}`}>
              <CheckCircle className="mr-2 w-4 h-4" /> Confirm
            </Button>
            <Button
              onClick={() => { setCapturedPreview(null); startCamera(); }}
              size="lg"
              variant="outline"
              className={`flex-1 ${outlineBtn}`}
            >
              <RefreshCw className="mr-2 w-4 h-4" /> Retake
            </Button>
          </div>
        </div>
      )}

      {/* ── Thumbnails de archivos subidos ── */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3 items-start">
            {files.map((file, idx) => (
              <div key={idx} className="relative">
                <div className={`w-24 h-24 rounded-lg overflow-hidden border-2 ${
                  validations[idx] === 'valid'
                    ? 'border-emerald-500'
                    : validations[idx] === 'invalid'
                      ? 'border-red-500/60'
                      : accentBorder
                }`}>
                  {file.type === 'application/pdf' ? (
                    <div className={`flex flex-col items-center justify-center h-full text-xs gap-1 ${
                      isLuxury ? 'bg-card/10 text-muted' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      <span className="text-2xl">📄</span>
                      <span>PDF</span>
                    </div>
                  ) : (
                    <img src={previewUrls[idx]} alt="Document preview" className="w-full h-full object-cover" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center hover:bg-red-500/40 transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Botones para añadir más (solo múltiple con slots disponibles) */}
            {canAddMore && (
              <div className="flex flex-col gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  multiple
                  className="hidden"
                  onChange={handleFileInput}
                />
                <button
                  type="button"
                  onClick={startCamera}
                  className={`w-24 h-[46px] rounded-lg border-2 border-dashed flex items-center justify-center ${addMoreBtn} transition-colors`}
                  title="Take photo"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-24 h-[46px] rounded-lg border-2 border-dashed flex items-center justify-center ${addMoreBtn} transition-colors`}
                  title="Upload file"
                >
                  <Upload className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Badges de validación */}
          {validations.map((v, idx) =>
            v !== 'idle' ? (
              <div
                key={idx}
                className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                  v === 'validating'
                    ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                    : v === 'valid'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}
              >
                {v === 'validating' && (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    <span>Verifying document with AI...</span>
                  </>
                )}
                {v === 'valid' && (
                  <>
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Document verified</span>
                  </>
                )}
                {v === 'invalid' && (
                  <>
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{validationErrors[idx]}</span>
                  </>
                )}
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
