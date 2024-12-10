import React, { useState } from "react";
import axios from "axios";
import "./AudioSplitter.css";
import { LAMBDA_URL } from "./constants";

const AudioSplitter = () => {
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [splitParts, setSplitParts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("audio/")) {
      setFile(selectedFile);
      setUploadMessage("");
    } else {
      setUploadMessage("Please select a valid audio file.");
    }
  };

  const getPresignedUrl = async () => {
    try {
      const response = await axios.get(`${LAMBDA_URL}/prod/presigned-url`);
      return response.data.upload_url;
    } catch (error) {
      throw new Error("Failed to fetch presigned URL.");
    }
  };

  const uploadToS3 = async (url, file) => {
    try {
      await axios.put(url, file, {
        headers: { "Content-Type": file.type },
      });
    } catch (error) {
      throw new Error("Failed to upload file to S3.");
    }
  };

  const splitAudio = async (objectKey) => {
    try {
      const response = await axios.post(LAMBDA_URL, {
        bucket_name: "my-audio-app-bucket",
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

    setIsLoading(true);
    setUploadMessage("");

    try {
      const s3UploadUrl = await getPresignedUrl();
      await uploadToS3(s3UploadUrl, file);

      const splitData = await splitAudio(file.name);
      setSplitParts([
        `${LAMBDA_URL}/${splitData.part1_key}`,
        `${LAMBDA_URL}/${splitData.part2_key}`,
      ]);
      setUploadMessage("Audio split successfully!");
    } catch (error) {
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
          accept="audio/*"
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
