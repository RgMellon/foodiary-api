import { promises as fs } from "fs";
import path from "path";

const API_URL = "https://api.canto-do-codigo.app.br/meals";
const TOKEN =
    "eyJraWQiOiIxV0J0Y3VHcWV0d1JyS1dRVW5aYW5EZk4xbExwZzFRTFlQeTlWRmxxMVNBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIzMzNjMGFjYS0xMDkxLTcwODAtYjM1NS1kYjY4YjgyN2M5MjEiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuc2EtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3NhLWVhc3QtMV80dXlTVjd5VXoiLCJjbGllbnRfaWQiOiI1Mm44bzZqa3MzMGkxZzUycTBpaXE1N3Q1MCIsIm9yaWdpbl9qdGkiOiJlMDQ0NWJjOS02ODVmLTRlM2MtOGY4NS0wOGYxNmZmYmU1MjMiLCJpbnRlcm5hbElkIjoiMzByZVczMFNDVlh2SUIzOUNDSUgwNXV3T2RVIiwiZXZlbnRfaWQiOiIwMjEzMGMxZC1mNWEwLTQ3NGQtOTUzYy1jZjMxYWM3YmU3ODgiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNzU0MzkwMTQ4LCJleHAiOjE3NTQ0MzMzNDgsImlhdCI6MTc1NDM5MDE0OCwianRpIjoiN2UzODk5ZjMtMzk1YS00ZGNlLTlmN2QtZTMwZmRiMmU1NDM0IiwidXNlcm5hbWUiOiIzMzNjMGFjYS0xMDkxLTcwODAtYjM1NS1kYjY4YjgyN2M5MjEifQ.A-D6if3xVlwEyC9ygVa5t-FBRdA35Drq9NGwqkkU_ssyDwvL05EZpPHbuSZV7eleE6ZhX5hP4riNW1BCrEKpRlpeiq-fi04dE9LGLkSBu5hPZrQOrUjNi4bJdoesTECllOV7XrhxQERiucNpM6jwP4Voegxpi07SeRKJoxX0eoArSP5Sw2AJiFi89NAICFrMQByd5vXw91TX9v-im7C6WyseFCnPIgYsMWNIhWik0O_yumlWu1jXvvp4_bkQlAyW7EMVZavEi9Ps2wNAEdRJRTyhsfNT36Wuu_SHLax9-aiQ9M6ZndfHsF1-XP-ygc2ReY0G49C9gOi_aZilAn05OQ";

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
