"use client";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useChat } from "ai/react";
import { useRef, useState, ReactElement } from "react";
import type { FormEvent } from "react";

import { ChatMessageBubble } from "@/components/ChatMessageBubble";

export function ChatWindow(props: {
  endpoint: string,
  emptyStateComponent: ReactElement,
  placeholder?: string,
  titleText?: string,
  emoji?: string;
}) {
  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  const { endpoint, emptyStateComponent, placeholder, titleText = "An LLM", emoji } = props;

  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading: chatEndpointIsLoading, setMessages } =
    useChat({
      api: endpoint,
      onError: (e) => {
        toast(e.message, {
          theme: "dark"
        });
      }
    });

 
    async function handleUploadClick() {
      try {
        const imageUploader = document.createElement('input');
        imageUploader.setAttribute('type', 'file');
        imageUploader.setAttribute('accept', 'image/*,application/pdf');
        imageUploader.click();
    
        imageUploader.onchange = async function() {
          try {
            if (!imageUploader.files || imageUploader.files.length === 0) {
              console.log('No files selected');
              return;
            }
    
            const file = imageUploader.files[0];
            console.log('Selected file:', file);
    
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async function() {
              const base64data = reader.result;
              console.log('Base64 data:');
    
              if (typeof base64data !== 'string') {
                console.error('Failed to read file data');
                return;
              }
    
              let fileType = file.type.split('/')[0];
              if (fileType === 'application') {
                fileType = 'pdf';
              }

              const response = await fetch('/api/ocr', {
                method: 'POST',
                body: JSON.stringify({ file: base64data, fileType: fileType }),
                headers: { 'Content-Type': 'application/json' }
              });
    
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
    
              const data = await response.json();
              console.log('Response data:', data);
              setInput(data.text || '');
            };
          } catch (error: any) {
            console.error('Error in file onchange:', error);
          }
        };
      } catch (error: any) {
        console.error('Error in handleUploadClick:', error);
      }
    }

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (messageContainerRef.current) {
      messageContainerRef.current.classList.add("grow");
    }
    if (!messages.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    if (chatEndpointIsLoading) {
      return;
    }
    handleSubmit(e);
  }

  return (
    <div className={`flex flex-col items-center p-4 md:p-8 rounded grow overflow-hidden ${(messages.length > 0 ? "border" : "")}`}>
      <h2 className={`${messages.length > 0 ? "" : "hidden"} text-2xl`}>{emoji} {titleText}</h2>
      {messages.length === 0 ? emptyStateComponent : ""}
      <div
        className="flex flex-col-reverse w-full mb-4 overflow-auto transition-[flex-grow] ease-in-out"
        ref={messageContainerRef}
      >
        {messages.length > 0 ? (
          [...messages]
            .reverse()
            .map((m) => (
              <ChatMessageBubble key={m.id} message={m} aiEmoji={emoji}></ChatMessageBubble>
            ))
        ) : (
          ""
        )}
      </div>

      <form onSubmit={sendMessage} className="flex w-full flex-col">
        <div className="flex w-full mt-4">
          <button 
            type="button" 
            className="rounded-full bg-blue-500 w-10 h-10 flex items-center justify-center text-white mr-4"
            onClick={handleUploadClick}
          >
            +
          </button>
          <input
            className="grow mr-8 p-4 rounded"
            value={input}
            placeholder={placeholder}
            onChange={handleInputChange}
          />
          <button type="submit" className="shrink-0 px-8 py-4 bg-sky-600 rounded w-28">
            <div role="status" className={`${(chatEndpointIsLoading) ? "" : "hidden"} flex justify-center`}>
              <svg aria-hidden="true" className="w-6 h-6 text-white animate-spin dark:text-white fill-sky-800" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
            <span className={(chatEndpointIsLoading) ? "hidden" : ""}>Send</span>
          </button>
        </div>
      </form>
      <ToastContainer/>
    </div>
  );
}