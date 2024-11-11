import Chats from "./_components/Chats";
import Myprofile from "./_components/Myprofile";
import Navbar from "./_components/Navbar";


const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col overflow-hidden h-[695px]">
            <Navbar />
            <div className="flex flex-grow overflow-hidden">
                <div className="w-[22%] bg-purple-300  p-10 flex justify-center overflow-hidden"><Myprofile /></div>

                <div className="w-[30%] pt-24 p-4 overflow-hidden"><Chats /></div>

                <div className="w-1/2 bg-purple-200 py-8 overflow-hidden">{children}</div>
            </div>
        </div>
    );
};

export default Layout;
