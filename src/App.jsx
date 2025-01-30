import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { CopyToClipboard } from 'react-copy-to-clipboard';

function App() {
  const socket = useMemo(() => io("http://localhost:3000"), []);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);

  useEffect(() => {
    socket.on("receive", (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { msg: data.obj.msg, senderId: data.obj.senderId },
      ]);
    });

    socket.on("file-receive", ({ senderId, fileName, fileData }) => {
      const blob = new Blob([new Uint8Array(fileData)], { type: "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          msg: (
            <a href={url} download={fileName} style={{ color: "blue" }}>
              {fileName} (Download)
            </a>
          ),
          senderId,
        },
      ]);
    });

    socket.on("currentUser", (data) => {
      setCurrentUser(data);
    });
  }, [socket]);

  const sendMessage = () => {
    if (inputText.trim()) {
      socket.emit("message", inputText);
      setInputText("");
    }
  };

  const sendFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        socket.emit("send-file", {
          fileName: file.name,
          fileData: Array.from(new Uint8Array(reader.result)),
        });
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="flex h-full">
      <div className="App bg-[#1d2126] text-white w-[100vw] relative h-[100vh]">
        <div className="chat-container bg-[#1d2126]">
          <div className="messages p-2 overflow-y-auto h-[92vh]">
            {messages.map((element, index) => (
              <div
                key={index}
                className={`p-2 my-1 rounded ${
                  element.senderId === currentUser
                    ? "bg-green-200 text-black ml-auto w-[90%] md:w-[50%]"
                    : "bg-slate-600/50 text-white mr-auto w-[90%] md:w-[50%]"
                }`}
              >
                <p>{element.msg}</p>
                {typeof element.msg === 'string' ? (
                  <CopyToClipboard
                    text={element.msg}
                    onCopy={() => setCopiedMessageIndex(index)}
                  >
                    <button className="text-sm text-blue-500 hover:underline">
                      {copiedMessageIndex === index ? 'Copied!' : 'Copy'}
                    </button>
                  </CopyToClipboard>
                ) : (
                  <span className="text-sm text-gray-400">Cannot copy this content</span>
                )}
              </div>
            ))}
          </div>
          <div className="input-area w-full fixed bottom-2 flex">
            <input
              className="bg-white text-black w-[80%] p-2 rounded"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} className="bg-green-300 w-[20%] p-2 rounded">
              Send
            </button>
            <div className="bg-black absolute top-[-50px] w-[20%] flex items-center justify-center text-xl">
              <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded">
                Upload File
                <input type="file" onChange={sendFile} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;