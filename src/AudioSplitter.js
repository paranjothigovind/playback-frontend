import React, { useState } from "react";
import axios from "axios";
import "./AudioSplitter.css";
import { LAMBDA_URL } from "./constants";

const AudioSplitter = () => {
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [splitParts, setSplitParts] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadAndSplit = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const getPresignedUrl = async () => {
      const response = await axios.get(LAMBDA_URL);
      return response.data.upload_url;
    };

    const s3UploadUrl = await getPresignedUrl();
    await axios.put(s3UploadUrl, file, {
      headers: { "Content-Type": file.type },
    });

    const objectKey = file.name;

    const apiGatewayUrl = LAMBDA_URL;
    const response = await axios.post(apiGatewayUrl, {
      bucket_name: "my-audio-app-bucket",
      object_key: objectKey,
    });

    if (response.status === 200) {
      setSplitParts([
        `${LAMBDA_URL}/${response.data.part1_key}`,
        `${LAMBDA_URL}/${response.data.part2_key}`,
      ]);
      setUploadMessage("Audio split successfully!");
    } else {
      setUploadMessage("Failed to split audio.");
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
      <button onClick={handleUploadAndSplit} className="upload-button">
        Upload and Split
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
