import { promises as fs } from "fs";
import path from "path";

const API_URL = "https://api.canto-do-codigo.app.br/meals";
const TOKEN =
    "eyJraWQiOiIxV0J0Y3VHcWV0d1JyS1dRVW5aYW5EZk4xbExwZzFRTFlQeTlWRmxxMVNBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIyM2ZjN2ExYS05MDAxLTcwNGItNWM1Ny05MDk5N2EzMWYyMjMiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuc2EtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3NhLWVhc3QtMV80dXlTVjd5VXoiLCJjbGllbnRfaWQiOiI1Mm44bzZqa3MzMGkxZzUycTBpaXE1N3Q1MCIsIm9yaWdpbl9qdGkiOiJkMzU0NzEzZS05NGJhLTQzMDctOWQ3ZC0wZjdhNDViMmE5YmMiLCJpbnRlcm5hbElkIjoiMzJnc3VueDdZb1JwZlVKa1dHNDRmWkNIOUFOIiwiZXZlbnRfaWQiOiI4MjUyZjA2MS0wMTk1LTRhZGQtYjM1MC04YmE4YTMzOTQ2ZTQiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNzU3ODUzNzc2LCJleHAiOjE3NTc4OTY5NzYsImlhdCI6MTc1Nzg1Mzc3NiwianRpIjoiZmVlZTNmOTAtYTU3MS00NDBmLWI3MDctYTRhYzhkOTM5ZjRhIiwidXNlcm5hbWUiOiIyM2ZjN2ExYS05MDAxLTcwNGItNWM1Ny05MDk5N2EzMWYyMjMifQ.R2ZxxHdoro-gAc3Vo-pTXSKWpQt-cFgqfRUPOPYU9C2d1BWscWOW0p6corO8ZBLaUMrF1xYVGI-wQdiGxu_RhwFuPEUrnDTJoZu-qXVPb2C-sxHMCKl13c9CsVQiR_1dpJwd7TklVxFddXeVZpNp4VTLdLOySCEdWuze6_zWKcA_UunfVLyX1JdvDkn3U4jUhTZAW9omgLu2cvZ5v3z32DqYeXzTBhxD_xZjGGTG9jcYkDid9u_K9RC4ZDOVtYBgFuJ9d5EGOl7IKoOpJx54P7LT6B_nAC96PaTngek-TFIeSo5_1z-ESh6PylYPXci1wLWUlsnBmqBUDPz3YYAzFw";

interface IPresignResponse {
    uploadSignature: string;
}

interface IPresignDecoded {
    url: string;
    fields: Record<string, string>;
}

async function readFile(
    filePath: string,
    type: "audio/m4a" | "image/jpeg"
): Promise<{
    data: Buffer;
    size: number;
    type: string;
}> {
    console.log(`🔍 Reading file from disk: ${filePath}`);
    const data = await fs.readFile(filePath);
    return {
        data,
        size: data.length,
        type,
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

async function uploadFile(
    filePath: string,
    fileType: "audio/m4a" | "image/jpeg"
): Promise<void> {
    try {
        const { data, size, type } = await readFile(filePath, fileType);
        const { url, fields } = await createMeal(type, size);
        const form = buildFormData(fields, data, path.basename(filePath), type);
        await uploadToS3(url, form);
    } catch (err) {
        console.error("❌ Error during uploadFile:", err);
        throw err;
    }
}

uploadFile(path.resolve(__dirname, "assets", "audio.m4a"), "audio/m4a").catch(
    () => process.exit(1)
);
