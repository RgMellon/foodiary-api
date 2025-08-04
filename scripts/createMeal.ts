import { promises as fs } from "fs";
import path from "path";

const API_URL = "https://api.canto-do-codigo.app.br/meals";
const TOKEN =
    "eyJraWQiOiIxV0J0Y3VHcWV0d1JyS1dRVW5aYW5EZk4xbExwZzFRTFlQeTlWRmxxMVNBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJlMzRjYWExYS1jMDMxLTcwOTUtMzdkZi01MTFiNjRjNjBkNzMiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuc2EtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3NhLWVhc3QtMV80dXlTVjd5VXoiLCJjbGllbnRfaWQiOiI1Mm44bzZqa3MzMGkxZzUycTBpaXE1N3Q1MCIsIm9yaWdpbl9qdGkiOiI2ZjVhM2IyMC1mMzgyLTQ0ODQtOTAwMC05ZTU0ODg0ZGFkOGQiLCJpbnRlcm5hbElkIjoiMzBwRUpleXFSZW5QNk42QlJUcEt0MkVHZWZjIiwiZXZlbnRfaWQiOiI4Y2I0MWY0NC1iNThmLTRhYzktYWVhZS1iM2RlM2QwY2JmNDgiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNzU0MzE2MDQ1LCJleHAiOjE3NTQzNTkyNDUsImlhdCI6MTc1NDMxNjA0NSwianRpIjoiMWQ0NTNjNTMtNjc1MC00MjlhLTg4NDAtMDU4NGM0NzdmZGZjIiwidXNlcm5hbWUiOiJlMzRjYWExYS1jMDMxLTcwOTUtMzdkZi01MTFiNjRjNjBkNzMifQ.lD-mySLHwbWNj2dQID-UHdkP0suOHE-ILEHGqgnyU7McSi_5y0FBec7xQge1rfZs_blqYqFZ_RaWg-ynS57b_jsZpOoF796Z0kwmgPBbW2wgXGW4a6Vgtt7PnjP27aLL9mXEAQo1e0r-1ePi7tbl0qw0QO4lnVcsIYxkd-Nv_jY8LRjQ4TIrXBJP756mJPS11_HkDofl4gXtX-2-H1K23PAG_5aA0qoJ9mGFCiTJlNr3d2UTqnnTvAiQsB7uxLo3wxF6Ky42XstX7oTFp5pyxZA1HwfXfhD5-qCNs42P1-uFc414KBv8hxFtPEb7_j2qmbzbvsAGYWfLyJhHUfKGeA";

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
