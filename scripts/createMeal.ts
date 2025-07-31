import { promises as fs } from "fs";
import path from "path";

const API_URL = "https://api.canto-do-codigo.app.br/meals";
const TOKEN =
    "eyJraWQiOiIxV0J0Y3VHcWV0d1JyS1dRVW5aYW5EZk4xbExwZzFRTFlQeTlWRmxxMVNBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIzM2RjNmFkYS01MGYxLTcwZDItNGY5Mi1jOTViYmI5MzMxZjUiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuc2EtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3NhLWVhc3QtMV80dXlTVjd5VXoiLCJjbGllbnRfaWQiOiI1Mm44bzZqa3MzMGkxZzUycTBpaXE1N3Q1MCIsIm9yaWdpbl9qdGkiOiIxYWNhMjYyOS0zNmUyLTQ3YmMtOTQ5Ny1mOTU0OGUzYzBjNDAiLCJpbnRlcm5hbElkIjoiMzBKazZIWDBOTzdUNFozUnVWelVPUmxSeWMxIiwiZXZlbnRfaWQiOiIxNjAxMDI4Ni0xYThhLTQ4ZjctOGU4Ny01MTRkNGFkNzAxNmYiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNzUzOTE1MzY0LCJleHAiOjE3NTM5NTg1NjMsImlhdCI6MTc1MzkxNTM2NCwianRpIjoiNTAwN2ZkYmYtNTQ3ZC00ZWYyLWIyYzktNDRhZmViMjU4ZDE2IiwidXNlcm5hbWUiOiIzM2RjNmFkYS01MGYxLTcwZDItNGY5Mi1jOTViYmI5MzMxZjUifQ.gc1ox_yQWkQHb80A-SpfG2j1nJhiLEvD4RmmWNWNJ3J9B3M2ve22167b7sSdZqbpPEGmEfGn9AcmJrnyLxM3D3GFrU91dpN70PYT51thqQtg5fQicd5jlDCk8dZ6hWVEADBvxYdz2XR04rtnaXo08PXW78Wft3j9qkrTLVPyAf5iH4YyraTL0K9s_98zNffsVmvHgM8BQ0EFd1E-fuOXywa9M0SBOm4uI5WK2Zeovn9W2sT-qnyeIr6HPblMMXrCHTDjHTxzulmYLRvO8BLV1m3O7JRp-sduJH7H_LWr--EQUa7e95waThjxGnXBzYu0PsCo76xBwKIf4228JBlXsw";

interface IPresignResponse {
    uploadSignature: string;
}

interface IPresignDecoded {
    url: string;
    fields: Record<string, string>;
}

async function readImageFile(filePath: string): Promise<{
    data: Buffer;
    size: number;
    type: string;
}> {
    console.log(`🔍 Reading file from disk: ${filePath}`);
    const data = await fs.readFile(filePath);
    return {
        data,
        size: data.length,
        type: "image/jpeg",
    };
}

async function createMeal(
    fileType: string,
    fileSize: number
): Promise<IPresignDecoded> {
    console.log(
        `🚀 Requesting presigned POST for ${fileSize} bytes of type ${fileType}`
    );
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ file: { type: fileType, size: fileSize } }),
    });

    if (!res.ok) {
        throw new Error(
            `Failed to get presigned POST: ${res.status} ${res.statusText}`
        );
    }

    const json = (await res.json()) as IPresignResponse;
    const decoded = JSON.parse(
        Buffer.from(json.uploadSignature, "base64").toString("utf-8")
    ) as IPresignDecoded;

    console.log("✅ Received presigned POST data");
    return decoded;
}

function buildFormData(
    fields: Record<string, string>,
    fileData: Buffer,
    filename: string,
    fileType: string
): FormData {
    console.log(
        `📦 Building FormData with ${
            Object.keys(fields).length
        } fields and file ${filename}`
    );
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) {
        form.append(key, value);
    }
    const blob = new Blob([fileData], { type: fileType });
    form.append("file", blob, filename);
    return form;
}

async function uploadToS3(url: string, form: FormData): Promise<void> {
    console.log(`📤 Uploading to S3 at ${url}`);
    const res = await fetch(url, {
        method: "POST",
        body: form,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(
            `S3 upload failed: ${res.status} ${res.statusText} — ${text}`
        );
    }

    console.log("🎉 Upload completed successfully");
}

async function uploadMealImage(filePath: string): Promise<void> {
    try {
        const { data, size, type } = await readImageFile(filePath);
        const { url, fields } = await createMeal(type, size);
        const form = buildFormData(fields, data, path.basename(filePath), type);
        await uploadToS3(url, form);
    } catch (err) {
        console.error("❌ Error during uploadMealImage:", err);
        throw err;
    }
}

uploadMealImage(path.resolve(__dirname, "assets", "dino.jpeg")).catch(() =>
    process.exit(1)
);
