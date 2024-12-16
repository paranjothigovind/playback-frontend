import React, { useState, ChangeEvent } from "react";
import axios from "axios";
import "./AudioSplitter.css";
import { SERVER_URL, LAMBDA_URL } from "./constants";

const AudioSplitter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [splitParts, setSplitParts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadMessage("");
    } else {
      setUploadMessage("Please select a valid audio file.");
    }
  };

  const getPresignedUrl = async (params: {
    file_name: string;
    bucket_name: string;
    content_type: string;
    expires: number;
  } ): Promise<string> => {
    try {
      const response = await axios.get(`https://hhuodfrkae.execute-api.us-east-1.amazonaws.com/prod/presigned-url`, { params });
      return response.data.url;
    } catch (error) {
      throw new Error("Failed to fetch presigned URL.");
    }
  };

  const uploadToS3 = async (url: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("Content-Type", file.type);
      await axios.put(url, formData);
    } catch (error: any) {
      console.error(error.response.data);
      throw new Error("Failed to upload file to S3.");
    }
  };

  const splitAudio = async (objectKey: string) => {
    try {
      const response = await axios.post(`https://kengrn22kg.execute-api.us-east-1.amazonaws.com/prod/split-audio`, {
        bucket_name: "awsbackendstack-audiobucket96beecba-mism2ey05iin",
        object_key: objectKey,
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed to split audio.");
    }
  };

  const handleUploadAndSplit = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const {
      name,
      type,
      size,
    } = file;

    setIsLoading(true);
    setUploadMessage("");

    try {
      const s3UploadUrl = await getPresignedUrl({
        file_name: name,
        bucket_name: "awsbackendstack-audiobucket96beecba-mism2ey05iin",
        content_type: "multipart/form-data; boundary=--------------------------6871592873333212137973631733937317",
        expires: 3600,
      });
      const response = await uploadToS3(s3UploadUrl, file);
console.log(response);

      const splitData = await splitAudio(file.name);
      setSplitParts([
        `${LAMBDA_URL}/${splitData.part1_key}`,
        `${LAMBDA_URL}/${splitData.part2_key}`,
      ]);
      setUploadMessage("Audio split successfully!");
    } catch (error: any) {
      setUploadMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="audio-splitter-container">
      <h1 className="title">Playback App</h1>
      <div className="upload-container">
        <input
          type="file"
          accept=""
          onChange={handleFileChange}
          className="file-input"
        />
      </div>
      <button
        onClick={handleUploadAndSplit}
        className="upload-button"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Upload and Split"}
      </button>

      {uploadMessage && <p className="upload-message">{uploadMessage}</p>}

      <div className="audio-parts">
        {splitParts.map((part, index) => (
          <audio key={index} controls className="audio-part">
            <source src={part} type="audio/mp3" />
          </audio>
        ))}
      </div>
    </div>
  );
};

export default AudioSplitter;
