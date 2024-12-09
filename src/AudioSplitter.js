import React, { useState } from 'react';
import axios from 'axios';
import './AudioSplitter.css'; // Importing a CSS file for styling

const AudioSplitter = () => {
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
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
      const response = await axios.get("https://y34iz73hpe.execute-api.ap-south-1.amazonaws.com/");
      return response.data.url;
    }

    // Step 1: Upload file to S3
    const s3UploadUrl = await getPresignedUrl(); // Obtain from backend
    await axios.put(s3UploadUrl, file, {
      headers: { "Content-Type": file.type },
    });

    const objectKey = file.name; // Adjust based on the S3 key

    // Step 2: Call API Gateway to invoke Lambda
    const apiGatewayUrl = "https://y34iz73hpe.execute-api.ap-south-1.amazonaws.com/";
    const response = await axios.post(apiGatewayUrl, {
      bucket_name: "my-audio-app-bucket",
      object_key: objectKey,
    });

    if (response.status === 200) {
      setSplitParts([
        `https://my-audio-app-bucket.s3.amazonaws.com/${response.data.part1_key}`,
        `https://my-audio-app-bucket.s3.amazonaws.com/${response.data.part2_key}`,
      ]);
      setUploadMessage("Audio split successfully!");
    } else {
      setUploadMessage("Failed to split audio.");
    }
  };

  return (
    <div className="audio-splitter-container">
      <h1 className="title">Playback App</h1>
      <div className='upload-container'>
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
      >
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
