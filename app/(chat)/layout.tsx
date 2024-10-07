const ChatLayout = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return ( 
        <div className="flex flex-col h-full mx-auto max-w-4xl w-full">
            {children}
        </div>
     );
}
 
export default ChatLayout;