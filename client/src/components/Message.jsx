
import React, { useEffect, useRef } from "react";
import { assets } from "../assets/assets";
import moment from "moment";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Prism from "prismjs";

// Prism styles + languages
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";

const Message = ({ message }) => {
  const markdownRef = useRef(null);

  useEffect(() => {
    if (markdownRef.current) {
      setTimeout(() => {
        Prism.highlightAllUnder(markdownRef.current);
      }, 0);
    }
  }, [message.content]);

  return (
    <div>
      {message.role === "user" ? (
        <div className="flex items-start justify-end my-4 gap-2">
          <div className="flex flex-col gap-2 p-2 bg-slate-50 dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md max-w-2xl">
            <p className="text-sm dark:text-primary">
              {message.content}
            </p>
            <span className="text-xs text-gray-400 dark:text-[#B1A6C0]">
              {moment(message.timestamp).fromNow()}
            </span>
          </div>
          <img
            src={assets.user_icon}
            alt=""
            className="w-8 rounded-full"
          />
        </div>
      ) : (
        <div className="inline-flex flex-col gap-2 p-2 px-4 max-w-2xl bg-primary/20 dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md my-4">
          {message.isImage ? (
            <img
              src={message.content}
              alt=""
              className="w-full max-w-md mt-2 rounded-md"
            />
          ) : (
            <div
              ref={markdownRef}
              className="text-sm dark:text-primary"
            >
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ inline, className, children }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <pre className={`language-${match[1]}`}>
                        <code className={`language-${match[1]}`}>
                          {String(children).replace(/\n$/, "")}
                        </code>
                      </pre>
                    ) : (
                      <code className="bg-black/10 px-1 rounded">
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </Markdown>
            </div>
          )}

          <span className="text-xs text-gray-400 dark:text-[#B1A6C0]">
            {moment(message.timestamp).fromNow()}
          </span>
        </div>
      )}
    </div>
  );
};

export default Message;

