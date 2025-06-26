import React, { FC, useEffect, useRef, useState, useContext } from "react"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import { MessageCodeBlock } from "./message-codeblock"
import { MessageMarkdownMemoized } from "./message-markdown-memoized"
import { createPortal } from "react-dom"
import { IconQuote } from '@tabler/icons-react'
import { ChatbotUIContext } from "@/context/context"

interface MessageMarkdownProps {
  content: string
}

export const MessageMarkdown: FC<MessageMarkdownProps> = ({ content }) => {
  const [buttonPos, setButtonPos] = useState<{ x: number; y: number } | null>(null)
  const [selectedText, setSelectedText] = useState("")
  const quoteButtonRef = useRef<HTMLButtonElement | null>(null)
  const savedRangeRef = useRef<Range | null>(null)
  const { chatCiteContent, setChatCiteContent } = useContext(ChatbotUIContext)

  // 插入引用内容到当前保存位置
  const insertQuoteAtSavedRange = () => {
    const range = savedRangeRef.current
    if (!range) return

    const quotedText = `> ${selectedText.replace(/\n/g, '\n> ')}\n\n`

    // 移动光标到插入内容后
    console.log('insertQuoteAtSavedRange', quotedText)
    setChatCiteContent(quotedText)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)

    setButtonPos(null)
  }

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (quoteButtonRef.current?.contains(target)) return

      const range = document.caretRangeFromPoint
        ? document.caretRangeFromPoint(e.clientX, e.clientY)
        : null

      if (range) savedRangeRef.current = range.cloneRange()
      setButtonPos(null) // 如果有浮动按钮就隐藏
    }

    const handleMouseUp = () => {
      const selection = window.getSelection()
      setTimeout(() => {
        if (!selection || !selection.toString().trim()) {
          setButtonPos(null)
          return
        }

        const text = selection.toString().trim()
        setSelectedText(text)

        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()

        setButtonPos({
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY - 40,
        })
      }, 0)
    }

    const handleSelectionChange = () => {
      const selection = window.getSelection()
      if (!selection || !selection.toString().trim()) {
        setButtonPos(null)
      }
    }

    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("selectionchange", handleSelectionChange)

    return () => {
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("selectionchange", handleSelectionChange)
    }
  }, [])

  return (
    <div style={{ position: "relative" }}>
      {/* Markdown 渲染区域 */}
      <MessageMarkdownMemoized
        className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 min-w-full space-y-6 break-words"
        remarkPlugins={[remarkGfm, remarkMath]}
        components={{
          p({ children }) {
            return <p className="mb-2 last:mb-0">{children}</p>
          },
          img({ node, ...props }) {
            return <img className="max-w-[67%]" {...props} />
          },
          code({ node, className, children, ...props }) {
            const childArray = React.Children.toArray(children)
            const firstChild = childArray[0] as React.ReactElement
            const firstChildAsString = React.isValidElement(firstChild)
              ? (firstChild as React.ReactElement).props.children
              : firstChild

            if (firstChildAsString === "▍") {
              return <span className="mt-1 animate-pulse cursor-default">▍</span>
            }

            if (typeof firstChildAsString === "string") {
              childArray[0] = firstChildAsString.replace("`▍`", "▍")
            }

            const match = /language-(\w+)/.exec(className || "")

            if (
              typeof firstChildAsString === "string" &&
              !firstChildAsString.includes("\n")
            ) {
              return (
                <code className={className} {...props}>
                  {childArray}
                </code>
              )
            }

            return (
              <MessageCodeBlock
                key={Math.random()}
                language={(match && match[1]) || ""}
                value={String(childArray).replace(/\n$/, "")}
                {...props}
              />
            )
          },
        }}
      >
        {content}
      </MessageMarkdownMemoized>

      {/* 浮动按钮，用 portal 渲染到 body 中避免污染插入逻辑 */}
      {buttonPos &&
        createPortal(
          <button
            ref={quoteButtonRef}
            style={{
              position: "absolute",
              top: buttonPos.y,
              left: buttonPos.x,
              background: "#ffff",
              padding: "5px 10px",
              borderRadius: "6px",
              color: "black",
              fontWeight: 500,
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              cursor: "pointer",
              zIndex: 9999,
            }}
            onClick={insertQuoteAtSavedRange}
          >
             <IconQuote size={20} stroke={2} />
          </button>,
          document.body
        )}
    </div>
  )
}
