import { supabase } from "@/lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface ValidateDocumentRequest {
    docType: 'driverLicense' | 'tlcLicense' | 'carRegistration' | 'vehicleInspection' | 'tlcDiamond' | 'insuranceFiles';
    file: string;       // base64, may include data URL prefix
    mimeType: string;
    expectedName: string;
    expectedPlate: string;
}

export interface ValidateDocumentResult {
    valid: boolean;
    extractedPlate: string;
    errorCode: 'WRONG_DOC_TYPE' | 'NAME_MISMATCH' | 'PLATE_MISMATCH' | 'EXPIRED' | 'UNREADABLE' | '';
    errorMessage: string;
}

export const visionService = {
    analyzeImage: async (base64Image: string): Promise<{ isFormal: boolean; labels: string[] }> => {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const response = await fetch(`${API_URL}/api/drivers/validate-photo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ image: base64Image })
        });

        if (!response.ok) {
            if (response.status === 429) throw new Error("RATE_LIMIT_EXCEEDED");
            if (response.status === 413) throw new Error("FILE_TOO_LARGE");
            const errorText = await response.text();
            throw new Error(errorText || "Server error");
        }

        const data = await response.json();
        return { isFormal: data.is_formal, labels: data.labels || [] };
    },

    validateDocument: async (req: ValidateDocumentRequest): Promise<ValidateDocumentResult> => {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const response = await fetch(`${API_URL}/api/drivers/validate-document`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(req),
        });

        if (!response.ok) {
            if (response.status === 429) throw new Error('RATE_LIMIT_EXCEEDED');
            if (response.status === 413) throw new Error('FILE_TOO_LARGE');
            const text = await response.text();
            throw new Error(text || 'Server error');
        }

        return response.json();
    },

    /** @deprecated Kept for compatibility. Validation is now performed on the backend. */
    validateFormalWear: (_labels: string[]): boolean => true,
};
