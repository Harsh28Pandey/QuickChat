import React, { useContext, useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../library/utils'
import { ChatContext } from '../../context/ChatContext.jsx'
import { AuthContext } from '../../context/AuthContext.jsx'
import toast from 'react-hot-toast'

const CURRENT_USER_ID = '680f50e4f10f3cd28382ecf9'

const ChatContainer = () => {

    const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext)
    const { authUser, onlineUsers } = useContext(AuthContext)

    const [input, setInput] = useState('')

    const chatRef = useRef(null)
    const scrollEnd = useRef(null)

    // handle sending a message
    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (input.trim() === "")
            return null

        await sendMessage({ text: input.trim() })
        setInput("")
    }

    // handle sending an image
    const handleSendImage = async (e) => {
        const file = e.target.files[0]
        if (!file || !file.type.startsWith("image/")) {
            toast.error("Select an Image File")
            return
        }

        const reader = new FileReader()
        reader.onloadend = async () => {
            await sendMessage({ image: reader.result })
            e.target.value = ""
        }
        reader.readAsDataURL(file)
    }

    useEffect(() => {
        if (selectedUser) {
            getMessages(selectedUser._id)
        }
    }, [selectedUser])

    // load messages on chat click (after refresh)
    useEffect(() => {
        if (scrollEnd.current && messages) {
            scrollEnd.current.scrollIntoView({ behavior: "smooth" })
        }
    })


    // 🔥 GUARANTEED scroll to bottom
    useEffect(() => {
        if (!chatRef.current) return

        // wait for DOM paint
        requestAnimationFrame(() => {
            chatRef.current.scrollTop = chatRef.current.scrollHeight
        })
    }, [messages])

    return selectedUser ? (
        <div className="h-full overflow-hidden relative backdrop-blur-lg">

            {/* header */}
            <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
                <img src={selectedUser.profilePic || assets.avatar_icon} className="w-8 rounded-full" />
                <p className="flex-1 text-lg text-white flex items-center gap-2">
                    {selectedUser.fullName}
                    {onlineUsers?.includes(selectedUser._id) && <span className='w-2 h-2 rounded-full bg-green-500'></span>}
                </p>
                <img
                    onClick={() => setSelectedUser(null)}
                    src={assets.arrow_icon}
                    className="md:hidden w-7 cursor-pointer"
                />
            </div>

            {/* 🔥 CHAT SCROLL AREA */}
            <div
                ref={chatRef}
                className="flex flex-col h-[calc(100%-120px)] overflow-y-auto p-3 pb-6"
            >
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex items-end gap-2 mb-4 justify-end
                        ${msg.senderId !== authUser._id && 'flex-row-reverse'}`}
                    >
                        {msg.image ? (
                            <img src={msg.image} className="max-w-60 rounded-lg" />
                        ) : (
                            <p
                                className={`p-2 max-w-52 text-sm rounded-lg break-all
                                bg-violet-500/30 text-white
                                ${msg.senderId === authUser._id
                                        ? 'rounded-br-none'
                                        : 'rounded-bl-none'
                                    }`}
                            >
                                {msg.text}
                            </p>
                        )}

                        <div className="text-xs text-center">
                            <img
                                src={
                                    msg.senderId === authUser._id
                                        ? authUser?.profilePic || assets.avatar_icon
                                        : selectedUser?.profilePic || assets.avatar_icon
                                }
                                className="w-7 rounded-full mx-auto"
                            />
                            <p className="text-gray-500">
                                {formatMessageTime(msg.createdAt)}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={scrollEnd}></div>
            </div>

            {/* bottom area */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
                <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
                    <input
                        onChange={(e) => setInput(e.target.value)}
                        value={input}
                        onKeyDown={(e) => e.key === "Enter" ? handleSendMessage(e) : null}
                        type='text'
                        className="flex-1 text-sm border-none rounded-lg placeholder-gray-400 p-3 bg-transparent outline-none text-white"
                        placeholder="Send a Message..."
                    />
                    <input onChange={handleSendImage} type="file" id='image' accept='image/png, image/jpeg' hidden />
                    <label htmlFor="image">
                        <img src={assets.gallery_icon} alt="" className='w-5 mr-2 cursor-pointer' />
                    </label>
                </div>
                <img onClick={handleSendMessage} src={assets.send_button} className="w-7 cursor-pointer" />
            </div>

        </div >
    ) : null
}

export default ChatContainer
