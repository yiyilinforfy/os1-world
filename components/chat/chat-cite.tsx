import { FC, useState, useContext } from "react"
import { IconArrowForward, IconX } from "@tabler/icons-react"
import { ChatbotUIContext } from "@/context/context"

interface ChatCiteProps {}

export const ChatCite: FC<ChatCiteProps> = ({}) => {
  
    const [isOpen, setIsOpen] = useState(false)
    const { chatCiteContent, setChatCiteContent } = useContext(ChatbotUIContext)
    if(!chatCiteContent) return null

    const clearChatCiteContent = () => {
      setChatCiteContent('')
    }
  
    return (
      <>
        <div className="flex max-w-xs items-center gap-x-2 rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-800">
          <IconArrowForward /> 
          <p id="cite-content-area" className="text-muted-foreground w-64 truncate text-sm">
            {chatCiteContent}
          </p>
          <IconX 
            className="cursor-pointer hover:opacity-50"
            onClick={clearChatCiteContent}
           />
        </div>
      </>
    )
  }